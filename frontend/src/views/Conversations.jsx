/* eslint-disable react/prop-types */
import { useEffect, useState, useRef } from 'react';
import axios from 'axios';
import Modal from 'react-modal';
import { FaPlus } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';
import { io } from 'socket.io-client';
import defaultIcon from '../assets/default-avatar.png'

Modal.setAppElement('#root');

const Conversations = ({ onSelectConversation, selectedConversationId }) => {
  const navigate = useNavigate();
  const [conversations, setConversations] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [error, setError] = useState('');

  const socketRef = useRef(null);

  useEffect(() => {
    const token = localStorage.getItem('token') || sessionStorage.getItem('token');
    const userId = localStorage.getItem('userId') || sessionStorage.getItem('userId');

    if (!token) {
      navigate('/login'); // Redirigir a login si no hay token
      return;
    }

    const fetchConversations = async () => {
      try {
        const res = await axios.get(`${import.meta.env.VITE_API_URL}/conversations`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        const updatedConversations = res.data.map((conversation) => {
          const otherUsers = conversation.users.filter(user => String(user._id) !== String(userId));
          return { ...conversation, otherUsers };
        });

        setConversations(updatedConversations);
      } catch (error) {
        console.error("Error al obtener conversaciones:", error);
      }
    };

    fetchConversations();

    // Configurar la conexión a Socket.io una sola vez
    if (!socketRef.current) {
      socketRef.current = io(`${import.meta.env.VITE_API_URL}`, {
        auth: { token: token }
      });

      // Escuchar eventos de creación de conversaciones en tiempo real
      socketRef.current.on("newConversation", (newConversation) => {
        const userId = localStorage.getItem('userId') || sessionStorage.getItem('userId');
        const conversationExists = conversations.some(
          (convo) => String(convo._id) === String(newConversation._id)
        );
        if (!conversationExists) {
          const otherUsers = newConversation.users.filter(user => String(user._id) !== String(userId));
          const formattedConversation = { ...newConversation, otherUsers };
          setConversations((prevConversations) => [...prevConversations, formattedConversation]);
        }
      });

      socketRef.current.on("updateConversation", (updatedConversation) => {
        const userId = localStorage.getItem('userId') || sessionStorage.getItem('userId');
        const otherUsers = updatedConversation.users.filter(user => String(user._id) !== String(userId));
        const updatedConvo = { ...updatedConversation, otherUsers };

        setConversations((prevConversations) =>
          prevConversations.map((convo) =>
            String(convo._id) === String(updatedConvo._id) ? updatedConvo : convo
          )
        );
      });

    }

    return () => {
      if (socketRef.current) {
        socketRef.current.off("newConversation");
        socketRef.current.off("updateConversation");
        socketRef.current.disconnect();
        socketRef.current = null;
      }
    };
  }, [conversations, navigate]);

  // Función para abrir el modal
  const openModal = () => {
    setIsModalOpen(true);
    setSearchTerm('');
    setSearchResults([]);
    setError('');
  };

  // Función para cerrar el modal
  const closeModal = () => {
    setIsModalOpen(false);
    setSearchTerm('');
    setSearchResults([]);
    setError('');
  };

  // Función para manejar la búsqueda de usuarios
  const handleSearch = async (e) => {
    e.preventDefault();
    if (searchTerm.trim() === '') {
      setError('Por favor, ingresa un nombre de usuario para buscar.');
      return;
    }

    try {
      setIsSearching(true);
      setError('');

      const token = localStorage.getItem('token') || sessionStorage.getItem('token');
      const res = await axios.get(`${import.meta.env.VITE_API_URL}/profile/users?username=${searchTerm}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      setSearchResults(res.data);
      if (res.data.length === 0) {
        setError('No se encontraron usuarios con ese nombre.');
      }
    } catch (error) {
      console.error("Error al buscar usuarios:", error);
      setError('Hubo un error al buscar usuarios.');
    } finally {
      setIsSearching(false);
    }
  };

  // Función para crear una nueva conversación
  const handleCreateConversation = async (selectedUserId) => {
    try {
      const token = localStorage.getItem('token') || sessionStorage.getItem('token');

      // eslint-disable-next-line no-unused-vars
      const res = await axios.post(
        `${import.meta.env.VITE_API_URL}/conversations`,
        { userId: selectedUserId },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      // No agregar manualmente, 'newConversation' event handler se encargará
      closeModal();
    } catch (error) {
      console.error("Error al crear conversación:", error);
      if (error.response && error.response.data && error.response.data.msg) {
        setError(error.response.data.msg);
      } else {
        setError('Hubo un error al crear la conversación.');
      }
    }
  };

  return (
    <div className="p-4 bg-gray-900 h-full ">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-2xl font-semibold text-white">Conversaciones</h2>
        <button
          onClick={openModal}
          className="flex items-center bg-purple-600 text-white px-3 py-2 rounded-md hover:bg-purple-700 "
        >
          <FaPlus />
        </button>
      </div>
      {conversations && conversations.length > 0 ? (
        <ul className="space-y-4 ">
          {conversations.map((conversation) => {
            const otherUser = conversation.otherUsers[0]; 
            return (
              <li
                key={conversation._id}
                className={`p-4 rounded-md cursor-pointer hover:bg-gray-700  ${
                  selectedConversationId === conversation._id ? 'bg-gray-700' : ''
                }`}
                onClick={() => onSelectConversation(conversation._id)}
              >
                <div className="flex items-center">
                  {/* Reemplazar el ícono de marcador de posición con la imagen de perfil */}
                  <img
                    src={otherUser.profilePicture?.secure_url || defaultIcon}
                    alt={`${otherUser.username}'s profile`}
                    className="h-10 w-10 rounded-full mr-4 object-cover"
                  />
                  <div>
                    <p className="text-white font-semibold">
                      {otherUser.username}
                    </p>
                  </div>
                </div>
              </li>
            );
          })}
        </ul>
      ) : (
        <p className="text-gray-400">No tienes conversaciones. Crea una nueva.</p>
      )}

      {/* Modal para buscar y crear conversaciones */}
      <Modal
        isOpen={isModalOpen}
        onRequestClose={closeModal}
        contentLabel="Crear Nueva Conversación"
        className="max-w-lg mx-auto mt-20 bg-gray-800 p-6 rounded-md shadow-lg outline-none"
        overlayClassName="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center"
      >
        <h2 className="text-xl font-semibold text-white mb-4">Buscar Usuario</h2>
        <form onSubmit={handleSearch} className="flex mb-4">
          <input
            type="text"
            placeholder="Nombre de usuario"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="flex-grow bg-gray-700 text-white p-2 rounded-l-md focus:outline-none"
          />
          <button
            type="submit"
            className="bg-purple-600 text-white px-4 py-2 rounded-r-md hover:bg-purple-700"
          >
            Buscar
          </button>
        </form>
        {isSearching && <p className="text-gray-400">Buscando usuarios...</p>}
        {error && <p className="text-red-500 mb-2">{error}</p>}
        <ul>
          {searchResults && searchResults.length > 0 ? (
            searchResults.map(user => (
              <li key={user._id} className="flex items-center justify-between bg-gray-700 p-2 rounded-md mb-2">
                <div className="flex items-center">
                  <img
                    src={user.profilePicture?.secure_url || defaultIcon}
                    alt={`${user.username}'s profile`}
                    className="h-8 w-8 rounded-full mr-3 object-cover"
                  />
                  <span className="text-white">{user.username}</span>
                </div>
                <button
                  onClick={() => handleCreateConversation(user._id)}
                  className="bg-green-500 text-white px-3 py-1 rounded-md hover:bg-green-600"
                >
                  Crear
                </button>
              </li>
            ))
          ) : (
            <p>No se encontraron usuarios.</p>
          )}
        </ul>

        <button
          onClick={closeModal}
          className="mt-4 bg-red-500 text-white px-4 py-2 rounded-md hover:bg-red-600"
        >
          Cerrar
        </button>
      </Modal>
    </div>
  );
};

export default Conversations;

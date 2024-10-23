// src/views/Conversations.jsx
import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import Modal from 'react-modal';
import { FaPlus } from 'react-icons/fa'; // Icono para el botón de agregar

Modal.setAppElement('#root'); // Establece el elemento raíz para accesibilidad

const Conversations = () => {
  const [conversations, setConversations] = useState([]);
  const navigate = useNavigate();
  const [isModalOpen, setIsModalOpen] = useState(false); // Estado para controlar el modal
  const [searchTerm, setSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchConversations = async () => {
      try {
        const token = localStorage.getItem('token') || sessionStorage.getItem('token');
        const userId = localStorage.getItem('userId') || sessionStorage.getItem('userId'); // Obtener el ID del usuario autenticado

        // Si no hay token, redirigir al login
        if (!token) {
          navigate('/'); // Redirigir al login
          return;
        }

        const res = await axios.get(`${import.meta.env.VITE_API_URL}/conversations`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        // Filtrar el nombre del otro usuario
        const updatedConversations = res.data.map((conversation) => {
          const otherUsers = conversation.users.filter(user => user._id !== userId); // Excluir al usuario autenticado
          return { ...conversation, otherUsers };
        });

        setConversations(updatedConversations);
      } catch (error) {
        console.error("Error al obtener conversaciones:", error);
      }
    };

    fetchConversations();
  }, [navigate]);

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

      // Supongamos que tienes un endpoint GET /users?username=xxx para buscar usuarios
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

      const res = await axios.post(
        `${import.meta.env.VITE_API_URL}/conversations`,
        { userId: selectedUserId },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      // Añadir la nueva conversación a la lista
      setConversations(prevConversations => [...prevConversations, { ...res.data.conversation, otherUsers: res.data.conversation.users.filter(user => user._id !== localStorage.getItem('userId')) }]);

      // Cerrar el modal
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
    <div className="p-4 bg-gray-900 h-full relative">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-semibold text-white">Conversations</h2>
        <button
          onClick={openModal}
          className="flex items-center bg-purple-600 text-white px-3 py-2 rounded-md hover:bg-purple-700"
        >
          <FaPlus className="mr-2" />
          Nueva Conversación
        </button>
      </div>
      <ul className="mt-4 space-y-4">
        {conversations.map((conversation) => (
          <li key={conversation._id} className="bg-gray-800 p-4 rounded-md hover:bg-gray-700">
            <Link to={`/conversations/${conversation._id}`} className="flex items-center">
              <div className="bg-purple-600 h-10 w-10 rounded-full mr-4"></div>
              <div>
                {/* Mostrar solo el nombre del otro usuario */}
                <p className="text-white font-semibold">
                  {conversation.otherUsers.map(user => user.username).join(', ')}
                </p>
                <p className="text-gray-400 text-sm">{conversation.lastMessage}</p>
              </div>
            </Link>
          </li>
        ))}
      </ul>

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
          {searchResults.map(user => (
            <li key={user._id} className="flex items-center justify-between bg-gray-700 p-2 rounded-md mb-2">
              <div className="flex items-center">
                <div className="bg-purple-600 h-8 w-8 rounded-full mr-3"></div>
                <span className="text-white">{user.username}</span>
              </div>
              <button
                onClick={() => handleCreateConversation(user._id)}
                className="bg-green-500 text-white px-3 py-1 rounded-md hover:bg-green-600"
              >
                Crear
              </button>
            </li>
          ))}
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

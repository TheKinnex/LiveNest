import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';

const Conversations = () => {
  const [conversations, setConversations] = useState([]);
  const navigate = useNavigate();

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

        const res = await axios.get('https://livenest-backend.onrender.com/conversations', {
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

  return (
    <div className="p-4 bg-gray-900 h-full">
      <h2 className="text-2xl font-semibold text-white">Conversations</h2>
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
    </div>
  );
};

export default Conversations;

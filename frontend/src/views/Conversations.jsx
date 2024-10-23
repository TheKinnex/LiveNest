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

        // Si no hay token, redirigir al login
      if (!token) {
        navigate('/'); // Redirigir al login
        return;
      }

        const res = await axios.get('https://livenest-backend.onrender.com/conversations', {
          headers: { Authorization: `Bearer ${token}` }, // Asegúrate de enviar el token en los headers
        });
        setConversations(res.data);
      } catch (error) {
        console.error("Error al obtener conversaciones:", error);
      }
    };
    

    fetchConversations();
  }, [navigate]);

  return (
    <div>
      <h2>Conversations</h2>
      <ul>
        {conversations.map((conversation) => (
          <li key={conversation._id}>
            <Link to={`/conversations/${conversation._id}`}>
              {conversation.users.map(user => user.username).join(', ')}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default Conversations;

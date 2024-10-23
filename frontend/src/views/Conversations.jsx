import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';

const Conversations = () => {
  const [conversations, setConversations] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchConversations = async () => {
      try {
        const token = localStorage.getItem('token');
        const response = await axios.get('http://localhost:5000/conversations', {
          headers: { Authorization: `Bearer ${token}` },
        });
        setConversations(response.data);
      } catch (error) {
        console.error(error);
        navigate('/');
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

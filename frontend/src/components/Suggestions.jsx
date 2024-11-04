import { useState, useEffect } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import { FaSpinner } from 'react-icons/fa';

const Suggestions = () => {
  const [suggestedUsers, setSuggestedUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchSuggestions = async () => {
    try {
      const token = localStorage.getItem('token') || sessionStorage.getItem('token');
      if (!token) {
        setLoading(false);
        return;
      }

      const response = await axios.get(
        `${import.meta.env.VITE_API_URL}/profile/suggestions`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setSuggestedUsers(response.data);
      setError('');
    } catch (err) {
      console.error('Error al obtener sugerencias:', err);
      setError('Hubo un error al obtener sugerencias.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSuggestions();
  }, []);

  const handleToggleFollow = async (userId) => {
    try {
      const token = localStorage.getItem('token') || sessionStorage.getItem('token');
      const response = await axios.post(
        `${import.meta.env.VITE_API_URL}/profile/${userId}/toggleFollow`,
        {},
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      // Actualizar el estado local después de seguir/dejar de seguir
      setSuggestedUsers(prevUsers =>
        prevUsers.map(user =>
          user._id === userId
            ? { ...user, isFollowing: response.data.following }
            : user
        )
      );
    } catch (err) {
      console.error('Error al seguir/dejar de seguir:', err);
      alert('Hubo un error al seguir/dejar de seguir al usuario.');
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center p-4">
        <FaSpinner className="animate-spin text-2xl text-purple-600" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 text-red-500 text-sm">
        {error}
      </div>
    );
  }

  return (
    <div className="mt-6 p-4  text-white rounded-md">
      <h2 className="text-sm text-gray-500 font-semibold mb-4">Sugerencias para ti</h2>
      {suggestedUsers.length === 0 ? (
        <p className="text-gray-400">No hay sugerencias disponibles.</p>
      ) : (
        <ul>
          {suggestedUsers.map(user => (
            <li key={user._id} className="flex items-center justify-between mb-4">
              <Link to={`/profile/${user.username}`} className="flex items-center space-x-3">
                <img
                  src={user.profilePicture?.secure_url || '/default-avatar.png'}
                  alt={user.username}
                  className="w-10 h-10 rounded-full"
                />
                <span className="">{user.username}</span>
              </Link>
              <button
                onClick={() => handleToggleFollow(user._id)}
                className={`px-3 py-1 rounded-md text-sm ${
                  user.isFollowing
                    ? 'bg-gray-700  hover:bg-gray-600'
                    : 'bg-purple-600  hover:bg-purple-500'
                }`}
              >
                {user.isFollowing ? 'Dejar de Seguir' : 'Seguir'}
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default Suggestions;

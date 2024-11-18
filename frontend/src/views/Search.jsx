import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import defaultIcon from '../assets/default-avatar.png'

const Search = () => {
    const [query, setQuery] = useState('');
    const [results, setResults] = useState([]);
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const handleSearch = async (e) => {
        const value = e.target.value;
        setQuery(value);

        if (!value.trim()) {
            setResults([]);
            return;
        }

        setLoading(true);
        try {
            const response = await axios.get(`${import.meta.env.VITE_API_URL}/profile/users`, {
                params: { username: value },
                headers: { Authorization: `Bearer ${localStorage.getItem('token') || sessionStorage.getItem('token')}` },
            });
            setResults(response.data);
        } catch (error) {
            console.error('Error al buscar usuarios:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleUserClick = (username) => {
        navigate(`/profile/${username}`);
    };

    return (
        <div className="flex flex-col items-center p-4 bg-gray-900 min-h-screen">
            <h1 className="text-3xl font-bold text-white mb-6">Buscar Usuarios</h1>
            <input
                type="text"
                value={query}
                onChange={handleSearch}
                placeholder="Escribe un nombre de usuario..."
                className="w-full max-w-md p-3 rounded bg-gray-800 text-white placeholder-gray-400 mb-4 border border-white focus:outline-none"
            />

            {loading ? (
                <p className="text-white">Cargando...</p>
            ) : (
                <ul className="w-full max-w-md rounded-lg gap-y-2 flex flex-col shadow-md">
                    {results.length > 0 ? (
                        results.map((user) => (
                            <li
                                key={user._id}
                                onClick={() => handleUserClick(user.username)}
                                className="flex items-center p-3 bg-gray-800 cursor-pointer hover:bg-gray-700"
                            >
                                <img
                                    src={user.profilePicture?.secure_url || defaultIcon}
                                    alt={`${user.username} profile`}
                                    className="w-10 h-10 object-cover rounded-full mr-3"
                                />
                                <span className="text-white">{user.username}</span>
                            </li>
                        ))
                    ) : (
                        query && <p className="text-gray-400 text-center p-4">No se encontraron usuarios.</p>
                    )}
                </ul>
            )}
        </div>
    );
};

export default Search;

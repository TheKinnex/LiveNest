import { useEffect, useState } from 'react';
import { FaHome, FaSearch, FaUser, FaEnvelope, FaPlus } from "react-icons/fa";
import { Link, useLocation, useNavigate } from 'react-router-dom';
import axios from 'axios';

const Sidebar = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const [username, setUsername] = useState(null);

    // Función para determinar si el enlace está activo
    const isActive = (path) => {
        return location.pathname === path;
    };

    useEffect(() => {
        const fetchCurrentUserProfile = async () => {
            try {
                const token = localStorage.getItem('token') || sessionStorage.getItem('token');
                const response = await axios.get(`${import.meta.env.VITE_API_URL}/profile/current`, {
                    headers: { Authorization: `Bearer ${token}` }
                });
                setUsername(response.data.username);
            } catch (error) {
                console.error("Error al obtener el perfil del usuario:", error);
            }
        };
        
        fetchCurrentUserProfile();
    }, []);

    const handleProfileClick = () => {
        if (username) {
            navigate(`/profile/${username}`);
        }
    };

    return (
        <>
            {/* Barra lateral para escritorio */}
            <div className="hidden md:flex flex-col h-full w-64 bg-[#1F2937] text-white p-4">
                <aside className="flex flex-col h-full">
                    <div className="p-5">
                        <h1 className="text-2xl font-bold">LiveNest</h1>
                    </div>
                    <nav className="flex flex-col mt-10 space-y-5 flex-grow">
                        <Link 
                            to="/" 
                            className={`flex items-center px-4 py-2 rounded hover:bg-gray-700 transition-colors duration-200 ${isActive('/') ? 'bg-gray-700' : ''}`} 
                            aria-label="Inicio"
                        >
                            <FaHome className="mr-3" />
                            Inicio
                        </Link>
                        <Link 
                            to="/search" 
                            className={`flex items-center px-4 py-2 rounded hover:bg-gray-700 transition-colors duration-200 ${isActive('/search') ? 'bg-gray-700' : ''}`} 
                            aria-label="Buscar"
                        >
                            <FaSearch className="mr-3" />
                            Buscar
                        </Link>
                        <Link 
                            to="/create-post" 
                            className={`flex items-center px-4 py-2 rounded hover:bg-gray-700 transition-colors duration-200 ${isActive('/explore') ? 'bg-gray-700' : ''}`} 
                            aria-label="Post"
                        >
                            <FaPlus className="mr-3" />
                            Crear Post
                        </Link>
                        <Link 
                            to="/conversations" 
                            className={`flex items-center px-4 py-2 rounded hover:bg-gray-700 transition-colors duration-200 ${isActive('/messages') ? 'bg-gray-700' : ''}`} 
                            aria-label="Mensajes"
                        >
                            <FaEnvelope className="mr-3" />
                            Mensajes
                        </Link>
                        <button 
                            onClick={handleProfileClick} 
                            className={`flex items-center px-4 py-2 rounded hover:bg-gray-700 transition-colors duration-200 ${isActive(`/profile/${username}`) ? 'bg-gray-700' : ''}`} 
                            aria-label="Perfil"
                        >
                            <FaUser className="mr-3" />
                            Perfil
                        </button>
                    </nav>
                </aside>
            </div>

            {/* Barra inferior para móviles */}
            <div className="md:hidden fixed bottom-0 left-0 w-full bg-[#1F2937] text-white flex justify-around py-4 shadow-t">
                <Link 
                    to="/" 
                    className={`flex flex-col items-center ${isActive('/') ? 'text-purple-500' : 'text-gray-400'}`} 
                    aria-label="Inicio"
                >
                    <FaHome className="text-xl" />
                </Link>
                <Link 
                    to="/search" 
                    className={`flex flex-col items-center ${isActive('/search') ? 'text-purple-500' : 'text-gray-400'}`} 
                    aria-label="Buscar"
                >
                    <FaSearch className="text-xl" />
                </Link>
                <Link 
                    to="/create-post" 
                    className={`flex flex-col items-center ${isActive('/explore') ? 'text-purple-500' : 'text-gray-400'}`} 
                    aria-label="create post"
                >
                    <FaPlus className="text-xl" />
                </Link>
                <Link 
                    to="/conversations" 
                    className={`flex flex-col items-center ${isActive('/messages') ? 'text-purple-500' : 'text-gray-400'}`} 
                    aria-label="Mensajes"
                >
                    <FaEnvelope className="text-xl" />
                </Link>
                <button 
                    onClick={handleProfileClick} 
                    className={`flex flex-col items-center ${isActive(`/profile/${username}`) ? 'text-purple-500' : 'text-gray-400'}`} 
                    aria-label="Perfil"
                >
                    <FaUser className="text-xl" />
                </button>
            </div>
        </>
    );
};

export default Sidebar;

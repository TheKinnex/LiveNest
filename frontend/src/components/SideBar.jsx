import { useEffect, useState } from 'react';
import { FaHome, FaSearch, FaUser, FaEnvelope, FaPlus, FaStar, FaClipboardList } from "react-icons/fa";
import { Link, useLocation, useNavigate } from 'react-router-dom';
import axios from 'axios';
import CreatePostModal from './CreatePostModal';

const Sidebar = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const [username, setUsername] = useState(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isPremium, setIsPremium] = useState(false);

    const isActive = (path) => {
        if (path.includes(':username') && username) {
            return location.pathname === path.replace(':username', username);
        }
        return location.pathname === path;
    };

    useEffect(() => {
        const fetchCurrentUserProfile = async () => {
            try {
                const token = localStorage.getItem('token') || sessionStorage.getItem('token');
                if (!token) {
                    navigate('/login');
                    return;
                }

                const response = await axios.get(`${import.meta.env.VITE_API_URL}/profile/current`, {
                    headers: { Authorization: `Bearer ${token}` },
                });
                setUsername(response.data.username);
                setIsPremium(response.data.isPremium);
            } catch (error) {
                console.error("Error al obtener el perfil del usuario:", error);
                navigate('/login');
            }
        };

        fetchCurrentUserProfile();
    }, [navigate]);

    const handleProfileClick = () => {
        if (username) {
            navigate(`/profile/${username}`);
        }
    };

    const handleOpenModal = () => {
        setIsModalOpen(true);
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
    };

    return (
        <>
            {/* Sidebar para pantallas grandes */}
            <div className=" hidden lg:flex flex-col h-full w-full bg-[#1F2937] text-white p-4 sidebar">
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
                        <button
                            onClick={handleOpenModal}
                            className={`flex items-center px-4 py-2 rounded hover:bg-gray-700 transition-colors duration-200 w-full text-left ${isActive('/create-post') ? 'bg-gray-700' : ''}`}
                            aria-label="Crear Post"
                        >
                            <FaPlus className="mr-3" />
                            Crear Post
                        </button>
                        <Link 
                            to="/conversations" 
                            className={`flex items-center px-4 py-2 rounded hover:bg-gray-700 transition-colors duration-200 ${isActive('/conversations') ? 'bg-gray-700' : ''}`} 
                            aria-label="Mensajes"
                        >
                            <FaEnvelope className="mr-3" />
                            Mensajes
                        </Link>
                        <Link 
                            to="/subscriptions" 
                            className={`flex items-center px-4 py-2 rounded hover:bg-gray-700 transition-colors duration-200 ${isActive('/subscriptions') ? 'bg-gray-700' : ''}`} 
                            aria-label="Suscripciones"
                        >
                            <FaStar className="mr-3" />
                            Suscripciones
                        </Link>
                        <Link 
                            to="/my-subscriptions" 
                            className={`flex items-center px-4 py-2 rounded hover:bg-gray-700 transition-colors duration-200 ${isActive('/my-subscriptions') ? 'bg-gray-700' : ''}`} 
                            aria-label="Mis Suscripciones"
                        >
                            <FaClipboardList className="mr-3" />
                            Mis Suscripciones
                        </Link>
                        <Link 
                            to="/account/edit" 
                            className={`flex items-center px-4 py-2 rounded hover:bg-gray-700 transition-colors duration-200 ${isActive('/account/edit') ? 'bg-gray-700' : ''}`} 
                            aria-label="Editar Perfil"
                        >
                            <FaUser className="mr-3" />
                            Editar Perfil
                        </Link>
                        <button 
                            onClick={handleProfileClick} 
                            className={`flex items-center px-4 py-2 rounded hover:bg-gray-700 transition-colors duration-200 ${username && isActive(`/profile/${username}`) ? 'bg-gray-700' : ''}`} 
                            aria-label="Perfil"
                        >
                            <FaUser className="mr-3" />
                            Perfil
                        </button>
                    </nav>
                </aside>
            </div>

            {/* Barra inferior para móviles */}
            <div className="lg:hidden fixed bottom-0 left-0 w-full bg-[#1F2937] text-white flex justify-around py-4 shadow-t z-50">
                <Link to="/" className={`flex flex-col items-center ${isActive('/') ? 'text-purple-500' : 'text-gray-400'}`} aria-label="Inicio">
                    <FaHome className="text-xl" />
                </Link>
                <Link to="/search" className={`flex flex-col items-center ${isActive('/search') ? 'text-purple-500' : 'text-gray-400'}`} aria-label="Buscar">
                    <FaSearch className="text-xl" />
                </Link>
                <Link to="/create-post" className={`flex flex-col items-center ${isActive('/create-post') ? 'text-purple-500' : 'text-gray-400'}`} aria-label="Crear Post">
                    <FaPlus className="text-xl" />
                </Link>
                <Link to="/conversations" className={`flex flex-col items-center ${isActive('/conversations') ? 'text-purple-500' : 'text-gray-400'}`} aria-label="Mensajes">
                    <FaEnvelope className="text-xl" />
                </Link>
                <button onClick={handleProfileClick} className={`flex flex-col items-center ${username && isActive(`/profile/${username}`) ? 'text-purple-500' : 'text-gray-400'}`} aria-label="Perfil">
                    <FaUser className="text-xl" />
                </button>
            </div>

            {/* Modal para Crear Post */}
            <CreatePostModal
                isOpen={isModalOpen}
                onClose={handleCloseModal}
                isPremium={isPremium}
            />
        </>
    );
};

export default Sidebar;

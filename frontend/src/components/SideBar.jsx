import { useEffect, useState } from 'react';
import { FaHome, FaSearch, FaUser, FaEnvelope, FaPlus, FaStar, FaClipboardList, FaSignOutAlt, FaTachometerAlt, FaUsers, FaUserSlash, FaFlag, FaRegFileAlt, FaArrowLeft } from "react-icons/fa";
import { Link, useLocation, useNavigate } from 'react-router-dom';
import axios from 'axios';
import CreatePostModal from './CreatePostModal';
import defaultIcon from '../assets/default-avatar.png'
import LogoTipo from '../assets/Proyecto Nuevo.png'

const Sidebar = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const [username, setUsername] = useState(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isPremium, setIsPremium] = useState(false);
    const [profilePicture, setProfilePicture] = useState(null);
    const [role, setRole] = useState(null);
    const [isAdminView, setIsAdminView] = useState(false);

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
                setProfilePicture(response.data.profilePicture?.secure_url || defaultIcon);
                setRole(localStorage.getItem("role") || sessionStorage.getItem("role"));
            } catch (error) {
                if (error.response && error.response.status === 403) {
                    navigate('/blocked'); // Redirigir si el usuario está bloqueado
                } else {
                    console.error("Error al obtener el perfil del usuario:", error);
                    navigate('/login');
                }
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


    const handleLogout = () => {
        localStorage.removeItem('token');
        sessionStorage.removeItem('token');
        localStorage.removeItem('userId');
        sessionStorage.removeItem('userId');
        localStorage.removeItem('role');
        sessionStorage.removeItem('role');
        localStorage.removeItem('username');
        sessionStorage.removeItem('username');
        navigate('/login');
    };

    const toggleAdminView = () => setIsAdminView(!isAdminView);

    return (
        <>
            {/* Sidebar para pantallas grandes */}
            <div className=" hidden lg:flex flex-col h-full w-full bg-[#1F2937] text-white p-4 sidebar">
                <aside className="flex flex-col h-full">
                <Link to={'/'}> <img src={LogoTipo} className='w-36' /> </Link>
                    <nav className="flex flex-col mt-10 space-y-5 flex-grow">
                        {role === 'admin' && (
                            <button
                                onClick={toggleAdminView}
                                className="flex items-center px-4 py-2 rounded hover:bg-gray-700 transition-colors duration-200 text-left"
                                aria-label="Dashboard"
                            >
                                {isAdminView ? <FaArrowLeft className="mr-3" /> : <FaTachometerAlt className="mr-3" />}
                                {isAdminView ? 'Regresar' : 'Dashboard'}
                            </button>
                        )}
                        {isAdminView ? (
                            <>
                                <Link to="/admin/users" className={`flex items-center px-4 py-2 rounded hover:bg-gray-700 transition-colors duration-200 ${isActive('/admin/users') ? 'bg-gray-700' : ''}`} aria-label="Usuarios">
                                    <FaUsers className="mr-3" />
                                    Usuarios
                                </Link>
                                <Link to="/admin/subscriptions" className={`flex items-center px-4 py-2 rounded hover:bg-gray-700 transition-colors duration-200 ${isActive('/admin/subscriptions') ? 'bg-gray-700' : ''}`} aria-label="Suscripciones">
                                    <FaClipboardList className="mr-3" />
                                    Suscripciones
                                </Link>
                                <Link to="/admin/blocked-users" className={`flex items-center px-4 py-2 rounded hover:bg-gray-700 transition-colors duration-200 ${isActive('/admin/blocked-users') ? 'bg-gray-700' : ''}`} aria-label="Usuarios Bloqueados">
                                    <FaUserSlash className="mr-3" />
                                    Bloqueados
                                </Link>
                                <Link to="/admin/reports" className={`flex items-center px-4 py-2 rounded hover:bg-gray-700 transition-colors duration-200 ${isActive('/admin/reports') ? 'bg-gray-700' : ''}`} aria-label="Reportes">
                                    <FaFlag className="mr-3" />
                                    Reportes
                                </Link>
                                <Link to="/admin/posts" className={`flex items-center px-4 py-2 rounded hover:bg-gray-700 transition-colors duration-200 ${isActive('/admin/posts') ? 'bg-gray-700' : ''}`} aria-label="Posts">
                                    <FaRegFileAlt className="mr-3" />
                                    Posts
                                </Link>
                            </>
                        ) : (
                            <>
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
                                    {profilePicture ? (
                                        <img src={profilePicture} alt="Perfil" className="h-8 w-h-8 rounded-full mr-3 object-cover" />
                                    ) : (
                                        <FaUser className="mr-3" />
                                    )}
                                    Perfil
                                </button>
                            </>
                        )}
                        <button onClick={handleLogout} className="mt-10 bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600 flex items-center justify-center">
                            <FaSignOutAlt className="mr-2" />
                            Cerrar Sesión
                        </button>
                    </nav>
                </aside>
            </div >

            {/* Barra inferior para móviles */}
            <div className="lg:hidden fixed bottom-0 left-0 w-full bg-[#1F2937] text-white flex justify-around items-center py-4 shadow-t z-50">
                {role === 'admin' && (
                    <button onClick={toggleAdminView} className="flex flex-col items-center text-gray-400 hover:text-purple-500" aria-label="Dashboard">
                        {isAdminView ? <FaArrowLeft className="text-xl" /> : <FaTachometerAlt className="text-xl" />}
                    </button>
                )}

                {isAdminView ? (
                    <>
                        <Link to="/admin/users" className={`flex flex-col items-center ${isActive('/admin/users') ? 'text-purple-500' : 'text-gray-400'}`} aria-label="Usuarios">
                            <FaUsers className="text-xl" />
                        </Link>
                        <Link to="/admin/subscriptions" className={`flex flex-col items-center ${isActive('/admin/subscriptions') ? 'text-purple-500' : 'text-gray-400'}`} aria-label="Suscripciones">
                            <FaClipboardList className="text-xl" />
                        </Link>
                        <Link to="/admin/blocked-users" className={`flex flex-col items-center ${isActive('/admin/blocked-users') ? 'text-purple-500' : 'text-gray-400'}`} aria-label="Bloqueados">
                            <FaUserSlash className="text-xl" />
                        </Link>
                        <Link to="/admin/reports" className={`flex flex-col items-center ${isActive('/admin/reports') ? 'text-purple-500' : 'text-gray-400'}`} aria-label="Reportes">
                            <FaFlag className="text-xl" />
                        </Link>
                        <Link to="/admin/posts" className={`flex flex-col items-center ${isActive('/admin/posts') ? 'text-purple-500' : 'text-gray-400'}`} aria-label="Posts">
                            <FaRegFileAlt className="text-xl" />
                        </Link>
                    </>
                ) : (
                    <>
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
                            {profilePicture ? (
                                <img src={profilePicture} alt="Perfil" className="h-8 w-8 rounded-full object-cover" />
                            ) : (
                                <FaUser className="text-xl" />
                            )}
                        </button>
                    </>
                )}

                <button onClick={handleLogout} className="flex flex-col items-center text-gray-400 hover:text-purple-500" aria-label="Cerrar Sesión">
                    <FaSignOutAlt className="text-xl" />
                </button>
            </div>


            {/* Modal para Crear Post */}
            < CreatePostModal
                isOpen={isModalOpen}
                onClose={handleCloseModal}
                isPremium={isPremium}
            />
        </>
    );
};

export default Sidebar;

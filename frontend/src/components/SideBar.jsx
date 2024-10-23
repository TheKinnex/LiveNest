// src/components/Sidebar.jsx
import { FaHome, FaSearch, FaUser, FaEnvelope, FaBell } from "react-icons/fa";
import { Link } from 'react-router-dom';

const Sidebar = () => {
    return (
        <div>
            {/* Barra lateral para escritorio */}
            <aside className="hidden md:flex flex-col h-screen w-64 bg-[#1F2937] text-white p-4">
                <div className="p-5">
                    <h1 className="text-2xl font-bold">LiveNest</h1>
                </div>
                <nav className="flex flex-col mt-10 space-y-5">
                    <Link to="/" className="flex items-center px-4 py-2 hover:bg-gray-700">
                        <FaHome className="mr-3" />
                        Inicio
                    </Link>
                    <Link to="/search" className="flex items-center px-4 py-2 hover:bg-gray-700">
                        <FaSearch className="mr-3" />
                        Buscar
                    </Link>
                    <Link to="/explore" className="flex items-center px-4 py-2 hover:bg-gray-700">
                        <FaBell className="mr-3" />
                        Explorar
                    </Link>
                    <Link to="/messages" className="flex items-center px-4 py-2 hover:bg-gray-700">
                        <FaEnvelope className="mr-3" />
                        Mensajes
                    </Link>
                    <Link to="/profile" className="flex items-center px-4 py-2 hover:bg-gray-700">
                        <FaUser className="mr-3" />
                        Perfil
                    </Link>
                </nav>
            </aside>

            {/* Barra inferior para móviles */}
            <div className="md:hidden fixed bottom-0 w-full bg-[#1F2937] text-white flex justify-around py-3">
                <a href="/" className="flex flex-col items-center">
                    <FaHome />
                    <span className="text-xs">Inicio</span>
                </a>
                <a href="/search" className="flex flex-col items-center">
                    <FaSearch />
                    <span className="text-xs">Buscar</span>
                </a>
                <a href="/explore" className="flex flex-col items-center">
                    <FaBell />
                    <span className="text-xs">Explorar</span>
                </a>
                <a href="/messages" className="flex flex-col items-center">
                    <FaEnvelope />
                    <span className="text-xs">Mensajes</span>
                </a>
                <a href="/profile" className="flex flex-col items-center">
                    <FaUser />
                    <span className="text-xs">Perfil</span>
                </a>
            </div>
        </div>
    );
};

export default Sidebar;

// src/components/Layout.jsx
import { useLocation } from 'react-router-dom';
import Sidebar from './SideBar';
import { Outlet } from 'react-router-dom';

const Layout = () => {
    const location = useLocation();

    // Definir las rutas donde no se mostrará el Sidebar
    const hideSidebarRoutes = ["/login", "/register", "/verify"];

    const showSidebar = !hideSidebarRoutes.includes(location.pathname);

    return (
        <div className="flex h-screen flex-col md:flex-row">
            {/* Mostrar el Sidebar solo en pantallas grandes */}
            {showSidebar && (
                <div className="hidden md:flex w-64 h-full">
                    <Sidebar />
                </div>
            )}

            {/* Contenido principal */}
            <div className="flex-1 flex flex-col overflow-y-auto h-full">
                <Outlet />

                {/* Barra de navegación inferior en móviles */}
                {showSidebar && (
                    <div className="md:hidden fixed bottom-0 w-full bg-gray-900 text-white py-3">
                        <Sidebar />
                    </div>
                )}
            </div>
        </div>
    );
};

export default Layout;

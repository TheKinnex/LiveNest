import { useLocation } from 'react-router-dom';
import Sidebar from './SideBar';
import HeaderMobile from './HeaderMobile';
import { Outlet } from 'react-router-dom';

const Layout = () => {
    const location = useLocation();

    // Definir las rutas donde no se mostrará el Sidebar y HeaderMobile
    const hideSidebarRoutes = ["/login", "/register", "/verify"];
    const showSidebar = !hideSidebarRoutes.includes(location.pathname);

    return (
        <div className="flex min-h-screen lg:h-screen overflow-hidden">
            {/* Header solo en dispositivos móviles */}
            {showSidebar && <HeaderMobile />}

            {/* Sidebar fijo solo en pantallas grandes */}
            {showSidebar && (
                <div className="hidden lg:flex w-64 h-full bg-[#1F2937]">
                    <Sidebar />
                </div>
            )}

            {/* Contenido principal */}
            <div className="flex-1 flex flex-col bg-[#111827] min-h-screen overflow-y-auto pt-12 lg:pt-0">
                <Outlet />

                {/* Barra de navegación inferior en móviles */}
                {showSidebar && (
                    <div className="lg:hidden fixed bottom-0 w-full bg-gray-900 text-white py-3">
                        <Sidebar />
                    </div>
                )}
            </div>
        </div>
    );
};

export default Layout;

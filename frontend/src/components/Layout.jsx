// src/components/Layout.jsx
import { useLocation } from 'react-router-dom';
import Sidebar from './SideBar';
import { Outlet } from 'react-router-dom';

const Layout = () => {
    const location = useLocation();

    // Definir las rutas donde no se mostrará el Sidebar
    const hideSidebarRoutes = ["/", "/register", "/verify"];

    const showSidebar = !hideSidebarRoutes.includes(location.pathname);

    return (
        <div className="flex h-screen">
            {showSidebar && (
                <div>
                    <div className="w-64 hidden md:block">
                        <Sidebar />
                    </div>
                    <div className=" block md:hidden">
                        <Sidebar />
                    </div>
                </div>
            )}
            <div className={`flex-1 ${showSidebar ? '' : 'w-full'}`}>
                <Outlet />
            </div>
        </div>
    );
};

export default Layout;

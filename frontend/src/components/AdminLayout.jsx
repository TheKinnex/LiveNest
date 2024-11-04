import { Outlet, NavLink } from 'react-router-dom';
import { FaUsers, FaClipboardList, FaUserLock, FaExclamationTriangle, FaRegNewspaper } from 'react-icons/fa';

const AdminLayout = () => {
  return (
    <div className="flex h-screen bg-gray-100">
      {/* Barra Lateral */}
      <aside className="w-64 bg-gray-800 text-white flex flex-col">
        <div className="p-4 text-2xl font-bold bg-gray-900">
          Admin Panel
        </div>
        <nav className="flex-1 p-4 space-y-2">
          <NavLink
            to="/admin/users"
            className={({ isActive }) =>
              `flex items-center px-4 py-2 rounded hover:bg-gray-700 ${
                isActive ? 'bg-gray-700' : ''
              }`
            }
          >
            <FaUsers className="mr-3" />
            Todos los Usuarios
          </NavLink>
          <NavLink
            to="/admin/subscriptions"
            className={({ isActive }) =>
              `flex items-center px-4 py-2 rounded hover:bg-gray-700 ${
                isActive ? 'bg-gray-700' : ''
              }`
            }
          >
            <FaClipboardList className="mr-3" />
            Todas las Suscripciones
          </NavLink>
          <NavLink
            to="/admin/blocked-users"
            className={({ isActive }) =>
              `flex items-center px-4 py-2 rounded hover:bg-gray-700 ${
                isActive ? 'bg-gray-700' : ''
              }`
            }
          >
            <FaUserLock className="mr-3" />
            Usuarios Bloqueados
          </NavLink>
          <NavLink
            to="/admin/reports"
            className={({ isActive }) =>
              `flex items-center px-4 py-2 rounded hover:bg-gray-700 ${
                isActive ? 'bg-gray-700' : ''
              }`
            }
          >
            <FaExclamationTriangle className="mr-3" />
            Reportes
          </NavLink>
          <NavLink
            to="/admin/posts"
            className={({ isActive }) =>
              `flex items-center px-4 py-2 rounded hover:bg-gray-700 ${
                isActive ? 'bg-gray-700' : ''
              }`
            }
          >
            <FaRegNewspaper className="mr-3" />
            Todos los Posts
          </NavLink>
        </nav>
      </aside>

      {/* Contenido Principal */}
      <main className="flex-1 p-4 overflow-auto">
        <Outlet />
      </main>
    </div>
  );
};

export default AdminLayout;

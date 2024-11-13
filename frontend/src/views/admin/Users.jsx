import { useEffect, useState } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import Loading from '../../components/Loading';

const Users = () => {
    const [users, setUsers] = useState([]);
    const [filteredUsers, setFilteredUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [editUserId, setEditUserId] = useState(null); 
    const [editData, setEditData] = useState({ username: '', email: '', role: '' }); 
    const [searchTerm, setSearchTerm] = useState('');

    const fetchUsers = async () => {
        try {
            const token = localStorage.getItem('token') || sessionStorage.getItem('token');
            const response = await axios.get(`${import.meta.env.VITE_API_URL}/admin/users`, {
                headers: { Authorization: `Bearer ${token}` },
            });
            setUsers(response.data);
            setFilteredUsers(response.data);
            setLoading(false);
        } catch (err) {
            console.error(err);
            setError('Error al obtener los usuarios.');
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchUsers();
    }, []);

    const handleSearch = (e) => {
        const value = e.target.value.toLowerCase();
        setSearchTerm(value);
        const filtered = users.filter(user => 
            user.username.toLowerCase().includes(value) || 
            user.email.toLowerCase().includes(value)
        );
        setFilteredUsers(filtered);
    };

    const handleEditClick = (user) => {
        setEditUserId(user._id);
        setEditData({ username: user.username, email: user.email, role: user.role });
    };

    const handleEditChange = (e) => {
        const { name, value } = e.target;
        setEditData((prevData) => ({ ...prevData, [name]: value }));
    };

    const handleSave = async () => {
        try {
            const token = localStorage.getItem('token') || sessionStorage.getItem('token');
            await axios.patch(`${import.meta.env.VITE_API_URL}/admin/users/${editUserId}`, editData, {
                headers: { Authorization: `Bearer ${token}` },
            });
            fetchUsers();
            setEditUserId(null);
        } catch (err) {
            console.error("Error al actualizar el usuario:", err);
            setError('Error al actualizar el usuario.');
        }
    };

    const handleBlockUnblock = async (userId, isBlocked) => {
        try {
            const token = localStorage.getItem('token') || sessionStorage.getItem('token');
            const action = isBlocked ? 'unblock' : 'block';
            
            await axios.patch(
                `${import.meta.env.VITE_API_URL}/admin/users/${userId}/${action}`,
                { action },
                {
                    headers: { Authorization: `Bearer ${token}` },
                }
            );
    
            fetchUsers();
        } catch (err) {
            console.error("Error al bloquear/desbloquear usuario:", err);
            setError('Error al actualizar el estado del usuario.');
        }
    };
    
    if (loading) return <Loading/>;
    if (error) return <div className="text-red-500">{error}</div>;

    return (
        <div className="p-4 md:p-6 lg:p-8 mb-14">
            <h2 className="text-2xl font-semibold text-white mb-4">Todos los Usuarios</h2>

            {/* Barra de búsqueda */}
            <input
                type="text"
                placeholder="Buscar por nombre de usuario o correo"
                value={searchTerm}
                onChange={handleSearch}
                className="w-full mb-4 px-3 py-2 rounded-md bg-gray-800 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500"
            />

            <div className="overflow-x-auto">
                <table className="min-w-full bg-gray-800 text-white rounded-lg">
                    <thead>
                        <tr>
                            <th className="py-2 px-2 md:px-4 border-b text-xs md:text-sm">Nombre de Usuario</th>
                            <th className="py-2 px-2 md:px-4 border-b text-xs md:text-sm">Correo Electrónico</th>
                            <th className="py-2 px-2 md:px-4 border-b text-xs md:text-sm">Rol</th>
                            <th className="py-2 px-2 md:px-4 border-b text-xs md:text-sm">Estado</th>
                            <th className="py-2 px-2 md:px-4 border-b text-xs md:text-sm">Acciones</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredUsers.map(user => (
                            <tr key={user._id} className="text-center">
                                <td className="py-2 px-2 md:px-4 border-b">
                                    <Link className="text-blue-300 text-xs md:text-sm" to={`/profile/${user.username}`}>
                                        {user.username}
                                    </Link>
                                </td>
                                <td className="py-2 px-2 md:px-4 border-b text-xs md:text-sm">{user.email}</td>
                                <td className="py-2 px-2 md:px-4 border-b text-xs md:text-sm">{user.role}</td>
                                <td className="py-2 px-2 md:px-4 border-b text-xs md:text-sm">
                                    {user.isBlocked ? 'Bloqueado' : 'Activo'}
                                </td>
                                <td className="py-2 px-2 md:px-4 border-b flex justify-center gap-2">
                                    <button
                                        className="bg-blue-500 text-white text-xs md:text-sm px-2 py-1 rounded hover:bg-blue-600"
                                        onClick={() => handleEditClick(user)}
                                    >
                                        Editar
                                    </button>
                                    <button
                                        className={`text-xs md:text-sm px-2 py-1 rounded ${
                                            user.isBlocked ? 'bg-green-500 hover:bg-green-600' : 'bg-red-500 hover:bg-red-600'
                                        } text-white`}
                                        onClick={() => handleBlockUnblock(user._id, user.isBlocked)}
                                    >
                                        {user.isBlocked ? 'Desbloquear' : 'Bloquear'}
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* Formulario de edición desplegable */}
            {editUserId && (
                <div className="bg-gray-700 text-white p-4 mt-4 rounded">
                    <h3 className="text-lg font-semibold mb-4">Editar Usuario</h3>
                    <div className="flex flex-col gap-y-2">
                        <label className="text-xs md:text-sm">
                            Nombre de Usuario:
                            <input
                                type="text"
                                name="username"
                                value={editData.username}
                                onChange={handleEditChange}
                                className="w-full px-2 py-1 mt-1 rounded bg-gray-800 text-white text-xs md:text-sm"
                            />
                        </label>
                        <label className="text-xs md:text-sm">
                            Correo Electrónico:
                            <input
                                type="email"
                                name="email"
                                value={editData.email}
                                onChange={handleEditChange}
                                className="w-full px-2 py-1 mt-1 rounded bg-gray-800 text-white text-xs md:text-sm"
                            />
                        </label>
                        <label className="text-xs md:text-sm">
                            Rol:
                            <select
                                name="role"
                                value={editData.role}
                                onChange={handleEditChange}
                                className="w-full px-2 py-1 mt-1 rounded bg-gray-800 text-white text-xs md:text-sm"
                            >
                                <option value="user">Usuario</option>
                                <option value="admin">Administrador</option>
                            </select>
                        </label>
                    </div>
                    <div className="flex mt-4 gap-2 justify-end">
                        <button
                            className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600 text-xs md:text-sm"
                            onClick={handleSave}
                        >
                            Guardar
                        </button>
                        <button
                            className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600 text-xs md:text-sm"
                            onClick={() => setEditUserId(null)}
                        >
                            Cancelar
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Users;

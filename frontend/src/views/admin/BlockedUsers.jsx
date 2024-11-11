import { useEffect, useState } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';

const BlockedUsers = () => {
    const [blockedUsers, setBlockedUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    const fetchBlockedUsers = async () => {
        try {
            const token = localStorage.getItem('token') || sessionStorage.getItem('token');
            const response = await axios.get(`${import.meta.env.VITE_API_URL}/admin/users`, {
                headers: { Authorization: `Bearer ${token}` },
            });
            const blocked = response.data.filter(user => user.isBlocked);
            setBlockedUsers(blocked);
            setLoading(false);
        } catch (err) {
            console.error(err);
            setError('Error al obtener los usuarios bloqueados.');
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchBlockedUsers();
    }, []);

    const handleBlockUnblock = async (userId, isBlocked) => {
        try {
            const token = localStorage.getItem('token') || sessionStorage.getItem('token');
            const action = isBlocked ? 'unblock' : 'block';

            await axios.patch(
                `${import.meta.env.VITE_API_URL}/admin/users/${userId}/block`,
                { action },
                {
                    headers: { Authorization: `Bearer ${token}` },
                }
            );
            fetchBlockedUsers()
        } catch (err) {
            console.error("Error al bloquear/desbloquear usuario:", err);
            setError('Error al actualizar el estado del usuario.');
        }
    };

    if (loading) return <div className="text-white">Cargando usuarios bloqueados...</div>;
    if (error) return <div className="text-red-500">{error}</div>;

    return (
        <div className="p-4 md:p-6 lg:p-8 mb-14">
            <h2 className="text-2xl font-semibold text-white mb-4">Usuarios Bloqueados</h2>
            <div className="overflow-x-auto">
                <table className="min-w-full bg-gray-800 text-white rounded-lg">
                    <thead>
                        <tr>
                            <th className="py-2 px-4 border-b">Nombre de Usuario</th>
                            <th className="py-2 px-4 border-b">Correo Electrónico</th>
                            <th className="py-2 px-4 border-b">Rol</th>
                            <th className="py-2 px-4 border-b">Acción</th>
                        </tr>
                    </thead>
                    <tbody>
                        {blockedUsers.map(user => (
                            <tr key={user._id} className="text-center">
                                <td className="py-2 px-4 border-b">
                                    <Link className="text-blue-300 text-xs md:text-sm" to={`/profile/${user.username}`}>
                                        {user.username}
                                    </Link>
                                </td>
                                <td className="py-2 px-4 border-b">{user.email}</td>
                                <td className="py-2 px-4 border-b">{user.role}</td>
                                <td className="py-2 px-4 border-b">
                                    <button
                                        className={`text-xs md:text-sm px-2 py-1 rounded ${user.isBlocked ? 'bg-green-500 hover:bg-green-600' : 'bg-red-500 hover:bg-red-600'
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
        </div>
    );
};

export default BlockedUsers;

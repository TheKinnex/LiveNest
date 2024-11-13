import { useEffect, useState } from 'react';
import axios from 'axios';
import Loading from '../../components/Loading';

const Subscriptions = () => {
    const [subscriptions, setSubscriptions] = useState([]);
    const [filteredSubscriptions, setFilteredSubscriptions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [usernameFilter, setUsernameFilter] = useState('');
    const [startDateFilter, setStartDateFilter] = useState('');
    const [endDateFilter, setEndDateFilter] = useState('');

    const fetchSubscriptions = async () => {
        try {
            const token = localStorage.getItem('token') || sessionStorage.getItem('token');
            const response = await axios.get(`${import.meta.env.VITE_API_URL}/admin/subscriptions`, {
                headers: { Authorization: `Bearer ${token}` },
            });
            setSubscriptions(response.data);
            setFilteredSubscriptions(response.data); // Set initial filtered data
            setLoading(false);
        } catch (err) {
            console.error(err);
            setError('Error al obtener las suscripciones.');
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchSubscriptions();
    }, []);

    const handleFilter = () => {
        const filtered = subscriptions.filter((sub) => {
            const usernameMatch = sub.subscriber?.username.toLowerCase().includes(usernameFilter.toLowerCase());
            const startDateMatch = startDateFilter ? new Date(sub.startDate) >= new Date(startDateFilter) : true;
            const endDateMatch = endDateFilter ? new Date(sub.endDate) <= new Date(endDateFilter) : true;
            return usernameMatch && startDateMatch && endDateMatch;
        });
        setFilteredSubscriptions(filtered);
    };

    if (loading) return <Loading/>;
    if (error) return <div className="text-red-500">{error}</div>;

    return (
        <div className="p-4 md:p-6 lg:p-8 mb-14">
            <h2 className="text-2xl font-semibold text-white mb-4">Todas las Suscripciones</h2>

            {/* Filtros */}
            <div className="mb-4 flex flex-wrap gap-4">
                <input
                    type="text"
                    placeholder="Buscar por Usuario"
                    value={usernameFilter}
                    onChange={(e) => setUsernameFilter(e.target.value)}
                    className="px-4 py-2 rounded bg-gray-700 text-white"
                />
                <input
                    type="date"
                    placeholder="Fecha de Inicio"
                    value={startDateFilter}
                    onChange={(e) => setStartDateFilter(e.target.value)}
                    className="px-4 py-2 rounded bg-gray-700 text-white"
                />
                <input
                    type="date"
                    placeholder="Fecha de Expiración"
                    value={endDateFilter}
                    onChange={(e) => setEndDateFilter(e.target.value)}
                    className="px-4 py-2 rounded bg-gray-700 text-white"
                />
                <button
                    onClick={handleFilter}
                    className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
                >
                    Filtrar
                </button>
            </div>

            {/* Tabla de suscripciones */}
            <div className="overflow-x-auto">
                <table className="min-w-full bg-gray-800 text-white rounded-lg">
                    <thead>
                        <tr>
                            <th className="py-2 px-4 border-b">Usuario</th>
                            <th className="py-2 px-4 border-b">Plan</th>
                            <th className="py-2 px-4 border-b">Fecha de Inicio</th>
                            <th className="py-2 px-4 border-b">Fecha de Expiración</th>
                            <th className="py-2 px-4 border-b">Estado</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredSubscriptions.map(sub => (
                            <tr key={sub._id} className="text-center">
                                <td className="py-2 px-4 border-b">
                                    {sub.subscriber?.username || 'Usuario no disponible'}
                                </td>
                                <td className="py-2 px-4 border-b">{sub.plan}</td>
                                <td className="py-2 px-4 border-b">{new Date(sub.startDate).toLocaleDateString()}</td>
                                <td className="py-2 px-4 border-b">{new Date(sub.endDate).toLocaleDateString()}</td>
                                <td className="py-2 px-4 border-b">{sub.isActive ? 'Activa' : 'Inactiva'}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default Subscriptions;

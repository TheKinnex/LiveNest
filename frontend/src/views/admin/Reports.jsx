import { useEffect, useState, useRef } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import Loading from '../../components/Loading';

const Reports = () => {
    const [reports, setReports] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [showReviewed, setShowReviewed] = useState(false); // Estado para alternar entre revisados y no revisados
    const [currentMediaIndex, setCurrentMediaIndex] = useState({});
    const touchStartRef = useRef(null);

    const fetchReports = async () => {
        try {
            const token = localStorage.getItem('token') || sessionStorage.getItem('token');
            const response = await axios.get(`${import.meta.env.VITE_API_URL}/admin/reports`, {
                headers: { Authorization: `Bearer ${token}` },
            });
            setReports(response.data.filter(report => !report.isDelete));
            setLoading(false);
        } catch (err) {
            console.error(err);
            setError('Error al obtener los reportes.');
            setLoading(false);
        }
    };

    const handleDeletePost = async (postId) => {
        if (window.confirm("¿Estás seguro de que deseas eliminar este post?")) {
            try {
                const token = localStorage.getItem('token') || sessionStorage.getItem('token');
                await axios.delete(`${import.meta.env.VITE_API_URL}/admin/posts/${postId}`, {
                    headers: { Authorization: `Bearer ${token}` },
                });
                fetchReports();
                alert("Post eliminado exitosamente.");
            } catch (err) {
                console.error("Error al eliminar el post:", err);
                setError("Error al eliminar el post.");
            }
        }
    };

    const handleDeleteReport = async (reportId) => {
        if (window.confirm("¿Estás seguro de que deseas eliminar este reporte?")) {
            try {
                const token = localStorage.getItem('token') || sessionStorage.getItem('token');
                await axios.delete(`${import.meta.env.VITE_API_URL}/admin/reports/${reportId}`, {
                    headers: { Authorization: `Bearer ${token}` },
                });
                fetchReports();
                alert("Reporte eliminado exitosamente.");
            } catch (err) {
                console.error("Error al eliminar el reporte:", err);
                setError("Error al eliminar el reporte.");
            }
        }
    };

    const handleMarkAsReviewed = async (reportId) => {
        try {
            const token = localStorage.getItem('token') || sessionStorage.getItem('token');
            await axios.patch(`${import.meta.env.VITE_API_URL}/admin/reports/${reportId}/review`, {}, {
                headers: { Authorization: `Bearer ${token}` },
            });
            fetchReports();
            alert("Reporte marcado como revisado.");
        } catch (err) {
            console.error("Error al marcar el reporte como revisado:", err);
            setError("Error al marcar el reporte como revisado.");
        }
    };

    const handleSwipe = (reportId, direction) => {
        setCurrentMediaIndex((prevIndexes) => {
            const currentIndex = prevIndexes[reportId] || 0;
            const mediaCount = reports.find((report) => report._id === reportId).post.media.length;

            if (direction === 'left') {
                return { ...prevIndexes, [reportId]: (currentIndex + 1) % mediaCount };
            } else if (direction === 'right') {
                return { ...prevIndexes, [reportId]: (currentIndex - 1 + mediaCount) % mediaCount };
            }
        });
    };

    const onTouchStart = (e) => {
        touchStartRef.current = e.changedTouches[0].clientX;
    };

    const onTouchEnd = (e, reportId) => {
        const touchEnd = e.changedTouches[0].clientX;
        if (touchStartRef.current - touchEnd > 50) handleSwipe(reportId, 'left');
        if (touchStartRef.current - touchEnd < -50) handleSwipe(reportId, 'right');
    };

    useEffect(() => {
        fetchReports();
    }, []);

    const filteredReports = reports.filter(report => report.isReviewed === showReviewed);

    if (loading) return <Loading />;
    if (error) return <div className="text-red-500">{error}</div>;

    return (
        <div className="p-4 md:p-6 lg:p-8 mb-14">
            <h2 className="text-2xl font-semibold text-white mb-4">Reportes</h2>

            {/* Botón para alternar entre reportes revisados y no revisados */}
            <button
                onClick={() => setShowReviewed(!showReviewed)}
                className="bg-[#A855F7] text-white px-4 py-2 rounded mb-4"
            >
                {showReviewed ? 'Ver Reportes No Revisados' : 'Ver Reportes Revisados'}
            </button>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredReports.map((report) => (
                    <div key={report._id} className="bg-gray-800 text-white p-4 rounded-lg shadow-lg h-fit">
                        <h3 className="text-lg font-bold">Post Reportado</h3>
                        <p className="text-sm truncate">Contenido: {report.post.content}</p>
                        <p className="text-sm">Autor: 
                            <Link to={`/profile/${report.post.author.username}`} className="text-blue-500 pl-2">
                                {report.post.author.username}
                            </Link>
                        </p>
                        <p className="text-sm">Reportado por: 
                            <Link to={`/profile/${report.reportedBy.username}`} className="text-blue-500 pl-2">
                                {report.reportedBy.username}
                            </Link>
                        </p>
                        <p className="text-sm">Razón del reporte: {report.reason}</p>
                        <p className="text-sm">Revisado: {report.isReviewed ? 'Sí' : 'No'}</p>

                        {/* Carrusel de multimedia del post reportado */}
                        <div className="relative flex justify-center items-center mt-2 h-80">
                            {report.post.media && report.post.media.length > 0 && (
                                <>
                                    {report.post.media[currentMediaIndex[report._id] || 0].type === 'image' ? (
                                        <img
                                            src={report.post.media[currentMediaIndex[report._id] || 0].secure_url}
                                            alt="Post media"
                                            className="w-full h-full object-cover rounded"
                                            onTouchStart={onTouchStart}
                                            onTouchEnd={(e) => onTouchEnd(e, report._id)}
                                        />
                                    ) : (
                                        <video
                                            src={report.post.media[currentMediaIndex[report._id] || 0].secure_url}
                                            controls
                                            className="w-full h-full object-cover rounded"
                                            onTouchStart={onTouchStart}
                                            onTouchEnd={(e) => onTouchEnd(e, report._id)}
                                        />
                                    )}

                                    {/* Botones de navegación para escritorio */}
                                    {report.post.media.length > 1 && (
                                        <>
                                            <button
                                                onClick={() => handleSwipe(report._id, 'right')}
                                                className="absolute left-2 top-1/2 transform -translate-y-1/2 bg-black bg-opacity-50 rounded-full p-2 text-white hidden md:block"
                                            >
                                                &#10094;
                                            </button>
                                            <button
                                                onClick={() => handleSwipe(report._id, 'left')}
                                                className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-black bg-opacity-50 rounded-full p-2 text-white hidden md:block"
                                            >
                                                &#10095;
                                            </button>
                                        </>
                                    )}
                                </>
                            )}
                        </div>

                        <div className="mt-4 flex flex-col gap-2">
                            <button
                                onClick={() => handleDeletePost(report.post._id)}
                                className="bg-red-500 text-white py-2 rounded hover:bg-red-600 w-full"
                            >
                                Eliminar Post
                            </button>
                            <button
                                onClick={() => handleDeleteReport(report._id)}
                                className="bg-yellow-500 text-white py-2 rounded hover:bg-yellow-600 w-full"
                            >
                                Eliminar Reporte
                            </button>
                            <button
                                onClick={() => handleMarkAsReviewed(report._id)}
                                className="bg-green-500 text-white py-2 rounded hover:bg-green-600 w-full"
                            >
                                Marcar como Revisado
                            </button>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default Reports;

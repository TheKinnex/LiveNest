import { useEffect, useState, useRef } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import Loading from '../../components/Loading';

const Posts = () => {
    const [posts, setPosts] = useState([]);
    const [filteredPosts, setFilteredPosts] = useState([]); // Posts filtrados por usuario
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [currentMediaIndex, setCurrentMediaIndex] = useState({});
    const [searchTerm, setSearchTerm] = useState(''); // Término de búsqueda
    const touchStartRef = useRef(null);

    const fetchPosts = async () => {
        try {
            const token = localStorage.getItem('token') || sessionStorage.getItem('token');
            const response = await axios.get(`${import.meta.env.VITE_API_URL}/admin/posts`, {
                headers: { Authorization: `Bearer ${token}` },
            });
            setPosts(response.data);
            setFilteredPosts(response.data); // Inicialmente, muestra todos los posts
            setLoading(false);
        } catch (err) {
            console.error(err);
            setError('Error al obtener los posts.');
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
                fetchPosts(); // Refrescar la lista de posts
                alert("Post eliminado exitosamente.");
            } catch (err) {
                console.error("Error al eliminar el post:", err);
                setError("Error al eliminar el post.");
            }
        }
    };

    const handleSwipe = (postId, direction) => {
        setCurrentMediaIndex((prevIndexes) => {
            const currentIndex = prevIndexes[postId] || 0;
            const mediaCount = posts.find((post) => post._id === postId).media.length;

            if (direction === 'left') {
                return { ...prevIndexes, [postId]: (currentIndex + 1) % mediaCount };
            } else if (direction === 'right') {
                return { ...prevIndexes, [postId]: (currentIndex - 1 + mediaCount) % mediaCount };
            }
        });
    };

    const onTouchStart = (e) => {
        touchStartRef.current = e.changedTouches[0].clientX;
    };

    const onTouchEnd = (e, postId) => {
        const touchEnd = e.changedTouches[0].clientX;
        if (touchStartRef.current - touchEnd > 50) handleSwipe(postId, 'left');
        if (touchStartRef.current - touchEnd < -50) handleSwipe(postId, 'right');
    };

    const handleSearchChange = (e) => {
        const value = e.target.value;
        setSearchTerm(value);
        if (value) {
            const filtered = posts.filter(post => post.author.username.toLowerCase().includes(value.toLowerCase()));
            setFilteredPosts(filtered);
        } else {
            setFilteredPosts(posts); // Restablecer a todos los posts si no hay búsqueda
        }
    };

    useEffect(() => {
        fetchPosts();
    }, []);

    if (loading) return <Loading/>;
    if (error) return <div className="text-red-500">{error}</div>;

    return (
        <div className="p-4 md:p-6 lg:p-8 mb-14">
            <h2 className="text-2xl font-semibold text-white mb-4">Todos los Posts</h2>
            <input
                type="text"
                placeholder="Buscar por usuario"
                value={searchTerm}
                onChange={handleSearchChange}
                className="mb-4 p-2 rounded bg-gray-800 text-white w-full md:w-1/3"
            />
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredPosts.map((post) => (
                    <div key={post._id} className="bg-gray-800 text-white p-4 rounded-lg shadow-lg">
                        <h3 className="text-lg font-bold ">Autor: 
                        <Link className=" text-blue-500 pl-2" to={`/profile/${post.author.username}`}>
                            {post.author.username}
                        </Link>
                        </h3>
                        <p className=' truncate'>{post.content}</p>

                        <div className="relative flex justify-center items-center mt-2">
                            {post.media.length > 0 && (
                                <>
                                    {post.media[currentMediaIndex[post._id] || 0].type === 'image' ? (
                                        <img
                                            src={post.media[currentMediaIndex[post._id] || 0].secure_url}
                                            alt="Post media"
                                            className="w-full h-[30rem] md:h-80 object-cover rounded"
                                            onTouchStart={onTouchStart}
                                            onTouchEnd={(e) => onTouchEnd(e, post._id)}
                                        />
                                    ) : (
                                        <video
                                            src={post.media[currentMediaIndex[post._id] || 0].secure_url}
                                            controls
                                            className="w-full h-[30rem] md:h-80 object-cover rounded"
                                            onTouchStart={onTouchStart}
                                            onTouchEnd={(e) => onTouchEnd(e, post._id)}
                                        />
                                    )}

                                    {/* Botones de navegación para escritorio */}
                                    {post.media.length > 1 && (
                                        <>
                                            <button
                                                onClick={() => handleSwipe(post._id, 'right')}
                                                className="absolute left-2 top-1/2 transform -translate-y-1/2 bg-black bg-opacity-50 rounded-full p-2 text-white hidden md:block"
                                            >
                                                &#10094;
                                            </button>
                                            <button
                                                onClick={() => handleSwipe(post._id, 'left')}
                                                className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-black bg-opacity-50 rounded-full p-2 text-white hidden md:block"
                                            >
                                                &#10095;
                                            </button>
                                        </>
                                    )}
                                </>
                            )}
                        </div>

                        <div className="mt-2 text-sm">
                            <p>Likes: {post.likes.length} Comentarios: {post.comments.length}</p>
                            <p>Publicado el: {new Date(post.createdAt).toLocaleDateString()}</p>
                        </div>

                        <button
                            onClick={() => handleDeletePost(post._id)}
                            className="mt-4 w-full bg-red-500 text-white py-2 rounded hover:bg-red-600"
                        >
                            Eliminar Post
                        </button>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default Posts;

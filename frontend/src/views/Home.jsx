import { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { FaSpinner } from 'react-icons/fa';
import PostHome from '../components/PostHome';

const Home = () => {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [isFetching, setIsFetching] = useState(false);
  const navigate = useNavigate();

  const POSTS_PER_PAGE = 10;

  const fetchPosts = async (page) => {
    if (isFetching) return; // Evitar múltiples solicitudes simultáneas
    setIsFetching(true);

    try {
      const response = await axios.get(
        `${import.meta.env.VITE_API_URL}/posts/feed`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token') || sessionStorage.getItem('token')}`,
          },
          params: {
            page,
            limit: POSTS_PER_PAGE,
          },
        }
      );

      const fetchedPosts = response.data.posts;

      // Añadir solo publicaciones nuevas al estado
      setPosts((prevPosts) => [
        ...prevPosts,
        ...fetchedPosts.filter((post) => !prevPosts.some((p) => p._id === post._id)),
      ]);

      setHasMore(fetchedPosts.length === POSTS_PER_PAGE);
      setError('');
    } catch (err) {
      console.error('Error al cargar las publicaciones:', err);
      setError('Hubo un error al cargar las publicaciones. Por favor, inténtalo de nuevo.');
    } finally {
      setLoading(false);
      setIsFetching(false); // Termina la solicitud
    }
  };

  useEffect(() => {
    const token = localStorage.getItem('token') || sessionStorage.getItem('token');
    if (!token) {
      navigate('/login'); // Redirigir a login si no hay token
      return;
    }
    // Fetch posts if token exists
    fetchPosts(currentPage);
  }, [currentPage, navigate]);


  useEffect(() => {
    const handleScroll = () => {
      if (
        window.innerHeight + document.documentElement.scrollTop + 100 >=
        document.documentElement.offsetHeight &&
        !isFetching &&
        hasMore
      ) {
        setCurrentPage((prevPage) => prevPage + 1);
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [isFetching, hasMore]);

  if (loading && currentPage === 1) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <FaSpinner className="animate-spin text-4xl text-purple-600" />
      </div>
    );
  }

  return (
    <main className="bg-[#111827] w-full h-fit p-4">
      <div className="max-w-sm mx-auto">
        {error && (
          <div className="bg-red-500 text-white p-3 rounded mb-4 text-center">
            {error}
          </div>
        )}

        <div className="grid grid-cols-1 text-white gap-6">
          {posts.map((post) => (
            <PostHome key={post._id} post={post} />
          ))}
        </div>

        {loading && currentPage > 1 && (
          <div className="flex justify-center items-center mt-4">
            <FaSpinner className="animate-spin text-2xl text-purple-600" />
          </div>
        )}

        {!hasMore && (
          <div className="text-center text-gray-400 mt-4">
            No hay más publicaciones para mostrar.
          </div>
        )}
      </div>
    </main>
  );
};

export default Home;

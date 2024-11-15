import { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { FaSpinner } from 'react-icons/fa';
import PostHome from '../components/PostHome';
import Suggestions from '../components/Suggestions'; 
import Loading from '../components/Loading';

const Home = () => {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [isFetching, setIsFetching] = useState(false);
  const navigate = useNavigate();

  const POSTS_PER_PAGE = 2;

  const fetchPosts = async (page) => {
    if (isFetching || !hasMore) return; // Evitar múltiples solicitudes simultáneas y verificar si hay más posts
    setIsFetching(true);

    try {
      const token = localStorage.getItem('token') || sessionStorage.getItem('token');
      if (!token) {
        navigate('/login');
        return;
      }

      const response = await axios.get(
        `${import.meta.env.VITE_API_URL}/posts/feed`,
        {
          headers: { Authorization: `Bearer ${token}` },
          params: { page, limit: POSTS_PER_PAGE },
        }
      );

      const fetchedPosts = response.data.posts;
      setPosts((prevPosts) => [
        ...prevPosts,
        ...fetchedPosts.filter((post) => !prevPosts.some((p) => p._id === post._id)),
      ]);

      setHasMore(page < response.data.totalPages);
      setError('');
    } catch (err) {
      console.error('Error al cargar las publicaciones:', err);
      setError('Hubo un error al cargar las publicaciones. Por favor, inténtalo de nuevo.');
    } finally {
      setLoading(false);
      setIsFetching(false);
    }
  };

  useEffect(() => {
    if (currentPage === 1) {
      setPosts([]); // Limpiar las publicaciones al cargar la primera página
    }
    fetchPosts(currentPage);
  }, [currentPage]);

  useEffect(() => {
    const handleScroll = () => {
      const scrollTop = window.pageYOffset || document.documentElement.scrollTop || document.body.scrollTop || 0;
      const offsetHeight = document.documentElement.offsetHeight || document.body.offsetHeight;
      const innerHeight = window.innerHeight;

      if (
        innerHeight + scrollTop >= offsetHeight - 100 &&
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
    return <Loading />;
  }

  return (
    <main className="bg-[#111827] w-full h-fit p-4 flex justify-center">
      <div className="flex w-full h-full bg-[#111827] max-w-7xl gap-8">
        <div className="flex-1 max-w-xl h-full bg-[#111827] pb-10 w-full mx-auto">
          {error && (
            <div className="bg-red-500 text-white p-3 rounded mb-4 text-center">
              {error}
            </div>
          )}

          <div className="grid grid-cols-1 bg-[#111827] text-white gap-6">
            {posts.map((post) => (
              <PostHome key={post._id} post={post} />
            ))}
          </div>

          {isFetching && currentPage > 1 && (
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

        <div className="hidden lg:block lg:w-[26%] ">
          <Suggestions />
        </div>
      </div>
    </main>
  );
};

export default Home;

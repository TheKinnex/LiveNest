  import { useEffect, useState, useRef } from 'react';
  import { useParams, useLocation, useNavigate } from 'react-router-dom';
  import axios from 'axios';
  import { FaArrowLeft } from 'react-icons/fa';
  import PostCard from '../components/PostCard.jsx';

  const UserPosts = () => {
    const { profileUsername } = useParams();
    const location = useLocation();
    const navigate = useNavigate();
    const [posts, setPosts] = useState([]);
    const postRefs = useRef([]);
    const index = parseInt(new URLSearchParams(location.search).get('index'), 10);
    const token = localStorage.getItem('token') || sessionStorage.getItem('token');

    useEffect(() => {

      if (!token) {
        navigate('/login'); // Redirigir a login si no hay token
        return;
      }
      
      const fetchUserProfile = async () => {
        try {
          // Obtener perfil y publicaciones del usuario en una sola solicitud
          const response = await axios.get(`${import.meta.env.VITE_API_URL}/profile/${profileUsername}`, {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          });


          

          if (response.data) {
            setPosts(response.data.posts || []); // Almacenar solo las publicaciones
          } else {
            console.error("Usuario no encontrado");
          }
        } catch (error) {
          console.error("Error al cargar las publicaciones:", error.response?.data?.msg || error.message);
        }
      };

      fetchUserProfile();
    }, [navigate, profileUsername, token]);

    useEffect(() => {
      if (!isNaN(index) && postRefs.current[index]) {
        postRefs.current[index].scrollIntoView({ behavior: "smooth", block: "start" });
      }
    }, [index, posts]);

    // Función para manejar el regreso al perfil
    const handleBackToProfile = () => {
      navigate(`/profile/${profileUsername}`);
    };

    return (
      <div className="bg-gray-900 h-fit flex flex-col items-center text-white">
        {/* Header sticky con flecha y título */}
        <header className="w-full max-w-4xl flex items-center p-4 bg-gray-800 sticky top-0 z-10">
          <button onClick={handleBackToProfile} className="flex items-center text-white">
            <FaArrowLeft className="mr-2" />
            <span>Publicaciones</span>
          </button>
        </header>

        {/* Contenido de publicaciones */}
        <div className="w-full max-w-4xl grid grid-cols-1 gap-2 mt-4 mb-20">
          {posts.map((post, i) => (
            <div key={post._id} ref={(el) => (postRefs.current[i] = el)}>
              <PostCard post={post} isMobile={window.innerWidth <= 768} />
              {/* Línea divisoria gris entre los posts */}
              {i < posts.length - 1 && (
                <hr className="border-t border-gray-700 my-4" />
              )}
            </div>
          ))}
        </div>
      </div>
    );
  };

  export default UserPosts;

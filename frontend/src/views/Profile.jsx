import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import PostModal from '../components/PostModal.jsx';
import { LuLayoutGrid } from "react-icons/lu";
import { IoIosPhotos } from "react-icons/io";
import { FaStar } from "react-icons/fa"; // Icono para la pelota amarilla
import defaultIcon from '../assets/default-avatar.png'
import Loading from '../components/Loading.jsx';

const Profile = () => {
  const { profileUsername } = useParams();
  const [userData, setUserData] = useState(null);
  const [isOwner, setIsOwner] = useState(false);
  const [isFollowing, setIsFollowing] = useState(false);
  const [selectedPostId, setSelectedPostId] = useState(null);
  const navigate = useNavigate();
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768); // Estado dinámico para detectar móvil
  const token = localStorage.getItem('token') || sessionStorage.getItem('token');
  const userId = localStorage.getItem('userId') || sessionStorage.getItem('userId');

  const handleToggleFollow = async () => {
    if (!token) return;
  
    try {
      const response = await axios.post(
        `${import.meta.env.VITE_API_URL}/profile/${userData._id}/toggleFollow`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
  
      // Aquí, actualizamos la lista de seguidores en `userData` y recalculamos `isFollowing`.
      const updatedFollowers = response.data.following
        ? [...userData.followers, { _id: userId }]
        : userData.followers.filter((follower) => follower._id !== userId);
  
      setUserData((prevUserData) => ({
        ...prevUserData,
        followers: updatedFollowers,
      }));
      
      setIsFollowing(response.data.following);
    } catch (error) {
      console.error("Error al alternar el estado de seguimiento:", error);
    }
  };
  
  
  useEffect(() => {
    const fetchUserProfile = async () => {
      if (!token) {
        navigate('/login'); // Redirigir a login si no hay token
        return;
      }
  
      try {
        const response = await axios.get(
          `${import.meta.env.VITE_API_URL}/profile/${profileUsername}`,
          { headers: { Authorization: `Bearer ${token}` } }
        );
  
        if (response.data) {
          setUserData(response.data);
          setIsOwner(response.data._id === userId);
          
          // Comprobamos si el usuario actual está en la lista de seguidores
          setIsFollowing(response.data.followers.some(follower => follower === userId));
        } else {
          console.error("Usuario no encontrado");
        }
      } catch (error) {
        console.error("Error al obtener el perfil del usuario:", error);
      }
    };
  
    fetchUserProfile();
  }, [navigate, profileUsername, token, userId]);
  
  

  useEffect(() => {
    // Manejar cambios en el tamaño de la ventana para actualizar isMobile
    const handleResize = () => {
      setIsMobile(window.innerWidth <= 768);
    };

    window.addEventListener('resize', handleResize);

    // Limpieza del event listener al desmontar el componente
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  

  const handleCreateConversation = async () => {
    const token = localStorage.getItem('token') || sessionStorage.getItem('token');
    if (!token || !userData) return;
  
    try {
      const response = await axios.post(
        `${import.meta.env.VITE_API_URL}/conversations`,
        { userId: userData._id },
        { headers: { Authorization: `Bearer ${token}` } }
      );
  
      // Redirigir a /conversations y pasar el ID de la conversación en el query
      navigate(`/conversations?selectedConversationId=${response.data.conversation._id}`);
    } catch (error) {
      if (error.response && error.response.status === 400 && error.response.data.msg === "La conversación ya existe") {
        const existingConversationResponse = await axios.get(
          `${import.meta.env.VITE_API_URL}/conversations`,
          { headers: { Authorization: `Bearer ${token}` } }
        );
  
        const existingConversation = existingConversationResponse.data.find(
          (conversation) => conversation.users.some((user) => user._id === userData._id)
        );
  
        if (existingConversation) {
          navigate(`/conversations?selectedConversationId=${existingConversation._id}`);
        }
      } else {
        console.error("Error al crear la conversación:", error);
      }
    }
  };
  

  const openPostModal = (postId, index) => {
    if (isMobile) {
      // Redirigir a la nueva vista con el índice en dispositivos móviles
      navigate(`/posts/${profileUsername}?index=${index}`);
    } else {
      setSelectedPostId(postId);
    }
  };

  const closePostModal = () => {
    setSelectedPostId(null);
  };

  const handleEditProfile = () => {
    navigate("/account/edit/");
  };

  const handleManageSubscriptions = () => {
    navigate("/my-subscriptions");
  };

  const handleViewSubscriptions = () => {
    navigate("/subscriptions");
  };

  if (!userData) return <Loading/>;

  return (
    <div className="bg-gray-900 min-h-screen flex flex-col items-center p-4 md:p-8 text-white ">
      {/* Header con foto de perfil, nombre de usuario y pelota amarilla si es premium */}
      <div className="flex flex-col md:flex-row items-center md:items-start md:space-x-5 w-full max-w-3xl">
        <img
          src={userData.profilePicture?.secure_url || defaultIcon}
          alt="Profile"
          className="w-20 h-20 lg:w-24 lg:h-24 object-cover bg-gray-600 rounded-full border-4 border-purple-500"
        />
        <div className="text-center md:text-left mt-4 md:mt-0 relative">
          <h1 className="text-xl md:text-2xl flex items-center justify-center md:justify-start">
            {userData.username}
            {userData.isPremium && (
              <FaStar className="text-yellow-500 ml-2" title="Usuario Premium" />
            )}
          </h1>
          <div className="flex justify-center md:justify-start space-x-4 mt-2 text-sm md:text-lg">
            <span>{userData.posts?.length || 0} publicaciones</span>
            <span>{userData.followers?.length || 0} seguidores</span>
            <span>{userData.following?.length || 0} seguidos</span>
          </div>
          <p className="mt-4 text-sm max-w-md px-2 md:px-0">{userData.bio || "Sin biografía"}</p>
        </div>
      </div>

      {/* Botones de acción */}
      <div className="flex space-x-4 mt-5 flex-wrap justify-center md:justify-start">
        {isOwner ? (
          <button
            onClick={handleEditProfile}
            className="bg-gray-700 px-4 py-2 rounded text-sm md:text-base hover:bg-gray-600 mb-2 md:mb-0"
          >
            Editar Perfil
          </button>
        ) : (
          <>
            <button
              onClick={handleToggleFollow}
              className={`px-4 py-2 rounded text-sm md:text-base transition-colors ${isFollowing ? "bg-gray-700 hover:bg-gray-600" : "bg-purple-600 hover:bg-purple-500"
                } mb-2 md:mb-0`}
            >
              {isFollowing ? "Dejar de Seguir" : "Seguir"}
            </button>
            <button
              onClick={handleCreateConversation}
              className="bg-gray-700 px-4 py-2 rounded text-sm md:text-base hover:bg-gray-600 mb-2 md:mb-0"
            >
              Mensaje
            </button>
          </>
        )}

        {/* Botones adicionales para dispositivos móviles */}
        {isMobile && isOwner && (
          <>
            {userData.isPremium && (
              <button
                onClick={handleManageSubscriptions}
                className="bg-yellow-500 px-4 py-2 rounded text-sm md:text-base hover:bg-yellow-600 mb-2 md:mb-0"
              >
                Gestionar Suscripciones
              </button>
            )}
            <button
              onClick={handleViewSubscriptions}
              className="bg-blue-600 px-4 py-2 rounded text-sm md:text-base hover:bg-blue-700 mb-2 md:mb-0"
            >
              Ver Suscripciones
            </button>
          </>
        )}
      </div>

      {/* Sección de navegación */}
      <div className="flex justify-around w-full max-w-3xl mt-8 border-b border-gray-700 pb-2 text-gray-400 text-sm md:text-base">
        <button className="flex items-center text-white">
          <LuLayoutGrid />
          <span className="ml-2">Publicaciones</span>
        </button>
      </div>

      {/* Grid de publicaciones */}
      <div className="grid grid-cols-3 gap-1 mt-6 w-full max-w-3xl lg:pb-11 pb-14">
        {userData.posts?.map((post, index) => (
          <div key={post._id} className="relative h-32 md:h-64 w-full cursor-pointer group" onClick={() => openPostModal(post._id, index)}>
            {post.media?.length > 1 && (
              <IoIosPhotos className="absolute top-2 right-2 text-white opacity-80" size={20} />
            )}
            {post.media?.[0]?.secure_url && (!post.media?.[0]?.type || post.media?.[0]?.type !== "video") ? (
              <img src={post.media[0].secure_url} alt="Post Media" className="w-full h-full object-cover" />
            ) : (
              <img
                src={post.media?.[0]?.thumbnail || '/default-thumbnail.png'}
                alt="Video Thumbnail"
                className="w-full h-full object-cover "
              />
            )}
            <div className="absolute inset-0 bg-black bg-opacity-50 flex flex-col justify-center items-center opacity-0 group-hover:opacity-100 transition-opacity">
              <span className="text-white text-sm">{post.likes?.length || 0} Likes</span>
              <span className="text-white text-sm">{post.comments.filter(comment => !comment.isDelete).length || 0} Comentarios</span>
            </div>
          </div>
        ))}
      </div>

      {selectedPostId && (
        <PostModal postId={selectedPostId} onClose={closePostModal} />
      )}
    </div>
  );
};

export default Profile;

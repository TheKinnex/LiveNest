import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import PostModal from '../components/PostModal.jsx';
import { LuLayoutGrid } from "react-icons/lu";
import { CiStreamOn } from "react-icons/ci";
import { IoIosPhotos } from "react-icons/io";

const Profile = () => {
  const { profileUsername } = useParams();
  const [userData, setUserData] = useState(null);
  const [isOwner, setIsOwner] = useState(false);
  const [isFollowing, setIsFollowing] = useState(false);
  const [selectedPostId, setSelectedPostId] = useState(null);
  const navigate = useNavigate();
  const isMobile = window.innerWidth <= 768; // Detecta si es móvil
  const token = localStorage.getItem('token') || sessionStorage.getItem('token');
  const userId = localStorage.getItem('userId') || sessionStorage.getItem('userId');

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
          setIsFollowing(response.data.followers.includes(userId));
        } else {
          console.error("Usuario no encontrado");
        }
      } catch (error) {
        console.error("Error al obtener el perfil del usuario:", error);
      }
    };

    fetchUserProfile();
  }, [navigate, profileUsername, token, userId]);

  const handleToggleFollow = async () => {
    const token = localStorage.getItem('token') || sessionStorage.getItem('token');
    if (!token) return;

    try {
      const response = await axios.post(
        `${import.meta.env.VITE_API_URL}/profile/${userData._id}/toggleFollow`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setIsFollowing(response.data.following);
    } catch (error) {
      console.error("Error al alternar el estado de seguimiento:", error);
    }
  };

  const handleCreateConversation = async () => {
    const token = localStorage.getItem('token') || sessionStorage.getItem('token');
    if (!token || !userData) return;

    try {
      const response = await axios.post(
        `${import.meta.env.VITE_API_URL}/conversations`,
        { userId: userData._id },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      // Redirigir a la conversación recién creada
      navigate(`/conversations/${response.data.conversation._id}`);
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
          navigate(`/conversations/${existingConversation._id}`);
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

  if (!userData) return <div className="text-white">Cargando perfil...</div>;

  return (
    <div className="bg-gray-900 min-h-screen flex flex-col items-center p-4 md:p-8 text-white">
      {/* Header con foto de perfil y nombre de usuario */}
      <div className="flex flex-col md:flex-row items-center md:items-start md:space-x-5 w-full max-w-3xl">
        <img
          src={userData.profilePicture?.secure_url || '/default-avatar.png'}
          alt="Profile"
          className="w-20 h-20 md:w-24 md:h-24 bg-gray-600 rounded-full border-4 border-purple-500"
        />
        <div className="text-center md:text-left mt-4 md:mt-0">
          <h1 className="text-xl md:text-2xl">{userData.username}</h1>
          <div className="flex justify-center md:justify-start space-x-4 mt-2 text-sm md:text-lg">
            <span>{userData.posts?.length || 0} publicaciones</span>
            <span>{userData.followers?.length || 0} seguidores</span>
            <span>{userData.following?.length || 0} seguidos</span>
          </div>
          <p className="mt-4 text-sm max-w-md px-2 md:px-0">{userData.bio || "Sin biografía"}</p>
        </div>
      </div>

      {/* Botones de acción */}
      <div className="flex space-x-4 mt-5">
        {isOwner ? (
          <button
            onClick={handleEditProfile}
            className="bg-gray-700 px-4 py-2 rounded text-sm md:text-base hover:bg-gray-600"
          >
            Editar Perfil
          </button>
        ) : (
          <>
            <button
              onClick={handleToggleFollow}
              className={`px-4 py-2 rounded text-sm md:text-base transition-colors ${isFollowing ? "bg-gray-700 hover:bg-gray-600" : "bg-purple-600 hover:bg-purple-500"
                }`}
            >
              {isFollowing ? "Dejar de Seguir" : "Seguir"}
            </button>
            <button
              onClick={handleCreateConversation}
              className="bg-gray-700 px-4 py-2 rounded text-sm md:text-base hover:bg-gray-600"
            >
              Mensaje
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
        <button className="flex items-center">
          <CiStreamOn />
          <span className="ml-2">Streams</span>
        </button>
      </div>

      {/* Grid de publicaciones */}
      <div className="grid grid-cols-3 gap-1 mt-6 w-full max-w-3xl">
        {userData.posts?.map((post, index) => (
          <div key={post._id} className="relative h-32 md:h-64 w-full cursor-pointer group" onClick={() => openPostModal(post._id, index)}>
            {post.media?.length > 1 && (
              <IoIosPhotos className="absolute top-2 right-2 text-white opacity-80" size={20} />
            )}
            {post.media?.[0]?.secure_url ? (
              <img src={post.media[0].secure_url} alt="Post Media" className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full bg-gray-800 flex items-center justify-center">
                <span className="text-gray-500">Sin imagen</span>
              </div>
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

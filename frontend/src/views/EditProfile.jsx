import { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import defaultIcon from '../assets/default-avatar.png'

const EditProfile = () => {
  const navigate = useNavigate();
  const userId = localStorage.getItem('userId') || sessionStorage.getItem('userId');
  const token = localStorage.getItem('token') || sessionStorage.getItem('token');

  const [username, setUsername] = useState('');
  const [bio, setBio] = useState('');
  const [profilePicture, setProfilePicture] = useState(null);
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [currentProfilePicture, setCurrentProfilePicture] = useState(defaultIcon); // Imagen actual de perfil

  // Cargar los datos actuales del perfil cuando el componente se monte
  useEffect(() => {
    const fetchProfileData = async () => {
      try {
        const response = await axios.get(
          `${import.meta.env.VITE_API_URL}/profile/current`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
        
        // Establecer los valores iniciales en el estado
        setUsername(response.data.username);
        setBio(response.data.bio || '');
        setCurrentProfilePicture(response.data.profilePicture?.secure_url || defaultIcon);
      } catch (error) {
        console.error("Error al cargar el perfil:", error);
        setErrorMsg("No se pudo cargar la información del perfil.");
      }
    };

    fetchProfileData();
  }, [userId, token]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');
  
    if (password || confirmPassword) {
      if (password !== confirmPassword) {
        setErrorMsg('Las contraseñas no coinciden');
        return;
      }
      if (password.length < 6) {
        setErrorMsg('La contraseña debe tener al menos 6 caracteres');
        return;
      }
    }
  
    const formData = new FormData();
    if (username) formData.append('username', username);
    if (bio) formData.append('bio', bio);
    if (profilePicture) formData.append('img', profilePicture);
    if (password) formData.append('password', password);
    if (confirmPassword) formData.append('confirmPassword', confirmPassword);
  
    try {
      setIsSubmitting(true);
      const response = await axios.patch(
        `${import.meta.env.VITE_API_URL}/profile/${userId}`,
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
            Authorization: `Bearer ${token}`,
          },
        }
      );
      setSuccessMsg(response.data.msg);
      setTimeout(() => {
        navigate(`/profile/${response.data.user.username}`);
      }, 2000);
    } catch (error) {
      console.error(error);
      setErrorMsg(error.response?.data?.msg || 'Error al actualizar el perfil');
    } finally {
      setIsSubmitting(false);
    }
  };
  

  const handleImageChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      setProfilePicture(e.target.files[0]);
      setCurrentProfilePicture(URL.createObjectURL(e.target.files[0])); // Vista previa de la nueva imagen
    }
  };

  return (
    <div className="bg-gray-900 h-full flex flex-col items-center p-6 md:p-8 text-white">
      <h1 className="text-2xl font-bold mb-6">Editar Perfil</h1>

      {/* Foto de perfil y botón para cambiar */}
      <div className="flex flex-col items-center mb-6">
        <div className="w-24 h-24 md:w-32 md:h-32 bg-gray-700 rounded-full mb-2">
          {/* Mostrar vista previa de la nueva imagen o la actual */}
          <img
            src={currentProfilePicture}
            alt="Profile"
            className="w-full h-full rounded-full object-cover"
          />
        </div>
        <label className="bg-blue-600 px-4 py-2 rounded-md cursor-pointer">
          Cambiar foto
          <input type="file" accept="image/*" hidden onChange={handleImageChange} />
        </label>
      </div>

      {/* Formulario de edición */}
      <form
        onSubmit={handleSubmit}
        className="w-full max-w-md space-y-4 bg-gray-800 p-6 rounded-md"
      >
        {/* Nombre de usuario */}
        <div>
          <label className="block text-gray-400 mb-1">Nombre de usuario</label>
          <input
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            placeholder="Nuevo nombre de usuario"
            className="w-full p-2 bg-gray-700 text-white rounded-md focus:outline-none"
          />
        </div>

        {/* Biografía */}
        <div>
          <label className="block text-gray-400 mb-1">Biografía</label>
          <textarea
            value={bio}
            onChange={(e) => setBio(e.target.value)}
            maxLength={150}
            placeholder="Nueva biografía"
            className="w-full p-2 bg-gray-700 text-white rounded-md focus:outline-none"
            rows="3"
          ></textarea>
          <p className="text-gray-500 text-xs mt-1">{bio.length} / 150</p>
        </div>

        {/* Contraseña */}
        <div>
          <label className="block text-gray-400 mb-1">Nueva Contraseña</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Nueva contraseña"
            className="w-full p-2 bg-gray-700 text-white rounded-md focus:outline-none"
          />
        </div>

        {/* Confirmar Contraseña */}
        <div>
          <label className="block text-gray-400 mb-1">Confirmar Nueva Contraseña</label>
          <input
            type="password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            placeholder="Confirmar nueva contraseña"
            className="w-full p-2 bg-gray-700 text-white rounded-md focus:outline-none"
          />
        </div>

        {/* Mensajes de Error y Éxito */}
        {errorMsg && <p className="text-red-500 text-sm">{errorMsg}</p>}
        {successMsg && <p className="text-green-500 text-sm">{successMsg}</p>}

        {/* Botón de Submit */}
        <button
          type="submit"
          disabled={isSubmitting}
          className={`w-full p-2 rounded-md text-white ${
            isSubmitting
              ? "bg-gray-600 cursor-not-allowed"
              : "bg-purple-600 hover:bg-purple-500"
          }`}
        >
          {isSubmitting ? "Actualizando..." : "Actualizar Perfil"}
        </button>
      </form>
    </div>
  );
};

export default EditProfile;

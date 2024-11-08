import { useState } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import { FaEye, FaEyeSlash } from 'react-icons/fa'; // Importar iconos

const Register = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [username, setUsername] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');

  const [showPassword, setShowPassword] = useState(false); // Estado para mostrar/ocultar contraseña

  // Expresiones regulares para validaciones
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  const usernameRegex = /^[a-zA-Z0-9_]+$/; // Sin espacios ni caracteres especiales
  const passwordRegex = /^(?=.*[A-Z])(?=.*[a-z])(?=.*[0-9])(?=.*[!@#$%^&*(),.]).{8,}$/;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage(''); 
    setSuccessMessage(''); 

    // Validar que no haya espacios en blanco
    if (/\s/.test(email) || /\s/.test(username) || /\s/.test(password)) {
      setErrorMessage('Los campos no pueden contener espacios en blanco.');
      return;
    }

    // Validar formato de correo
    if (!emailRegex.test(email)) {
      setErrorMessage('Por favor, ingresa un correo válido.');
      return;
    }

    // Validar formato de nombre de usuario
    if (!usernameRegex.test(username)) {
      setErrorMessage('El nombre de usuario solo puede contener letras, números y guiones bajos.');
      return;
    }

    // Validar formato de contraseña
    if (!passwordRegex.test(password)) {
      setErrorMessage('La contraseña debe tener al menos 8 caracteres, una mayúscula, una minúscula, un número y un carácter especial.');
      return;
    }

    setLoading(true);

    try {
      // Llamada a la API de registro
      await axios.post(`${import.meta.env.VITE_API_URL}/auth/register`, { email, password, username });

      setSuccessMessage('Registro exitoso. Por favor, revisa tu correo para verificar tu cuenta.');
    } catch (error) {
      if (error.response && error.response.data) {
        if (error.response.status === 400) {
          if (error.response.data.msg === 'Este username ya está ocupado') {
            setErrorMessage('El nombre de usuario ya está ocupado, elige otro.');
          } else if (error.response.data.msg === 'El correo ya está vinculado a una cuenta') {
            setErrorMessage('El correo ya está registrado, intenta iniciar sesión o usa otro correo.');
          } else {
            setErrorMessage(error.response.data.msg);
          }
        } else {
          setErrorMessage('Hubo un error en la solicitud. Intenta nuevamente.');
        }
      } else {
        setErrorMessage('Error de conexión con el servidor. Intenta más tarde.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className=' bg-[#111827] w-full h-full lg:h-screen text-white'>
      <div className=' flex flex-col justify-center items-center h-full'>
        <div className='w-80 flex flex-col justify-center gap-y-5'>
          <h2 className=' text-xl font-semibold text-left'>LiveNest</h2>
          <h2 className=' text-xl font-semibold text-left mt-10'>Bienvenido!</h2>
        </div>
        <form className=' flex flex-col mt-5 gap-y-5 w-80' onSubmit={handleSubmit}>
          <div className=' flex flex-col'>
            <label className=' text-xs pl-2'>Username</label>
            <input
              className=' w-80 h-12 rounded-md p-2 text-black '
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value.trim())} // Evitar espacios
              placeholder="Username"
              required
            />
          </div>
          <div className=' flex flex-col'>
            <label className=' text-xs pl-2'>Correo</label>
            <input
              className=' w-80 h-12 rounded-md p-2 text-black '
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value.trim())} // Evitar espacios
              placeholder="Correo"
              required
            />
          </div>
          <div className='flex flex-col relative'>
            <label className=' text-xs pl-2'>Contraseña</label>
            <input
              className='w-80 h-12 rounded-md p-2 text-black'
              type={showPassword ? "text" : "password"} // Cambiar tipo según estado
              value={password}
              onChange={(e) => setPassword(e.target.value.trim())} // Evitar espacios
              placeholder="Contraseña"
              required
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-4 top-8 text-gray-500 hover:text-gray-300 focus:outline-none"
            >
              {showPassword ? <FaEyeSlash /> : <FaEye />} {/* Mostrar icono según estado */}
            </button>
          </div>

          {/* Mostrar mensaje de error */}
          {errorMessage && <p className="text-red-500 text-sm">{errorMessage}</p>}

          {/* Mostrar mensaje de éxito */}
          {successMessage && <p className="text-green-500 text-sm break-words ">{successMessage}</p>}

          {/* Botón de enviar deshabilitado si está cargando */}
          <button className=' bg-purple-600 p-2 rounded-md font-medium' type="submit" disabled={loading}>
            {loading ? 'Registrando...' : 'Registrarse'}
          </button>

          <span className='flex gap-2 text-xs text-blue-600' >
            Ya tienes una cuenta? <Link to={'/'} className=' text-purple-600'>Iniciar Sesión</Link>
          </span>
        </form>
      </div>
    </main>
  );
};

export default Register;

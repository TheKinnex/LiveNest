import { useState, useEffect } from 'react';
import axios from 'axios';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { FaEye, FaEyeSlash } from 'react-icons/fa'; // Importar iconos

const ResetPassword = () => {
  const { token } = useParams(); // Obtener el token de la URL
  const navigate = useNavigate();

  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false); // Estado para mostrar/ocultar contraseña
  const [showConfirmPassword, setShowConfirmPassword] = useState(false); // Estado para mostrar/ocultar confirmación

  const validatePassword = (password) => {
    // Al menos 8 caracteres, una mayúscula, una minúscula, un número y un carácter especial
    const regex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[\W_]).{8,}$/;
    return regex.test(password);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setMessage('');

    if (!validatePassword(password)) {
      setError('La contraseña debe tener al menos 8 caracteres, una mayúscula, una minúscula, un número y un carácter especial.');
      return;
    }

    if (password !== confirmPassword) {
      setError('Las contraseñas no coinciden.');
      return;
    }

    setLoading(true);

    try {
      const response = await axios.post(`${import.meta.env.VITE_API_URL}/auth/reset-password/${token}`, { password });
      setMessage(response.data.msg);
      // Redirigir al usuario después de un breve retraso
      setTimeout(() => {
        navigate('/login');
      }, 3000);
    } catch (err) {
      if (err.response && err.response.data && err.response.data.msg) {
        setError(err.response.data.msg);
      } else {
        setError('Hubo un error al procesar tu solicitud. Inténtalo de nuevo más tarde.');
      }
    } finally {
      setLoading(false);
    }
  };

  // Opcional: Verificar si el token es válido al cargar la página
  useEffect(() => {
    const verifyToken = async () => {
      try {
        // Intentar verificar el token sin cambiar la contraseña
        await axios.post(`${import.meta.env.VITE_API_URL}/auth/reset-password/${token}`, { password: 'dummyPassword123!' });
      } catch (err) {
        if (err.response && err.response.status === 400) {
          setError(err.response.data.msg);
        } else {
          setError('Token inválido o expirado.');
        }
      }
    };

    if (token) {
      verifyToken();
    }
  }, [token]);

  return (
    <main className='bg-[#111827] w-full min-h-screen flex justify-center items-center text-white p-4'>
      <div className='w-full max-w-md bg-gray-800 p-6 rounded-lg shadow-lg'>
        <h2 className='text-2xl font-semibold mb-4 text-center'>Restablecer Contraseña</h2>
        <p className='mb-6 text-center'>Ingresa tu nueva contraseña.</p>

        {message && <p className="text-green-500 mb-4 text-center">{message}</p>}
        {error && <p className="text-red-500 mb-4 text-center">{error}</p>}

        <form onSubmit={handleSubmit} className='flex flex-col gap-4'>
          <div className='flex flex-col relative'>
            <label htmlFor="password" className='mb-1 text-sm'>Nueva Contraseña</label>
            <input
              type={showPassword ? "text" : "password"} // Cambiar tipo según estado
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Nueva Contraseña"
              className='w-full p-3 rounded-md text-black'
              required
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-4 top-10 text-gray-500 hover:text-gray-300 focus:outline-none"
            >
              {showPassword ? <FaEyeSlash /> : <FaEye />} {/* Mostrar icono según estado */}
            </button>
          </div>
          <div className='flex flex-col relative'>
            <label htmlFor="confirmPassword" className='mb-1 text-sm'>Confirmar Contraseña</label>
            <input
              type={showConfirmPassword ? "text" : "password"} // Cambiar tipo según estado
              id="confirmPassword"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="Confirmar Contraseña"
              className='w-full p-3 rounded-md text-black'
              required
            />
            <button
              type="button"
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              className="absolute right-4 top-10 text-gray-500 hover:text-gray-300 focus:outline-none"
            >
              {showConfirmPassword ? <FaEyeSlash /> : <FaEye />} {/* Mostrar icono según estado */}
            </button>
          </div>
          <button
            type="submit"
            disabled={loading}
            className={`bg-purple-600 p-3 rounded-md font-medium ${loading ? 'opacity-50 cursor-not-allowed' : 'hover:bg-purple-500'}`}
          >
            {loading ? 'Restableciendo...' : 'Restablecer Contraseña'}
          </button>
        </form>

        <div className='mt-4 text-center'>
          <Link to="/login" className='text-purple-400 hover:underline'>Volver al Inicio de Sesión</Link>
        </div>
      </div>
    </main>
  );
};

export default ResetPassword;

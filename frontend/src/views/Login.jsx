import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
//import googleLog from '../assets/googleLog.png';
import { FaEye, FaEyeSlash } from 'react-icons/fa'; // Importar iconos para mostrar/ocultar contraseña

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false); // Estado para controlar la visibilidad de la contraseña
  const navigate = useNavigate();

  const validateEmail = (email) => {
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return regex.test(email);
  };

  const validatePassword = (password) => {
    const regex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[\W_]).{8,}$/;
    return regex.test(password);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErrorMessage('');

    if (!validateEmail(email)) {
      setErrorMessage('Correo inválido');
      setLoading(false);
      return;
    }

    if (!validatePassword(password)) {
      setErrorMessage('La contraseña debe tener al menos 8 caracteres, una mayúscula, una minúscula, un número y un carácter especial');
      setLoading(false);
      return;
    }

    try {
      const response = await axios.post(`${import.meta.env.VITE_API_URL}/auth/login`, { email, password });
      const { token, user } = response.data;

      if (rememberMe) {
        localStorage.setItem('token', token);
        localStorage.setItem('userId', user.id);
        localStorage.setItem('role', user.role);
        localStorage.setItem('username', user.username);

      } else {
        sessionStorage.setItem('token', token);
        sessionStorage.setItem('userId', user.id);
        sessionStorage.setItem('role', user.role);
        sessionStorage.setItem('username', user.username);

        //Eliminar localstorage por si token esta vencido
        localStorage.removeItem('token');
        localStorage.removeItem('userId');
        localStorage.removeItem('role');
        localStorage.removeItem('username');
      }

      navigate('/');
    } catch (error) {
      setErrorMessage('Credenciales incorrectas o problema de conexión');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className='bg-[#111827] w-full h-full lg:h-screen text-white flex justify-center items-center p-4'>
      <div className='flex flex-col justify-center items-center w-full max-w-md'>
        <div className='w-80 flex flex-col justify-center gap-y-5 mb-8'>
          <h2 className='text-xl font-semibold text-left'>LiveNest</h2>
          <h2 className='text-xl font-semibold text-left mt-10'>¡Encantado de verte de nuevo!</h2>
        </div>
        <form className='flex flex-col gap-y-5 w-80' onSubmit={handleSubmit}>
          {/* Campo de Correo Electrónico */}
          <div className='flex flex-col'>
            <label className='text-xs pl-2' htmlFor="email">Correo</label>
            <input
              id="email"
              className='w-80 h-12 rounded-md p-2 text-black'
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Correo"
              required
            />
          </div>

          {/* Campo de Contraseña con Botón de Mostrar/Ocultar */}
          <div className='flex flex-col relative'>
            <label className='text-xs pl-2' htmlFor="password">Contraseña</label>
            <input
              id="password"
              className='w-80 h-12 rounded-md p-2 pr-10 text-black' // Agregar padding derecho para el botón
              type={showPassword ? "text" : "password"} // Cambiar tipo según estado
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Contraseña"
              required
            />
            {/* Botón para mostrar/ocultar contraseña */}
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-[0.93rem] top-8 transform  text-gray-500 hover:text-gray-300 focus:outline-none"
              aria-label={showPassword ? "Ocultar contraseña" : "Mostrar contraseña"} // Mejorar accesibilidad
            >
              {showPassword ? <FaEyeSlash /> : <FaEye />}
            </button>
          </div>

          {/* Opciones de Recordarme y Olvidaste la Contraseña */}
          <div className='flex justify-between items-center'>
            <div className='flex items-center'>
              <input
                className="mr-2 mt-[0.3rem] h-3.5 w-8 appearance-none rounded-[0.4375rem] bg-neutral-300 before:pointer-events-none before:absolute before:h-3.5 before:w-3.5 before:rounded-full before:bg-transparent before:content-[''] after:absolute after:z-[2] after:-mt-[0.1875rem] after:h-5 after:w-5 after:rounded-full after:border-none after:bg-neutral-100 after:shadow-[0_0px_3px_0_rgb(0_0_0_/_7%),_0_2px_2px_0_rgb(0_0_0_/_4%)] after:transition-[background-color_0.2s,transform_0.2s] after:content-[''] checked:bg-purple-400 checked:after:absolute checked:after:z-[2] checked:after:-mt-[3px] checked:after:ml-[1.0625rem] checked:after:h-5 checked:after:w-5 checked:after:rounded-full checked:after:border-none checked:after:bg-primary checked:after:shadow-[0_3px_1px_-2px_rgba(0,0,0,0.2),_0_2px_2px_0_rgba(0,0,0,0.14),_0_1px_5px_0_rgba(0,0,0,0.12)] checked:after:transition-[background-color_0.2s,transform_0.2s] checked:after:content-[''] hover:cursor-pointer focus:outline-none focus:ring-0 focus:before:scale-100 focus:before:opacity-[0.12] focus:before:shadow-[3px_-1px_0px_13px_rgba(0,0,0,0.6)] focus:before:transition-[box-shadow_0.2s,transform_0.2s] focus:after:absolute focus:after:z-[1] focus:after:block focus:after:h-5 focus:after:w-5 focus:after:rounded-full focus:after:content-[''] checked:focus:border-primary checked:focus:bg-primary checked:focus:before:ml-[1.0625rem] checked:focus:before:scale-100 checked:focus:before:shadow-[3px_-1px_0px_13px_#3b71ca] checked:focus:before:transition-[box-shadow_0.2s,transform_0.2s] dark:bg-neutral-600 dark:after:bg-purple-400 dark:checked:bg-primary dark:checked:after:bg-primary dark:focus:before:shadow-[3px_-1px_0px_13px_rgba(255,255,255,0.4)] dark:checked:focus:before:shadow-[3px_-1px_0px_13px_#3b71ca]"
                type="checkbox"
                id="rememberMe"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
              />
              <label htmlFor="rememberMe" className="text-sm cursor-pointer">
                Recordarme
              </label>
            </div>
            <div>
              <Link to="/forgot-password" className='text-sm text-purple-400 hover:underline'>
                ¿Olvidaste la contraseña?
              </Link>
            </div>
          </div>

          {/* Mensajes de Error */}
          {errorMessage && <p className="text-red-500 text-sm text-center">{errorMessage}</p>}

          {/* Botón de Iniciar Sesión */}
          <button
            className='bg-purple-600 p-3 rounded-md font-medium hover:bg-purple-500 disabled:opacity-50 disabled:cursor-not-allowed'
            type="submit"
            disabled={loading}
          >
            {loading ? 'Cargando...' : 'Iniciar Sesión'}
          </button>

          <hr className='border-t border-gray-700 my-4' />

          {/* Botón de Iniciar Sesión con Google 
          <button
            className='bg-gray-600 p-3 rounded-md font-medium hover:bg-gray-500 flex items-center justify-center'
            type="button"
            onClick={() => {
              // Implementar lógica de inicio de sesión con Google si está disponible
            }}
          >
            <img className='w-6 mr-2' src={googleLog} alt="Google login" />
            <span>Iniciar Sesión con Google</span>
          </button>
          */}
          {/* Enlace a la Página de Registro */}
          <span className='flex gap-2 text-xs text-blue-600 justify-center mt-4'>
            ¿No tienes una cuenta? <Link to="/register" className='text-purple-600 hover:underline'>Registrarse</Link>
          </span>
        </form>
      </div>
    </main>
  );
};

export default Login;

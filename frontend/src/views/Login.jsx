import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import googleLog from '../assets/googleLog.png';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false); // Estado para el checkbox
  const [errorMessage, setErrorMessage] = useState('');
  const [loading, setLoading] = useState(false); // Estado para el indicador de carga
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true); // Mostrar indicador de carga
    setErrorMessage(''); // Limpiar mensaje de error previo
    try {
      const response = await axios.post('https://livenest-backend.onrender.com/auth/login', { email, password });

      // Si el usuario seleccionó "Recordarme", almacenar el token en localStorage, sino en sessionStorage

      if (rememberMe) {
        localStorage.setItem('token', response.data.token);
        localStorage.setItem('userId', response.data.user.id);  // Guarda el ID del usuario autenticado
      } else {
        sessionStorage.setItem('token', response.data.token);
        sessionStorage.setItem('userId', response.data.user.id);  // Guarda el ID del usuario autenticado
      }

      // Redirigir a la página de conversaciones
      navigate('/conversations');
    } catch (error) {
      setErrorMessage('Credenciales incorrectas o problema de conexión');
      console.error(error);
    } finally {
      setLoading(false); // Ocultar indicador de carga
    }
  };


  return (
    <main className=' bg-[#111827] w-full h-screen text-white'>
      <div className=' flex flex-col justify-center items-center h-full'>
        <div className='w-80 flex flex-col justify-center gap-y-5'>
          <h2 className=' text-xl font-semibold text-left'>LiveNest</h2>
          <h2 className=' text-xl font-semibold text-left mt-10'>Encantado de verte de nuevo!</h2>
        </div>
        <form className=' flex flex-col mt-5 gap-y-5 ' onSubmit={handleSubmit}>
          <div className=' flex flex-col'>
            <label className=' text-xs pl-2'>correo</label>
            <input
              className=' w-80 h-12 rounded-md p-2 text-black '
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Correo"
              required
            />
          </div>
          <div className='flex flex-col'>
            <label className=' text-xs pl-2'>contraseña</label>
            <input
              className='w-80 h-12 rounded-md p-2 text-black'
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Contraseña"
              required
            />
          </div>
          <div className=' flex justify-between'>
            <div>
              <input
                className="mr-2 mt-[0.3rem] h-3.5 w-8 appearance-none rounded-[0.4375rem] bg-neutral-300 before:pointer-events-none before:absolute before:h-3.5 before:w-3.5 before:rounded-full before:bg-transparent before:content-[''] after:absolute after:z-[2] after:-mt-[0.1875rem] after:h-5 after:w-5 after:rounded-full after:border-none after:bg-neutral-100 after:shadow-[0_0px_3px_0_rgb(0_0_0_/_7%),_0_2px_2px_0_rgb(0_0_0_/_4%)] after:transition-[background-color_0.2s,transform_0.2s] after:content-[''] checked:bg-purple-400 checked:after:absolute checked:after:z-[2] checked:after:-mt-[3px] checked:after:ml-[1.0625rem] checked:after:h-5 checked:after:w-5 checked:after:rounded-full checked:after:border-none checked:after:bg-primary checked:after:shadow-[0_3px_1px_-2px_rgba(0,0,0,0.2),_0_2px_2px_0_rgba(0,0,0,0.14),_0_1px_5px_0_rgba(0,0,0,0.12)] checked:after:transition-[background-color_0.2s,transform_0.2s] checked:after:content-[''] hover:cursor-pointer focus:outline-none focus:ring-0 focus:before:scale-100 focus:before:opacity-[0.12] focus:before:shadow-[3px_-1px_0px_13px_rgba(0,0,0,0.6)] focus:before:transition-[box-shadow_0.2s,transform_0.2s] focus:after:absolute focus:after:z-[1] focus:after:block focus:after:h-5 focus:after:w-5 focus:after:rounded-full focus:after:content-[''] checked:focus:border-primary checked:focus:bg-primary checked:focus:before:ml-[1.0625rem] checked:focus:before:scale-100 checked:focus:before:shadow-[3px_-1px_0px_13px_#3b71ca] checked:focus:before:transition-[box-shadow_0.2s,transform_0.2s] dark:bg-neutral-600 dark:after:bg-purple-400 dark:checked:bg-primary dark:checked:after:bg-primary dark:focus:before:shadow-[3px_-1px_0px_13px_rgba(255,255,255,0.4)] dark:checked:focus:before:shadow-[3px_-1px_0px_13px_#3b71ca]"
                type="checkbox"
                role="switch"
                id="flexSwitchCheckDefault"
                onChange={(e) => setRememberMe(e.target.checked)} // Manejar el checkbox
              />
              <label className=" text-sm inline-block pl-[0.15rem] hover:cursor-pointer">
                Recordarme
              </label>
            </div>
            <div>
              <a className=' text-sm text-purple-400' href="">Olvidaste la contraseña?</a>
            </div>
          </div>

          {/* Mostrar mensaje de error */}
          {errorMessage && <p className="text-red-500 text-sm">{errorMessage}</p>}

          {/* Botón de enviar deshabilitado si está cargando */}
          <button className=' bg-purple-600 p-2 rounded-md font-medium' type="submit" disabled={loading}>
            {loading ? 'Cargando...' : 'Iniciar Sesión'}
          </button>

          <hr />

          {/* Botón para iniciar sesión con Google */}
          <button className=' bg-gray-600 p-2 rounded-md font-medium' type="button">
            <div className=' flex justify-center gap-2'>
              <img className='w-6' src={googleLog} alt="Google login" />
              <span>Iniciar Sesión con Google</span>
            </div>
          </button>

          <span className='flex gap-2 text-xs text-blue-600' >No tienes una cuenta? <a href="" className=' text-purple-600'>Registrarse</a></span>
        </form>
      </div>
    </main>
  );
};

export default Login;

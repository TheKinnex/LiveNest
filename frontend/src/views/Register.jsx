import { useState } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';


const Register = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [username, setUsername] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState(''); // Estado para el mensaje de éxito


  /* 
  
  Nuevo Feedback: No estas realizando la validacion de los inputs, te recomiendo 
  hacerlo en el backend y en el frontend y luego 
  mostrar el mensaje de error en el frontend de existir algun error en algun campo
  
  */
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true); // Mostrar indicador de carga
    setErrorMessage(''); // Limpiar mensaje de error previo
    setSuccessMessage(''); // Limpiar mensaje de éxito previo

    try {
      // Llamada a la API de registro
      await axios.post(`${import.meta.env.VITE_API_URL}/auth/register`, { email, password, username });

      // Mostrar el mensaje de éxito si el registro es exitoso
      setSuccessMessage('Registro exitoso. Por favor, revisa tu correo para verificar tu cuenta.');
    } catch (error) {
      if (error.response && error.response.data) {
        setErrorMessage(error.response.data.msg);
      } else {
        setErrorMessage('Error al registrarse. Por favor, intenta nuevamente.');
      }
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className=' bg-[#111827] w-full h-screen text-white'>
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
              onChange={(e) => setUsername(e.target.value)}
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
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Correo"
              required
            />
          </div>
          <div className='flex flex-col'>
            <label className=' text-xs pl-2'>Contraseña</label>
            <input
              className='w-80 h-12 rounded-md p-2 text-black'
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Contraseña"
              required
            />
          </div>

          {/* Mostrar mensaje de error */}
          {errorMessage && <p className="text-red-500 text-sm">{errorMessage}</p>}

          {/* Mostrar mensaje de éxito */}
          {successMessage && <p className="text-green-500 text-sm break-words " >{successMessage}</p>}

          {/* Botón de enviar deshabilitado si está cargando */}
          <button className=' bg-purple-600 p-2 rounded-md font-medium' type="submit" disabled={loading}>
            {loading ? 'Registrando...' : 'Registrarse'}
          </button>

          <span className='flex gap-2 text-xs text-blue-600' >Ya tienes una cuenta? <Link to={'/  '} className=' text-purple-600'>Iniciar Sesion</Link></span>
        </form>
      </div>
    </main>
  );
};

export default Register;

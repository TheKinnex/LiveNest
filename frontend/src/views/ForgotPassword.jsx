import { useState } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';

const ForgotPassword = () => {
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const validateEmail = (email) => {
    // Validación de correo con regex
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return regex.test(email);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setMessage('');

    if (!validateEmail(email)) {
      setError('Por favor, ingresa un correo electrónico válido.');
      return;
    }

    setLoading(true);

    try {
      const response = await axios.post(`${import.meta.env.VITE_API_URL}/auth/forgot-password`, { email });
      setMessage(response.data.msg);
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

  return (
    <main className='bg-[#111827] w-full min-h-screen flex justify-center items-center text-white p-4'>
      <div className='w-full max-w-md bg-gray-800 p-6 rounded-lg shadow-lg'>
        <h2 className='text-2xl font-semibold mb-4 text-center'>Restablecer Contraseña</h2>
        <p className='mb-6 text-center'>Ingresa tu correo electrónico para recibir instrucciones de restablecimiento de contraseña.</p>

        {message && <p className="text-green-500 mb-4 text-center">{message}</p>}
        {error && <p className="text-red-500 mb-4 text-center">{error}</p>}

        <form onSubmit={handleSubmit} className='flex flex-col gap-4'>
          <div className='flex flex-col'>
            <label htmlFor="email" className='mb-1 text-sm'>Correo Electrónico</label>
            <input
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="tucorreo@ejemplo.com"
              className='w-full p-3 rounded-md text-black'
              required
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className={`bg-purple-600 p-3 rounded-md font-medium ${loading ? 'opacity-50 cursor-not-allowed' : 'hover:bg-purple-500'}`}
          >
            {loading ? 'Enviando...' : 'Enviar Instrucciones'}
          </button>
        </form>

        <div className='mt-4 text-center'>
          <Link to="/login" className='text-purple-400 hover:underline'>Volver al Inicio de Sesión</Link>
        </div>
      </div>
    </main>
  );
};

export default ForgotPassword;

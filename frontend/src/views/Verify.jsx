import { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import axios from 'axios';

const Verify = () => {
    const [loading, setLoading] = useState(true);
    const [message, setMessage] = useState('');
    const navigate = useNavigate();
    const location = useLocation();

    useEffect(() => {
        const verifyAccount = async () => {
            try {
                // Extraer los parámetros de la URL
                const queryParams = new URLSearchParams(location.search);
                const email = queryParams.get('email');
                const code = queryParams.get('code');

                if (!email || !code) {
                    setMessage('El enlace de verificación no es válido.');
                    setLoading(false);
                    return;
                }

                // Enviar la solicitud al backend para verificar la cuenta
                const response = await axios.get(`https://livenest-backend.onrender.com/auth/verify`, {
                    params: { email, code }
                });
                
                console.log(response.data.msg) 
                console.log(response.data) 
                setMessage(response.data.msg);
                setLoading(false);

                // Redirigir al login después de 3 segundos
                setTimeout(() => {
                    navigate('/');
                }, 2000);

            } catch (error) {
                console.error(error);
                setLoading(false);
            }
        };

        verifyAccount();
    }, [location, navigate]);

    return (
        <main className=' bg-[#111827] w-full h-screen text-white'>
            <div className=' flex flex-col justify-center items-center h-full'>
                {loading ? (
                    <p className='text-xl'>Verificando tu cuenta...</p>
                ) : (
                    <div className='text-center'>
                        <h2 className='text-xl'>{message}</h2>
                        <p className='text-sm text-gray-400'>Serás redirigido al inicio de sesión en unos momentos...</p>
                    </div>
                )}
            </div>
        </main>
    );
};

export default Verify;

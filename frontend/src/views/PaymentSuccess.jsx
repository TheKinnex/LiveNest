import { useEffect, useState } from 'react';
import { useLocation, Link } from 'react-router-dom';

const PaymentSuccess = () => {
  const location = useLocation();
  const [message, setMessage] = useState('Procesando tu suscripción...');

  useEffect(() => {
    const query = new URLSearchParams(location.search);
    const subscriptionIdParam = query.get('subscriptionId');
    const token = localStorage.getItem('token') || sessionStorage.getItem('token');

    if (subscriptionIdParam && token) {
      setMessage('¡Suscripción exitosa! Ahora tienes acceso a beneficios premium.');
    } else {
      setMessage('Suscripción exitosa.');
    }
  }, [location]);

  return (
    <div className="bg-gray-900 min-h-screen flex flex-col items-center justify-center p-4">
      <h1 className="text-3xl font-bold text-white mb-4">Suscripción Existosa</h1>
      <p className="text-gray-300 mb-8">{message}</p>
      <Link to="/my-subscriptions" className="bg-purple-600 text-white px-4 py-2 rounded-md hover:bg-purple-700">
        Ver Mis Suscripciones
      </Link>
    </div>
  );
};

export default PaymentSuccess;

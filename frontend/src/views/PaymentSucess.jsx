// src/views/PaymentSuccess.jsx
import { useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

const PaymentSuccess = () => {
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    const query = new URLSearchParams(location.search);
    const subscriptionId = query.get('subscriptionId');
    const msg = query.get('msg');

    if (subscriptionId) {
      // Opcional: Puedes hacer una solicitud para obtener detalles de la suscripción
      // o actualizar el estado de la aplicación para reflejar la nueva suscripción.
    }

    if (msg) {
      // Opcional: Mostrar mensajes específicos si se pasan en la URL
      alert(msg);
    }
  }, [location]);

  return (
    <div className="bg-gray-900 min-h-screen flex flex-col items-center justify-center text-white p-4">
      <h1 className="text-3xl font-semibold mb-4">¡Suscripción Exitosa!</h1>
      <p className="mb-6">Gracias por suscribirte. Ahora tienes acceso a beneficios premium.</p>
      <button
        onClick={() => navigate('/my-subscriptions')}
        className="bg-purple-600 hover:bg-purple-700 px-4 py-2 rounded-md"
      >
        Ver Mis Suscripciones
      </button>
    </div>
  );
};

export default PaymentSuccess;

import { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import Loading from '../components/Loading';

const MySubscriptions = () => {
  const [subscription, setSubscription] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [showModal, setShowModal] = useState(false);
  const navigate = useNavigate();
  const token = localStorage.getItem('token') || sessionStorage.getItem('token');

  useEffect(() => {
    const fetchActiveSubscription = async () => {
      if (!token) {
        navigate('/login');
        return;
      }
      try {
        const response = await axios.get(`${import.meta.env.VITE_API_URL}/subscriptions`, {
          headers: { Authorization: `Bearer ${token}` },
        });
  
        const activeSubscription = response.data.subscriptions?.find(sub => sub.isActive && sub.plan === 'Premium');
        if (activeSubscription) {
          setSubscription(activeSubscription);
        } else if (response.data.msg === "No tienes suscripciones activas.") {
          setSubscription({ plan: "Gratis", price: 0 });
        } else {
          setError('No tienes una suscripción premium activa para cancelar.');
        }
      } catch (err) {
        if (err.response && err.response.status === 404) {
          setSubscription({ plan: "Gratis", price: 0 }); // Muestra la suscripción gratis si no hay activa
        } else {
          console.error("Error al obtener suscripción activa:", err);
          setError('No se pudo obtener tu suscripción activa.');
        }
      } finally {
        setLoading(false);
      }
    };
  
    fetchActiveSubscription();
  }, [navigate, token]);
  

  const handleCancelSubscription = async () => {
    try {
      await axios.patch(
        `${import.meta.env.VITE_API_URL}/subscriptions/cancel`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setSuccess('Tu suscripción ha sido cancelada exitosamente.');
      setSubscription({ plan: "Gratis", price: 0 });
      setShowModal(false);
    } catch (err) {
      console.error("Error al cancelar suscripción:", err);
      setError('Hubo un error al cancelar tu suscripción.');
    }
  };

  if (loading) return <Loading/>;
  if (error) return <div className="text-red-500">{error}</div>;
  if (success) return <div className="text-green-500">{success}</div>;

  return (
    <div className="bg-gray-900 min-h-screen flex flex-col items-center p-6 mb-16">
      <h1 className="text-3cxl font-bold text-white mb-8">Gestionar Suscripción</h1>
      {subscription ? (
        <div className="bg-gray-800 p-8 rounded-lg shadow-lg w-full max-w-md text-center">
          <h2 className="text-2xl font-semibold text-white mb-4 capitalize">{subscription.plan} Plan</h2>
          <p className="text-gray-300 mb-4">Precio: ${subscription.price}/mes</p>
          {subscription.plan === "Gratis" ? (
            <div>
              <p className="text-gray-300 mb-4">Disfruta de las funciones básicas del servicio.</p>
              <button
                onClick={() => navigate('/subscriptions')}
                className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 w-full font-semibold mt-4"
              >
                Mejorar Plan
              </button>
            </div>
          ) : (
            <>
              <p className="text-gray-300 mb-4">
                Fecha de Finalización: {new Date(subscription.endDate).toLocaleDateString()}
              </p>
              <button
                onClick={() => setShowModal(true)}
                className="bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700 w-full font-semibold mt-4"
              >
                Cancelar Suscripción
              </button>
            </>
          )}
        </div>
      ) : (
        <div className="text-white">No se encontró ninguna suscripción.</div>
      )}

      {/* Modal de confirmación */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50">
          <div className="bg-gray-800 p-6 rounded-lg shadow-lg w-full max-w-sm text-center">
            <h2 className="text-xl font-semibold text-white mb-4">¿Estás seguro?</h2>
            <p className="text-gray-300 mb-6">
              Al cancelar tu suscripción, perderás todos los beneficios del plan premium.
            </p>
            <div className="flex justify-center space-x-4">
              <button
                onClick={handleCancelSubscription}
                className="bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700 font-semibold"
              >
                Sí, Cancelar
              </button>
              <button
                onClick={() => setShowModal(false)}
                className="bg-gray-500 text-white px-4 py-2 rounded-md hover:bg-gray-600 font-semibold"
              >
                No, Mantener
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MySubscriptions;

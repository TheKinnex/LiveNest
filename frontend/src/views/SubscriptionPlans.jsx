// src/views/SubscriptionPlans.jsx
import { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { FaPaypal } from 'react-icons/fa';

const SubscriptionPlans = () => {
  const navigate = useNavigate();
  const [plans, setPlans] = useState([]);
  const [loading, setLoading] = useState(true);
  const token = localStorage.getItem('token') || sessionStorage.getItem('token');

  useEffect(() => {
    const fetchPlans = async () => {
      try {
        const res = await axios.get(`${import.meta.env.VITE_API_URL}/subscriptions/plans`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setPlans(res.data.plans);
      } catch (error) {
        console.error("Error al obtener los planes de suscripción:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchPlans();
  }, [token]);

  const handleSubscribe = async (plan) => {
    try {
      const res = await axios.post(
        `${import.meta.env.VITE_API_URL}/payments/create`,
        { plan },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (plan === 'free') {
        alert("Suscripción gratuita creada exitosamente.");
        navigate('/my-subscriptions');
        return;
      }

      // Redirigir al usuario a PayPal para completar el pago
      window.location.href = res.data.links.href;
    } catch (error) {
      console.error("Error al crear la transacción de suscripción:", error);
      alert("Hubo un error al procesar tu suscripción.");
    }
  };

  if (loading) return <div className="text-white">Cargando planes de suscripción...</div>;

  return (
    <div className="bg-gray-900 min-h-screen flex flex-col items-center p-4 md:p-8 text-white">
      <h1 className="text-3xl font-semibold mb-8">Planes de Suscripción</h1>
      <div className="flex flex-col md:flex-row gap-6">
        {plans.map((plan) => (
          <div key={plan.plan} className="bg-gray-800 p-6 rounded-lg shadow-lg w-80">
            <h2 className="text-2xl font-bold mb-4 capitalize">{plan.plan}</h2>
            <p className="text-gray-400 mb-4">{plan.description}</p>
            <p className="text-3xl font-semibold mb-6">
              {plan.price === 0 ? "Gratis" : `$${plan.price}`}
              <span className="text-lg">/{plan.durationInDays ? `${plan.durationInDays} días` : 'Indefinido'}</span>
            </p>
            <button
              onClick={() => handleSubscribe(plan.plan)}
              className={`w-full py-2 px-4 rounded-md text-white flex items-center justify-center ${
                plan.plan === 'paid' ? 'bg-purple-600 hover:bg-purple-700' : 'bg-gray-600 hover:bg-gray-700'
              }`}
            >
              {plan.plan === 'paid' ? <FaPaypal className="mr-2" /> : null}
              {plan.plan === 'paid' ? "Suscribirse" : "Seleccionar"}
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default SubscriptionPlans;

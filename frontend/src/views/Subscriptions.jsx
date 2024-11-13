import { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import Loading from '../components/Loading';

const Subscriptions = () => {
  const [plans, setPlans] = useState([]);
  const [currentPlan, setCurrentPlan] = useState('Gratis'); 
  const [isPremiumActive, setIsPremiumActive] = useState(false); // Estado para suscripción premium activa
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const token = localStorage.getItem('token') || sessionStorage.getItem('token');

  useEffect(() => {
    const fetchData = async () => {
      if (!token) {
        navigate('/login');
        return;
      }

      try {
        // Obtener los planes de suscripción
        const plansResponse = await axios.get(`${import.meta.env.VITE_API_URL}/subscriptions/plans`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        setPlans(plansResponse.data.plans);

        // Obtener el perfil del usuario para determinar el plan actual
        const profileResponse = await axios.get(`${import.meta.env.VITE_API_URL}/profile/current`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        setCurrentPlan(profileResponse.data.isPremium ? 'Premium' : 'Gratis');
        setIsPremiumActive(profileResponse.data.isPremium);
      } catch (err) {
        console.error("Error fetching data:", err);
        setError('No se pudieron cargar los datos.');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [navigate, token]);

  const handleSubscribe = async (plan) => {
    if (isPremiumActive && plan === 'Premium') {
      setError('Ya tienes una suscripción premium activa.');
      return;
    }

    try {
      const response = await axios.post(
        `${import.meta.env.VITE_API_URL}/payments/create`,
        { plan },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      // Redirigir a la URL de aprobación de PayPal
      window.location.href = response.data.links.href;
    } catch (err) {
      console.error("Error al iniciar la suscripción:", err);
      setError('Hubo un error al iniciar la suscripción.');
    }
  };

  if (loading) return <Loading/>;
  if (error) return <div className="text-red-500">{error}</div>;

  return (
    <div className="bg-gray-900 min-h-screen flex flex-col items-center p-4">
      <h1 className="text-3xl font-bold text-white mb-8">Planes de Suscripción</h1>
      {isPremiumActive && (
        <div className="mb-4 text-green-500 font-semibold">
          Ya tienes una suscripción premium activa.
        </div>
      )}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 w-full max-w-4xl mb-16">
        {plans.map((plan) => (
          <div key={plan.plan} className="bg-gray-800 p-6 rounded-lg shadow-lg">
            <h2 className="text-2xl font-semibold text-white mb-4 capitalize">{plan.plan} Plan</h2>
            <p className="text-gray-300 mb-4">{plan.description}</p>
            <p className="text-white text-xl mb-4">
              {plan.price === 0 ? 'Gratis' : `$${plan.price}/mes`}
            </p>
            <ul className="text-gray-300 mb-4">
              {plan.benefits.map((benefit, index) => (
                <li key={index} className="flex items-center space-x-2">
                  <span className="text-green-500">✓</span>
                  <span>{benefit}</span>
                </li>
              ))}
            </ul>
            {plan.plan === 'Gratis' ? (
              currentPlan === 'Gratis' ? (
                <span className="text-green-500 font-semibold">Plan Actual</span>
              ) : (
                <span className="text-gray-500">Plan Gratis</span>
              )
            ) : (
              <button
                onClick={() => handleSubscribe(plan.plan)}
                className={`bg-purple-600 text-white px-4 py-2 rounded-md hover:bg-purple-700 ${isPremiumActive ? 'opacity-50 cursor-not-allowed' : ''}`}
                disabled={isPremiumActive}
              >
                {isPremiumActive ? 'Plan Activo' : 'Elegir Plan'}
              </button>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default Subscriptions;

import { Link } from 'react-router-dom';

const PaymentCancel = () => {
  return (
    <div className="bg-gray-900 min-h-screen flex flex-col items-center justify-center p-4">
      <h1 className="text-3xl font-bold text-white mb-4">Pago Cancelado</h1>
      <p className="text-gray-300 mb-8">Has cancelado la suscripción.</p>
      <Link to="/subscriptions" className="bg-purple-600 text-white px-4 py-2 rounded-md hover:bg-purple-700">
        Volver a Suscripciones
      </Link>
    </div>
  );
};

export default PaymentCancel;

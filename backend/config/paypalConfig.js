import paypal from '@paypal/checkout-server-sdk';

// Configuración del entorno (Sandbox para desarrollo, Live para producción)
const Environment = process.env.NODE_ENV === 'Live'
  ? paypal.core.LiveEnvironment
  : paypal.core.SandboxEnvironment;

// Inicializar el cliente de PayPal
const paypalClient = new paypal.core.PayPalHttpClient(
  new Environment(process.env.PAYPAL_CLIENT_ID, process.env.PAYPAL_CLIENT_SECRET)
);

export default paypalClient;

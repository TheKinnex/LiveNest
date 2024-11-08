import paypalClient from "../config/paypalConfig.js"; // Importar configuración de PayPal
import Transaction from "../models/Transaction.js";
import User from "../models/User.js";
import Subscription from "../models/Subscription.js";
import paypal from "@paypal/checkout-server-sdk"; // Importa el SDK de PayPal
import jwt from "jsonwebtoken";


// @desc Crear una transacción de PayPal para suscripción
// @route POST /payments/create
export const createSubscriptionTransaction = async (req, res) => {
  const { plan } = req.body;
  const token = req.header('Authorization')?.split(' ')[1];

  try {
    // Verificar si el usuario tiene una suscripción activa
    const user = await User.findById(req.user.id).populate('subscriptions');
    const activeSubscription = user.subscriptions.find(sub => sub.isActive && sub.plan === 'Premium' && new Date(sub.endDate) > new Date());

    if (activeSubscription) {
      return res.status(400).json({ msg: "Ya tienes una suscripción premium activa." });
    }

    if (plan === 'Gratis') {
      // Crear una suscripción gratuita sin transacción
      const subscription = new Subscription({
        subscriber: req.user.id,
        plan: "Gratis",
        price: 0,
        isActive: true,
      });

      await subscription.save();

      user.subscriptions.push(subscription._id);
      await user.save();

      return res.status(201).json({
        msg: "Suscripción gratuita creada exitosamente",
        subscription,
      });
    }

    if (plan !== 'Premium') {
      return res.status(400).json({ msg: "Plan de suscripción inválido." });
    }

    const request = new paypal.orders.OrdersCreateRequest();
    request.prefer("return=representation");
    request.requestBody({
      intent: "CAPTURE",
      purchase_units: [
        {
          amount: {
            currency_code: "USD",
            value: "4.00",
          },
          description: `Suscripción plan ${plan}`,
        },
      ],
      application_context: {
        brand_name: "LiveNest",
        landing_page: "LOGIN",
        user_action: "PAY_NOW",
        return_url: `${process.env.BACK_URL}/payments/success?jwt=${token}`,
        cancel_url: `${process.env.BACK_URL}/payments/cancel`,
      },
    });

    const order = await paypalClient.execute(request);

    res.status(201).json({
      orderID: order.result.id,
      links: order.result.links.find((link) => link.rel === "approve"),
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: "Error creando la transacción" });
  }
};

// @desc Capturar el pago de una suscripción
// @route GET /payments/success
export const captureSubscriptionTransaction = async (req, res) => {
  const { token, jwt: userToken } = req.query;

  if (!userToken) {
    return res.status(401).json({ msg: "No token, autorización denegada" });
  }

  try {
    // Verificar el JWT
    const decoded = jwt.verify(userToken, process.env.JWT_SECRET);
    req.user = decoded.user;

    const request = new paypal.orders.OrdersCaptureRequest(token);
    request.requestBody({});
    const capture = await paypalClient.execute(request);

    if (capture.result.status === "COMPLETED") {
      const payments = capture.result.purchase_units[0].payments?.captures?.[0];
      if (!payments) {
        return res
          .status(400)
          .redirect(`${process.env.FRONT_URL}/payments/failure?msg=Información de pago no encontrada.`);
      }

      const newTransaction = new Transaction({
        user: req.user.id,
        amount: payments.amount.value,
        currency: payments.amount.currency_code || "USD",
        status: "completed",
        paymentMethod: "PayPal",
      });

      await newTransaction.save();

      const subscription = new Subscription({
        subscriber: req.user.id,
        plan: "Premium",
        price: 4,
        startDate: new Date(),
        endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
        isActive: true,
      });

      await subscription.save();

      const subscriberUser = await User.findById(req.user.id);
      subscriberUser.subscriptions.push(subscription._id);
      subscriberUser.isPremium = true; // Actualizar isPremium a true
      await subscriberUser.save();

      return res
        .status(200)
        .redirect(`${process.env.FRONT_URL}/payments/success?subscriptionId=${subscription._id}`);
    } else {
      return res.status(400).redirect(`${process.env.FRONT_URL}/payments/failure?msg=Error capturando el pago.`);
    }
  } catch (err) {
    console.error(err);
    return res.status(500).redirect(`${process.env.FRONT_URL}/payments/failure?msg=Error en el servidor.`);
  }
};

// @desc Manejar la cancelación del pago
// @route GET /payments/cancel
export const cancelSubscriptionTransaction = async (req, res) => {
  res.redirect(`${process.env.FRONT_URL}/payments/cancel`);
};


// @desc Obtener historial de pagos del usuario logueado
// @route GET /payments/history
export const getPaymentHistory = async (req, res) => {
  try {
    // Buscar todas las transacciones realizadas por el usuario logueado
    const transactions = await Transaction.find({ user: req.user.id })
      .sort({ createdAt: -1 }) // Ordenar por la más reciente primero
      .select("amount currency status createdAt"); // Seleccionar los campos relevantes

    // Verificar si no se encontraron transacciones
    if (transactions.length === 0) {
      return res.status(404).json({ msg: "No se encontraron pagos en tu historial." });
    }

    // Enviar las transacciones encontradas
    res.status(200).json({
      msg: "Historial de pagos obtenido exitosamente",
      transactions,
    });
  } catch (err) {
    console.error("Error al obtener el historial de pagos:", err.message);
    res.status(500).json({ msg: "Error en el servidor al obtener el historial de pagos." });
  }
};

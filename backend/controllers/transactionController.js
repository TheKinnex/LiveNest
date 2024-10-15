import paypalClient from "../config/paypalConfig.js"; // Importar configuración de PayPal
import Transaction from "../models/Transaction.js";
import User from "../models/User.js";
import Subscription from "../models/Suscription.js";
import paypal from "@paypal/checkout-server-sdk"; // Importa el SDK de PayPal

// @desc Crear una transacción de PayPal para suscripción
// @route POST /payments/create
export const createSubscriptionTransaction = async (req, res) => {
  const { channelId } = req.body;

  try {
    // Crear una orden de pago en PayPal
    const request = new paypal.orders.OrdersCreateRequest();
    request.prefer("return=representation");
    request.requestBody({
      intent: "CAPTURE",
      purchase_units: [
        {
          amount: {
            currency_code: "USD",
            value: "4.00", // Precio fijo de $4 para suscripción
          },
          description: `Suscripción a canal ${channelId}`,
        },
      ],
      application_context: {
        brand_name: "LiveNest",
        landing_page: "LOGIN",
        user_action: "PAY_NOW",
        return_url: `${process.env.CLIENT_URL}/payments/success?channelId=${channelId}`,
        cancel_url: `${process.env.CLIENT_URL}/payments/cancel`,
      },
    });

    // Ejecutar la solicitud
    const order = await paypalClient.execute(request);

    // Retornar el ID de la orden al cliente para que redirija a PayPal
    res.status(201).json({
      orderID: order.result.id,
      links: order.result.links.filter((link) => link.rel === "approve")[0],
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: "Error creando la transacción" });
  }
};

// @desc Capturar el pago de una suscripción
// @route GET /payments/success
export const captureSubscriptionTransaction = async (req, res) => {
  const { token, channelId } = req.query; // Leer el token y el channelId desde la URL

  if (!channelId) {
    return res
      .status(400)
      .json({ msg: "El canal de suscripción es obligatorio." });
  }

  try {
    // Obtener los detalles de la orden de PayPal
    const requestDetails = new paypal.orders.OrdersGetRequest(token);
    const orderDetails = await paypalClient.execute(requestDetails);

    if (!orderDetails || !orderDetails.result) {
      return res
        .status(400)
        .json({
          msg: "No se encontró la información de la compra en la respuesta de PayPal.",
        });
    }

    // Capturar la orden
    const request = new paypal.orders.OrdersCaptureRequest(token);
    request.requestBody({});
    const capture = await paypalClient.execute(request);

    if (capture.result.status === "COMPLETED") {
      const payments = capture.result.purchase_units[0].payments?.captures?.[0];
      if (!payments) {
        return res
          .status(400)
          .json({
            msg: "No se encontró la información del pago en la respuesta de captura.",
          });
      }

      const amount = payments.amount?.value;
      const currency = payments.amount?.currency_code || "USD";

      // Guardar la transacción en la base de datos
      const newTransaction = new Transaction({
        user: req.user.id,
        amount: amount,
        currency: currency,
        status: "completed", // Pago completado
        paymentMethod: "PayPal",
      });

      await newTransaction.save();

      // Registrar la suscripción en la base de datos
      const subscription = new Subscription({
        subscriber: req.user.id,
        channel: channelId,
        plan: "paid",
        price: 4,
        startDate: new Date(),
        endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 días después del inicio
        isActive: true,
      });

      await subscription.save();

      // Actualizar el usuario que se suscribe
      const subscriberUser = await User.findById(req.user.id);
      subscriberUser.subscriptions.push(subscription._id); // Agregar suscripción al suscriptor
      await subscriberUser.save();

      // Actualizar el canal que recibe la suscripción
      const channelUser = await User.findById(channelId);
      if (!channelUser) {
        return res.status(404).json({ msg: "Canal no encontrado." });
      }
      channelUser.subscribers.push(subscription._id); // Agregar suscriptor al canal
      await channelUser.save();

      return res.status(200).json({
        msg: "Pago completado y suscripción activa",
        subscription,
        transaction: newTransaction,
      });
    } else {
      return res.status(400).json({ msg: "Error capturando el pago." });
    }
  } catch (err) {
    console.error(err);
    return res.status(500).json({ msg: "Error en el servidor" });
  }
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

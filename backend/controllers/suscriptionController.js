// controllers/subscriptionController.js
import Subscription from "../models/Suscription.js";
import User from "../models/User.js";

// @desc Listar planes de suscripción de un canal
// @route GET /subscriptions/:channelId
export const listSubscriptions = async (req, res) => {
  try {
    const channel = await User.findById(req.params.channelId);

    if (!channel) {
      return res.status(404).json({ msg: "Canal no encontrado" });
    }

    // Listar los dos planes disponibles
    const plans = [
      {
        plan: "free",
        price: 0,
        durationInDays: null,
        description: "Suscripción gratuita con acceso limitado.",
      },
      {
        plan: "paid",
        price: 4,
        durationInDays: 30,
        description:
          "Suscripción de pago con beneficios premium durante 30 días.",
      },
    ];

    res.json({ msg: "Planes de suscripción disponibles", plans });
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Error en el servidor");
  }
};

// @desc Cancelar una suscripción activa
// @route PATCH /subscriptions/:channelId/cancel
export const cancelSubscription = async (req, res) => {
  const channelId = await User.findById(req.params.channelId);

  if (!channelId) {
    return res.status(400).json({ msg: "El ID del canal es obligatorio." });
  }

  try {
    // Encontrar la suscripción activa
    const subscription = await Subscription.findOne({
      subscriber: req.user.id,
      channel: channelId,
      isActive: true,
    });

    if (!subscription) {
      return res
        .status(404)
        .json({ msg: "No tienes una suscripción activa a este canal." });
    }

    // Marcar la suscripción como inactiva
    subscription.isActive = false;
    await subscription.save();

    // Actualizar el usuario suscriptor eliminando la referencia a esta suscripción
    const subscriberUser = await User.findById(req.user.id);
    subscriberUser.subscriptions = subscriberUser.subscriptions.filter(
      (subId) => subId.toString() !== subscription._id.toString()
    );
    await subscriberUser.save();

    // Actualizar el canal eliminando la referencia de este suscriptor
    const channelUser = await User.findById(channelId);
    if (!channelUser) {
      return res.status(404).json({ msg: "Canal no encontrado." });
    }
    channelUser.subscribers = channelUser.subscribers.filter(
      (subId) => subId.toString() !== subscription._id.toString()
    );
    await channelUser.save();

    res.json({ msg: "Suscripción cancelada exitosamente", subscription });
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Error en el servidor");
  }
};

// @desc Obtener suscripciones activas
// @route GET /subscriptions
export const getUserSubscriptions = async (req, res) => {
  try {
    // Buscar todas las suscripciones del usuario logueado
    const subscriptions = await Subscription.find({
      subscriber: req.user.id,
      isActive: true,
    }).populate("channel", "username profilePicture");

    if (!subscriptions || subscriptions.length === 0) {
      return res.status(404).json({ msg: "No tienes suscripciones activas." });
    }

    res.json({
      msg: "Suscripciones obtenidas exitosamente",
      subscriptions,
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Error en el servidor");
  }
};

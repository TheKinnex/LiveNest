import Subscription from "../models/Subscription.js";
import User from "../models/User.js";


// @desc Listar planes de suscripción
// @route GET /subscriptions/plans
export const listSubscriptionPlans = async (req, res) => {
  try {
    // Definir los planes de suscripción con sus beneficios
    const plans = [
      {
        plan: "Gratis",
        price: 0,
        durationInDays: null,
        description: "Suscripción gratuita con acceso limitado.",
        benefits: [
          "Acceso básico a contenido",
          "Interacción limitada en la plataforma",
        ],
      },
      {
        plan: "Premium",
        price: 4,
        durationInDays: 30,
        description: "Suscripción de pago con beneficios premium durante 30 días.",
        benefits: [
          "Permite subir videos",
          "Prioridad de soporte",
          "Mayor recomendación de perfil",
          "Insignia premium en perfil",
        ],
      },
    ];

    res.json({ msg: "Planes de suscripción disponibles", plans });
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Error en el servidor");
  }
};

// @desc Cancelar una suscripción activa
// @route PATCH /subscriptions/cancel
export const cancelSubscription = async (req, res) => {
  try {
    // Encontrar la suscripción activa del usuario
    const subscription = await Subscription.findOne({
      subscriber: req.user.id,
      isActive: true,
      plan: "Premium",
    });

    if (!subscription) {
      return res.status(404).json({ msg: "No tienes una suscripción activa para cancelar." });
    }

    // Marcar la suscripción como inactiva
    subscription.isActive = false;
    await subscription.save();

    // Actualizar el usuario suscriptor
    const subscriberUser = await User.findById(req.user.id);

    // Si la suscripción cancelada es premium, establecer isPremium en false
    subscriberUser.isPremium = false;

    await subscriberUser.save();

    res.json({ msg: "Suscripción cancelada exitosamente", subscription });
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Error en el servidor");
  }
};


// @desc Obtener suscripciones activas del usuario logueado
// @route GET /subscriptions
export const getUserSubscriptions = async (req, res) => {
  try {
    // Buscar todas las suscripciones activas del usuario logueado
    const subscriptions = await Subscription.find({
      subscriber: req.user.id,
      isActive: true,
    });

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

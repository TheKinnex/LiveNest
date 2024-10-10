import mongoose from "mongoose";

const subscriptionSchema = new mongoose.Schema({
  subscriber: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true, // Usuario que se suscribe
  },
  channel: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true, // Canal o streamer al que se suscribe
  },
  plan: {
    type: String,
    enum: ['free', 'premium', 'enterprise'],
    default: 'free', // Tipo de plan que el usuario ha seleccionado para la suscripción
  },
  price: {
    type: Number,
    default: 0, // Precio de la suscripción según el tipo de plan
  },
  startDate: {
    type: Date,
    default: Date.now, // Fecha de inicio de la suscripción
  },
  endDate: {
    type: Date, // Fecha de finalización de la suscripción
  },
  isActive: {
    type: Boolean,
    default: true, // Estado de la suscripción (activa o inactiva)
  },
  // NUEVO: Agregar referencia directa a la transmisión en vivo (opcional)
  liveStream: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'LiveStream',
  },
});

const Subscription = mongoose.model('Subscription', subscriptionSchema);
module.exports = Subscription;

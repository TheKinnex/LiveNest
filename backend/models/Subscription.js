// models/Subscription.js
import mongoose from "mongoose";

const subscriptionSchema = new mongoose.Schema({
  subscriber: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true, // Usuario que se suscribe
  },
  plan: {
    type: String,
    enum: ['Gratis', 'Premium'],
    required: true,
  },
  price: {
    type: Number,
    default: 4, // Precio fijo de $4 para suscripciones pagas
  },
  durationInDays: {
    type: Number,
    default: 30, // Duración fija de 30 días (1 mes)
  },
  startDate: {
    type: Date,
    default: Date.now, // Fecha de inicio de la suscripción
  },
  endDate: {
    type: Date, // Fecha de finalización de la suscripción, se calculará automáticamente
  },
  isActive: {
    type: Boolean,
    default: true, // Estado de la suscripción (activa o inactiva)
  },
});

// Middleware para calcular la fecha de finalización antes de guardar
subscriptionSchema.pre('save', function(next) {
  if (this.plan === 'Premium' && !this.endDate) {
    this.endDate = new Date(this.startDate.getTime() + this.durationInDays * 24 * 60 * 60 * 1000);
  }
  next();
});

const Subscription = mongoose.model('Subscription', subscriptionSchema);
export default Subscription;

// middlewares/authorizationMiddleware.js
export const authorizationMiddleware = (req, res, next) => {
    if (req.user.id !== req.params.userId) {
      return res.status(403).json({ msg: 'Acceso denegado: No autorizado para modificar este perfil' });
    }
    next();
  };
  
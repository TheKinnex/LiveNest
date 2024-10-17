import jwt from "jsonwebtoken";
import User from "../models/User.js";

export const authMiddleware = async (req, res, next) => {
  // Obtener el token de la cabecera Authorization
  const token = req.header('Authorization')?.split(' ')[1];

  if (!token) {
    return res.status(401).json({ msg: 'No token, autorización denegada' });
  }

  try {
    // Decodificar el token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded.user;

    // Verificar si el usuario está bloqueado o eliminado
    const user = await User.findById(req.user.id);

    if (!user) {
      return res.status(404).json({ msg: 'Cuenta no encontrada' });
    }

    /* 
    
    aqui esta de nuevo el error de la propiedad "isDeleted" que no existe
    
    */
    /* if (user.isDeleted) {
      return res.status(403).json({ msg: 'Tu cuenta ha sido eliminada' });
    } */

    if (user.isDelete) {
      return res.status(403).json({ msg: 'Tu cuenta ha sido eliminada' });
    }

    if (user.isBlocked) {
      return res.status(403).json({ msg: 'Tu cuenta ha sido bloqueada. Contacta al administrador' });
    }

    next();
  } catch (err) {
    console.error(err.message);
    res.status(401).json({ msg: 'Token no válido' });
  }
};


import jwt from "jsonwebtoken";
import User from "../models/User.js";

export const adminMiddleware = async (req, res, next) => {

    // Obtener el token de la cabecera Authorization
    const token = req.header("Authorization")?.split(" ")[1];

    if (!token) {
      return res.status(401).json({ msg: "No token, autorización denegada" });
    }

    try {
      // Decodificar el token
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      req.user = decoded.user;

      // Verificar si el usuario está bloqueado o eliminado
      const user = await User.findById(req.user.id);

      if (user.role == "admin") {
        next();
      }
    } catch (err) {
      console.error(err.message);
      res.status(401).json({ msg: "Token no válido" });
    }
  };

/* 

Podrias ahorrarte realizar una llamada a tu base de datos
si en el token le colocas el role a cada usuario 
asi se optimizan tiempos de request 

*/
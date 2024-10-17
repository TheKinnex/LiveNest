import User from "../models/User.js";
import Post from "../models/Post.js";
import Report from '../models/Report.js'

// @desc Listar todos los usuarios
// @route GET /admin/users
export const listUsers = async (req, res) => {
  try {
    const users = await User.find().select("-password"); // Excluir el campo contraseña
    res.json(users);
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Error en el servidor");
  }
};

// @desc Editar un usuario
// @route PATCH /admin/users/:userId
export const editUser = async (req, res) => {
  try {
    const { username, email, role } = req.body;

    let user = await User.findById(req.params.userId);

    if (!user) {
      return res.status(404).json({ msg: "Usuario no encontrado" });
    }

    user.username = username || user.username;
    user.email = email || user.email;
    user.role = role || user.role;
    user.updatedAt = Date.now();

    await user.save();

    res.json({ msg: "Usuario actualizado correctamente", user });
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Error en el servidor");
  }
};

/* 

Para Edit user aunque esta bien, podrias utilizar una solucion que no necesite el reenvio de los datos 
que no quieras editar como:

export const editUser = async (req, res) => {
  try {
    const { username, email, role } = req.body;

    // Opciones para devolver el documento actualizado
    const options = { new: true, runValidators: true };

    // Actualiza solo los campos proporcionados
    const updatedFields = {};
    if (username) updatedFields.username = username;
    if (email) updatedFields.email = email;
    if (role) updatedFields.role = role;

    // Buscar y actualizar el usuario en un solo paso
    const user = await User.findByIdAndUpdate(req.params.userId, updatedFields, options);

    if (!user) {
      return res.status(404).json({ msg: "Usuario no encontrado" });
    }

    res.json({ msg: "Usuario actualizado correctamente", user });
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Error en el servidor");
  }
};


*/

// @desc Bloquear o eliminar un usuario
// @route DELETE /admin/users/:userId

/* 

Si el controlador no se encargara solamente del softDelete debe tener
un nombre mas representativo de su funcion

*/
export const deleteUser = async (req, res) => {
  try {
    const { action } = req.body; // 'block' para bloquear, 'delete' para eliminar

    let user = await User.findById(req.params.userId);

    if (!user) {
      return res.status(404).json({ msg: "Usuario no encontrado" });
    }

    

    // Verifica ya que tienes un error en la propiedad "isDeleted" esta no existe
    if (action === "block") {
      user.isBlocked = true;
      //user.isDeleted = false; // Por si ya estaba marcado como eliminado

      /* 
      
      La voy a cambiar para poder probarla
      
      */

      user.isDelete = false;
    } else if (action === "delete") {
      /* 
      
      igual aqui "isDeleted" no existe
      
      */
      //user.isDeleted = true;

      user.isDelete = true;
      user.isBlocked = false; // Por si ya estaba bloqueado
    } else {
      return res.status(400).json({ msg: "Acción no válida" });
    }

    await user.save();

    const statusMsg = action === "block" ? "bloqueado" : "eliminado";
    res.json({ msg: `Usuario ${statusMsg} correctamente` });
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Error en el servidor");
  }
};

// @desc Desbloquear un usuario
// @route PATCH /admin/users/:userId/unblock
export const unblockUser = async (req, res) => {
  try {
    // Buscar el usuario por su ID
    const user = await User.findById(req.params.userId);

    if (!user) {
      return res.status(404).json({ msg: 'Usuario no encontrado' });
    }

    // Verificar si el usuario ya está desbloqueado
    if (!user.isBlocked) {
      return res.status(400).json({ msg: 'El usuario ya está desbloqueado' });
    }

    // Desbloquear el usuario
    user.isBlocked = false;
    await user.save();

    res.json({ msg: 'Usuario desbloqueado exitosamente', user });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Error en el servidor');
  }
};

// @desc Obtener todos los reportes
// @route GET /admin/reports
export const getAllReports = async (req, res) => {
  try {
    const reports = await Report.find()
      .populate('post', 'content author') // Popular detalles del post
      .populate('reportedBy', 'username'); // Popular detalles del usuario que hizo el reporte

    res.json(reports);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Error en el servidor');
  }
};

// @desc Eliminar contenido inapropiado (marcar como eliminado)
// @route DELETE /admin/posts/:postId
export const deletePost = async (req, res) => {
  try {
    // Buscar el post por su ID
    const post = await Post.findById(req.params.postId);

    if (!post) {
      return res.status(404).json({ msg: 'Post no encontrado' });
    }

    // Verificar si el post ya está marcado como eliminado
    if (post.isDelete) {
      return res.status(400).json({ msg: 'El post ya ha sido eliminado' });
    }

    // Marcar el post como eliminado (soft delete)
    post.isDelete = true;
    post.updatedAt = Date.now();
    await post.save();

    /* 
    
    Aqui seria bueno que se devolviera el post que al que se le aplico la accion
    
    */
    res.json({ msg: 'Post marcado como eliminado exitosamente' });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Error en el servidor');
  }
};

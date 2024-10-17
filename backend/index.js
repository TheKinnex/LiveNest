import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import fileUpload from 'express-fileupload';
import {connectDB} from './config/config.js'; 
import authRoutes from "./routes/authRoutes.js";
import userRoutes from './routes/userRoutes.js'
import postRoutes from './routes/postRoutes.js'
import commentRoutes from './routes/commentRoutes.js'
import adminRoutes from './routes/adminRoutes.js'
import conversationRoutes from './routes/conversationRoutes.js'
import messageRoutes from './routes/messageRoutes.js'
import paymentsRoutes from './routes/paymentsRoutes.js'
import suscriptionRoutes from './routes/suscriptionRoutes.js'

dotenv.config();

// Conectar a la base de datos
connectDB();

const app = express();
/* 

Debes definir correctamente las opciones de cors para asegurar la seguridad de tu backend.

*/
app.use(cors());
app.use(express.json());
app.use(fileUpload({
    useTempFiles : true,
    tempFileDir : './uploads'
}));


app.use("/auth", authRoutes);
app.use("/profile", userRoutes);
app.use('/posts', postRoutes);
app.use('/comments', commentRoutes);
app.use('/admin', adminRoutes);
app.use('/conversations', conversationRoutes)
app.use('/messages', messageRoutes)
app.use('/payments', paymentsRoutes)
app.use('/suscription', suscriptionRoutes)

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));

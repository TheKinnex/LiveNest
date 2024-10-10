import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import {connectDB} from './config/config.js'; // Nota: Agregar extensión .js al final

dotenv.config();

// Conectar a la base de datos
connectDB();

const app = express();
app.use(cors());
app.use(express.json()); // Parseo de JSON

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));

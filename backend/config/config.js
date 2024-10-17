
import mongoose from 'mongoose';


/* 

Ya que en resto de respuestas usas Español para el idioma de respuesta del servidor
en la respuesta por consola aqui deberia tambien ser una respuesta en español

*/
export async function connectDB() 
{
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('MongoDB connected successfully');
  } catch (error) {
    console.error(`Error: ${error.message}`);
    process.exit(1);
  }
};


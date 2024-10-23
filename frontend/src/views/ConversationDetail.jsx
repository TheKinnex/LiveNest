import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom'; // Agrega useNavigate para la redirección
import io from 'socket.io-client';
import axios from 'axios';

const socket = io('http://localhost:5000');

const ConversationDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate(); // Hook para redirigir
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");

  useEffect(() => {
    // Unirse a la conversación en socket.io
    socket.emit("joinConversation", id);

    // Obtener los mensajes de la conversación desde el backend
    const fetchMessages = async () => {
      try {
        const token = localStorage.getItem('token');
        const res = await axios.get(
          `http://localhost:5000/messages/${id}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setMessages(res.data);
      } catch (error) {
        console.error("Error al cargar los mensajes:", error);
      }
    };
    fetchMessages();

    // Recibir mensajes en tiempo real
    socket.on("receiveMessage", (newMessage) => {
      setMessages((prevMessages) => [...prevMessages, newMessage]);
    });

    return () => {
      socket.off("receiveMessage");
      socket.emit("leaveConversation", id); // Dejar la conversación cuando se salga del componente
    };
  }, [id]);

  const handleSendMessage = async () => {
    try {
      const token = localStorage.getItem("token"); // Obtener el token del localStorage
      const headers = {
        headers: { Authorization: `Bearer ${token}` },
      };

      // Enviar el mensaje al backend
      await axios.post(
        `http://localhost:5000/messages/${id}/send`,
        { content: newMessage },
        headers // Agregar los headers con el token
      );

      setNewMessage(""); // Limpiar el campo de mensaje
    } catch (error) {
      console.error("Error al enviar el mensaje:", error);
    }
  };

  const handleLeaveConversation = () => {
    // Emitir evento para dejar la conversación
    socket.emit("leaveConversation", id);

    // Redirigir al usuario a la lista de conversaciones
    navigate("/conversations"); // O cualquier otra ruta a la que desees redirigir
  };

  return (
    <div>
      <h2>Conversation Detail</h2>
      <ul>
        {messages.map((message, index) => (
          <li key={index}>
            <strong>{message.sender?.username || "Anónimo"}:</strong> {message.content}{" "}
            <span>{new Date(message.createdAt).toLocaleString()}</span>
          </li>
        ))}
      </ul>
      <input
        type="text"
        placeholder="Escribe un mensaje..."
        value={newMessage}
        onChange={(e) => setNewMessage(e.target.value)}
      />
      <button onClick={handleSendMessage}>Enviar</button>
      <button onClick={handleLeaveConversation}>Salir</button> {/* Botón para salir */}
    </div>
  );
};

export default ConversationDetail;

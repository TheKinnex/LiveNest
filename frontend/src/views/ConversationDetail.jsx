import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import io from 'socket.io-client';
import axios from 'axios';

const ConversationDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");

  // Obtener el token y el userId desde localStorage o sessionStorage
  const token = localStorage.getItem("token") || sessionStorage.getItem("token");
  const userId = localStorage.getItem("userId") || sessionStorage.getItem("userId");

  useEffect(() => {
    const socket = io('https://livenest-backend.onrender.com', {
      auth: { token },
    });

    // Unirse a la conversación en socket.io
    socket.emit("joinConversation", id);

    // Obtener los mensajes de la conversación desde el backend
    const fetchMessages = async () => {
      try {
        const res = await axios.get(`https://livenest-backend.onrender.com/messages/${id}`, {
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

    // Cleanup para evitar fugas de memoria
    return () => {
      socket.off("receiveMessage");
      socket.emit("leaveConversation", id);
      socket.disconnect();
    };
  }, [id, token]);

  const handleSendMessage = async () => {
    try {
      await axios.post(
        `https://livenest-backend.onrender.com/messages/${id}/send`,
        { content: newMessage },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      setNewMessage(""); // Limpiar el campo de mensaje
    } catch (error) {
      console.error("Error al enviar el mensaje:", error);
    }
  };

  const handleLeaveConversation = () => {
    navigate("/conversations");
  };

  return (
    <div className="p-4">
      <h2 className="text-lg font-semibold">Conversation Detail</h2>
      <ul className="mt-4 space-y-2">
        {messages.map((message, index) => {
          // Verifica si el mensaje fue enviado por el usuario actual
          const isCurrentUser = String(message.sender._id) === String(userId);

          return (
            <li
              key={index}
              className={`flex ${isCurrentUser ? 'justify-end' : 'justify-start'}`} // Cambiar la alineación según el remitente
            >
              <div
                className={`p-2 rounded-lg max-w-xs ${
                  isCurrentUser ? 'bg-red-100 text-right' : 'bg-blue-100 text-left'
                }`} // Cambiar el color y la alineación según el remitente
              >
                <strong className={isCurrentUser ? "text-red-500" : "text-blue-500"}>
                  {message.sender.username}:
                </strong>
                <p>{message.content}</p>
                <span className="text-xs text-gray-500">{new Date(message.createdAt).toLocaleString()}</span>
              </div>
            </li>
          );
        })}
      </ul>
      <div className="mt-4 flex items-center">
        <input
          className="flex-grow border rounded-md px-2 py-1"
          type="text"
          placeholder="Escribe un mensaje..."
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
        />
        <button onClick={handleSendMessage} className="ml-2 bg-green-500 text-white px-4 py-1 rounded-md">Enviar</button>
        <button onClick={handleLeaveConversation} className="ml-2 bg-gray-500 text-white px-4 py-1 rounded-md">Salir</button>
      </div>
    </div>
  );
};

export default ConversationDetail;

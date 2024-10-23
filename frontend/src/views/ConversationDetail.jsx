import { useEffect, useState, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import io from 'socket.io-client';
import axios from 'axios';
import { FaSmile, FaPaperPlane } from "react-icons/fa";

const ConversationDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const [username, setUsername] = useState("");
  const messagesEndRef = useRef(null);

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

    // Obtener información de la conversación para mostrar el nombre del usuario
    const fetchConversationInfo = async () => {
      try {
        const res = await axios.get(`https://livenest-backend.onrender.com/conversations/${id}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const otherUser = res.data.users.find(user => user._id !== userId);
        setUsername(otherUser ? otherUser.username : "Usuario");

        // Verificar el estado en línea del otro usuario al cargar la conversación
        socket.emit('checkOnlineStatus', otherUser._id);
      } catch (error) {
        console.error("Error al obtener información de la conversación:", error);
      }
    };
    fetchConversationInfo();

    // Recibir mensajes en tiempo real
    socket.on("receiveMessage", (newMessage) => {
      setMessages((prevMessages) => [...prevMessages, newMessage]);
    });

    // Scroll automático hacia el último mensaje
    const scrollToBottom = () => {
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    scrollToBottom();

    // Cleanup para evitar fugas de memoria
    return () => {
      socket.off("receiveMessage");
      socket.emit("leaveConversation", id);
      socket.disconnect();
    };
  }, [id, token, userId]);

  useEffect(() => {
    // Scroll automático hacia el último mensaje cuando se actualizan los mensajes
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSendMessage = async () => {
    if (newMessage.trim() === "") return;
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
    <div className="flex flex-col h-screen">
      {/* Encabezado del chat */}
      <header className="bg-gray-800 p-4 flex items-center justify-between text-white">
        <div className="flex items-center space-x-3">
          <div className="bg-purple-600 h-10 w-10 rounded-full"></div>
          <div>
            <p className="font-semibold">{username}</p>
          </div>
        </div>
        <button onClick={handleLeaveConversation} className="text-red-500">Salir</button>
      </header>

      {/* Mensajes */}
      <div className="flex-1 p-4 space-y-4 overflow-y-auto no-scrollbar bg-gray-900">
        {messages.map((message, index) => {
          const isCurrentUser = String(message.sender._id) === String(userId);
          return (
            <div
              key={index}
              className={`flex ${isCurrentUser ? 'justify-end' : 'justify-start'}`}
            >
              <div dir={`${isCurrentUser ? 'Right-to-left ' : 'left-to-Right '}`}
                className={`p-1 max-w-xs ${isCurrentUser ? 'bg-purple-600 rounded-l-lg rounded-br-lg text-white border-white border' : 'bg-gray-700 text-white rounded-r-lg rounded-bl-lg border-white border'
                }`}
              >
                <p className="px-1 py-1 font-semibold text-base">{message.content}</p>
              </div>
            </div>
          );
        })}
        <div ref={messagesEndRef}></div>
      </div>

      {/* Input para enviar mensaje */}
      <div className="bg-gray-800 p-4 flex items-center space-x-2 sticky bottom-0">
        <FaSmile className="text-purple-500 cursor-pointer" />
        <input
          type="text"
          placeholder="Enviar mensaje..."
          className="flex-grow bg-gray-700 text-white p-2 rounded-md focus:outline-none"
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              handleSendMessage();
            }
          }}
        />
        <button onClick={handleSendMessage} className="text-purple-500">
          <FaPaperPlane />
        </button>
      </div>
    </div>
  );
};

export default ConversationDetail;

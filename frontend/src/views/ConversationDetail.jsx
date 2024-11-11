/* eslint-disable react/prop-types */
import { useEffect, useState, useRef } from 'react';
import io from 'socket.io-client';  
import axios from 'axios';
import { FaPaperPlane, FaTimes } from "react-icons/fa";
import { useNavigate } from 'react-router-dom';
import defaultIcon from '../assets/default-avatar.png'

const ConversationDetail = ({ conversationId, isDesktop, onExit }) => {
  const navigate = useNavigate();
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const [username, setUsername] = useState("");
  const [profilePicture, setProfilePicture] = useState("");
  const [isSending, setIsSending] = useState(false);
  const messagesEndRef = useRef(null);

  // Obtener el token y el userId desde localStorage o sessionStorage
  const token = localStorage.getItem("token") || sessionStorage.getItem("token");
  const userId = localStorage.getItem("userId") || sessionStorage.getItem("userId");

  useEffect(() => {
    if (!token) {
      navigate('/login'); // Redirigir a login si no hay token
      return;
    }

    const socket = io(`${import.meta.env.VITE_API_URL}`, {
      auth: { token },
    });

    // Unirse a la conversación en socket.io
    socket.emit("joinConversation", conversationId);

    // Obtener los mensajes de la conversación desde el backend
    const fetchMessages = async () => {
      try {
        const res = await axios.get(`${import.meta.env.VITE_API_URL}/messages/${conversationId}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setMessages(res.data);
      } catch (error) {
        console.error("Error al cargar los mensajes:", error);
      }
    };
    fetchMessages();

    // Obtener información de la conversación para mostrar el nombre y foto del usuario
    const fetchConversationInfo = async () => {
      try {
        const res = await axios.get(`${import.meta.env.VITE_API_URL}/conversations/${conversationId}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const otherUser = res.data.users.find(user => user._id !== userId);
        setUsername(otherUser ? otherUser.username : "Usuario");
        setProfilePicture(otherUser.profilePicture?.secure_url || defaultIcon);

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
      socket.emit("leaveConversation", conversationId);
      socket.disconnect();
    };
  }, [conversationId, navigate, token, userId]);

  useEffect(() => {
    // Scroll automático hacia el último mensaje cuando se actualizan los mensajes
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSendMessage = async () => {
    if (newMessage.trim() === "" || isSending) return; // Evitar múltiples envíos
    setIsSending(true); // Bloquear el envío
    try {
      await axios.post(
        `${import.meta.env.VITE_API_URL}/messages/${conversationId}/send`,
        { content: newMessage },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      setNewMessage(""); // Limpiar el campo de mensaje
    } catch (error) {
      console.error("Error al enviar el mensaje:", error);
    } finally {
      setIsSending(false); // Desbloquear el botón de envío
    }
  };

  const handleLeaveConversation = () => {
    if (!isDesktop) {
      onExit(); // Solo en mobile, regresa a la lista de conversaciones
    }
  };

  return (
    <div className="flex flex-col h-full">
      {/* Encabezado del chat */}
      <header className="bg-gray-800 p-4 flex items-center justify-between text-white">
        <div className="flex items-center space-x-3">
          {/* Mostrar la imagen de perfil del otro usuario */}
          <img
            src={profilePicture}
            alt={`${username}'s profile`}
            className="h-10 w-10 rounded-full object-cover"
          />
          <div>
            <p className="font-semibold">{username}</p>
          </div>
        </div>
        {/* Mostrar el botón de salir solo en mobile */}
        {!isDesktop && (
          <button onClick={handleLeaveConversation} className="text-red-500">
            <FaTimes />
          </button>
        )}
      </header>

      {/* Mensajes */}
      <div className="flex-1 p-4 mb-14 lg:mb-0 space-y-4 overflow-y-auto bg-gray-900">
        {messages.map((message, index) => {
          const isCurrentUser = String(message.sender._id) === String(userId);
          return (
            <div
              key={index}
              className={`flex ${isCurrentUser ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`p-2 max-w-xs ${
                  isCurrentUser
                    ? 'bg-purple-600 rounded-l-lg rounded-br-lg text-white border border-white'
                    : 'bg-gray-700 text-white rounded-r-lg rounded-bl-lg border border-white'
                }`}
              >
                <p className="font-semibold text-base break-words">{message.content}</p>
              </div>
            </div>
          );
        })}
        <div ref={messagesEndRef}></div>
      </div>

      {/* Input para enviar mensaje */}
      <div className="lg:bg-gray-900 bg-transparent p-4 lg:flex lg:items-center space-x-2 flex relative bottom-16 lg:bottom-0">
        <input
          type="text"
          placeholder="Enviar mensaje..."
          className="flex-grow bg-transparent border border-white text-white p-2 rounded-md focus:outline-none"
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              handleSendMessage();
            }
          }}
        />
        <button onClick={handleSendMessage} className="text-purple-500" disabled={isSending}>
          <FaPaperPlane />
        </button>
      </div>
    </div>
  );
};

export default ConversationDetail;

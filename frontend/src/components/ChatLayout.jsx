import { useState, useEffect } from 'react';
import Conversations from '../views/Conversations';
import ConversationDetail from '../views/ConversationDetail';

const ChatLayout = () => {
  const [selectedConversationId, setSelectedConversationId] = useState(null);
  const [isDesktop, setIsDesktop] = useState(window.innerWidth >= 1024);

  // Función para actualizar el estado de pantalla en tiempo real
  useEffect(() => {
    const handleResize = () => {
      setIsDesktop(window.innerWidth >= 1024);
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Función para seleccionar una conversación
  const handleSelectConversation = (conversationId) => {
    setSelectedConversationId(conversationId);
  };

  // Función para salir de una conversación (solo en móvil)
  const handleExitConversation = () => {
    setSelectedConversationId(null);
  };

  return (
    <div className="flex h-screen bg-gray-900">
      {isDesktop ? (
        <>
          {/* Lista de Conversaciones */}
          <div className="w-1/3 border-r border-gray-700 overflow-y-auto">
            <Conversations 
              onSelectConversation={handleSelectConversation} 
              selectedConversationId={selectedConversationId} 
            />
          </div>

          {/* Detalles de la Conversación */}
          <div className="w-2/3">
            {selectedConversationId ? (
              <ConversationDetail 
                conversationId={selectedConversationId} 
                isDesktop={isDesktop} 
                onExit={handleExitConversation} 
              />
            ) : (
              <div className="flex items-center justify-center h-full text-gray-500">
                Selecciona una conversación para comenzar
              </div>
            )}
          </div>
        </>
      ) : (
        <>
          {selectedConversationId ? (
            <div className="w-full">
              <ConversationDetail 
                conversationId={selectedConversationId} 
                isDesktop={isDesktop} 
                onExit={handleExitConversation} 
              />
            </div>
          ) : (
            <div className="w-full">
              <Conversations 
                onSelectConversation={handleSelectConversation} 
                selectedConversationId={selectedConversationId} 
              />
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default ChatLayout;

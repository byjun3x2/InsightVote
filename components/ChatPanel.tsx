
import React, { useState, useEffect, useRef } from 'react';
import { Agenda, User, ChatMessage } from '../utils/types';

interface Props {
  agenda: Agenda | null;
  messages: ChatMessage[];
  onSendMessage: (message: string) => void;
  isOpen: boolean;
  onClose: () => void;
  currentUser: User | null;
}

const ChatPanel: React.FC<Props> = ({ agenda, messages, onSendMessage, isOpen, onClose, currentUser }) => {
  const [newMessage, setNewMessage] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (newMessage.trim()) {
      onSendMessage(newMessage);
      setNewMessage('');
    }
  };

  const panelStyle: React.CSSProperties = {
    position: 'fixed',
    top: 0,
    right: isOpen ? 0 : '-350px', // 열려있을 때와 닫혀있을 때 위치
    width: '350px',
    height: '100%',
    backgroundColor: '#f8f9fa',
    boxShadow: '-2px 0 5px rgba(0,0,0,0.1)',
    transition: 'right 0.3s ease-in-out',
    display: 'flex',
    flexDirection: 'column',
    zIndex: 1000, // 다른 요소들 위에 오도록
  };

  const headerStyle: React.CSSProperties = {
    padding: '1rem',
    borderBottom: '1px solid #dee2e6',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
  };

  const messageListStyle: React.CSSProperties = {
    flex: 1,
    padding: '1rem',
    overflowY: 'auto',
  };

  const formStyle: React.CSSProperties = {
    padding: '1rem',
    borderTop: '1px solid #dee2e6',
  };

  const getMessageStyle = (senderId: string): React.CSSProperties => {
    const isCurrentUser = senderId === currentUser?.id;
    return {
      marginBottom: '0.75rem',
      textAlign: isCurrentUser ? 'right' : 'left',
    };
  };

  const bubbleStyle = (senderId: string): React.CSSProperties => {
    const isCurrentUser = senderId === currentUser?.id;
    return {
      display: 'inline-block',
      padding: '0.5rem 0.75rem',
      borderRadius: '15px',
      backgroundColor: isCurrentUser ? '#007bff' : '#e9ecef',
      color: isCurrentUser ? 'white' : 'black',
      maxWidth: '80%',
      textAlign: 'left',
    };
  };

  return (
    <div style={panelStyle}>
      <div style={headerStyle}>
        <h5 style={{ margin: 0 }}>{agenda?.title || '채팅'}</h5>
        <button onClick={onClose} style={{ background: 'none', border: 'none', fontSize: '1.2rem', cursor: 'pointer' }}>&times;</button>
      </div>
      <div style={messageListStyle}>
        {messages.map((msg) => (
          <div key={msg.id} style={getMessageStyle(msg.sender.id)}>
            <div style={{ fontSize: '0.8rem', color: '#6c757d', marginBottom: '0.2rem' }}>
              {msg.sender.name}
            </div>
            <div style={bubbleStyle(msg.sender.id)}>
              {msg.message}
            </div>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>
      <form style={formStyle} onSubmit={handleSendMessage}>
        <input
          type="text"
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          placeholder="메시지를 입력하세요..."
          style={{ width: '100%', padding: '0.5rem', borderRadius: '5px', border: '1px solid #ced4da' }}
        />
      </form>
    </div>
  );
};

export default ChatPanel;

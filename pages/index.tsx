import React, { useEffect, useState } from 'react';
import { io, Socket } from 'socket.io-client';

let socket: Socket;

const Home: React.FC = () => {
  const [message, setMessage] = useState('');
  const [chat, setChat] = useState<string[]>([]);

  useEffect(() => {
    socket = io('http://localhost:4000');

    socket.on('connect', () => {
      console.log('Socket.IO 연결됨:', socket.id);
    });

    socket.on('message', (msg: string) => {
      setChat((prev) => [...prev, msg]);
    });

    return () => {
      socket.disconnect();
    };
  }, []);

  const sendMessage = () => {
    if (message.trim() !== '') {
      socket.emit('message', message);
      setMessage('');
    }
  };

  return (
    <div style={{ padding: '1rem' }}>
      <h1>InsightVote Socket.IO 테스트</h1>
      <div style={{ marginBottom: '1rem' }}>
        <input
          type="text"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="메시지 입력"
        />
        <button onClick={sendMessage}>전송</button>
      </div>
      <div>
        <h3>채팅 로그</h3>
        <ul>
          {chat.map((msg, idx) => (
            <li key={idx}>{msg}</li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default Home;

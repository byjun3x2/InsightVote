import React, { useEffect, useState } from 'react';
import { io, Socket } from 'socket.io-client';

let socket: Socket;

const Home: React.FC = () => {
  const [vote, setVote] = useState('');
  const [results, setResults] = useState<any[]>([]);

  useEffect(() => {
    socket = io('http://localhost:4000');

    socket.on('connect', () => {
      console.log('서버 연결됨:', socket.id);
    });

    socket.on('voteUpdate', (updatedVoteData) => {
      setResults((prev) => [...prev, updatedVoteData]);
    });

    return () => {
      socket.disconnect();
    };
  }, []);

  const submitVote = () => {
    if (vote.trim()) {
      socket.emit('voteSubmit', { choice: vote, timestamp: Date.now() });
      setVote('');
    }
  };

  return (
    <div style={{ padding: '1rem' }}>
      <h1>투표 제출 및 실시간 업데이트 로직 구현</h1>
      <input
        type="text"
        value={vote}
        onChange={(e) => setVote(e.target.value)}
        placeholder="투표 선택 입력"
      />
      <button onClick={submitVote}>투표 제출</button>
      <div>
        <h3>실시간 투표 결과</h3>
        <ul>
          {results.map((res, idx) => (
            <li key={idx}>
              선택: {res.choice} - 시간: {new Date(res.timestamp).toLocaleTimeString()}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default Home;

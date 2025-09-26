import React, { useEffect, useRef, useState } from 'react';
import { io, Socket } from 'socket.io-client';
import { Agenda, VoteResult } from '../utils/types';
import AgendaList from '../components/AgendaList';
import ResultChart from '../components/ResultChart';

const Home: React.FC = () => {
  const [agendas, setAgendas] = useState<Agenda[]>([]);
  const [selectedAgendaId, setSelectedAgendaId] = useState<string>('');
  const [selectedOptionId, setSelectedOptionId] = useState<string>('');
  const [results, setResults] = useState<VoteResult[]>([]);
  const socketRef = useRef<Socket | null>(null);

  useEffect(() => {
    fetch('http://localhost:4000/api/agendas')
      .then((res) => res.json())
      .then((data) => setAgendas(data))
      .catch(console.error);
  }, []);

  useEffect(() => {
    socketRef.current = io('http://localhost:4000');

    socketRef.current.on('connect', () => {
      console.log('서버에 연결됨:', socketRef.current?.id);
    });

    socketRef.current.on('voteUpdate', (voteData) => {
      setResults((prev) => [...prev, voteData]);
    });

    return () => {
      socketRef.current?.disconnect();
    };
  }, []);

  const submitVote = () => {
    if (selectedOptionId && selectedAgendaId && socketRef.current) {
      socketRef.current.emit('voteSubmit', {
        agendaId: selectedAgendaId,
        optionId: selectedOptionId,
        timestamp: Date.now(),
      });

      setSelectedOptionId('');
      setSelectedAgendaId('');
    }
  };

  return (
    <div style={{ padding: '1rem' }}>
      <h1>InsightVote - 실시간 투표</h1>

      <AgendaList
        agendas={agendas}
        selectedAgendaId={selectedAgendaId}
        onSelectAgenda={setSelectedAgendaId}
        selectedOptionId={selectedOptionId}
        onSelectOption={setSelectedOptionId}
      />

      <button onClick={submitVote} disabled={!selectedOptionId}>
        투표 제출
      </button>

      <ResultChart results={results} />
    </div>
  );
};

export default Home;

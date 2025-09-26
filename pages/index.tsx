import React, { useEffect, useRef, useState } from 'react';
import { io, Socket } from 'socket.io-client';
import { Agenda, VoteResult } from '../utils/types';
import AgendaList from '../components/AgendaList';
import ResultChart from '../components/ResultChart';
import CreateAgendaForm from '../components/CreateAgendaForm';

const Home: React.FC = () => {
  const [agendas, setAgendas] = useState<Agenda[]>([]);
  const [selectedAgendaId, setSelectedAgendaId] = useState<string>('');
  const [selectedOptionId, setSelectedOptionId] = useState<string>('');
  const [results, setResults] = useState<VoteResult[]>([]);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const socketRef = useRef<Socket | null>(null);

  const fetchAgendas = () => {
    fetch('http://localhost:4000/api/agendas')
      .then((res) => res.json())
      .then((data) => setAgendas(data))
      .catch(console.error);
  };

  useEffect(() => {
    fetchAgendas();
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

  const handleSelectAgenda = (id: string) => {
    setSelectedAgendaId(id);
    setSelectedOptionId(''); // 안건 변경 시 선택된 옵션 초기화
  };

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

  const handleCloseAgenda = async (id: string) => {
    try {
      const response = await fetch(`http://localhost:4000/api/agendas/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ isActive: false }),
      });

      if (response.ok) {
        fetchAgendas(); // 목록 새로고침
        setSelectedAgendaId(''); // 선택 해제
      }
    } catch (e) {
      console.error('Error closing agenda:', e);
    }
  };

  const handleCreateAgenda = async (data: { title: string; options: { text: string }[] }) => {
    try {
      const response = await fetch('http://localhost:4000/api/agendas', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      if (response.ok) {
        fetchAgendas(); // 목록 새로고침
        setShowCreateForm(false); // 폼 닫기
      }
    } catch (e) {
      console.error('Error creating agenda:', e);
    }
  };

  const handleDeleteAgenda = async (id: string) => {
    if (window.confirm('정말로 이 안건을 삭제하시겠습니까?')) {
      try {
        const response = await fetch(`http://localhost:4000/api/agendas/${id}`, {
          method: 'DELETE',
        });

        if (response.ok) {
          fetchAgendas(); // 목록 새로고침
        }
      } catch (e) {
        console.error('Error deleting agenda:', e);
      }
    }
  };

  return (
    <div style={{ padding: '1rem' }}>
      <h1>InsightVote - 실시간 투표</h1>

      {!showCreateForm ? (
        <button onClick={() => setShowCreateForm(true)} style={{ marginBottom: '1rem' }}>
          새 안건 만들기
        </button>
      ) : (
        <CreateAgendaForm
          onSubmit={handleCreateAgenda}
          onCancel={() => setShowCreateForm(false)}
        />
      )}

      <AgendaList
        agendas={agendas}
        selectedAgendaId={selectedAgendaId}
        onSelectAgenda={handleSelectAgenda}
        selectedOptionId={selectedOptionId}
        onSelectOption={setSelectedOptionId}
        onCloseAgenda={handleCloseAgenda}
        onDeleteAgenda={handleDeleteAgenda}
      />

      <button onClick={submitVote} disabled={!selectedOptionId}>
        투표 제출
      </button>

      <ResultChart results={results} agendas={agendas} />
    </div>
  );
};

export default Home;

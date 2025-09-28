import React, { useEffect, useRef, useState } from 'react';
import { io, Socket } from 'socket.io-client';
import { Agenda, VoteResult } from '../utils/types';
import AgendaList from '../components/AgendaList';
import ResultChart from '../components/ResultChart';
import CreateAgendaForm from '../components/CreateAgendaForm';

import { useAuth } from '../context/AuthContext';
import { useRouter } from 'next/router';
import Header from '../components/Header';

const Home: React.FC = () => {
  const [agendas, setAgendas] = useState<Agenda[]>([]);
  const [selectedAgendaId, setSelectedAgendaId] = useState<string>('');
  const [selectedOptionId, setSelectedOptionId] = useState<string>('');
  const [results, setResults] = useState<VoteResult[]>([]);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [allUsers, setAllUsers] = useState<User[]>([]);
  const socketRef = useRef<Socket | null>(null);
  const { isAuthenticated, token, user, loading } = useAuth();
  const router = useRouter();

  // 페이지 접근 제어
  useEffect(() => {
    if (loading === false && isAuthenticated === false) {
      router.push('/login');
    }
  }, [isAuthenticated, loading, router]);

  const fetchAgendas = () => {
    fetch('http://localhost:4000/api/agendas', {
      headers: {
        // API 요청 시 인증 토큰 추가
        'Authorization': `Bearer ${token}`,
      },
    })
      .then((res) => res.json())
      .then((data) => setAgendas(data))
      .catch(console.error);
  };

  const fetchUsers = () => {
    fetch('http://localhost:4000/api/users', {
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    })
      .then((res) => res.json())
      .then((data) => setAllUsers(data))
      .catch(console.error);
  };

  const fetchResults = () => {
    fetch('http://localhost:4000/api/votes', {
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    })
      .then((res) => res.json())
      .then((data) => setResults(data))
      .catch(console.error);
  };

  useEffect(() => {
    if (isAuthenticated) {
      fetchAgendas();
      fetchUsers();
      fetchResults();
    }
  }, [isAuthenticated, token]); // isAuthenticated와 token이 준비되면 fetch 실행

  useEffect(() => {
    if (!isAuthenticated || !token) return;

    // 이전 소켓 연결이 있다면 해제
    if (socketRef.current) {
      socketRef.current.disconnect();
    }

    // 인증 토큰과 함께 새 소켓 연결
    socketRef.current = io('http://localhost:4000', {
      auth: {
        token,
      },
    });

    socketRef.current.on('connect', () => {
      console.log('서버에 연결됨:', socketRef.current?.id);
    });

    socketRef.current.on('voteUpdate', (voteData) => {
      // 실시간 결과 목록에 추가
      setResults((prev) => [...prev, voteData]);

      // 버그 수정을 위해 안건 목록 전체를 다시 불러옵니다.
      fetchAgendas();
    });

    // 컴포넌트 언마운트 시 소켓 연결 해제
    return () => {
      socketRef.current?.disconnect();
    };
  }, [isAuthenticated, token]); // isAuthenticated와 token이 변경될 때마다 소켓 재연결

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
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ isActive: false }),
      });

      if (response.ok) {
        fetchAgendas(); // 목록 새로고침
      }
    } catch (e) {
      console.error('Error closing agenda:', e);
    }
  };

  const handleCreateAgenda = async (data: { title: string; options: { text: string }[]; startTime?: string; deadline?: string; voteLimit?: number }) => {
    try {
      const response = await fetch('http://localhost:4000/api/agendas', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
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
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        });

        if (response.ok) {
          fetchAgendas(); // 목록 새로고침
        }
      } catch (e) {
        console.error('Error deleting agenda:', e);
      }
    }
  };

  // 인증 상태 확인 전에는 렌더링하지 않음 (또는 로딩 스피너 표시)
  if (loading || !isAuthenticated) {
    return <div>Loading...</div>;
  }

  return (
    <div>
      <Header />
      <div style={{ padding: '1rem' }}>
        {!showCreateForm ? (
          <button onClick={() => setShowCreateForm(true)} style={{ marginBottom: '1rem' }}>
            새 안건 만들기
          </button>
        ) : (
                  <CreateAgendaForm
                    onSubmit={handleCreateAgenda}
                    onCancel={() => setShowCreateForm(false)}
                  />        )}

        <AgendaList
          agendas={agendas}
          selectedAgendaId={selectedAgendaId}
          onSelectAgenda={handleSelectAgenda}
          selectedOptionId={selectedOptionId}
          onSelectOption={setSelectedOptionId}
          onCloseAgenda={handleCloseAgenda}
          onDeleteAgenda={handleDeleteAgenda}
          onTimerComplete={handleCloseAgenda}
          currentUserId={isAuthenticated ? user?.userId : ''}
          results={results}
          allUsers={allUsers}
        />

        <button onClick={submitVote} disabled={!selectedOptionId}>
          투표 제출
        </button>

        <ResultChart results={results} agendas={agendas} allUsers={allUsers} />
      </div>
    </div>
  );
};

export default Home;

import React, { useEffect, useRef, useState } from 'react';
import { io, Socket } from 'socket.io-client';
import { Agenda, VoteResult, User, ChatMessage } from '../utils/types';
import AgendaList from '../components/AgendaList';
import ResultChart from '../components/ResultChart';
import CreateAgendaForm from '../components/CreateAgendaForm';
import ChatPanel from '../components/ChatPanel';
import { useAuth } from '../context/AuthContext';
import { useRouter } from 'next/router';
import Header from '../components/Header';

import { useAgendaStore } from '../store/useAgendaStore';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL;

const Home: React.FC = () => {
  const [agendas, setAgendas] = useState<Agenda[]>([]);
  const [selectedAgendaId, setSelectedAgendaId] = useState<string>('');
  const [selectedOptionId, setSelectedOptionId] = useState<string>('');
  const [allVotes, setAllVotes] = useState<VoteResult[]>([]);
  const [liveVotes, setLiveVotes] = useState<VoteResult[]>([]);
  const { isCreateAgendaFormVisible, showCreateAgendaForm, hideCreateAgendaForm } = useAgendaStore();
  const [allUsers, setAllUsers] = useState<User[]>([]);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [filterTag, setFilterTag] = useState<string | null>(null); // 필터 태그 상태 추가
  const socketRef = useRef<Socket | null>(null);
  const { isAuthenticated, token, user, loading } = useAuth();
  const router = useRouter();
  const previousAgendaIdRef = useRef<string | undefined>(undefined);

  // 페이지 접근 제어
  useEffect(() => {
    if (loading === false && isAuthenticated === false) {
      router.push('/login');
    }
  }, [isAuthenticated, loading, router]);

  const fetchAgendas = () => {
    let url = `${API_BASE_URL}/api/agendas`;
    if (filterTag) {
      url += `?tag=${filterTag}`;
    }
    fetch(url, {
      headers: { 'Authorization': `Bearer ${token}` },
    })
      .then((res) => res.json())
      .then((data) => setAgendas(data))
      .catch(console.error);
  };

  const fetchUsers = () => {
    fetch(`${API_BASE_URL}/api/users`, {
      headers: { 'Authorization': `Bearer ${token}` },
    })
      .then((res) => res.json())
      .then((data) => setAllUsers(data))
      .catch(console.error);
  };

  const fetchResults = () => {
    fetch(`${API_BASE_URL}/api/votes`, {
      headers: { 'Authorization': `Bearer ${token}` },
    })
      .then((res) => res.json())
      .then((data) => setAllVotes(data))
      .catch(console.error);
  };

  useEffect(() => {
    if (isAuthenticated) {
      fetchAgendas();
    }
  }, [isAuthenticated, token, filterTag]); // filterTag가 변경될 때마다 안건을 다시 불러옴

  useEffect(() => {
    if (isAuthenticated) {
      fetchUsers();
      fetchResults();
    }
  }, [isAuthenticated, token]);


  useEffect(() => {
    if (!isAuthenticated || !token) return;

    if (socketRef.current) {
      socketRef.current.disconnect();
    }

    socketRef.current = io(API_BASE_URL, { auth: { token } });

    socketRef.current.on('connect', () => {
      console.log('서버에 연결됨:', socketRef.current?.id);
    });

    socketRef.current.on('voteUpdate', (voteData: VoteResult) => {
      const updateUserVote = (votes: VoteResult[]) => {
        const existingVoteIndex = votes.findIndex(
          (vote) => vote.agendaId === voteData.agendaId && vote.userId === voteData.userId
        );

        if (existingVoteIndex !== -1) {
          // 기존 투표가 있으면 업데이트
          const newVotes = [...votes];
          newVotes[existingVoteIndex] = voteData;
          return newVotes;
        } else {
          // 기존 투표가 없으면 추가
          return [...votes, voteData];
        }
      };

      setLiveVotes(updateUserVote);
      setAllVotes(updateUserVote);
      fetchAgendas();
    });

    socketRef.current.on('chatMessage', (message: ChatMessage) => {
      setMessages((prevMessages) => [...prevMessages, message]);
    });

    return () => {
      socketRef.current?.disconnect();
    };
  }, [isAuthenticated, token]);

  const handleSelectAgenda = (id: string) => {
    const newSelectedId = selectedAgendaId === id ? '' : id;
    setSelectedAgendaId(newSelectedId);
    setSelectedOptionId('');
  };

  useEffect(() => {
    const currentAgendaId = selectedAgendaId;
    const previousAgendaId = previousAgendaIdRef.current;

    if (socketRef.current) {
      if (previousAgendaId) {
        socketRef.current.emit('leaveRoom', previousAgendaId);
      }
      if (currentAgendaId) {
        socketRef.current.emit('joinRoom', currentAgendaId);
      }
    }

    setMessages([]); // 안건 변경 시 메시지 초기화
    previousAgendaIdRef.current = currentAgendaId;
  }, [selectedAgendaId]);

  const handleSendMessage = (message: string) => {
    if (socketRef.current && selectedAgendaId && user) {
      // Optimistic update: UI에 메시지를 즉시 추가
      const optimisticMessage: ChatMessage = {
        id: new Date().toISOString(), // 임시 ID
        message,
        sender: {
          id: user.id,
          name: user.name,
        },
        timestamp: new Date(),
      };
      setMessages((prevMessages) => [...prevMessages, optimisticMessage]);

      // 서버로 메시지 전송
      socketRef.current.emit('chatMessage', { agendaId: selectedAgendaId, message });
    }
  };

  const handleTagClick = (tag: string) => {
    setFilterTag(tag);
  };

  const clearFilter = () => {
    setFilterTag(null);
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
      const response = await fetch(`${API_BASE_URL}/api/agendas/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({ isActive: false }),
      });
      if (response.ok) fetchAgendas();
    } catch (e) {
      console.error('Error closing agenda:', e);
    }
  };

  const handleCreateAgenda = async (data: { title: string; options: { text: string }[]; tags?: string[]; startTime?: string; deadline?: string; voteLimit?: number }) => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/agendas`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify(data),
      });
      if (response.ok) {
        fetchAgendas();
        hideCreateAgendaForm();
      }
    } catch (e) {
      console.error('Error creating agenda:', e);
    }
  };

  const handleDeleteAgenda = async (id: string) => {
    if (window.confirm('정말로 이 안건을 삭제하시겠습니까?')) {
      try {
        const response = await fetch(`${API_BASE_URL}/api/agendas/${id}`, {
          method: 'DELETE',
          headers: { 'Authorization': `Bearer ${token}` },
        });
        if (response.ok) fetchAgendas();
      } catch (e) {
        console.error('Error deleting agenda:', e);
      }
    }
  };

  if (loading || !isAuthenticated) {
    return <div>Loading...</div>;
  }

  const selectedAgenda = agendas.find(a => a.id === selectedAgendaId) || null;

  return (
    <div>
      <Header />
      <div style={{ display: 'flex' }}>
        <div style={{ flex: 1, padding: '1rem', transition: 'margin-right 0.3s ease-in-out', marginRight: selectedAgendaId ? '350px' : '0' }}>
          {!isCreateAgendaFormVisible ? (
            <button onClick={showCreateAgendaForm} style={{ marginBottom: '1rem' }}>
              새 안건 만들기
            </button>
          ) : (
            <CreateAgendaForm
              onSubmit={handleCreateAgenda}
            />
          )}

          {filterTag && (
            <div style={{ marginBottom: '1rem' }}>
              <span style={{ fontWeight: 'bold' }}>Filtering by: #{filterTag}</span>
              <button onClick={clearFilter} style={{ marginLeft: '1rem', cursor: 'pointer' }}>
                Clear Filter
              </button>
            </div>
          )}

          <AgendaList
            agendas={agendas}
            selectedAgendaId={selectedAgendaId}
            onSelectAgenda={handleSelectAgenda}
            onTagClick={handleTagClick}
            selectedOptionId={selectedOptionId}
            onSelectOption={setSelectedOptionId}
            onSubmitVote={submitVote}
            onCloseAgenda={handleCloseAgenda}
            onDeleteAgenda={handleDeleteAgenda}
            onTimerComplete={handleCloseAgenda}
            currentUserId={user?.id || ''}
            results={allVotes}
            allUsers={allUsers}
          />
          <ResultChart
            key={JSON.stringify(liveVotes)}
            results={liveVotes}
            agendas={agendas}
            allUsers={allUsers}
          />
        </div>
        <ChatPanel
          agenda={selectedAgenda}
          messages={messages}
          onSendMessage={handleSendMessage}
          isOpen={!!selectedAgendaId}
          onClose={() => setSelectedAgendaId('')}
          currentUser={user}
        />
      </div>
    </div>
  );
};

export default Home;

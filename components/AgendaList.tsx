import React from 'react';
import { Agenda, Option, VoteResult } from '../utils/types';
import VoteOption from './VoteOption';
import AgendaCard from './AgendaCard';
import VoteSummaryChart from './VoteSummaryChart';

interface Props {
  agendas: Agenda[];
  selectedAgendaId: string;
  onSelectAgenda: (id: string) => void;
  selectedOptionId: string;
  onSelectOption: (id: string) => void;
  onCloseAgenda: (id: string) => void;
  onDeleteAgenda: (id: string) => void;
  currentUserId: string;
  onTimerComplete: (id: string) => void;
  results: VoteResult[];
  allUsers: User[];
}

const AgendaList: React.FC<Props> = ({
                                       agendas,
                                       selectedAgendaId,
                                       onSelectAgenda,
                                       selectedOptionId,
                                       onSelectOption,
                                       onCloseAgenda,
                                       onDeleteAgenda,
                                       currentUserId,
                                       onTimerComplete,
                                       results,
                                       allUsers,
                                     }) => {
  const selectedAgenda = agendas.find((a) => a.id === selectedAgendaId);

  const closeButtonStyle: React.CSSProperties = {
    backgroundColor: '#dc3545',
    color: 'white',
    border: 'none',
    padding: '0.5rem 1rem',
    borderRadius: '5px',
    cursor: 'pointer',
    marginLeft: '1rem',
  };

  const renderSelectedAgendaContent = () => {
    if (!selectedAgenda) return null;

    if (selectedAgenda.isActive) {
      return (
        <>
          {selectedAgenda.options.map((option: Option) => (
            <VoteOption
              key={option.id}
              optionId={option.id}
              optionText={option.text}
              selected={selectedOptionId === option.id}
              onChange={onSelectOption}
            />
          ))}
        </>
      );
    } else {
      // 마감된 안건의 경우, 결과 차트 표시
      const agendaVotes = results.filter(r => r.agendaId === selectedAgenda.id);
      const voteData = agendaVotes.reduce((acc, vote) => {
        acc[vote.optionId] = (acc[vote.optionId] || 0) + 1;
        return acc;
      }, {} as { [optionId: string]: number });

      return (
        <VoteSummaryChart 
          options={selectedAgenda.options} 
          voteData={voteData} 
          totalVotes={agendaVotes.length} 
        />
      );
    }
  };

  return (
    <div>
      <h2>투표할 안건 선택:</h2>
      <div>
        {agendas.map((agenda) => (
          <AgendaCard
            key={agenda.id}
            agenda={agenda}
            isSelected={agenda.id === selectedAgendaId}
            onSelect={onSelectAgenda}
            onDelete={onDeleteAgenda}
            currentUserId={currentUserId}
            onTimerComplete={onTimerComplete}
            allUsers={allUsers}
          />
        ))}
      </div>

      {selectedAgenda && (
        <div style={{ marginTop: '2rem' }}>
          <div style={{ display: 'flex', alignItems: 'center' }}>
            <h2>{selectedAgenda.title}: {selectedAgenda.isActive ? '선택지' : '결과'}</h2>
            {selectedAgenda.isActive && selectedAgenda.creatorId === currentUserId && (
              <button style={closeButtonStyle} onClick={() => onCloseAgenda(selectedAgenda.id)}>
                투표 마감
              </button>
            )}
          </div>
          {renderSelectedAgendaContent()}
        </div>
      )}
    </div>
  );
};

export default AgendaList;

import React from 'react';
import { Agenda, VoteResult, User } from '../utils/types';
import AgendaCard from './AgendaCard';

interface Props {
  agendas: Agenda[];
  selectedAgendaId: string;
  onSelectAgenda: (id: string) => void;
  selectedOptionId: string;
  onSelectOption: (id: string) => void;
  onSubmitVote: () => void;
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
  onSubmitVote,
  onCloseAgenda,
  onDeleteAgenda,
  currentUserId,
  onTimerComplete,
  results,
  allUsers,
}) => {
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
            onTimerComplete={onCloseAgenda} // 타이머 완료 시 마감 처리
            allUsers={allUsers}
            selectedOptionId={selectedOptionId}
            onSelectOption={onSelectOption}
            onSubmitVote={onSubmitVote}
            results={results} // 결과 계산을 위해 전달
          />
        ))}
      </div>
    </div>
  );
};

export default AgendaList;

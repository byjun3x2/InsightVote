import React from 'react';
import { Agenda, Option } from '../utils/types';
import VoteOption from './VoteOption';

interface Props {
  agendas: Agenda[];
  selectedAgendaId: string;
  onSelectAgenda: (id: string) => void;
  selectedOptionId: string;
  onSelectOption: (id: string) => void;
}

const AgendaList: React.FC<Props> = ({
                                       agendas,
                                       selectedAgendaId,
                                       onSelectAgenda,
                                       selectedOptionId,
                                       onSelectOption,
                                     }) => {
  return (
    <div>
      <label>투표할 안건 선택:</label>
      <select value={selectedAgendaId} onChange={(e) => onSelectAgenda(e.target.value)}>
        <option value="">선택하세요</option>
        {agendas.map((agenda) => (
          <option key={agenda.id} value={agenda.id}>
            {agenda.title}
          </option>
        ))}
      </select>

      {selectedAgendaId && (
        <div>
          <h2>선택지</h2>
          {agendas
            .find((a) => a.id === selectedAgendaId)
            ?.options.map((option: Option) => (
              <VoteOption
                key={option.id}
                optionId={option.id}
                optionText={option.text}
                selected={selectedOptionId === option.id}
                onChange={onSelectOption}
              />
            ))}
        </div>
      )}
    </div>
  );
};

export default AgendaList;

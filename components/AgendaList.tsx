import React from 'react';
import { Agenda, Option } from '../utils/types';
import VoteOption from './VoteOption';
import AgendaCard from './AgendaCard';

interface Props {
  agendas: Agenda[];
  selectedAgendaId: string;
  onSelectAgenda: (id: string) => void;
  selectedOptionId: string;
  onSelectOption: (id: string) => void;
  onCloseAgenda: (id: string) => void;
  onDeleteAgenda: (id: string) => void;
}

const AgendaList: React.FC<Props> = ({
                                       agendas,
                                       selectedAgendaId,
                                       onSelectAgenda,
                                       selectedOptionId,
                                       onSelectOption,
                                       onCloseAgenda,
                                       onDeleteAgenda,
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
          />
        ))}
      </div>

      {selectedAgenda && (
        <div style={{ marginTop: '2rem' }}>
          <div style={{ display: 'flex', alignItems: 'center' }}>
            <h2>{selectedAgenda.title}: 선택지</h2>
            {selectedAgenda.isActive && (
              <button style={closeButtonStyle} onClick={() => onCloseAgenda(selectedAgenda.id)}>
                투표 마감
              </button>
            )}
          </div>
          {selectedAgenda.options.map((option: Option) => (
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

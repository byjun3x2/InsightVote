import React from 'react';
import { Agenda } from '../utils/types';

interface Props {
  agenda: Agenda;
  isSelected: boolean;
  onSelect: (id: string) => void;
}

const AgendaCard: React.FC<Props> = ({ agenda, isSelected, onSelect }) => {
  const cardStyle: React.CSSProperties = {
    padding: '1rem',
    border: isSelected ? '2px solid dodgerblue' : '1px solid #ccc',
    borderRadius: '8px',
    marginBottom: '1rem',
    cursor: 'pointer',
    transition: 'border-color 0.2s',
  };

  return (
    <div style={cardStyle} onClick={() => onSelect(agenda.id)}>
      <h3>{agenda.title}</h3>
    </div>
  );
};

export default AgendaCard;

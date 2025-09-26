import React from 'react';
import { Agenda } from '../utils/types';

interface Props {
  agenda: Agenda;
  isSelected: boolean;
  onSelect: (id: string) => void;
  onDelete: (id: string) => void;
}

const AgendaCard: React.FC<Props> = ({ agenda, isSelected, onSelect, onDelete }) => {
  const cardStyle: React.CSSProperties = {
    position: 'relative',
    padding: '1rem',
    border: isSelected ? '2px solid dodgerblue' : '1px solid #ccc',
    borderRadius: '8px',
    marginBottom: '1rem',
    cursor: agenda.isActive ? 'pointer' : 'not-allowed',
    opacity: agenda.isActive ? 1 : 0.5,
    transition: 'border-color 0.2s, opacity 0.2s',
  };

  const statusBadgeStyle: React.CSSProperties = {
    position: 'absolute',
    top: '1rem',
    right: '1rem',
    padding: '0.25rem 0.5rem',
    borderRadius: '12px',
    fontSize: '0.75rem',
    color: 'white',
    backgroundColor: agenda.isActive ? '#28a745' : '#6c757d',
  };

  const deleteButtonStyle: React.CSSProperties = {
    position: 'absolute',
    bottom: '1rem',
    right: '1rem',
    backgroundColor: 'transparent',
    color: '#dc3545',
    border: '1px solid #dc3545',
    padding: '0.25rem 0.5rem',
    borderRadius: '5px',
    cursor: 'pointer',
    fontSize: '0.75rem',
  };

  const handleSelect = () => {
    if (agenda.isActive) {
      onSelect(agenda.id);
    }
  };

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation(); // 카드의 onSelect가 실행되는 것을 방지
    onDelete(agenda.id);
  };

  return (
    <div style={cardStyle} onClick={handleSelect}>
      <span style={statusBadgeStyle}>{agenda.isActive ? '진행중' : '마감'}</span>
      <h3>{agenda.title}</h3>
      <button style={deleteButtonStyle} onClick={handleDelete}>
        삭제
      </button>
    </div>
  );
};

export default AgendaCard;

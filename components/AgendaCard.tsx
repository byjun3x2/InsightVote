import React from 'react';
import { Agenda, User } from '../utils/types';
import Timer from './Timer';


interface Props {
  agenda: Agenda;
  isSelected: boolean;
  onSelect: (id: string) => void;
  onDelete: (id: string) => void;
  currentUserId: string;
  onTimerComplete: (id: string) => void;
  allUsers: User[];
}

const AgendaCard: React.FC<Props> = ({ agenda, isSelected, onSelect, onDelete, currentUserId, onTimerComplete, allUsers }) => {
  const cardStyle: React.CSSProperties = {
    position: 'relative',
    padding: '1rem',
    border: isSelected ? '2px solid dodgerblue' : '1px solid #ccc',
    borderRadius: '8px',
    marginBottom: '1rem',
    cursor: agenda.isActive ? 'pointer' : 'not-allowed',
    opacity: agenda.isActive ? 1 : 0.5,
    transition: 'border-color 0.2s, opacity 0.2s',
    minHeight: '160px', // 우측 컨트롤 UI를 모두 담을 수 있는 최소 높이
  };

  const rightControlsStyle: React.CSSProperties = {
    position: 'absolute',
    top: '1rem',
    right: '1rem',
    bottom: '1rem',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'space-between',
    alignItems: 'center',
  };

  const statusBadgeStyle: React.CSSProperties = {
    padding: '0.25rem 0.5rem',
    borderRadius: '12px',
    fontSize: '0.75rem',
    color: 'white',
    backgroundColor: agenda.isActive ? '#28a745' : '#6c757d',
  };

  const deleteButtonStyle: React.CSSProperties = {
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

  const creator = allUsers.find(u => u.id === agenda.creatorId);

  return (
    <div style={cardStyle} onClick={handleSelect}>
      <div style={{ paddingRight: '100px' }}> {/* 컨트롤 UI 공간 확보 */}
        <h3>{agenda.title}</h3>
        <div style={{ fontSize: '0.9rem', color: '#555', marginTop: '0.5rem' }}>
          <p style={{ margin: 0, fontWeight: 'bold' }}>
            제안자: {creator?.name || '(알 수 없음)'}
          </p>
          {(agenda.voteLimit && agenda.voteLimit > 0) ? (
            <p style={{ margin: '0.5rem 0 0 0' }}>
              투표 현황: {agenda.voteCount}명 / {agenda.voteLimit}명
            </p>
          ) : (
            <p style={{ margin: '0.5rem 0 0 0' }}>
              총 투표: {agenda.voteCount}명
            </p>
          )}
          {agenda.startTime && (
            <p style={{ margin: '0.25rem 0 0 0' }}>
              시작: {new Date(agenda.startTime).toLocaleString('ko-KR')}
            </p>
          )}
          {agenda.deadline && (
            <p style={{ margin: '0.25rem 0 0 0' }}>
              마감: {new Date(agenda.deadline).toLocaleString('ko-KR')}
            </p>
          )}
        </div>
      </div>

      <div style={rightControlsStyle}>
        <span style={statusBadgeStyle}>{agenda.isActive ? '진행중' : '마감'}</span>
        
        {agenda.isActive && agenda.startTime && agenda.deadline && (
          <Timer 
            startTime={agenda.startTime} 
            deadline={agenda.deadline} 
            onComplete={() => onTimerComplete && onTimerComplete(agenda.id)}
          />
        )}
        
        {currentUserId === agenda.creatorId ? (
          <button style={deleteButtonStyle} onClick={handleDelete}>
            삭제
          </button>
        ) : (
          <div></div> // 삭제 버튼 공간을 차지하기 위한 빈 div
        )}
      </div>
    </div>
  );
};

export default AgendaCard;

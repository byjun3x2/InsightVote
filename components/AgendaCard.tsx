import React from 'react';
import { Agenda, Option, User, VoteResult } from '../utils/types';
import Timer from './Timer';
import VoteSummaryChart from './VoteSummaryChart';

interface Props {
  agenda: Agenda;
  isSelected: boolean;
  onSelect: (id: string) => void;
  onDelete: (id: string) => void;
  onTagClick: (tag: string) => void;
  currentUserId: string;
  onTimerComplete: (id: string) => void;
  allUsers: User[];
  selectedOptionId: string;
  onSelectOption: (id:string) => void;
  onSubmitVote: () => void;
  results: VoteResult[];
}

const AgendaCard: React.FC<Props> = ({
  agenda,
  isSelected,
  onSelect,
  onDelete,
  onTagClick,
  currentUserId,
  onTimerComplete,
  allUsers,
  selectedOptionId,
  onSelectOption,
  onSubmitVote,
  results,
}) => {
  const cardStyle: React.CSSProperties = {
    position: 'relative',
    padding: '1rem',
    border: isSelected ? '2px solid dodgerblue' : '1px solid #ccc',
    borderRadius: '8px',
    marginBottom: '1rem',
    cursor: 'pointer',
    opacity: agenda.isActive ? 1 : 0.7,
    transition: 'border-color 0.2s, opacity 0.2s',
    backgroundColor: isSelected ? '#f8f9fa' : 'white',
    minHeight: '200px',
  };

  const globalControlsContainer: React.CSSProperties = {
    position: 'absolute',
    top: '1rem',
    right: '0.1rem',
    width: '150px',
    height: 'calc(100% - 2rem)',
  };

  const actionControlsStyle: React.CSSProperties = {
    position: 'absolute',
    right:5,
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '9rem',
  };

  const timerContainerStyle: React.CSSProperties = {
    position: 'absolute',
    right: 10,
    top: 40
  };

  const statusBadgeStyle: React.CSSProperties = {
    padding: '0.25rem 0.4rem',
    borderRadius: '12px',
    fontSize: '0.75rem',
    color: 'white',
    backgroundColor: agenda.isActive ? '#28a745' : '#6c757d',
    textAlign: 'center',
    boxSizing: 'border-box',
  };

  const deleteButtonStyle: React.CSSProperties = {
    backgroundColor: 'transparent',
    color: '#dc3545',
    border: '1px solid #dc3545',
    padding: '0.25rem 0.5rem',
    borderRadius: '5px',
    cursor: 'pointer',
    fontSize: '0.75rem',
    boxSizing: 'border-box',
  };

  const tagStyle: React.CSSProperties = {
    display: 'inline-block',
    padding: '0.2rem 0.5rem',
    backgroundColor: '#e9ecef',
    color: '#495057',
    borderRadius: '12px',
    fontSize: '0.75rem',
    marginRight: '0.4rem',
    marginTop: '0.5rem',
    cursor: 'pointer',
  };

  const handleSelect = () => {
    onSelect(agenda.id);
  };

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    onDelete(agenda.id);
  };

  const handleTagClick = (e: React.MouseEvent, tag: string) => {
    e.stopPropagation();
    onTagClick(tag);
  };

  const creator = allUsers.find(u => u.id === agenda.creatorId);

  const renderVoteSummary = () => {
    const agendaVotes = results.filter(r => r.agendaId === agenda.id);
    const voteData = agendaVotes.reduce((acc, vote) => {
      acc[vote.optionId] = (acc[vote.optionId] || 0) + 1;
      return acc;
    }, {} as { [optionId: string]: number });

    return (
      <div style={{ marginTop: '1rem', borderTop: '1px solid #eee', paddingTop: '1rem' }} onClick={(e) => e.stopPropagation()}>
        <VoteSummaryChart
          options={agenda.options}
          voteData={voteData}
          totalVotes={agendaVotes.length}
        />
      </div>
    );
  };

  return (
    <div style={cardStyle} className={isSelected ? 'agenda-card-selected' : ''} onClick={handleSelect}>
      <div style={{ paddingRight: '160px' }}>
        <h3>{agenda.title}</h3>
        <div>
          {agenda.tags && agenda.tags.map(tag => (
            <span key={tag} style={tagStyle} onClick={(e) => handleTagClick(e, tag)}>#{tag}</span>
          ))}
        </div>
        <div style={{ fontSize: '0.9rem', color: '#555', marginTop: '0.5rem' }}>
          <p style={{ margin: 0, fontWeight: 'bold' }}>
            제안자: {creator?.name || '(알 수 없음)'}
          </p>
          <p style={{ margin: '0.5rem 0 0 0' }}>
            총 투표: {agenda.voteCount}명
            {agenda.voteLimit && agenda.voteLimit > 0 ? ` / ${agenda.voteLimit}명` : ''}
          </p>
          {agenda.startTime && <p style={{ margin: '0.25rem 0 0 0' }}>시작: {new Date(agenda.startTime).toLocaleString('ko-KR')}</p>}
          {agenda.deadline && <p style={{ margin: '0.25rem 0 0 0' }}>마감: {new Date(agenda.deadline).toLocaleString('ko-KR')}</p>}
        </div>
      </div>

      {isSelected && (
        agenda.isActive ? (
          <div style={{ marginTop: '1rem', borderTop: '1px solid #eee', paddingTop: '1rem' }} onClick={(e) => e.stopPropagation()}>
            {agenda.options.map((option: Option) => (
              <div key={option.id} style={{ padding: '0.25rem 0' }}>
                <label style={{ cursor: 'pointer' }}>
                  <input
                    type="radio"
                    name={`agenda-options-${agenda.id}`}
                    value={option.id}
                    checked={selectedOptionId === option.id}
                    onChange={() => onSelectOption(option.id)}
                    style={{ marginRight: '0.5rem' }}
                  />
                  {option.text}
                </label>
              </div>
            ))}
            <button
              onClick={onSubmitVote}
              disabled={!selectedOptionId}
              style={{ marginTop: '1rem', padding: '0.5rem 1rem', cursor: 'pointer' }}
            >
              투표하기
            </button>
          </div>
        ) : (
          renderVoteSummary()
        )
      )}

      <div style={globalControlsContainer}>
        <div style={actionControlsStyle}>
          <span style={statusBadgeStyle}>{agenda.isActive ? '진행중' : '마감'}</span>
          {currentUserId === agenda.creatorId && (
            <button style={deleteButtonStyle} onClick={handleDelete}>
              삭제
            </button>
          )}
        </div>

        {agenda.isActive && agenda.startTime && agenda.deadline && (
          <div style={timerContainerStyle}>
            <Timer
              startTime={agenda.startTime}
              deadline={agenda.deadline}
              onComplete={() => onTimerComplete && onTimerComplete(agenda.id)}
            />
          </div>
        )}
      </div>
    </div>
  );
};

export default AgendaCard;
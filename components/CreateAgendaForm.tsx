import React, { useState } from 'react';

interface Props {
  onSubmit: (data: { title: string; options: { text: string }[]; startTime?: string; deadline?: string; voteLimit?: number }) => void;
  onCancel: () => void;
}

const CreateAgendaForm: React.FC<Props> = ({ onSubmit, onCancel }) => {
  const [title, setTitle] = useState('');
  const [options, setOptions] = useState([{ text: '' }, { text: '' }]);
  const [startTime, setStartTime] = useState('');
  const [deadline, setDeadline] = useState('');
  const [voteLimit, setVoteLimit] = useState('');

  const handleOptionChange = (index: number, value: string) => {
    const newOptions = [...options];
    newOptions[index].text = value;
    setOptions(newOptions);
  };

  const addOption = () => {
    setOptions([...options, { text: '' }]);
  };

  const removeOption = (index: number) => {
    const newOptions = options.filter((_, i) => i !== index);
    setOptions(newOptions);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const validOptions = options.filter(opt => opt.text.trim() !== '');
    if (title.trim() && validOptions.length >= 2) {
      onSubmit({ 
        title, 
        options: validOptions, 
        startTime,
        deadline, 
        voteLimit: voteLimit ? parseInt(voteLimit, 10) : undefined 
      });
    }
  };

  const formStyle: React.CSSProperties = {
    border: '1px solid #ccc',
    borderRadius: '8px',
    padding: '1.5rem',
    marginTop: '1rem',
    marginBottom: '2rem',
  };

  const inputStyle: React.CSSProperties = {
    width: '100%',
    padding: '0.5rem',
    marginBottom: '1rem',
    boxSizing: 'border-box',
  };

  const buttonStyle: React.CSSProperties = {
    padding: '0.5rem 1rem',
    border: 'none',
    borderRadius: '5px',
    cursor: 'pointer',
    marginRight: '0.5rem',
  };

  return (
    <form onSubmit={handleSubmit} style={formStyle}>
      <h2>새 안건 만들기</h2>
      <input
        type="text"
        placeholder="안건 제목"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        style={inputStyle}
        required
      />
      <h4>선택지 (최소 2개)</h4>
      {options.map((option, index) => (
        <div key={index} style={{ display: 'flex', marginBottom: '0.5rem' }}>
          <input
            type="text"
            placeholder={`선택지 ${index + 1}`}
            value={option.text}
            onChange={(e) => handleOptionChange(index, e.target.value)}
            style={{ ...inputStyle, marginBottom: 0, marginRight: '0.5rem' }}
          />
          {options.length > 2 && (
            <button type="button" onClick={() => removeOption(index)} style={{ ...buttonStyle, backgroundColor: '#dc3545', color: 'white' }}>
              삭제
            </button>
          )}
        </div>
      ))}
      <button type="button" onClick={addOption} style={{ ...buttonStyle, backgroundColor: '#007bff', color: 'white', marginTop: '0.5rem' }}>
        선택지 추가
      </button>

      <div style={{ display: 'flex', gap: '1rem' }}>
        <div style={{ flex: 1, marginTop: '1.5rem' }}>
          <h4>투표 시작 시간 (선택 사항)</h4>
          <input
            type="datetime-local"
            value={startTime}
            onChange={(e) => setStartTime(e.target.value)}
            style={inputStyle}
          />
        </div>
        <div style={{ flex: 1, marginTop: '1.5rem' }}>
          <h4>투표 마감 시간 (선택 사항)</h4>
          <input
            type="datetime-local"
            value={deadline}
            onChange={(e) => setDeadline(e.target.value)}
            style={inputStyle}
          />
        </div>
      </div>

      <div style={{ marginTop: '1.5rem' }}>
        <h4>최대 투표 인원 (선택 사항, 0 또는 미입력 시 무제한)</h4>
        <input
          type="number"
          min="0"
          placeholder="예: 10"
          value={voteLimit}
          onChange={(e) => setVoteLimit(e.target.value)}
          style={inputStyle}
        />
      </div>

      <div style={{ marginTop: '1.5rem' }}>
        <button type="submit" style={{ ...buttonStyle, backgroundColor: '#28a745', color: 'white' }}>
          안건 생성
        </button>
        <button type="button" onClick={onCancel} style={{ ...buttonStyle, backgroundColor: '#6c757d', color: 'white' }}>
          취소
        </button>
      </div>
    </form>
  );
};

export default CreateAgendaForm;

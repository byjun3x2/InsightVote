import React from 'react';
import { Agenda, VoteResult, User } from '../utils/types';

interface Props {
  results: VoteResult[];
  agendas: Agenda[];
  allUsers: User[];
}

const ResultChart: React.FC<Props> = ({ results, agendas, allUsers }) => {
  const getResultText = (result: VoteResult) => {
    const agenda = agendas.find((a) => a.id === result.agendaId);
    const option = agenda?.options.find((o) => o.id === result.optionId);
    const user = allUsers.find((u) => u.id === result.userId);

    const agendaTitle = agenda?.title || '(알 수 없는 안건)';
    const optionText = option?.text || '(알 수 없는 선택지)';
    const userName = user?.name || '(알 수 없는 사용자)';
    const timestamp = new Date(result.timestamp).toLocaleString('ko-KR');

    return `${timestamp} - ${userName}님이 "${agendaTitle}" 안건에 "${optionText}" 항목으로 투표했습니다.`;
  };

  return (
    <div style={{ marginTop: '2rem' }}>
      <h2>실시간 투표 결과</h2>
      <ul>
        {results.map((res, idx) => (
          <li key={idx}>{getResultText(res)}</li>
        ))}
      </ul>
    </div>
  );
};

export default ResultChart;

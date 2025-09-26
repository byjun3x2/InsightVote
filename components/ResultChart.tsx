import React from 'react';
import { Agenda, VoteResult } from '../utils/types';

interface Props {
  results: VoteResult[];
  agendas: Agenda[];
}

const ResultChart: React.FC<Props> = ({ results, agendas }) => {
  const getResultText = (result: VoteResult) => {
    const agenda = agendas.find((a) => a.id === result.agendaId);
    const option = agenda?.options.find((o) => o.id === result.optionId);

    const agendaTitle = agenda?.title || '(알 수 없는 안건)';
    const optionText = option?.text || '(알 수 없는 선택지)';

    return `안건: ${agendaTitle}, 선택: ${optionText}, 시간: ${new Date(
      result.timestamp
    ).toLocaleTimeString()}`;
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

import React from 'react';
import { VoteResult } from '../utils/types';

interface Props {
  results: VoteResult[];
}

const ResultChart: React.FC<Props> = ({ results }) => {
  // 간단한 결과 리스트 출력. 차트 라이브러리 연결 시 교체 가능
  return (
    <div>
      <h2>실시간 투표 결과</h2>
      <ul>
        {results.map((res, idx) => (
          <li key={idx}>
            {`안건: ${res.agendaId}, 선택: ${res.optionId}, 시간: ${new Date(
              res.timestamp
            ).toLocaleTimeString()}`}
          </li>
        ))}
      </ul>
    </div>
  );
};

export default ResultChart;

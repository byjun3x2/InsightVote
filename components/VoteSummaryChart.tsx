import React from 'react';
import { Option } from '../utils/types';

interface VoteData {
  [optionId: string]: number;
}

interface Props {
  options: Option[];
  voteData: VoteData;
  totalVotes: number;
}

const VoteSummaryChart: React.FC<Props> = ({ options, voteData, totalVotes }) => {

  const barStyle: React.CSSProperties = {
    height: '20px',
    backgroundColor: '#007bff',
    color: 'white',
    display: 'flex',
    alignItems: 'center',
    paddingLeft: '0.5rem',
    borderRadius: '0.25rem',
    transition: 'width 0.5s ease-in-out',
    whiteSpace: 'nowrap',
  };

  return (
    <div style={{ marginTop: '1rem' }}>
      <h4>투표 결과</h4>
      {options.map(option => {
        const count = voteData[option.id] || 0;
        const percentage = totalVotes > 0 ? (count / totalVotes) * 100 : 0;
        return (
          <div key={option.id} style={{ marginBottom: '0.5rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.25rem', fontSize: '0.9rem' }}>
              <span>{option.text}</span>
              <span>{count}표 ({percentage.toFixed(1)}%)</span>
            </div>
            <div style={{ width: '100%', backgroundColor: '#e9ecef', borderRadius: '0.25rem' }}>
              <div style={{ ...barStyle, width: `${percentage}%` }}>
                {percentage > 10 && `${percentage.toFixed(1)}%`}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default VoteSummaryChart;

import React from 'react';

interface Props {
  optionId: string;
  optionText: string;
  selected: boolean;
  onChange: (optionId: string) => void;
}

const VoteOption: React.FC<Props> = ({ optionId, optionText, selected, onChange }) => {
  return (
    <label style={{ display: 'block' }}>
      <input
        type="radio"
        name="voteOption"
        value={optionId}
        checked={selected}
        onChange={() => onChange(optionId)}
      />
      {optionText}
    </label>
  );
};

export default VoteOption;

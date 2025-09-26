import React, { useState, useEffect } from 'react';

interface Props {
  startTime: string;
  deadline: string;
  onComplete: () => void;
}

const Timer: React.FC<Props> = ({ startTime, deadline, onComplete }) => {
  const [remaining, setRemaining] = useState('');
  const [progress, setProgress] = useState(0); // 0 to 100

  useEffect(() => {
    let isCompleted = false;
    const calculateTime = () => {
      const now = new Date().getTime();
      const start = new Date(startTime).getTime();
      const end = new Date(deadline).getTime();

      if (now < start) {
        setProgress(0);
        setRemaining('시작 전');
        return;
      }

      if (now >= end) {
        setProgress(100);
        setRemaining('마감');
        if (!isCompleted) {
          onComplete();
          isCompleted = true;
        }
        return;
      }

      const totalDuration = end - start;
      const elapsedTime = now - start;
      const remainingTime = end - now;

      const percentage = (elapsedTime / totalDuration);
      setProgress(percentage * 100);

      const hours = Math.floor((remainingTime % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const minutes = Math.floor((remainingTime % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((remainingTime % (1000 * 60)) / 1000);

      setRemaining(`${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`);
    };

    const interval = setInterval(calculateTime, 1000);
    calculateTime();

    return () => clearInterval(interval);
  }, [startTime, deadline]);

  const size = 80;
  const strokeWidth = 8;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (progress / 100) * circumference;

  return (
    <div style={{ position: 'relative', width: size, height: size, marginTop: '1rem' }}>
      <svg width={size} height={size} style={{ transform: 'rotate(-90deg)' }}>
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="#e9ecef"
          strokeWidth={strokeWidth}
          fill="transparent"
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="#28a745"
          strokeWidth={strokeWidth}
          fill="transparent"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          style={{ transition: 'stroke-dashoffset 0.5s linear' }}
        />
      </svg>
      <div style={{
        position: 'absolute',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        fontSize: '0.8rem',
        color: '#555'
      }}>
        <div>{remaining}</div>
        {progress > 0 && progress < 100 && <div style={{ fontSize: '0.7rem' }}>남음</div>}
      </div>
    </div>
  );
};

export default Timer;

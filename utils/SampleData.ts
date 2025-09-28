import { Agenda } from './types';

export const sampleAgendas: Agenda[] = [
  {
    id: 'agenda1',
    title: '회의 장소 결정',
    options: [
      { id: 'opt1', text: '회의실 A' },
      { id: 'opt2', text: '회의실 B' },
      { id: 'opt3', text: '회식 장소' },
    ],
    isActive: true,
    creatorId: 'sample-user-id', // 샘플 생성자 ID 추가
  },
];

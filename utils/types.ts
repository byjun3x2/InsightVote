export interface Option {
  id: string;
  text: string;
}

export interface Agenda {
  id: string;
  title: string;
  description?: string;
  options: Option[];
  startTime?: string;
  endTime?: Date;
  isActive: boolean;
  deadline?: string;
  voteLimit?: number;
  voteCount?: number;
  creatorId: string;
}

export interface VoteResult {
  agendaId: string;
  optionId: string;
  timestamp: number;
  userId: string;
}

export interface User {
  id: string;
  username: string;
  name: string;
  email: string;
  password?: string; // 비밀번호는 프론트엔드로 전달되지 않도록 optional 처리
}

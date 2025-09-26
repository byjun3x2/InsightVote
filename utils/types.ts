export interface Option {
  id: string;
  text: string;
}

export interface Agenda {
  id: string;
  title: string;
  description?: string;
  options: Option[];
  startTime?: Date;
  endTime?: Date;
  isActive: boolean;
}

export interface VoteResult {
  agendaId: string;
  optionId: string;
  timestamp: number;
}

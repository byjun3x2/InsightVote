import { create } from 'zustand';

interface AgendaState {
  isCreateAgendaFormVisible: boolean;
  showCreateAgendaForm: () => void;
  hideCreateAgendaForm: () => void;
}

export const useAgendaStore = create<AgendaState>((set) => ({
  isCreateAgendaFormVisible: false,
  showCreateAgendaForm: () => set({ isCreateAgendaFormVisible: true }),
  hideCreateAgendaForm: () => set({ isCreateAgendaFormVisible: false }),
}));

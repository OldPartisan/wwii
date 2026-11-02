import { create } from 'zustand';
import { clock } from './clock';
import type { Theater } from '../types';

export interface LayerState {
  territories: boolean;
  fronts: boolean;
  arrows: boolean;
  places: boolean;
  commanders: boolean;
  sprites: boolean;
}

interface UIState {
  layers: LayerState;
  theater: Theater;
  selectedEvent: string | null;
  selectedCommander: string | null;
  aboutOpen: boolean;
  toggleLayer: (key: keyof LayerState) => void;
  setTheater: (t: Theater) => void;
  openEvent: (id: string) => void;
  closeEvent: () => void;
  openCommander: (id: string) => void;
  closeCommander: () => void;
  setAbout: (open: boolean) => void;
}

export const useUI = create<UIState>((set) => ({
  layers: {
    territories: true,
    fronts: true,
    arrows: true,
    places: true,
    commanders: true,
    sprites: true,
  },
  theater: 'europe',
  selectedEvent: null,
  selectedCommander: null,
  aboutOpen: false,
  toggleLayer: (key) =>
    set((s) => ({ layers: { ...s.layers, [key]: !s.layers[key] } })),
  setTheater: (theater) => set({ theater }),
  openEvent: (id) => {
    clock.setPlaying(false);
    set({ selectedEvent: id, selectedCommander: null });
  },
  closeEvent: () => set({ selectedEvent: null }),
  openCommander: (id) => {
    clock.setPlaying(false);
    set({ selectedCommander: id, selectedEvent: null });
  },
  closeCommander: () => set({ selectedCommander: null }),
  setAbout: (aboutOpen) => set({ aboutOpen }),
}));

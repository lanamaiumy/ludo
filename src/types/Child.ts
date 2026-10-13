export type SessionMinutes = 5 | 10;

export type Child = {
  id: string;
  name: string;
  maxVolume: number;
  sessionMinutes: SessionMinutes;
};

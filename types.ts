export interface Country {
  code: string;
  name: string;
}

export interface Question {
  target: Country;
  options: Country[];
}

export interface GameStats {
  correct: number;
  wrong: number;
  streak: number;
  bestStreak: number;
}

export enum GameState {
  LOADING = 'LOADING',
  PLAYING = 'PLAYING',
  RESULT = 'RESULT',
}
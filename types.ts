
export type GameState = 'BETTING' | 'ROLLING' | 'RESULT' | 'WALKING' | 'FISHING' | 'CATCHING' | 'SHOP' | 'TOPUP' | 'WITHDRAW';

export type BetChoice = 'TAI' | 'XIU';

export interface CatchResult {
  fish: {
    name: string;
    image: string;
  };
  weight: number;
  gold: number;
  story: string;
}

export interface UserStats {
  gold: number;
  totalBets: number;
  wins: number;
  losses: number;
  highestWin: number;
  rodLevel: number;
  totalWeight: number;
  bestCatch?: CatchResult;
}

export interface BetResult {
  dice: number[];
  total: number;
  choice: BetChoice;
  isWin: boolean;
  payout: number;
  commentary?: string;
}

export interface GameHistory {
  result: BetChoice;
  total: number;
  dice: number[];
}

export interface TopUpHistory {
  id: string;
  telco: string;
  amount: number;
  status: 'PENDING' | 'SUCCESS' | 'ERROR';
  date: string;
}

export interface WithdrawHistory {
  id: string;
  telco: string;
  amount: number;
  goldDeducted: number;
  status: 'PENDING' | 'COMPLETED' | 'REJECTED';
  cardCode?: string;
  cardSerial?: string;
  date: string;
}

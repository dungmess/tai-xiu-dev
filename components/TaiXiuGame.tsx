
import React, { useState, useEffect } from 'react';
import { GameState, UserStats, BetChoice, GameHistory } from '../types';
import { BET_LEVELS, DICE_FACES, INITIAL_GOLD } from '../constants';
import { generateBetCommentary } from '../services/geminiService';
import TopUpPage from './TopUpPage';
import WithdrawPage from './WithdrawPage';

const TaiXiuGame: React.FC = () => {
  // An toàn hóa Stats Initialization
  const [stats, setStats] = useState<UserStats>(() => {
    const defaultStats: UserStats = {
      gold: INITIAL_GOLD,
      totalBets: 0,
      wins: 0,
      losses: 0,
      highestWin: 0,
      rodLevel: 0,
      totalWeight: 0
    };
    
    try {
      const saved = localStorage.getItem('taixiu_stats');
      if (saved) {
        const parsed = JSON.parse(saved);
        return { ...defaultStats, ...parsed };
      }
    } catch (e) {
      console.warn("Failed to parse stats from localStorage", e);
    }
    return defaultStats;
  });

  const [gameState, setGameState] = useState<GameState>('BETTING');
  const [currentBet, setCurrentBet] = useState<number>(100);
  const [currentChoice, setCurrentChoice] = useState<BetChoice | null>(null);
  const [dice, setDice] = useState<number[]>([1, 2, 3]);
  
  // An toàn hóa History Initialization
  const [history, setHistory] = useState<GameHistory[]>(() => {
    try {
      const saved = localStorage.getItem('taixiu_history');
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.warn("Failed to parse history from localStorage", e);
    }
    return [];
  });

  const [commentary, setCommentary] = useState<string>("Vạn sự khởi đầu nan, chúc bạn may mắn!");
  const [isOpening, setIsOpening] = useState(false);

  useEffect(() => {
    try {
      localStorage.setItem('taixiu_stats', JSON.stringify(stats));
    } catch (e) {
      console.error("Save stats error", e);
    }
  }, [stats]);

  useEffect(() => {
    try {
      localStorage.setItem('taixiu_history', JSON.stringify(history));
    } catch (e) {
      console.error("Save history error", e);
    }
  }, [history]);

  const handleBet = async () => {
    if (!currentChoice || gameState !== 'BETTING' || stats.gold < currentBet) return;

    setGameState('ROLLING');
    setCommentary("Quân xúc xắc đang bay, tiền tài đang nhảy múa...");

    const rollInterval = setInterval(() => {
      setDice([
        Math.floor(Math.random() * 6) + 1,
        Math.floor(Math.random() * 6) + 1,
        Math.floor(Math.random() * 6) + 1
      ]);
    }, 100);

    setTimeout(async () => {
      clearInterval(rollInterval);
      
      const finalDice = [
        Math.floor(Math.random() * 6) + 1,
        Math.floor(Math.random() * 6) + 1,
        Math.floor(Math.random() * 6) + 1
      ];
      setDice(finalDice);
      
      const total = finalDice.reduce((a, b) => a + b, 0);
      const isTriple = finalDice[0] === finalDice[1] && finalDice[1] === finalDice[2];
      const result: BetChoice = total >= 11 ? 'TAI' : 'XIU';
      const isWin = !isTriple && currentChoice === result;

      const payout = isWin ? currentBet : -currentBet;
      const newGold = stats.gold + payout;

      setStats(prev => ({
        ...prev,
        gold: newGold,
        totalBets: prev.totalBets + 1,
        wins: isWin ? prev.wins + 1 : prev.wins,
        losses: isWin ? prev.losses : prev.losses + 1,
        highestWin: isWin && currentBet > prev.highestWin ? currentBet : prev.highestWin
      }));

      const newHistory = [{ result, total, dice: finalDice }, ...history].slice(0, 20);
      setHistory(newHistory);
      
      setIsOpening(true);
      setGameState('RESULT');

      // Catch lỗi khi gọi AI Service
      try {
        const aiComment = await generateBetCommentary(result, total, finalDice, isWin, currentBet);
        setCommentary(aiComment);
      } catch (err) {
        console.error("AI Commentary Error:", err);
        setCommentary(isWin ? "Thắng lớn rồi!" : "Thua rồi, đừng nản!");
      }
    }, 2000);
  };

  const resetGame = () => {
    setIsOpening(false);
    setGameState('BETTING');
    setCurrentChoice(null);
  };

  const handleTopUpSuccess = (goldBonus: number) => {
    setStats(prev => ({ ...prev, gold: prev.gold + goldBonus }));
  };

  const handleWithdrawSuccess = (goldDeducted: number) => {
    setStats(prev => ({ ...prev, gold: prev.gold - goldDeducted }));
  };

  return (
    <div className="min-h-screen bg-slate-950 text-white flex flex-col items-center p-4 md:p-8 font-sans">
      <div className="w-full max-w-5xl flex flex-wrap justify-between items-center mb-8 gap-4">
        <div className="bg-slate-900 border border-slate-700 p-3 rounded-2xl flex items-center gap-4 shadow-xl">
          <div className="text-2xl animate-pulse">💰</div>
          <div>
            <div className="text-slate-400 text-[10px] uppercase font-bold">Vàng Khả Dụng</div>
            <div className="text-yellow-400 font-game text-xl tracking-wider">{stats.gold.toLocaleString()}</div>
          </div>
        </div>
        
        <h1 className="text-2xl md:text-3xl font-game text-transparent bg-clip-text bg-gradient-to-b from-yellow-200 to-yellow-600 drop-shadow-lg text-center order-first md:order-none w-full md:w-auto">
          VƯƠNG QUỐC TÀI XỈU
        </h1>

        <div className="flex gap-2">
            <button 
                onClick={() => setGameState('TOPUP')}
                className="bg-green-600 hover:bg-green-500 text-white font-game px-4 py-3 rounded-xl shadow-lg transition-transform active:scale-95 border-b-4 border-green-800 flex items-center gap-2 text-xs md:text-sm"
            >
                <span className="text-xl">+</span> NẠP TIỀN
            </button>
            <button 
                onClick={() => setGameState('WITHDRAW')}
                className="bg-red-600 hover:bg-red-500 text-white font-game px-4 py-3 rounded-xl shadow-lg transition-transform active:scale-95 border-b-4 border-red-800 flex items-center gap-2 text-xs md:text-sm"
            >
                📤 RÚT THẺ
            </button>
        </div>
      </div>

      <div className="w-full max-w-4xl bg-slate-900/50 border-2 border-slate-800 rounded-[3rem] p-8 relative shadow-2xl backdrop-blur-sm overflow-hidden">
        <div className="absolute inset-0 bg-radial-gradient from-blue-900/10 to-transparent pointer-events-none"></div>

        <div className="text-center mb-10">
          <div className="inline-block relative">
            <div className="w-20 h-20 bg-slate-800 rounded-full border-2 border-yellow-500 flex items-center justify-center text-4xl mb-2 mx-auto shadow-[0_0_20px_rgba(234,179,8,0.3)]">
              🧙‍♂️
            </div>
            <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 bg-yellow-500 text-slate-950 text-[10px] px-2 py-0.5 rounded-full font-bold">
                THẦN BÀI
            </div>
          </div>
          <p className="mt-4 text-lg font-medium italic text-blue-200 max-w-md mx-auto min-h-[3rem]">
            "{commentary}"
          </p>
        </div>

        <div className="flex justify-center items-center gap-8 mb-12 py-10 bg-slate-950/50 rounded-full border border-slate-800 relative">
          {dice.map((d, i) => (
            <div 
              key={i} 
              className={`w-16 h-16 md:w-20 md:h-20 bg-white rounded-2xl flex items-center justify-center text-5xl md:text-6xl text-slate-900 shadow-inner border-b-4 border-slate-300 transition-all duration-300 ${gameState === 'ROLLING' ? 'animate-bounce' : ''}`}
            >
              {DICE_FACES[d - 1]}
            </div>
          ))}
          
          {gameState === 'ROLLING' && (
             <div className="absolute inset-0 bg-slate-800 rounded-full flex flex-col items-center justify-center animate-pulse z-10 border-4 border-slate-700">
                <div className="text-6xl mb-2">🎲</div>
                <div className="font-game text-yellow-500 tracking-widest">ĐANG LẮC...</div>
             </div>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-10">
          <button 
            disabled={gameState !== 'BETTING'}
            onClick={() => setCurrentChoice('XIU')}
            className={`group relative overflow-hidden py-8 rounded-[2rem] border-4 transition-all duration-300 ${
                currentChoice === 'XIU' 
                ? 'bg-blue-600 border-blue-400 scale-105 shadow-[0_0_30px_rgba(37,99,235,0.4)]' 
                : 'bg-slate-800 border-slate-700 hover:border-blue-500 opacity-60 hover:opacity-100'
            }`}
          >
            <div className="text-4xl font-game mb-1">XỈU</div>
            <div className="text-sm font-bold text-blue-300">4 - 10</div>
          </button>

          <button 
            disabled={gameState !== 'BETTING'}
            onClick={() => setCurrentChoice('TAI')}
            className={`group relative overflow-hidden py-8 rounded-[2rem] border-4 transition-all duration-300 ${
                currentChoice === 'TAI' 
                ? 'bg-red-600 border-red-400 scale-105 shadow-[0_0_30px_rgba(220,38,38,0.4)]' 
                : 'bg-slate-800 border-slate-700 hover:border-red-500 opacity-60 hover:opacity-100'
            }`}
          >
            <div className="text-4xl font-game mb-1">TÀI</div>
            <div className="text-sm font-bold text-red-300">11 - 17</div>
          </button>
        </div>

        <div className="flex flex-wrap justify-center gap-3 mb-10">
          {BET_LEVELS.map(amt => (
            <button 
              key={amt}
              disabled={gameState !== 'BETTING'}
              onClick={() => setCurrentBet(amt)}
              className={`w-16 h-16 md:w-20 md:h-20 rounded-full flex items-center justify-center text-[10px] md:text-xs font-bold transition-all border-4 shadow-lg ${
                currentBet === amt 
                ? 'bg-yellow-500 text-slate-900 border-yellow-200 scale-110 rotate-12 shadow-yellow-500/50' 
                : 'bg-slate-800 text-slate-400 border-slate-700 hover:bg-slate-700'
              }`}
            >
              {amt >= 1000 ? `${amt/1000}K` : amt}
            </button>
          ))}
        </div>

        <div className="flex justify-center">
            {gameState === 'RESULT' ? (
                <button 
                    onClick={resetGame}
                    className="w-full max-w-sm bg-blue-600 hover:bg-blue-500 text-white font-game py-5 rounded-2xl text-xl shadow-xl transition-all border-b-4 border-blue-800 active:border-0 active:translate-y-1"
                >
                    TIẾP TỤC VÁN MỚI
                </button>
            ) : (
                <button 
                    onClick={handleBet}
                    disabled={gameState !== 'BETTING' || !currentChoice || stats.gold < currentBet}
                    className={`w-full max-w-sm font-game py-5 rounded-2xl text-xl shadow-xl transition-all border-b-4 ${
                        gameState !== 'BETTING' || !currentChoice || stats.gold < currentBet
                        ? 'bg-slate-700 text-slate-500 border-slate-900 cursor-not-allowed'
                        : 'bg-yellow-500 hover:bg-yellow-400 text-slate-950 border-yellow-700 active:border-0 active:translate-y-1 pulse-gold'
                    }`}
                >
                    {stats.gold < currentBet ? 'KHÔNG ĐỦ VÀNG' : 'ĐẶT CƯỢC NGAY'}
                </button>
            )}
        </div>
      </div>

      <div className="w-full max-w-4xl mt-8 grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-2 bg-slate-900/80 border border-slate-800 p-6 rounded-[2rem] shadow-xl overflow-hidden">
          <h3 className="text-slate-500 text-xs font-bold uppercase tracking-widest mb-4 flex justify-between">
            Lịch sử ván đấu <span>Cầu 20 ván</span>
          </h3>
          <div className="flex flex-wrap gap-2">
            {history.map((h, i) => (
              <div 
                key={i} 
                className={`w-10 h-10 rounded-full flex flex-col items-center justify-center text-[10px] font-bold shadow-lg animate-fadeIn ${
                    h.result === 'TAI' ? 'bg-red-500/20 text-red-500 border border-red-500/50' : 'bg-blue-500/20 text-blue-500 border border-blue-500/50'
                }`}
              >
                <div>{h.result[0]}</div>
                <div className="text-[8px] opacity-70">{h.total}</div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-slate-900/80 border border-slate-800 p-6 rounded-[2rem] shadow-xl">
           <h3 className="text-slate-500 text-xs font-bold uppercase tracking-widest mb-4">Kết quả gần đây</h3>
           <div className="space-y-4">
              <div className="flex justify-between items-center border-b border-slate-800 pb-2">
                <span className="text-slate-400 text-sm">Vàng:</span>
                <span className="font-game text-yellow-400">{stats.gold.toLocaleString()}</span>
              </div>
              <div className="flex justify-between items-center border-b border-slate-800 pb-2">
                <span className="text-slate-400 text-sm">Tổng ván:</span>
                <span className="font-game text-white">{stats.totalBets}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-400 text-sm">Thắng:</span>
                <span className="font-game text-green-400">{stats.wins}</span>
              </div>
           </div>
        </div>
      </div>

      {gameState === 'TOPUP' && (
        <TopUpPage 
          onClose={() => setGameState('BETTING')} 
          onSuccess={handleTopUpSuccess}
        />
      )}
      {gameState === 'WITHDRAW' && (
        <WithdrawPage 
          currentGold={stats.gold}
          onClose={() => setGameState('BETTING')} 
          onWithdraw={handleWithdrawSuccess}
        />
      )}
    </div>
  );
};

export default TaiXiuGame;

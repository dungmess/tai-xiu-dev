
import React, { useState, useEffect } from 'react';

interface TaiXiuOverlayProps {
  gold: number;
  onBet: (amount: number, choice: 'TAI' | 'XIU') => Promise<{ dice: number[], win: boolean, resultGold: number }>;
  onClose: () => void;
}

const TaiXiuOverlay: React.FC<TaiXiuOverlayProps> = ({ gold, onBet, onClose }) => {
  const [betAmount, setBetAmount] = useState(100);
  const [choice, setChoice] = useState<'TAI' | 'XIU' | null>(null);
  const [rolling, setRolling] = useState(false);
  const [dice, setDice] = useState([1, 1, 1]);
  const [history, setHistory] = useState<string[]>([]);
  const [lastResult, setLastResult] = useState<{ win: boolean, total: number } | null>(null);

  const handleRoll = async () => {
    if (!choice || rolling || gold < betAmount) return;
    
    setRolling(true);
    setLastResult(null);

    // Fake roll animation
    const interval = setInterval(() => {
      setDice([
        Math.floor(Math.random() * 6) + 1,
        Math.floor(Math.random() * 6) + 1,
        Math.floor(Math.random() * 6) + 1
      ]);
    }, 100);

    setTimeout(async () => {
      clearInterval(interval);
      const result = await onBet(betAmount, choice);
      setDice(result.dice);
      const total = result.dice.reduce((a, b) => a + b, 0);
      const gameResult = total >= 11 ? 'TÀI' : 'XỈU';
      setHistory(prev => [gameResult, ...prev].slice(0, 10));
      setLastResult({ win: result.win, total });
      setRolling(false);
    }, 2000);
  };

  return (
    <div className="absolute inset-0 bg-black/90 backdrop-blur-md flex flex-col items-center justify-center p-6 z-50 pointer-events-auto">
      <div className="w-full max-w-xl bg-slate-900 border-4 border-yellow-600 rounded-3xl p-8 relative shadow-[0_0_100px_rgba(234,179,8,0.2)]">
        <button onClick={onClose} className="absolute top-4 right-4 text-white text-3xl hover:text-red-500 transition-colors">&times;</button>
        
        <h2 className="text-4xl font-game text-yellow-500 text-center mb-8 tracking-widest drop-shadow-lg">TÀI • XỈU</h2>
        
        {/* Dice Area */}
        <div className="flex justify-center gap-6 mb-10">
          {dice.map((d, i) => (
            <div key={i} className={`w-20 h-20 bg-white rounded-2xl flex items-center justify-center text-4xl shadow-inner border-b-4 border-slate-300 ${rolling ? 'animate-bounce' : ''}`}>
              {['⚀', '⚁', '⚂', '⚃', '⚄', '⚅'][d - 1]}
            </div>
          ))}
        </div>

        {/* Result Text */}
        {lastResult && !rolling && (
          <div className={`text-center font-game text-2xl mb-4 ${lastResult.win ? 'text-green-400 animate-pulse' : 'text-red-400'}`}>
            {lastResult.win ? 'CHIẾN THẮNG!' : 'THẤT BẠI!'}
            <div className="text-sm mt-1">Tổng điểm: {lastResult.total}</div>
          </div>
        )}

        {/* Betting Buttons */}
        <div className="grid grid-cols-2 gap-4 mb-8">
          <button 
            disabled={rolling}
            onClick={() => setChoice('XIU')}
            className={`py-6 rounded-2xl font-game text-2xl border-4 transition-all ${choice === 'XIU' ? 'bg-blue-600 border-blue-400 scale-105 shadow-[0_0_20px_rgba(37,99,235,0.5)]' : 'bg-slate-800 border-slate-700 hover:border-blue-500'}`}
          >
            XỈU
            <div className="text-xs font-sans text-blue-300">4 - 10</div>
          </button>
          <button 
            disabled={rolling}
            onClick={() => setChoice('TAI')}
            className={`py-6 rounded-2xl font-game text-2xl border-4 transition-all ${choice === 'TAI' ? 'bg-red-600 border-red-400 scale-105 shadow-[0_0_20px_rgba(220,38,38,0.5)]' : 'bg-slate-800 border-slate-700 hover:border-red-500'}`}
          >
            TÀI
            <div className="text-xs font-sans text-red-300">11 - 17</div>
          </button>
        </div>

        {/* Bet Selection */}
        <div className="flex flex-wrap justify-center gap-2 mb-8">
          {[100, 500, 1000, 5000, 10000].map(amt => (
            <button 
              key={amt}
              disabled={rolling}
              onClick={() => setBetAmount(amt)}
              className={`px-4 py-2 rounded-full font-game text-xs transition-all ${betAmount === amt ? 'bg-yellow-500 text-slate-900' : 'bg-slate-700 text-slate-400 hover:bg-slate-600'}`}
            >
              {amt.toLocaleString()}
            </button>
          ))}
        </div>

        {/* Action Button */}
        <button 
          onClick={handleRoll}
          disabled={rolling || !choice || gold < betAmount}
          className={`w-full py-4 rounded-xl font-game text-xl shadow-lg transition-all active:scale-95 ${rolling || !choice || gold < betAmount ? 'bg-slate-700 cursor-not-allowed opacity-50' : 'bg-yellow-500 hover:bg-yellow-400 text-slate-900 border-b-4 border-yellow-700'}`}
        >
          {rolling ? 'ĐANG LẮC...' : gold < betAmount ? 'KHÔNG ĐỦ VÀNG' : 'LẮC XÚC XẮC'}
        </button>

        {/* History */}
        <div className="mt-8 flex items-center justify-center gap-2 overflow-hidden">
          {history.map((h, i) => (
            <div key={i} className={`w-8 h-8 rounded-full flex items-center justify-center text-[10px] font-bold ${h === 'TÀI' ? 'bg-red-500/20 text-red-500 border border-red-500' : 'bg-blue-500/20 text-blue-500 border border-blue-500'}`}>
              {h[0]}
            </div>
          ))}
          {history.length === 0 && <div className="text-slate-600 text-xs italic">Chưa có lịch sử ván đấu</div>}
        </div>
      </div>
    </div>
  );
};

export default TaiXiuOverlay;

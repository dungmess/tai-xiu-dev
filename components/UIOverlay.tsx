
import React from 'react';
import { GameState, UserStats, CatchResult } from '../types';
import { RODS } from '../constants';
import TaiXiuOverlay from './TaiXiuOverlay';

interface UIOverlayProps {
  gameState: GameState;
  stats: UserStats;
  currentResult?: CatchResult;
  tension: number;
  onCast: () => void;
  onReel: (reeling: boolean) => void;
  onCloseResult: () => void;
  onOpenShop: () => void;
  onCloseShop: () => void;
  onOpenBetting: () => void;
  onCloseBetting: () => void;
  onBet: (amount: number, choice: 'TAI' | 'XIU') => Promise<{ dice: number[], win: boolean, resultGold: number }>;
  onUpgrade: (type: 'rod') => void;
  onMove: (dir: number) => void;
}

const UIOverlay: React.FC<UIOverlayProps> = ({ 
  gameState, stats, currentResult, tension, onCast, onReel, onCloseResult, onOpenShop, onCloseShop, onOpenBetting, onCloseBetting, onBet, onUpgrade, onMove
}) => {
  const isInMenu = gameState === 'SHOP' || gameState === 'RESULT' || gameState === 'BETTING';

  return (
    <div className="absolute inset-0 pointer-events-none flex flex-col items-center justify-between p-6">
      {/* Top Bar */}
      <div className="w-full flex justify-between items-start pointer-events-auto">
        <div className="bg-slate-900/80 border border-slate-700 p-4 rounded-xl flex items-center gap-4 shadow-2xl backdrop-blur-md">
          <div className="w-12 h-12 rounded-full bg-blue-500 flex items-center justify-center text-2xl border-2 border-blue-300">
            🎣
          </div>
          <div>
            <div className="text-slate-400 text-xs uppercase font-bold tracking-widest">Kinh Phí</div>
            <div className="text-yellow-400 font-game text-xl flex items-center gap-1">
              {stats.gold.toLocaleString()} <span className="text-sm">GOLD</span>
            </div>
          </div>
        </div>

        <div className="flex gap-2">
            <button 
                onClick={onOpenBetting}
                className="bg-red-600 hover:bg-red-500 text-white font-game px-6 py-3 rounded-xl shadow-lg transition-transform active:scale-95 border-b-4 border-red-800"
            >
                🎲 TÀI XỈU
            </button>
            <button 
                onClick={onOpenShop}
                className="bg-yellow-500 hover:bg-yellow-400 text-slate-900 font-game px-6 py-3 rounded-xl shadow-lg transition-transform active:scale-95 border-b-4 border-yellow-700"
            >
                🛒 CỬA HÀNG
            </button>
        </div>
      </div>

      {/* Center Interaction */}
      <div className="flex flex-col items-center gap-8 w-full max-w-md pointer-events-auto">
        {gameState === 'WALKING' && (
          <div className="flex flex-col items-center gap-6">
            <div className="bg-black/40 px-6 py-2 rounded-full text-white text-sm font-bold uppercase tracking-widest backdrop-blur-sm border border-white/10">
                Ghé thăm lều Tài Xỉu hoặc Tìm chỗ câu cá
            </div>
            
            <button 
                onClick={onCast}
                className="bg-gradient-to-r from-blue-600 to-cyan-500 hover:from-blue-500 hover:to-cyan-400 text-white font-game px-12 py-5 rounded-2xl shadow-2xl border-b-4 border-blue-800 transition-all active:scale-95 active:border-b-0"
            >
                CÂU TẠI ĐÂY
            </button>

            <div className="flex gap-4 mt-8 md:hidden">
                <button 
                    onMouseDown={() => onMove(-1)} onMouseUp={() => onMove(0)}
                    onTouchStart={() => onMove(-1)} onTouchEnd={() => onMove(0)}
                    className="w-20 h-20 bg-slate-800/80 rounded-2xl flex items-center justify-center text-4xl text-white border-2 border-slate-600"
                >
                    ⬅️
                </button>
                <button 
                    onMouseDown={() => onMove(1)} onMouseUp={() => onMove(0)}
                    onTouchStart={() => onMove(1)} onTouchEnd={() => onMove(0)}
                    className="w-20 h-20 bg-slate-800/80 rounded-2xl flex items-center justify-center text-4xl text-white border-2 border-slate-600"
                >
                    ➡️
                </button>
            </div>
          </div>
        )}

        {gameState === 'CATCHING' && (
          <div className="w-full flex flex-col items-center gap-4">
             <div className="text-red-500 font-game text-4xl animate-bounce drop-shadow-[0_0_10px_rgba(239,68,68,0.8)]">
              CÁ CẮN! REEL NGAY!
            </div>
            <div className="w-full h-10 bg-slate-900 border-2 border-slate-700 rounded-2xl overflow-hidden relative">
              <div 
                className={`h-full transition-all duration-100 ${
                  tension > 80 ? 'bg-red-500' : tension < 20 ? 'bg-blue-400' : 'bg-green-500'
                }`}
                style={{ width: `${tension}%` }}
              />
              <div className="absolute inset-0 flex items-center justify-center font-game text-xs text-white mix-blend-difference">
                ĐỘ CĂNG: {Math.round(tension)}%
              </div>
            </div>
            <button 
              onMouseDown={() => onReel(true)}
              onMouseUp={() => onReel(false)}
              onTouchStart={() => onReel(true)}
              onTouchEnd={() => onReel(false)}
              className="w-48 h-48 bg-slate-800 rounded-full border-8 border-slate-700 shadow-2xl flex items-center justify-center font-game text-2xl text-white hover:bg-slate-700 active:scale-90 transition-all pulse-gold"
            >
              GIỮ ĐỂ KÉO
            </button>
          </div>
        )}
      </div>

      {/* Overlays */}
      {gameState === 'BETTING' && <TaiXiuOverlay gold={stats.gold} onBet={onBet} onClose={onCloseBetting} />}

      {gameState === 'RESULT' && currentResult && (
        <div className="absolute inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 pointer-events-auto">
          <div className="bg-slate-900 border-2 border-yellow-500 w-full max-w-lg rounded-3xl p-8 flex flex-col items-center shadow-[0_0_50px_rgba(234,179,8,0.3)] animate-bob">
            <div className="text-4xl mb-4">{currentResult.fish.image}</div>
            <h2 className="text-3xl font-game text-yellow-400 text-center mb-2">CHIẾN TÍCH: {currentResult.fish.name}</h2>
            <div className="text-white text-xl font-game mb-4">{currentResult.weight.toFixed(2)} KG</div>
            <div className="bg-slate-800/50 p-6 rounded-2xl border border-slate-700 mb-6 text-center italic text-blue-200 leading-relaxed italic">"{currentResult.story}"</div>
            <div className="bg-yellow-500/20 text-yellow-400 px-4 py-2 rounded-full border border-yellow-500/50 font-game mb-8">+ {currentResult.gold} GOLD</div>
            <button onClick={onCloseResult} className="w-full bg-yellow-500 hover:bg-yellow-400 text-slate-900 font-game py-4 rounded-xl text-xl shadow-lg">TIẾP TỤC</button>
          </div>
        </div>
      )}

      {gameState === 'SHOP' && (
        <div className="absolute inset-0 bg-slate-950/95 flex flex-col p-6 pointer-events-auto">
          <div className="flex justify-between items-center mb-8">
            <h2 className="text-3xl font-game text-white">CỬA HÀNG TRANG BỊ</h2>
            <button onClick={onCloseShop} className="text-slate-400 hover:text-white text-4xl">&times;</button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 overflow-y-auto">
            {RODS.map(rod => {
              const isOwned = stats.rodLevel >= rod.level;
              const isAvailable = stats.rodLevel === rod.level - 1;
              return (
                <div key={rod.level} className={`p-6 rounded-2xl border-2 transition-all ${isOwned ? 'bg-blue-500/10 border-blue-500/50' : 'bg-slate-900 border-slate-800'}`}>
                  <h3 className="text-xl font-game text-white">{rod.name}</h3>
                  <p className="text-slate-400 text-sm mb-4">Sức kéo: +{rod.power}%</p>
                  {isOwned ? (
                    <div className="text-blue-400 font-game text-sm text-center py-2 bg-blue-400/10 rounded-lg">ĐÃ SỞ HỮU</div>
                  ) : (
                    <button 
                      disabled={!isAvailable || stats.gold < rod.price}
                      onClick={() => onUpgrade('rod')}
                      className={`w-full py-3 rounded-xl font-game ${isAvailable && stats.gold >= rod.price ? 'bg-yellow-500 text-slate-900' : 'bg-slate-800 text-slate-500'}`}
                    >
                      {rod.price.toLocaleString()} GOLD
                    </button>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* HUD */}
      {!isInMenu && (
        <div className="w-full max-w-4xl grid grid-cols-3 gap-4 mb-4">
            <div className="bg-slate-900/50 p-3 rounded-xl border border-slate-800 text-center">
                <div className="text-[10px] text-slate-500 uppercase font-bold">Cấp Cần</div>
                <div className="text-blue-400 font-game">LV.{stats.rodLevel}</div>
            </div>
            <div className="bg-slate-900/50 p-3 rounded-xl border border-slate-800 text-center">
                <div className="text-[10px] text-slate-500 uppercase font-bold">Kỷ Lục</div>
                <div className="text-yellow-400 font-game text-xs">{stats.bestCatch ? `${stats.bestCatch.weight.toFixed(1)}kg` : '---'}</div>
            </div>
            <div className="bg-slate-900/50 p-3 rounded-xl border border-slate-800 text-center">
                <div className="text-[10px] text-slate-500 uppercase font-bold">Tổng Trọng Lượng</div>
                <div className="text-white font-game">{stats.totalWeight.toFixed(1)}kg</div>
            </div>
        </div>
      )}
    </div>
  );
};

export default UIOverlay;

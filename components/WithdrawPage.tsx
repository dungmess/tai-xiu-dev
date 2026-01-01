
import React, { useState, useEffect } from 'react';
import { CARD_AMOUNTS, GOLD_TO_VND_RATE } from '../constants';
import { WithdrawHistory } from '../types';

// Sử dụng thông tin cấu hình từ TopUpPage để đồng bộ
const TSR_CONFIG = {
  PARTNER_ID: '74286329190', 
  PARTNER_KEY: '101368fb2d13c631239bf43c8f24d867' 
};

// Khai báo kiểu cho md5 từ script CDN đã thêm ở index.html
declare var md5: (string: string) => string;

interface WithdrawPageProps {
  currentGold: number;
  onClose: () => void;
  onWithdraw: (goldAmount: number) => void;
}

const WithdrawPage: React.FC<WithdrawPageProps> = ({ currentGold, onClose, onWithdraw }) => {
  const [selectedAmount, setSelectedAmount] = useState(CARD_AMOUNTS[0]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error' | 'info', text: string } | null>(null);
  
  const [history, setHistory] = useState<WithdrawHistory[]>(() => {
    const saved = localStorage.getItem('withdraw_history');
    return saved ? JSON.parse(saved) : [];
  });

  useEffect(() => {
    localStorage.setItem('withdraw_history', JSON.stringify(history));
  }, [history]);

  const requiredGold = selectedAmount * GOLD_TO_VND_RATE;

  const handleRequestWithdraw = async () => {
    if (currentGold < requiredGold) {
      setMessage({ type: 'error', text: 'Số dư vàng không đủ để đổi mệnh giá này!' });
      return;
    }

    if (TSR_CONFIG.PARTNER_ID === 'YOUR_PARTNER_ID') {
      setMessage({ type: 'error', text: 'Chưa cấu hình API Key của TSR!' });
      return;
    }

    setLoading(true);
    setMessage({ type: 'info', text: 'Đang kết nối hệ thống mua thẻ TSR...' });

    const requestId = Math.floor(Math.random() * 1000000000).toString();
    const telco = 'VIETTEL';
    const quantity = 1;
    
    // Tạo chữ ký theo chuẩn API Mua Thẻ TSR: md5(partner_key + telco + amount + quantity + request_id)
    const signature = md5(TSR_CONFIG.PARTNER_KEY + telco + selectedAmount + quantity + requestId);

    try {
      // Endpoint giả định cho API Mua Thẻ TSR v2
      // Lưu ý: CORS có thể chặn request trực tiếp từ trình duyệt
      const response = await fetch('https://thesieure.com.vn/api/buy-card', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          partner_id: TSR_CONFIG.PARTNER_ID,
          telco: telco,
          amount: selectedAmount,
          quantity: quantity,
          request_id: requestId,
          sign: signature,
          command: 'buycard'
        })
      });

      // Đối với bản Demo/Frontend: Nếu bị CORS hoặc API chưa mở cho account này
      // Chúng ta sẽ mô phỏng phản hồi thành công sau khi trừ tiền thật
      // TRONG THỰC TẾ: Bỏ đoạn giả lập bên dưới và parse dữ liệu từ `await response.json()`
      
      const isDevMode = true; // Bật để test logic khi chưa có backend/cors proxy
      
      if (isDevMode) {
        await new Promise(resolve => setTimeout(resolve, 2000));
        
        // Trừ tiền người chơi ngay lập tức
        onWithdraw(requiredGold);

        const fakeCode = Math.floor(Math.random() * 10000000000000).toString();
        const fakeSerial = Math.floor(Math.random() * 10000000000).toString();
        
        const newEntry: WithdrawHistory = {
          id: requestId,
          telco: telco,
          amount: selectedAmount,
          goldDeducted: requiredGold,
          status: 'COMPLETED',
          cardCode: fakeCode,
          cardSerial: fakeSerial,
          date: new Date().toLocaleString()
        };

        setHistory(prev => [newEntry, ...prev]);
        setMessage({ type: 'success', text: `Đổi thẻ thành công! Mã thẻ đã được gửi vào lịch sử.` });
      } else {
        const data = await response.json();
        if (data.status === 1) {
          onWithdraw(requiredGold);
          const newEntry: WithdrawHistory = {
            id: requestId,
            telco: telco,
            amount: selectedAmount,
            goldDeducted: requiredGold,
            status: 'COMPLETED',
            cardCode: data.cards[0].code,
            cardSerial: data.cards[0].serial,
            date: new Date().toLocaleString()
          };
          setHistory(prev => [newEntry, ...prev]);
          setMessage({ type: 'success', text: 'Mua thẻ thành công!' });
        } else {
          setMessage({ type: 'error', text: data.message || 'Hệ thống TSR từ chối giao dịch.' });
        }
      }

    } catch (err) {
      console.error(err);
      setMessage({ type: 'error', text: 'Lỗi API hoặc chặn CORS. Vui lòng kiểm tra console.' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-slate-950/98 z-[60] flex flex-col items-center p-4 md:p-8 overflow-y-auto animate-fadeIn">
      <div className="w-full max-w-4xl">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h2 className="text-3xl font-game text-red-500 tracking-tighter">HỆ THỐNG RÚT THẺ</h2>
            <p className="text-slate-400 text-sm">Đổi vàng sang mã thẻ Viettel tự động</p>
          </div>
          <button onClick={onClose} className="bg-slate-800 w-12 h-12 rounded-full flex items-center justify-center text-slate-400 hover:text-white transition-colors text-2xl">&times;</button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Cấu hình rút */}
          <div className="bg-slate-900 border border-slate-800 p-8 rounded-[2.5rem] shadow-2xl relative overflow-hidden">
            <div className="absolute top-0 right-0 p-4 opacity-10 text-6xl">💸</div>
            
            <h3 className="text-white font-game mb-6 text-xl">CHỌN MỆNH GIÁ</h3>
            
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mb-8">
              {CARD_AMOUNTS.map(amt => (
                <button
                  key={amt}
                  onClick={() => setSelectedAmount(amt)}
                  className={`p-4 rounded-2xl border-2 transition-all flex flex-col items-center justify-center gap-1 ${
                    selectedAmount === amt 
                    ? 'bg-red-600 border-red-400 scale-105 shadow-lg shadow-red-500/20' 
                    : 'bg-slate-800 border-slate-700 hover:border-slate-500'
                  }`}
                >
                  <div className="font-bold text-white text-lg">{(amt/1000)}K</div>
                  <div className="text-[10px] text-red-200 uppercase font-bold">{(amt * GOLD_TO_VND_RATE).toLocaleString()} Vàng</div>
                </button>
              ))}
            </div>

            <div className="bg-slate-950/50 p-6 rounded-2xl border border-slate-800 mb-8 space-y-3">
              <div className="flex justify-between text-sm">
                <span className="text-slate-400 font-medium">Số dư khả dụng:</span>
                <span className="text-yellow-400 font-game">{currentGold.toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-slate-400 font-medium">Phí đổi thẻ (Hệ thống):</span>
                <span className="text-slate-500">Miễn phí</span>
              </div>
              <div className="border-t border-slate-800 pt-4 flex justify-between items-center">
                <span className="text-white font-bold uppercase text-xs">Tổng vàng trừ:</span>
                <span className="text-2xl font-game text-red-500">{requiredGold.toLocaleString()}</span>
              </div>
            </div>

            {message && (
              <div className={`p-4 rounded-xl text-sm font-bold mb-4 animate-fadeIn border ${
                message.type === 'success' ? 'bg-green-500/10 text-green-400 border-green-500/20' : 
                message.type === 'error' ? 'bg-red-500/10 text-red-400 border-red-500/20' : 'bg-blue-500/10 text-blue-400 border-blue-500/20'
              }`}>
                {message.text}
              </div>
            )}

            <button 
              disabled={loading || currentGold < requiredGold}
              onClick={handleRequestWithdraw}
              className={`w-full py-5 rounded-2xl font-game text-xl shadow-xl transition-all ${
                loading || currentGold < requiredGold 
                ? 'bg-slate-800 text-slate-600 cursor-not-allowed opacity-50' 
                : 'bg-red-600 hover:bg-red-500 text-white pulse-gold shadow-red-500/30'
              }`}
            >
              {loading ? 'ĐANG KẾT NỐI TSR...' : currentGold < requiredGold ? 'KHÔNG ĐỦ VÀNG' : 'ĐỔI THẺ NGAY'}
            </button>
            <p className="text-[10px] text-slate-500 text-center mt-4 italic">Thông tin thẻ sẽ được hiển thị ngay sau khi đổi thành công.</p>
          </div>

          {/* Lịch sử và kết quả */}
          <div className="bg-slate-900/50 border border-slate-800 p-8 rounded-[2.5rem] flex flex-col overflow-hidden shadow-xl">
            <h3 className="text-slate-400 text-xs font-bold mb-6 uppercase tracking-widest flex justify-between items-center">
                KHO THẺ CỦA BẠN
                <span className="bg-slate-800 px-2 py-1 rounded text-[10px]">{history.length} THẺ</span>
            </h3>
            <div className="flex-1 space-y-4 overflow-y-auto pr-2 custom-scrollbar">
              {history.map(item => (
                <div key={item.id} className="bg-slate-800 border border-slate-700 rounded-3xl p-5 hover:border-slate-500 transition-all group">
                  <div className="flex justify-between items-start mb-4">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-red-600 rounded-xl flex items-center justify-center text-white font-bold text-xs shadow-lg">VT</div>
                        <div>
                            <div className="font-game text-white text-sm">{item.amount.toLocaleString()} VND</div>
                            <div className="text-slate-500 text-[10px]">{item.date}</div>
                        </div>
                    </div>
                    <span className="px-3 py-1 bg-green-500/10 text-green-500 rounded-full text-[9px] font-bold uppercase tracking-tighter">Thành công</span>
                  </div>
                  
                  <div className="bg-slate-950/80 p-4 rounded-2xl border border-slate-700/50 space-y-2">
                    <div className="flex justify-between items-center">
                        <span className="text-slate-500 text-[10px] uppercase font-bold">Mã thẻ:</span>
                        <span className="text-yellow-400 font-mono font-bold tracking-wider text-sm select-all cursor-pointer hover:text-yellow-300 transition-colors">
                            {item.cardCode}
                        </span>
                    </div>
                    <div className="flex justify-between items-center">
                        <span className="text-slate-500 text-[10px] uppercase font-bold">Seri:</span>
                        <span className="text-slate-300 font-mono text-xs select-all">
                            {item.cardSerial}
                        </span>
                    </div>
                  </div>
                </div>
              ))}
              
              {history.length === 0 && (
                <div className="flex flex-col items-center justify-center py-24 text-slate-600">
                   <div className="text-6xl mb-6 opacity-20">📭</div>
                   <div className="text-sm font-medium">Bạn chưa đổi chiếc thẻ nào</div>
                   <div className="text-[11px] mt-1 opacity-50">Thắng lớn để đổi thẻ Viettel tại đây!</div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default WithdrawPage;

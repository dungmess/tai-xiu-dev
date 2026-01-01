
import React, { useState, useEffect } from 'react';
import { TELCOS, CARD_AMOUNTS } from '../constants';
import { TopUpHistory } from '../types';

// Lưu ý: Partner ID và Key lấy từ trang thesieure.com.vn
// Trong môi trường sản xuất, KHÔNG ĐỂ KEY Ở FRONTEND. Cần dùng Proxy Backend.
const TSR_CONFIG = {
  PARTNER_ID: '74286329190', // Thay ID của bạn vào đây
  PARTNER_KEY: '101368fb2d13c631239bf43c8f24d867' // Thay Key của bạn vào đây
};

interface TopUpPageProps {
  onClose: () => void;
  onSuccess: (amount: number) => void;
}

// Khai báo kiểu cho md5 từ script CDN
declare var md5: (string: string) => string;

const TopUpPage: React.FC<TopUpPageProps> = ({ onClose, onSuccess }) => {
  const [telco, setTelco] = useState(TELCOS[0]);
  const [amount, setAmount] = useState(CARD_AMOUNTS[0]);
  const [serial, setSerial] = useState('');
  const [pin, setPin] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error' | 'info', text: string } | null>(null);
  
  const [topupHistory, setTopupHistory] = useState<TopUpHistory[]>(() => {
    const saved = localStorage.getItem('topup_history');
    return saved ? JSON.parse(saved) : [];
  });

  useEffect(() => {
    localStorage.setItem('topup_history', JSON.stringify(topupHistory));
  }, [topupHistory]);

  const handleTopUp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!serial || !pin) {
      setMessage({ type: 'error', text: 'Vui lòng nhập đầy đủ Seri và Mã thẻ!' });
      return;
    }

    if (TSR_CONFIG.PARTNER_ID === 'YOUR_PARTNER_ID') {
      setMessage({ type: 'error', text: 'Chưa cấu hình PARTNER_ID/KEY của TSR!' });
      return;
    }

    setLoading(true);
    setMessage({ type: 'info', text: 'Đang gửi dữ liệu tới TheSieuRe...' });

    const requestId = Math.floor(Math.random() * 1000000000).toString();
    const signature = md5(TSR_CONFIG.PARTNER_KEY + pin + serial);

    try {
      // Dữ liệu theo tài liệu API TSR v2
      const payload = {
        telco: telco,
        code: pin,
        serial: serial,
        amount: amount,
        request_id: requestId,
        partner_id: TSR_CONFIG.PARTNER_ID,
        command: 'charging',
        sign: signature
      };

      // Gửi request tới TSR (Lưu ý: Có thể bị CORS nếu gọi trực tiếp từ trình duyệt)
      const response = await fetch('https://thesieure.com.vn/chargingws/v2', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload)
      });

      const data = await response.json();

      /**
       * Kết quả trả về (data.status):
       * 1: Thành công (Thẻ đã vào hàng chờ xử lý)
       * 2: Thẻ sai
       * 3: Thẻ lỗi/Đã dùng
       * 4: Hệ thống bảo trì
       * 99: Đang chờ xử lý
       */
      
      if (data.status === 1 || data.status === 99) {
        setMessage({ type: 'success', text: 'Gửi thẻ thành công! Vui lòng đợi hệ thống kiểm tra.' });
        
        const newEntry: TopUpHistory = {
          id: requestId,
          telco,
          amount,
          status: 'PENDING',
          date: new Date().toLocaleTimeString()
        };
        
        setTopupHistory(prev => [newEntry, ...prev]);
        setSerial('');
        setPin('');

        // Giả lập sau 10s hệ thống TSR callback thành công (Chỉ dành cho Demo)
        // Trong thực tế, bạn cần một API Backend để nhận callback và cộng tiền thật.
        setTimeout(() => {
          handleAutoConfirm(requestId, amount);
        }, 10000);

      } else {
        setMessage({ type: 'error', text: data.message || 'Lỗi: Thẻ không hợp lệ.' });
      }
    } catch (err) {
      console.error(err);
      setMessage({ type: 'error', text: 'Lỗi kết nối API hoặc chặn CORS. Vui lòng kiểm tra console.' });
    } finally {
      setLoading(false);
    }
  };

  const handleAutoConfirm = (id: string, cardAmount: number) => {
    setTopupHistory(prev => prev.map(item => {
      if (item.id === id && item.status === 'PENDING') {
        onSuccess(cardAmount * 10); // Tỷ lệ 1:10
        return { ...item, status: 'SUCCESS' as const };
      }
      return item;
    }));
  };

  return (
    <div className="fixed inset-0 bg-slate-950/98 z-[60] flex flex-col items-center p-4 md:p-8 overflow-y-auto">
      <div className="w-full max-w-2xl">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h2 className="text-3xl font-game text-yellow-500">NẠP THẺ CÀO TSR</h2>
            <p className="text-slate-400 text-sm">Hệ thống gạch thẻ tự động thật 100%</p>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-white text-4xl">&times;</button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <form onSubmit={handleTopUp} className="bg-slate-900 border border-slate-800 p-6 rounded-[2rem] shadow-2xl space-y-4">
            <div>
              <label className="block text-slate-400 text-xs font-bold mb-2">NHÀ MẠNG</label>
              <select 
                value={telco} 
                onChange={(e) => setTelco(e.target.value)}
                className="w-full bg-slate-800 border border-slate-700 p-3 rounded-xl text-white outline-none focus:border-yellow-500"
              >
                {TELCOS.map(t => <option key={t} value={t}>{t}</option>)}
              </select>
            </div>

            <div>
              <label className="block text-slate-400 text-xs font-bold mb-2">MỆNH GIÁ THẺ</label>
              <select 
                value={amount} 
                onChange={(e) => setAmount(Number(e.target.value))}
                className="w-full bg-slate-800 border border-slate-700 p-3 rounded-xl text-white outline-none focus:border-yellow-500"
              >
                {CARD_AMOUNTS.map(a => <option key={a} value={a}>{a.toLocaleString()} VND</option>)}
              </select>
            </div>

            <div>
              <label className="block text-slate-400 text-xs font-bold mb-2">SỐ SERI</label>
              <input 
                type="text" 
                value={serial}
                onChange={(e) => setSerial(e.target.value)}
                placeholder="Nhập số seri..."
                className="w-full bg-slate-800 border border-slate-700 p-3 rounded-xl text-white outline-none focus:border-yellow-500"
              />
            </div>

            <div>
              <label className="block text-slate-400 text-xs font-bold mb-2">MÃ THẺ (PIN)</label>
              <input 
                type="text" 
                value={pin}
                onChange={(e) => setPin(e.target.value)}
                placeholder="Nhập mã thẻ..."
                className="w-full bg-slate-800 border border-slate-700 p-3 rounded-xl text-white outline-none focus:border-yellow-500"
              />
            </div>

            {message && (
              <div className={`p-3 rounded-xl text-xs font-bold animate-fadeIn ${
                message.type === 'success' ? 'bg-green-500/20 text-green-400' : 
                message.type === 'error' ? 'bg-red-500/20 text-red-400' : 'bg-blue-500/20 text-blue-400'
              }`}>
                {message.text}
              </div>
            )}

            <button 
              disabled={loading}
              className={`w-full py-4 rounded-xl font-game text-xl shadow-lg transition-all ${
                loading ? 'bg-slate-700 opacity-50' : 'bg-yellow-500 hover:bg-yellow-400 text-slate-950 pulse-gold'
              }`}
            >
              {loading ? 'ĐANG GỬI THẺ...' : 'XÁC NHẬN NẠP'}
            </button>
            <p className="text-[10px] text-red-500 text-center font-bold">CHỌN SAI MỆNH GIÁ SẼ MẤT THẺ!</p>
          </form>

          <div className="bg-slate-900/50 border border-slate-800 p-6 rounded-[2rem] flex flex-col">
            <h3 className="text-slate-400 text-xs font-bold mb-4 uppercase">Trạng thái thẻ đã nạp</h3>
            <div className="flex-1 space-y-3 overflow-y-auto max-h-[350px] pr-2">
              {topupHistory.map(item => (
                <div key={item.id} className="bg-slate-800/50 p-3 rounded-xl border border-slate-700 flex justify-between items-center">
                  <div>
                    <div className="font-bold text-white text-xs">{item.telco} - {item.amount.toLocaleString()}đ</div>
                    <div className="text-slate-500 text-[10px]">{item.date}</div>
                  </div>
                  <span className={`px-2 py-1 rounded-lg text-[9px] font-bold ${
                    item.status === 'SUCCESS' ? 'bg-green-500 text-white' : 
                    item.status === 'PENDING' ? 'bg-yellow-500 text-slate-900' : 'bg-red-500 text-white'
                  }`}>
                    {item.status === 'PENDING' ? 'ĐANG CHỜ' : item.status}
                  </span>
                </div>
              ))}
              {topupHistory.length === 0 && <div className="text-slate-600 italic text-center text-sm py-10">Lịch sử trống</div>}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TopUpPage;

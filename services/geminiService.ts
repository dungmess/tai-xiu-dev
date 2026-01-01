
import { GoogleGenAI } from "@google/genai";

export const generateBetCommentary = async (result: string, total: number, dice: number[], isWin: boolean, amount: number): Promise<string> => {
  // Kiểm tra an toàn biến môi trường ngay từ đầu
  const apiKey = (typeof process !== 'undefined' && process.env && process.env.API_KEY) 
    ? process.env.API_KEY 
    : null;

  if (!apiKey || typeof apiKey !== 'string' || apiKey.trim() === '') {
    console.warn("Gemini API Key is missing or invalid. Using local fallback commentary.");
    return isWin ? "Thắng lớn rồi! Bạn quả là có linh cảm tốt." : "Thua rồi, vận may đang tắc đường thôi!";
  }

  try {
    const ai = new GoogleGenAI({ apiKey });
    const prompt = `Bạn là một "Thần Bài" hài hước và am hiểu. 
    Kết quả ván Tài Xỉu vừa rồi là: ${result} (Tổng điểm: ${total}, Xúc xắc: ${dice.join(', ')}).
    Người chơi đặt cược ${amount} vàng và đã ${isWin ? 'THẮNG' : 'THUA'}.
    Hãy viết 1 câu bình luận ngắn gọn (dưới 20 từ) thật ấn tượng, có chút mỉa mai nếu thua hoặc tâng bốc nếu thắng.`;
    
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: prompt,
      config: {
        temperature: 0.9,
      }
    });

    return response.text || (isWin ? "Quá đỉnh!" : "Chia buồn nhé!");
  } catch (error) {
    // Tránh reject promise, luôn trả về string an toàn
    console.error("Gemini AI Service Error:", error);
    return isWin ? "Lộc lá đầy nhà!" : "Đen thôi, đỏ quên đi!";
  }
};

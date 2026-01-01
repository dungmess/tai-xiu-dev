
import { GoogleGenAI } from "@google/genai";

export const generateBetCommentary = async (result: string, total: number, dice: number[], isWin: boolean, amount: number): Promise<string> => {
  try {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
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

    return response.text || (isWin ? "Thắng lớn rồi!" : "Thua rồi, đừng nản!");
  } catch (error) {
    console.error("Gemini Error:", error);
    return isWin ? "Số đỏ đấy!" : "Vận đen thôi!";
  }
};

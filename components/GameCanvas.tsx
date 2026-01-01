
import React, { useEffect, useRef } from 'react';

interface GameCanvasProps {
  gameState: string;
  charX: number;
  isMoving: boolean;
  facingRight: boolean;
  tension: number;
}

const GameCanvas: React.FC<GameCanvasProps> = ({ gameState, charX, isMoving, facingRight, tension }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  // Fix: Explicitly passed undefined as an argument to satisfy TypeScript's requirement for at least one argument in useRef.
  const requestRef = useRef<number | undefined>(undefined);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const drawEnvironment = (width: number, height: number) => {
      // Sky
      const skyGrad = ctx.createLinearGradient(0, 0, 0, height * 0.4);
      skyGrad.addColorStop(0, '#0ea5e9');
      skyGrad.addColorStop(1, '#7dd3fc');
      ctx.fillStyle = skyGrad;
      ctx.fillRect(0, 0, width, height * 0.4);

      // Mountains
      ctx.fillStyle = '#64748b';
      for (let i = 0; i < 3; i++) {
        const x = i * 600 - 100;
        ctx.beginPath();
        ctx.moveTo(x, height * 0.4);
        ctx.lineTo(x + 300, height * 0.15);
        ctx.lineTo(x + 600, height * 0.4);
        ctx.fill();
      }

      // Riverbank
      ctx.fillStyle = '#22c55e';
      ctx.fillRect(0, height * 0.4, width, height * 0.15);

      // Casino Tent / Betting Zone (at a fixed position on the riverbank)
      const tentPos = 200;
      ctx.fillStyle = '#1e293b';
      ctx.fillRect(tentPos, height * 0.3, 120, 80);
      ctx.fillStyle = '#ef4444';
      ctx.beginPath();
      ctx.moveTo(tentPos - 10, height * 0.3);
      ctx.lineTo(tentPos + 60, height * 0.25);
      ctx.lineTo(tentPos + 130, height * 0.3);
      ctx.fill();
      ctx.fillStyle = 'white';
      ctx.font = 'bold 12px Arial';
      ctx.fillText('TÀI XỈU', tentPos + 35, height * 0.35);

      // Water
      const waterGrad = ctx.createLinearGradient(0, height * 0.55, 0, height);
      waterGrad.addColorStop(0, '#3b82f6');
      waterGrad.addColorStop(1, '#1e3a8a');
      ctx.fillStyle = waterGrad;
      ctx.fillRect(0, height * 0.55, width, height * 0.45);
    };

    const drawCharacter = (x: number, y: number, isFishing: boolean) => {
      const bob = Math.sin(Date.now() / 150) * (isMoving ? 10 : 2);
      ctx.save();
      ctx.translate(x, y + bob);
      if (!facingRight) ctx.scale(-1, 1);
      ctx.font = '60px Arial';
      ctx.textAlign = 'center';
      ctx.fillText(isFishing ? '🎣' : '🚶‍♂️', 0, 0);
      ctx.restore();

      if (isFishing) {
          ctx.strokeStyle = '#94a3b8';
          ctx.lineWidth = 2;
          ctx.beginPath();
          const startX = x + (facingRight ? 25 : -25);
          const startY = y + bob - 40;
          ctx.moveTo(startX, startY);
          const targetX = x + (facingRight ? 150 : -150);
          const targetY = canvas.height * 0.75;
          const cpX = (startX + targetX) / 2 + (tension - 50);
          const cpY = (startY + targetY) / 2 - 50;
          ctx.quadraticCurveTo(cpX, cpY, targetX, targetY);
          ctx.stroke();
      }
    };

    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      drawEnvironment(canvas.width, canvas.height); 
      const isFishing = gameState === 'FISHING' || gameState === 'CATCHING';
      drawCharacter(charX, canvas.height * 0.48, isFishing);
      requestRef.current = requestAnimationFrame(animate);
    };

    requestRef.current = requestAnimationFrame(animate);
    return () => {
      if (requestRef.current) cancelAnimationFrame(requestRef.current);
    };
  }, [gameState, charX, isMoving, facingRight, tension]);

  return <canvas ref={canvasRef} className="w-full h-full block" width={window.innerWidth} height={window.innerHeight} />;
};

export default GameCanvas;

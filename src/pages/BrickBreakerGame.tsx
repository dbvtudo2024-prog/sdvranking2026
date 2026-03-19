
import React, { useEffect, useRef, useState, useCallback, useMemo } from 'react';
import { RotateCcw, Trophy, Heart, Play, ArrowLeft, CheckCircle2, Home } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { AuthUser, Member, UserRole } from '@/types';

interface BrickBreakerGameProps {
  onBack: () => void;
  isDarkMode?: boolean;
  user: AuthUser | null;
  members: Member[];
  onUpdateMember: (member: Member) => void;
  override?: boolean;
}

interface Ball {
  x: number;
  y: number;
  dx: number;
  dy: number;
  radius: number;
}

interface Brick {
  x: number;
  y: number;
  status: number;
  bonus?: 'multiball' | 'expand';
}

const BrickBreakerGame: React.FC<BrickBreakerGameProps> = ({ onBack, isDarkMode, user, members, onUpdateMember, override }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [gameState, setGameState] = useState<'start' | 'playing' | 'paused' | 'won' | 'lost' | 'finished'>('start');
  const [score, setScore] = useState(0);
  const [lives, setLives] = useState(3);
  const [level, setLevel] = useState(1);

  const currentMember = useMemo(() => 
    members.find(m => m.email === user?.email),
  [members, user]);

  const hasPlayedThisWeek = useMemo(() => {
    if (override) return false;
    if (!currentMember?.scores) return false;
    
    const now = new Date();
    const day = now.getDay();
    // Saturday (6) is the start of the week
    const diff = (day + 1) % 7;
    const saturday = new Date(now);
    saturday.setDate(now.getDate() - diff);
    saturday.setHours(0, 0, 0, 0);

    return (currentMember.scores || []).some(s => 
      s.gameId === 'brickBreakerGame' && new Date(s.date) >= saturday
    );
  }, [currentMember, override]);

  // Game constants
  const PADDLE_HEIGHT = 10;
  const INITIAL_PADDLE_WIDTH = 75;
  const BALL_RADIUS = 6;
  const BRICK_ROW_COUNT = 5;
  const BRICK_COLUMN_COUNT = 8;
  const BRICK_PADDING = 10;
  const BRICK_OFFSET_TOP = 30;
  const BRICK_OFFSET_LEFT = 20;

  // Mutable game state for the loop
  const paddleRef = useRef({ x: 0, width: INITIAL_PADDLE_WIDTH });
  const ballsRef = useRef<Ball[]>([]);
  const bricksRef = useRef<Brick[][]>([]);
  const animationFrameRef = useRef<number>(0);
  const bonusTimerRef = useRef<NodeJS.Timeout | null>(null);

  const initBricks = useCallback(() => {
    if (!canvasRef.current) return;
    const bricks: Brick[][] = [];
    const brickWidth = (canvasRef.current.width - BRICK_OFFSET_LEFT * 2 - (BRICK_COLUMN_COUNT - 1) * BRICK_PADDING) / BRICK_COLUMN_COUNT;
    const brickHeight = 20;

    for (let c = 0; c < BRICK_COLUMN_COUNT; c++) {
      bricks[c] = [];
      for (let r = 0; r < BRICK_ROW_COUNT; r++) {
        const bonusRand = Math.random();
        let bonus: 'multiball' | 'expand' | undefined = undefined;
        if (bonusRand < 0.05) bonus = 'multiball';
        else if (bonusRand < 0.1) bonus = 'expand';

        bricks[c][r] = { 
          x: c * (brickWidth + BRICK_PADDING) + BRICK_OFFSET_LEFT, 
          y: r * (brickHeight + BRICK_PADDING) + BRICK_OFFSET_TOP, 
          status: 1,
          bonus
        };
      }
    }
    bricksRef.current = bricks;
  }, []);

  const resetBall = useCallback(() => {
    if (!canvasRef.current) return;
    ballsRef.current = [{
      x: canvasRef.current.width / 2,
      y: canvasRef.current.height - 30,
      dx: 3 * (Math.random() > 0.5 ? 1 : -1),
      dy: -3,
      radius: BALL_RADIUS
    }];
    paddleRef.current.x = (canvasRef.current.width - paddleRef.current.width) / 2;
  }, []);

  const startGame = () => {
    setGameState('playing');
    if (score === 0) {
      initBricks();
    }
    resetBall();
  };

  const restartGame = () => {
    setScore(0);
    setLives(3);
    setLevel(1);
    paddleRef.current.width = INITIAL_PADDLE_WIDTH;
    if (bonusTimerRef.current) clearTimeout(bonusTimerRef.current);
    initBricks();
    resetBall();
    setGameState('playing');
  };

  const handleFinish = useCallback(() => {
    if (!currentMember) return;

    const points = 50; 
    const newScore = {
      gameId: 'brickBreakerGame',
      points,
      date: new Date().toISOString()
    };

    const updatedMember = {
      ...currentMember,
      scores: [...(currentMember.scores || []), newScore]
    };

    onUpdateMember(updatedMember);
    setGameState('finished');
  }, [currentMember, onUpdateMember]);

  useEffect(() => {
    if (hasPlayedThisWeek) return;
    if (!canvasRef.current) return;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d')!;

    const drawBall = (ball: Ball) => {
      ctx.beginPath();
      ctx.arc(ball.x, ball.y, ball.radius, 0, Math.PI * 2);
      ctx.fillStyle = "#0061f2";
      ctx.fill();
      ctx.closePath();
    };

    const drawPaddle = () => {
      ctx.beginPath();
      ctx.rect(paddleRef.current.x, canvas.height - PADDLE_HEIGHT - 5, paddleRef.current.width, PADDLE_HEIGHT);
      ctx.fillStyle = "#0061f2";
      ctx.fill();
      ctx.strokeStyle = "rgba(255,255,255,0.5)";
      ctx.lineWidth = 2;
      ctx.stroke();
      ctx.closePath();
    };

    const drawBricks = () => {
      const brickWidth = (canvas.width - BRICK_OFFSET_LEFT * 2 - (BRICK_COLUMN_COUNT - 1) * BRICK_PADDING) / BRICK_COLUMN_COUNT;
      const brickHeight = 20;

      for (let c = 0; c < BRICK_COLUMN_COUNT; c++) {
        for (let r = 0; r < BRICK_ROW_COUNT; r++) {
          const b = bricksRef.current[c][r];
          if (b.status === 1) {
            ctx.beginPath();
            ctx.rect(b.x, b.y, brickWidth, brickHeight);
            
            if (b.bonus === 'multiball') ctx.fillStyle = "#f59e0b"; // Amber
            else if (b.bonus === 'expand') ctx.fillStyle = "#10b981"; // Emerald
            else {
              const colors = ["#ef4444", "#3b82f6", "#22c55e", "#eab308", "#a855f7"];
              ctx.fillStyle = colors[r % colors.length];
            }
            
            ctx.fill();
            ctx.strokeStyle = "rgba(0,0,0,0.1)";
            ctx.stroke();
            ctx.closePath();
          }
        }
      }
    };

    const collisionDetection = () => {
      const brickWidth = (canvas.width - BRICK_OFFSET_LEFT * 2 - (BRICK_COLUMN_COUNT - 1) * BRICK_PADDING) / BRICK_COLUMN_COUNT;
      const brickHeight = 20;

      for (let c = 0; c < BRICK_COLUMN_COUNT; c++) {
        for (let r = 0; r < BRICK_ROW_COUNT; r++) {
          const b = bricksRef.current[c][r];
          if (b.status === 1) {
            ballsRef.current.forEach(ball => {
              if (ball.x > b.x && ball.x < b.x + brickWidth && ball.y > b.y && ball.y < b.y + brickHeight) {
                ball.dy = -ball.dy;
                b.status = 0;
                setScore(s => s + 10);

                // Handle Bonus
                if (b.bonus === 'multiball') {
                  ballsRef.current.push(
                    { ...ball, dx: ball.dx + 1, dy: -ball.dy },
                    { ...ball, dx: ball.dx - 1, dy: -ball.dy }
                  );
                } else if (b.bonus === 'expand') {
                  paddleRef.current.width = INITIAL_PADDLE_WIDTH * 1.5;
                  if (bonusTimerRef.current) clearTimeout(bonusTimerRef.current);
                  bonusTimerRef.current = setTimeout(() => {
                    paddleRef.current.width = INITIAL_PADDLE_WIDTH;
                  }, 10000);
                }

                // Check Win
                const activeBricks = bricksRef.current.flat().filter(br => br.status === 1).length;
                if (activeBricks === 0) {
                  handleFinish();
                }
              }
            });
          }
        }
      }
    };

    const draw = () => {
      if (gameState !== 'playing') return;

      ctx.clearRect(0, 0, canvas.width, canvas.height);
      drawBricks();
      drawPaddle();
      ballsRef.current.forEach(drawBall);
      collisionDetection();

      const newBalls: Ball[] = [];
      ballsRef.current.forEach(ball => {
        // Wall collisions
        if (ball.x + ball.dx > canvas.width - ball.radius || ball.x + ball.dx < ball.radius) {
          ball.dx = -ball.dx;
        }
        if (ball.y + ball.dy < ball.radius) {
          ball.dy = -ball.dy;
        } else if (ball.y + ball.dy > canvas.height - ball.radius - PADDLE_HEIGHT - 5) {
          if (ball.x > paddleRef.current.x && ball.x < paddleRef.current.x + paddleRef.current.width) {
            // Hit paddle - change angle based on where it hit
            const hitPos = (ball.x - (paddleRef.current.x + paddleRef.current.width / 2)) / (paddleRef.current.width / 2);
            ball.dx = hitPos * 5;
            ball.dy = -ball.dy;
          } else if (ball.y + ball.dy > canvas.height - ball.radius) {
            // Ball lost
            return; // Don't add to newBalls
          }
        }

        ball.x += ball.dx;
        ball.y += ball.dy;
        newBalls.push(ball);
      });

      ballsRef.current = newBalls;

      if (ballsRef.current.length === 0) {
        setLives(l => {
          if (l <= 1) {
            setGameState('lost');
            return 0;
          }
          resetBall();
          return l - 1;
        });
      }

      animationFrameRef.current = requestAnimationFrame(draw);
    };

    if (gameState === 'playing') {
      animationFrameRef.current = requestAnimationFrame(draw);
    }

    return () => cancelAnimationFrame(animationFrameRef.current);
  }, [gameState, resetBall, initBricks, hasPlayedThisWeek, handleFinish]);

  const handleMouseMove = (e: React.MouseEvent | React.TouchEvent) => {
    if (!canvasRef.current) return;
    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    let clientX = 0;
    if ('touches' in e) {
      clientX = e.touches[0].clientX;
    } else {
      clientX = e.clientX;
    }
    const relativeX = clientX - rect.left;
    if (relativeX > 0 && relativeX < canvas.width) {
      paddleRef.current.x = relativeX - paddleRef.current.width / 2;
    }
  };

  if (hasPlayedThisWeek) {
    return (
      <div className="flex flex-col items-center justify-center h-full p-6 text-center bg-slate-900">
        <div className="w-24 h-24 bg-green-900/30 rounded-full flex items-center justify-center mb-6">
          <CheckCircle2 size={48} className="text-green-400" />
        </div>
        <h2 className="text-2xl font-black text-white uppercase mb-2">Missão Cumprida!</h2>
        <p className="text-slate-400 font-bold mb-8 uppercase tracking-widest text-sm">
          Você já completou este desafio esta semana. Volte na próxima segunda!
        </p>
        <button 
          onClick={onBack}
          className="w-full max-w-xs py-4 bg-white text-slate-900 rounded-2xl font-black uppercase tracking-widest shadow-lg active:scale-95 transition-all flex items-center justify-center gap-2"
        >
          <Home size={20} />
          Voltar ao Início
        </button>
      </div>
    );
  }

  if (gameState === 'finished') {
    return (
      <div className="flex flex-col items-center justify-center h-full p-6 text-center bg-slate-900">
        <motion.div 
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          className="w-24 h-24 bg-yellow-400 rounded-full flex items-center justify-center mb-6 shadow-lg"
        >
          <Trophy size={48} className="text-slate-900" />
        </motion.div>
        <h2 className="text-3xl font-black text-white uppercase mb-2">Parabéns!</h2>
        <p className="text-slate-400 font-bold mb-8 uppercase tracking-widest text-sm">
          Você destruiu todos os blocos e ganhou 50 pontos!
        </p>
        <button 
          onClick={onBack}
          className="w-full max-w-xs py-4 bg-blue-600 text-white rounded-2xl font-black uppercase tracking-widest shadow-lg active:scale-95 transition-all"
        >
          Finalizar
        </button>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full bg-slate-900 p-4 text-white overflow-hidden">
      <div className="flex items-center justify-between mb-4">
        <div className="flex flex-col">
          <h1 className="text-lg font-black uppercase tracking-tight">Destruir Blocos</h1>
          <div className="flex items-center gap-4 mt-1">
            <span className="text-xs font-bold text-blue-400 uppercase tracking-widest">Score: {score}</span>
            <div className="flex items-center gap-1">
              {[...Array(3)].map((_, i) => (
                <Heart 
                  key={i} 
                  size={12} 
                  className={i < lives ? "text-red-500 fill-red-500" : "text-slate-700"} 
                />
              ))}
            </div>
          </div>
        </div>
        <div className="flex gap-2">
          <button 
            onClick={restartGame}
            className="p-2 bg-slate-800 rounded-xl active:scale-90 transition-all"
          >
            <RotateCcw size={18} />
          </button>
          <button 
            onClick={onBack}
            className="p-2 bg-slate-800 rounded-xl active:scale-90 transition-all"
          >
            <ArrowLeft size={18} />
          </button>
        </div>
      </div>

      <div className="flex-1 relative flex items-center justify-center bg-slate-950 rounded-3xl border-4 border-slate-800 overflow-hidden">
        <canvas 
          ref={canvasRef}
          width={350}
          height={500}
          onMouseMove={handleMouseMove}
          onTouchMove={handleMouseMove}
          className="max-w-full max-h-full touch-none"
        />

        <AnimatePresence>
          {gameState === 'start' && (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-black/80 flex flex-col items-center justify-center p-8 text-center"
            >
              <div className="w-20 h-20 bg-blue-600 rounded-3xl flex items-center justify-center mb-6 shadow-xl rotate-12">
                <Play size={40} fill="white" />
              </div>
              <h2 className="text-2xl font-black uppercase mb-2">Pronto?</h2>
              <p className="text-slate-400 text-xs font-bold uppercase tracking-widest mb-8">
                Destrua todos os blocos e pegue os bônus!
              </p>
              <button 
                onClick={startGame}
                className="px-12 py-4 bg-blue-600 rounded-2xl font-black uppercase tracking-widest shadow-lg active:scale-95 transition-all"
              >
                Começar
              </button>
            </motion.div>
          )}

          {(gameState === 'won' || gameState === 'lost') && (
            <motion.div 
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="absolute inset-0 bg-black/90 flex flex-col items-center justify-center p-8 text-center"
            >
              <div className={`w-20 h-20 ${gameState === 'won' ? 'bg-yellow-400' : 'bg-red-500'} rounded-full flex items-center justify-center mb-6 shadow-lg`}>
                {gameState === 'won' ? <Trophy size={40} /> : <RotateCcw size={40} />}
              </div>
              <h2 className="text-3xl font-black uppercase mb-2">
                {gameState === 'won' ? 'Vitória!' : 'Fim de Jogo'}
              </h2>
              <p className="text-slate-400 font-bold mb-8 uppercase tracking-widest text-sm">
                Pontuação Final: {score}
              </p>
              <button 
                onClick={restartGame}
                className="w-full py-4 bg-blue-600 rounded-2xl font-black uppercase tracking-widest shadow-lg active:scale-95 transition-all"
              >
                Tentar Novamente
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <div className="mt-4 grid grid-cols-2 gap-3">
        <div className="bg-slate-800/50 p-3 rounded-2xl flex items-center gap-3">
          <div className="w-3 h-3 bg-amber-500 rounded-full" />
          <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Multi-Bola</span>
        </div>
        <div className="bg-slate-800/50 p-3 rounded-2xl flex items-center gap-3">
          <div className="w-3 h-3 bg-emerald-500 rounded-full" />
          <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Barra Larga</span>
        </div>
      </div>
    </div>
  );
};

export default BrickBreakerGame;


import React, { useEffect, useRef, useState, useCallback, useMemo } from 'react';
import { RotateCcw, Trophy, Heart, Play, ArrowLeft, CheckCircle2, Home, Gamepad2 } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { AuthUser, Member, Score, UserRole } from '@/types';
import GameHeader from '@/components/GameHeader';
import GameStatsBar from '@/components/GameStatsBar';

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
  const [gameState, setGameState] = useState<'start' | 'playing' | 'paused' | 'won' | 'lost' | 'finished' | 'won_level'>('start');
  const [score, setScore] = useState(0);
  const [lives, setLives] = useState(3);
  const [level, setLevel] = useState(1);

  const currentMember = useMemo(() => 
    members.find(m => m.id === user?.id || (m.name.trim().toLowerCase() === user?.name?.trim().toLowerCase())),
  [members, user]);

  const isAdmin = useMemo(() => 
    user?.role === UserRole.LEADERSHIP || user?.email === 'ronaldosonic@gmail.com',
  [user]);

  // Game constants
  const PADDLE_HEIGHT = 10;
  const INITIAL_PADDLE_WIDTH = 75;
  const BALL_RADIUS = 6;
  const BRICK_COLUMN_COUNT = 8;
  const BRICK_PADDING = 8;
  const BRICK_OFFSET_TOP = 30;
  const BRICK_OFFSET_LEFT = 15;

  const LEVEL_MAPS = [
    // Nível 1: Coração (Vermelho/Azul)
    [
      [0, 1, 1, 0, 0, 1, 1, 0],
      [1, 1, 1, 1, 1, 1, 1, 1],
      [1, 1, 1, 1, 1, 1, 1, 1],
      [0, 1, 1, 1, 1, 1, 1, 0],
      [0, 0, 1, 1, 1, 1, 0, 0],
      [0, 0, 0, 1, 1, 0, 0, 0]
    ],
    // Nível 2: Escudo com Centro de Aço
    [
      [1, 1, 1, 1, 1, 1, 1, 1],
      [1, 1, 2, 2, 2, 2, 1, 1],
      [1, 2, -1, 1, 1, -1, 2, 1],
      [1, 2, 1, 1, 1, 1, 2, 1],
      [0, 1, 2, 2, 2, 2, 1, 0],
      [0, 0, 1, 1, 1, 1, 0, 0]
    ],
    // Nível 3: O X de Obstáculos
    [
      [-1, 1, 0, 0, 0, 0, 1, -1],
      [1, -1, 1, 1, 1, 1, -1, 1],
      [0, 1, -1, 2, 2, -1, 1, 0],
      [0, 1, 2, -1, -1, 2, 1, 0],
      [1, -1, 1, 1, 1, 1, -1, 1],
      [-1, 1, 0, 0, 0, 0, 1, -1]
    ],
    // Nível 4: Losangos de Ouro
    [
      [0, 0, 0, 1, 1, 0, 0, 0],
      [0, 0, 1, 2, 2, 1, 0, 0],
      [0, 1, 2, -1, -1, 2, 1, 0],
      [1, 2, -1, 0, 0, -1, 2, 1],
      [0, 1, 2, -1, -1, 2, 1, 0],
      [0, 0, 1, 2, 2, 1, 0, 0],
      [0, 0, 0, 1, 1, 0, 0, 0]
    ],
    // Nível 5: Invasão Espacial (Robot face)
    [
      [1, 0, 0, 0, 0, 0, 0, 1],
      [0, 1, 0, 0, 0, 0, 1, 0],
      [1, 1, 1, 1, 1, 1, 1, 1],
      [1, -1, 1, -1, -1, 1, -1, 1],
      [1, 1, 1, 1, 1, 1, 1, 1],
      [0, 1, 2, 2, 2, 2, 1, 0],
      [0, 0, 1, 1, 1, 1, 0, 0]
    ]
  ];

  // Mutable game state for the loop
  const paddleRef = useRef({ x: 0, width: INITIAL_PADDLE_WIDTH });
  const ballsRef = useRef<Ball[]>([]);
  const bricksRef = useRef<Brick[][]>([]);
  const animationFrameRef = useRef<number>(0);
  const bonusTimerRef = useRef<any>(null);

  const initBricks = useCallback(() => {
    if (!canvasRef.current) return;
    const mapIndex = (level - 1) % LEVEL_MAPS.length;
    const currentMap = LEVEL_MAPS[mapIndex];
    const bricks: Brick[][] = [];
    const brickWidth = (canvasRef.current.width - BRICK_OFFSET_LEFT * 2 - (BRICK_COLUMN_COUNT - 1) * BRICK_PADDING) / BRICK_COLUMN_COUNT;
    const brickHeight = 18;

    for (let c = 0; c < BRICK_COLUMN_COUNT; c++) {
      bricks[c] = [];
      for (let r = 0; r < currentMap.length; r++) {
        const brickType = currentMap[r][c];
        if (brickType === 0) {
           bricks[c][r] = { x: 0, y: 0, status: 0 };
           continue;
        }

        const bonusRand = Math.random();
        let bonus: 'multiball' | 'expand' | undefined = undefined;
        if (brickType > 0) { // Only destructive bricks have bonus
          if (bonusRand < 0.08) bonus = 'multiball';
          else if (bonusRand < 0.15) bonus = 'expand';
        }

        bricks[c][r] = { 
          x: c * (brickWidth + BRICK_PADDING) + BRICK_OFFSET_LEFT, 
          y: r * (brickHeight + BRICK_PADDING) + BRICK_OFFSET_TOP, 
          status: brickType,
          bonus
        };
      }
    }
    bricksRef.current = bricks;
  }, [level]);

  const resetBall = useCallback(() => {
    if (!canvasRef.current) return;
    const speed = 3.5 + (level - 1) * 0.5; // Increasing speed more aggressively
    ballsRef.current = [{
      x: canvasRef.current.width / 2,
      y: canvasRef.current.height - 35,
      dx: (speed * 0.7) * (Math.random() > 0.5 ? 1 : -1),
      dy: -speed,
      radius: BALL_RADIUS
    }];
    paddleRef.current.x = (canvasRef.current.width - paddleRef.current.width) / 2;
  }, [level]);

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
    // Apenas encerra o jogo sem salvar no perfil do membro para não entrar no ranking
    setGameState('finished');
  }, []);

  useEffect(() => {
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
      const brickHeight = 18;
      const mapIndex = (level - 1) % LEVEL_MAPS.length;
      const currentMapRows = LEVEL_MAPS[mapIndex].length;

      for (let c = 0; c < BRICK_COLUMN_COUNT; c++) {
        for (let r = 0; r < currentMapRows; r++) {
          const b = bricksRef.current[c][r];
          if (!b || b.status === 0) continue;
          
          ctx.beginPath();
          // ctx.roundRect is supported in modern browsers
          if (ctx.roundRect) {
            ctx.roundRect(b.x, b.y, brickWidth, brickHeight, 4);
          } else {
            ctx.rect(b.x, b.y, brickWidth, brickHeight);
          }
          
          if (b.status === -1) {
            ctx.fillStyle = "#475569"; // Obstáculo 
            ctx.strokeStyle = "#94a3b8";
          } else if (b.bonus === 'multiball') {
            ctx.fillStyle = "#f59e0b"; // Amber
            ctx.strokeStyle = "#fbbf24";
          } else if (b.bonus === 'expand') {
            ctx.fillStyle = "#10b981"; // Emerald
            ctx.strokeStyle = "#34d399";
          } else {
            if (b.status === 2) {
              ctx.fillStyle = "#7c3aed"; // Violet
              ctx.strokeStyle = "#a78bfa";
            } else {
              const colors = ["#ef4444", "#3b82f6", "#22c55e", "#eab308", "#a855f7"];
              ctx.fillStyle = colors[r % colors.length];
              ctx.strokeStyle = "rgba(255,255,255,0.2)";
            }
          }
          
          ctx.fill();
          ctx.lineWidth = 1;
          ctx.stroke();
          ctx.closePath();
        }
      }
    };

    const collisionDetection = () => {
      const brickWidth = (canvas.width - BRICK_OFFSET_LEFT * 2 - (BRICK_COLUMN_COUNT - 1) * BRICK_PADDING) / BRICK_COLUMN_COUNT;
      const brickHeight = 18;
      const mapIndex = (level - 1) % LEVEL_MAPS.length;
      const currentMapRows = LEVEL_MAPS[mapIndex].length;

      for (let c = 0; c < BRICK_COLUMN_COUNT; c++) {
        for (let r = 0; r < currentMapRows; r++) {
          const b = bricksRef.current[c][r];
          if (!b || b.status === 0) continue;

          ballsRef.current.forEach(ball => {
            if (ball.x + ball.radius > b.x && ball.x - ball.radius < b.x + brickWidth && 
                ball.y + ball.radius > b.y && ball.y - ball.radius < b.y + brickHeight) {
              
              const fromTop = Math.abs(ball.y - b.y);
              const fromBottom = Math.abs(ball.y - (b.y + brickHeight));
              const fromLeft = Math.abs(ball.x - b.x);
              const fromRight = Math.abs(ball.x - (b.x + brickWidth));
              const min = Math.min(fromTop, fromBottom, fromLeft, fromRight);

              if (min === fromTop || min === fromBottom) ball.dy = -ball.dy;
              else ball.dx = -ball.dx;

              if (b.status > 0) {
                b.status--;
                if (b.status === 0) {
                  setScore(s => s + (b.bonus ? 25 : 10));
                  if (b.bonus === 'multiball') {
                    ballsRef.current.push(
                      { ...ball, dx: ball.dx + 1.5, dy: -ball.dy },
                      { ...ball, dx: ball.dx - 1.5, dy: -ball.dy }
                    );
                  } else if (b.bonus === 'expand') {
                    paddleRef.current.width = INITIAL_PADDLE_WIDTH * 1.5;
                    if (bonusTimerRef.current) clearTimeout(bonusTimerRef.current);
                    bonusTimerRef.current = setTimeout(() => {
                      paddleRef.current.width = INITIAL_PADDLE_WIDTH;
                    }, 10000);
                  }
                } else {
                  setScore(s => s + 5);
                }
              }
            }
          });
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
        if (ball.x + ball.dx > canvas.width - ball.radius || ball.x + ball.dx < ball.radius) {
          ball.dx = -ball.dx;
        }
        if (ball.y + ball.dy < ball.radius) {
          ball.dy = -ball.dy;
        } else if (ball.y + ball.dy > canvas.height - ball.radius - PADDLE_HEIGHT - 5) {
          if (ball.x > paddleRef.current.x && ball.x < paddleRef.current.x + paddleRef.current.width) {
            const hitPos = (ball.x - (paddleRef.current.x + paddleRef.current.width / 2)) / (paddleRef.current.width / 2);
            ball.dx = hitPos * 5;
            ball.dy = -ball.dy;
          } else if (ball.y + ball.dy > canvas.height - ball.radius) {
            return;
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

      const activeBricks = bricksRef.current.flat().filter(br => br.status > 0).length;
      if (activeBricks === 0) {
        setGameState('won_level');
      }

      animationFrameRef.current = requestAnimationFrame(draw);
    };

    if (gameState === 'playing') {
      animationFrameRef.current = requestAnimationFrame(draw);
    }

    return () => cancelAnimationFrame(animationFrameRef.current);
  }, [gameState, resetBall, initBricks, handleFinish]);

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

  const nextLevel = () => {
    setLevel(l => l + 1);
    setGameState('playing');
  };

  useEffect(() => {
    if (gameState === 'playing') {
      initBricks();
      resetBall();
    }
  }, [level, initBricks, resetBall, gameState]);

  return (
    <div className="flex flex-col h-full bg-slate-900 text-white overflow-hidden">
      <GameHeader 
        title="Quebra-Tudo"
        user={user}
        stats={[
          { label: 'Nível', value: level },
          { label: 'Pontos', value: score },
          { label: 'Vidas', value: lives }
        ]}
        onRefresh={restartGame}
        onBack={onBack}
      />
      <GameStatsBar stats={[
        { label: 'Nível', value: level },
        { label: 'Pontos', value: score },
        { label: 'Vidas', value: lives }
      ]} />

      <div className="flex-1 relative flex items-center justify-center bg-slate-950 rounded-b-3xl border-x-4 border-b-4 border-slate-800 overflow-hidden">
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
              <div className="flex flex-col gap-3 w-full">
                <button 
                  onClick={startGame}
                  className="w-full py-4 bg-blue-600 rounded-2xl font-black uppercase tracking-widest shadow-lg active:scale-95 transition-all"
                >
                  Começar
                </button>
                <button 
                  onClick={onBack}
                  className="w-full py-3 bg-slate-800 text-slate-400 rounded-2xl font-black uppercase tracking-widest text-xs active:scale-95 transition-all"
                >
                  Voltar
                </button>
              </div>
            </motion.div>
          )}

          {(gameState === 'won' || gameState === 'lost' || gameState === 'won_level') && (
            <motion.div 
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="absolute inset-0 bg-black/90 flex flex-col items-center justify-center p-8 text-center"
            >
              <div className={`w-20 h-20 ${gameState === 'lost' ? 'bg-red-500' : 'bg-yellow-400'} rounded-full flex items-center justify-center mb-6 shadow-lg text-white font-black`}>
                {gameState === 'lost' ? <RotateCcw size={40} /> : <Trophy size={40} />}
              </div>
              <h2 className="text-3xl font-black uppercase mb-2">
                {gameState === 'won_level' ? 'Nível Concluído!' : (gameState === 'won' ? 'Vitória!' : 'Fim de Jogo')}
              </h2>
              <p className="text-slate-400 font-bold mb-8 uppercase tracking-widest text-sm">
                {gameState === 'won_level' ? `Prepare-se para o Nível ${level}` : `Pontuação Final: ${score}`}
              </p>
              
              <div className="flex flex-col gap-3 w-full">
                <button 
                  onClick={gameState === 'won_level' ? nextLevel : restartGame}
                  className="w-full py-4 bg-blue-600 rounded-2xl font-black uppercase tracking-widest shadow-lg active:scale-95 transition-all text-sm"
                >
                  {gameState === 'won_level' ? 'Próximo Nível' : 'Tentar Novamente'}
                </button>
                {(gameState === 'won' || gameState === 'won_level') && (
                  <button 
                    onClick={handleFinish}
                    className="w-full py-3 bg-green-600 rounded-2xl font-black uppercase tracking-widest text-xs active:scale-95 transition-all"
                  >
                    Salvar e Sair
                  </button>
                )}
              </div>
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

import React, { useEffect, useRef, useState } from 'react';
import { toast } from 'sonner';

type Direction = 'UP' | 'DOWN' | 'LEFT' | 'RIGHT';
type Position = { x: number; y: number };

interface SnakeGameProps {
  width: number;
  height: number;
  controls: {
    up: boolean;
    down: boolean;
    left: boolean;
    right: boolean;
  };
  isActive: boolean;
  onGameOver: (score: number) => void;
}

const CELL_SIZE = 20;
const GAME_SPEED = 150;

const SnakeGame: React.FC<SnakeGameProps> = ({ 
  width, 
  height,
  controls,
  isActive,
  onGameOver
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [direction, setDirection] = useState<Direction>('RIGHT');
  const [snake, setSnake] = useState<Position[]>([
    { x: 5, y: 5 },
    { x: 4, y: 5 },
    { x: 3, y: 5 }
  ]);
  const [food, setFood] = useState<Position>({ x: 10, y: 10 });
  const [score, setScore] = useState(0);
  const [gameOver, setGameOver] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  
  // Game loop using requestAnimationFrame
  const lastRenderTimeRef = useRef(0);
  const animationFrameIdRef = useRef(0);
  
  // Handle control inputs
  useEffect(() => {
    if (!isActive || gameOver || isPaused) return;
    
    if (controls.up && direction !== 'DOWN') {
      setDirection('UP');
    } else if (controls.down && direction !== 'UP') {
      setDirection('DOWN');
    } else if (controls.left && direction !== 'RIGHT') {
      setDirection('LEFT');
    } else if (controls.right && direction !== 'LEFT') {
      setDirection('RIGHT');
    }
  }, [controls, isActive, gameOver, isPaused]);
  
  // Generate random food position
  const generateFood = (): Position => {
    const gridWidth = Math.floor(width / CELL_SIZE);
    const gridHeight = Math.floor(height / CELL_SIZE);
    
    const x = Math.floor(Math.random() * gridWidth);
    const y = Math.floor(Math.random() * gridHeight);
    
    // Make sure food doesn't spawn on snake
    for (const segment of snake) {
      if (segment.x === x && segment.y === y) {
        return generateFood();
      }
    }
    
    return { x, y };
  };
  
  // Game logic
  const updateGame = () => {
    if (gameOver || isPaused || !isActive) return;
    
    const newSnake = [...snake];
    const head = { ...newSnake[0] };
    
    // Move head based on direction
    switch (direction) {
      case 'UP':
        head.y -= 1;
        break;
      case 'DOWN':
        head.y += 1;
        break;
      case 'LEFT':
        head.x -= 1;
        break;
      case 'RIGHT':
        head.x += 1;
        break;
    }
    
    // Check for collision with walls
    const gridWidth = Math.floor(width / CELL_SIZE);
    const gridHeight = Math.floor(height / CELL_SIZE);
    
    if (
      head.x < 0 || 
      head.x >= gridWidth || 
      head.y < 0 || 
      head.y >= gridHeight
    ) {
      setGameOver(true);
      onGameOver(score);
      toast.error("Game Over! You hit the wall!");
      return;
    }
    
    // Check for collision with self
    for (let i = 0; i < newSnake.length; i++) {
      if (head.x === newSnake[i].x && head.y === newSnake[i].y) {
        setGameOver(true);
        onGameOver(score);
        toast.error("Game Over! You hit yourself!");
        return;
      }
    }
    
    // Check for collision with food
    if (head.x === food.x && head.y === food.y) {
      setScore(score + 10);
      setFood(generateFood());
      // Don't remove tail to grow the snake
    } else {
      // Remove tail to maintain length
      newSnake.pop();
    }
    
    // Add new head to the front of the snake
    newSnake.unshift(head);
    setSnake(newSnake);
  };
  
  // Render the game
  const renderGame = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    // Clear canvas
    ctx.fillStyle = 'black';
    ctx.fillRect(0, 0, width, height);
    
    // Draw snake
    ctx.fillStyle = '#9D4EDD'; // Arcade purple
    snake.forEach((segment, index) => {
      if (index === 0) {
        // Head with gradient fill
        const gradient = ctx.createLinearGradient(
          segment.x * CELL_SIZE,
          segment.y * CELL_SIZE,
          segment.x * CELL_SIZE + CELL_SIZE,
          segment.y * CELL_SIZE + CELL_SIZE
        );
        gradient.addColorStop(0, '#F72585'); // Arcade pink
        gradient.addColorStop(1, '#4CC9F0'); // Arcade neon
        ctx.fillStyle = gradient;
      } else {
        ctx.fillStyle = '#9D4EDD'; // Arcade purple
      }
      ctx.fillRect(
        segment.x * CELL_SIZE,
        segment.y * CELL_SIZE,
        CELL_SIZE,
        CELL_SIZE
      );
      
      // Add inner glow effect
      ctx.strokeStyle = '#4CC9F0';
      ctx.lineWidth = 0.5;
      ctx.strokeRect(
        segment.x * CELL_SIZE + 2,
        segment.y * CELL_SIZE + 2,
        CELL_SIZE - 4,
        CELL_SIZE - 4
      );
    });
    
    // Draw food with glow effect
    ctx.fillStyle = '#F72585'; // Arcade pink
    ctx.beginPath();
    ctx.arc(
      food.x * CELL_SIZE + CELL_SIZE / 2,
      food.y * CELL_SIZE + CELL_SIZE / 2,
      CELL_SIZE / 2,
      0,
      2 * Math.PI
    );
    ctx.fill();
    
    // Add glow effect to food
    ctx.shadowColor = '#F72585';
    ctx.shadowBlur = 10;
    ctx.strokeStyle = '#F72585';
    ctx.stroke();
    
    // Reset shadow
    ctx.shadowBlur = 0;
    
    // Draw score
    ctx.fillStyle = 'white';
    ctx.font = '16px Arial';
    ctx.fillText(`Score: ${score}`, 10, 20);
    
    // Game over or pause overlay
    if (gameOver || isPaused) {
      ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
      ctx.fillRect(0, 0, width, height);
      
      ctx.fillStyle = 'white';
      ctx.font = '24px Arial';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      
      if (gameOver) {
        ctx.fillText('Game Over', width / 2, height / 2 - 30);
        ctx.fillText(`Final Score: ${score}`, width / 2, height / 2 + 10);
        ctx.font = '18px Arial';
        ctx.fillText('Gesture to try again', width / 2, height / 2 + 50);
      } else if (isPaused) {
        ctx.fillText('Paused', width / 2, height / 2);
      }
    }
  };
  
  // Main game loop
  const gameLoop = (currentTime: number) => {
    animationFrameIdRef.current = requestAnimationFrame(gameLoop);
    
    const secondsSinceLastRender = (currentTime - lastRenderTimeRef.current) / 1000;
    if (secondsSinceLastRender < GAME_SPEED / 1000) return;
    
    lastRenderTimeRef.current = currentTime;
    
    updateGame();
    renderGame();
  };
  
  // Start/stop game loop based on active state
  useEffect(() => {
    if (isActive && !gameOver) {
      animationFrameIdRef.current = requestAnimationFrame(gameLoop);
    }
    
    return () => {
      cancelAnimationFrame(animationFrameIdRef.current);
    };
  }, [isActive, gameOver, isPaused, snake, food, direction]);
  
  // Reset game
  const resetGame = () => {
    setSnake([
      { x: 5, y: 5 },
      { x: 4, y: 5 },
      { x: 3, y: 5 }
    ]);
    setDirection('RIGHT');
    setFood(generateFood());
    setScore(0);
    setGameOver(false);
    setIsPaused(false);
  };
  
  useEffect(() => {
    if (!isActive) {
      setIsPaused(true);
    } else {
      setIsPaused(false);
    }
  }, [isActive]);
  
  // Initialize on mount
  useEffect(() => {
    renderGame();
    return () => {
      cancelAnimationFrame(animationFrameIdRef.current);
    };
  }, []);
  
  return (
    <div className="relative w-full max-w-full h-auto">
      <canvas
        ref={canvasRef}
        width={width}
        height={height}
        className="w-full h-auto max-w-full rounded-md border-2 border-arcade-neon"
      />
      {gameOver && (
        <button
          onClick={resetGame}
          className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 mt-16
                     bg-arcade-purple text-white py-2 px-4 rounded-md hover:bg-arcade-blue
                     transition-colors duration-300"
        >
          Play Again
        </button>
      )}
    </div>
  );
};

export default SnakeGame;

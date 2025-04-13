import React, { useState } from 'react';
import SnakeGame from './SnakeGame';
import GestureCamera from './GestureCamera';

const ArcadeContainer: React.FC = () => {
  const [controls, setControls] = useState({
    up: false,
    down: false,
    left: false,
    right: false
  });
  const [isGameActive, setIsGameActive] = useState(false);
  const [highScore, setHighScore] = useState(0);
  
  const handleControlsChange = (newControls: typeof controls) => {
    setControls(newControls);
  };
  
  const handleGameOver = (score: number) => {
    if (score > highScore) {
      setHighScore(score);
    }
  };
  
  const toggleGameActive = () => {
    setIsGameActive(!isGameActive);
  };
  
  return (
    <div className="flex flex-col lg:flex-row gap-6 w-full px-4 py-6">
      {/* Game Section */}
      <div className="lg:w-2/3 w-full">
        <div className="flex flex-col sm:flex-row items-center justify-between mb-4">
          <h2 className="text-xl sm:text-2xl font-bold text-white text-center sm:text-left">
            <span className="arcade-text animate-glow">Snake Game</span>
          </h2>
          <div className="flex gap-2 mt-4 sm:mt-0">
            <button
              onClick={toggleGameActive}
              className="bg-arcade-purple text-white py-2 px-4 rounded-md hover:bg-arcade-blue
                        transition-colors duration-300 font-bold"
            >
              {isGameActive ? "Pause Game" : "Start Game"}
            </button>
          </div>
        </div>

        <div className="arcade-box flex flex-col items-center justify-center mb-4">
          <SnakeGame
            width={600}
            height={400}
            controls={controls}
            isActive={isGameActive}
            onGameOver={handleGameOver}
          />
          <div className="mt-4 text-center text-gray-400 text-sm">
            High Score: <span className="text-arcade-neon font-bold">{highScore}</span>
          </div>
        </div>

        <div className="text-center text-gray-400 text-sm">
          Use hand gestures to control the snake. Collect food to grow longer!
        </div>
      </div>

      {/* Camera Section */}
      <div className="lg:w-1/3 w-full">
        <h2 className="text-xl sm:text-2xl font-bold text-white mb-4 text-center sm:text-left">
          <span className="arcade-text animate-glow">Gesture Controls</span>
        </h2>

        <div className="arcade-box">
          <GestureCamera
            onControlsChange={handleControlsChange}
            isActive={true}
          />

          <div className="mt-4 space-y-2">
            <h3 className="text-arcade-neon font-bold">Control Guide:</h3>
            <ul className="space-y-2 text-sm text-gray-300">
              <li className="flex items-center gap-2">
                <span className="bg-arcade-purple px-2 py-1 rounded text-xs">↑</span>
                <span>Point up with index finger</span>
              </li>
              <li className="flex items-center gap-2">
                <span className="bg-arcade-purple px-2 py-1 rounded text-xs">↓</span>
                <span>Thumb down gesture</span>
              </li>
              <li className="flex items-center gap-2">
                <span className="bg-arcade-purple px-2 py-1 rounded text-xs">←</span>
                <span>Open palm or move hand left</span>
              </li>
              <li className="flex items-center gap-2">
                <span className="bg-arcade-purple px-2 py-1 rounded text-xs">→</span>
                <span>Closed fist or move hand right</span>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ArcadeContainer;

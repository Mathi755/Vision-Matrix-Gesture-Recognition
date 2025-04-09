
import React, { useState } from 'react';
import SnakeGame from './SnakeGame';
import GestureCamera from './GestureCamera';
import { Button } from "@/components/ui/button";
import { HelpCircle, PauseCircle, PlayCircle } from 'lucide-react';
import { 
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

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
      <div className="lg:w-2/3">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-2xl font-bold text-white">
            <span className="arcade-text animate-glow">Snake Game</span>
          </h2>
          <div className="flex gap-2">
            <Button 
              variant="outline" 
              size="icon"
              onClick={toggleGameActive}
              className="border-arcade-neon text-arcade-neon hover:bg-arcade-blue/10"
            >
              {isGameActive ? (
                <PauseCircle className="h-5 w-5" />
              ) : (
                <PlayCircle className="h-5 w-5" />
              )}
            </Button>
            
            <Dialog>
              <DialogTrigger asChild>
                <Button 
                  variant="outline" 
                  size="icon"
                  className="border-arcade-neon text-arcade-neon hover:bg-arcade-blue/10"
                >
                  <HelpCircle className="h-5 w-5" />
                </Button>
              </DialogTrigger>
              <DialogContent className="bg-arcade-dark border-arcade-purple text-white">
                <DialogHeader>
                  <DialogTitle className="text-xl arcade-text">How to Play</DialogTitle>
                  <DialogDescription className="text-gray-300">
                    Control the snake using hand gestures.
                  </DialogDescription>
                </DialogHeader>
                
                <div className="space-y-4 my-4">
                  <h3 className="font-bold text-arcade-neon">Gesture Controls:</h3>
                  <ul className="space-y-3">
                    <li className="control-instruction">
                      <span className="bg-arcade-purple px-2 py-1 rounded">↑</span>
                      <span>Point up with your index finger</span>
                    </li>
                    <li className="control-instruction">
                      <span className="bg-arcade-purple px-2 py-1 rounded">↓</span>
                      <span>Thumb down or lower middle finger</span>
                    </li>
                    <li className="control-instruction">
                      <span className="bg-arcade-purple px-2 py-1 rounded">←</span>
                      <span>Open palm or move hand left</span>
                    </li>
                    <li className="control-instruction">
                      <span className="bg-arcade-purple px-2 py-1 rounded">→</span>
                      <span>Closed fist or move hand right</span>
                    </li>
                  </ul>
                  
                  <p className="text-sm text-gray-400 mt-4">
                    Try to eat as much food as possible without hitting the walls or yourself!
                  </p>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </div>
        
        <div className="arcade-box mb-4">
          <div className="flex justify-between items-center mb-4">
            <div className="text-arcade-neon font-bold">
              Current Controls: 
              <span className={`ml-2 ${controls.up ? 'text-arcade-pink' : 'text-gray-500'}`}>UP</span>
              <span className={`ml-2 ${controls.down ? 'text-arcade-pink' : 'text-gray-500'}`}>DOWN</span>
              <span className={`ml-2 ${controls.left ? 'text-arcade-pink' : 'text-gray-500'}`}>LEFT</span>
              <span className={`ml-2 ${controls.right ? 'text-arcade-pink' : 'text-gray-500'}`}>RIGHT</span>
            </div>
            <div className="text-arcade-pink font-bold">
              High Score: {highScore}
            </div>
          </div>
          
          <SnakeGame 
            width={600} 
            height={400} 
            controls={controls}
            isActive={isGameActive}
            onGameOver={handleGameOver}
          />
          
          {!isGameActive && (
            <div className="mt-4 text-center">
              <button
                onClick={toggleGameActive}
                className="bg-arcade-purple text-white py-2 px-6 rounded-md hover:bg-arcade-blue
                          transition-colors duration-300 font-bold"
              >
                {isGameActive ? "Pause Game" : "Start Game"}
              </button>
            </div>
          )}
        </div>
        
        <div className="text-center text-gray-400 text-sm">
          Use hand gestures to control the snake. Collect food to grow longer!
        </div>
      </div>
      
      {/* Camera Section */}
      <div className="lg:w-1/3">
        <h2 className="text-2xl font-bold text-white mb-4">
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

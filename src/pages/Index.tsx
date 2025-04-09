
import React from 'react';
import ArcadeContainer from '@/components/games/ArcadeContainer';

const Index = () => {
  return (
    <div className="min-h-screen bg-gradient-to-b from-arcade-dark to-arcade-blue/20">
      <header className="py-8 px-4 text-center">
        <h1 className="text-5xl font-extrabold mb-2">
          <span className="arcade-text animate-glow">Gesture Arcade</span>
        </h1>
        <p className="text-gray-300 max-w-2xl mx-auto">
          Control games with hand gestures! Use your webcam to play interactive arcade games with motion controls.
        </p>
      </header>
      
      <main className="container mx-auto pb-16">
        <ArcadeContainer />
        
        <div className="mt-16 text-center">
          <h2 className="text-3xl font-bold arcade-text mb-6">How It Works</h2>
          <div className="grid md:grid-cols-3 gap-6 text-center">
            <div className="arcade-box">
              <div className="h-14 w-14 bg-arcade-purple rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-xl font-bold">1</span>
              </div>
              <h3 className="text-arcade-neon font-bold text-xl mb-2">Enable Camera</h3>
              <p className="text-gray-300">Allow camera access so the game can detect your hand gestures</p>
            </div>
            
            <div className="arcade-box">
              <div className="h-14 w-14 bg-arcade-purple rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-xl font-bold">2</span>
              </div>
              <h3 className="text-arcade-neon font-bold text-xl mb-2">Learn Controls</h3>
              <p className="text-gray-300">Practice different hand gestures to control the game</p>
            </div>
            
            <div className="arcade-box">
              <div className="h-14 w-14 bg-arcade-purple rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-xl font-bold">3</span>
              </div>
              <h3 className="text-arcade-neon font-bold text-xl mb-2">Play Games</h3>
              <p className="text-gray-300">Start the game and control it with your hand movements</p>
            </div>
          </div>
        </div>
      </main>
      
      <footer className="py-6 text-center text-gray-400 text-sm">
        <p>
          Gesture Arcade - Control games with hand movements
          <br />
          Powered by MediaPipe and React
        </p>
      </footer>
    </div>
  );
};

export default Index;

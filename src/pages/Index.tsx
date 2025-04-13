import React from 'react';
import ArcadeContainer from '@/components/games/ArcadeContainer';

const Index = () => {
  return (
    <div className="min-h-screen bg-gradient-to-b from-arcade-dark to-arcade-blue/20">
      {/* Header Section */}
      <header className="py-8 px-4 text-center">
        <h1 className="text-4xl sm:text-5xl font-extrabold mb-4">
          <span className="arcade-text animate-glow">Gesture Arcade</span>
        </h1>
        <p className="text-gray-300 max-w-xl mx-auto text-sm sm:text-base">
          Control games with hand gestures! Use your webcam to play interactive arcade games with motion controls.
        </p>
      </header>

      {/* Main Content */}
      <main className="container mx-auto pb-16 px-4">
        {/* Arcade Container */}
        <ArcadeContainer />

        {/* How It Works Section */}
        <div className="mt-16 text-center">
          <h2 className="text-2xl sm:text-3xl font-bold arcade-text mb-6">How It Works</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-center">
            {/* Step 1 */}
            <div className="arcade-box p-4">
              <div className="h-14 w-14 bg-arcade-purple rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-xl font-bold">1</span>
              </div>
              <h3 className="text-arcade-neon font-bold text-lg sm:text-xl mb-2">Enable Camera</h3>
              <p className="text-gray-300 text-sm sm:text-base">
                Allow camera access so the game can detect your hand gestures.
              </p>
            </div>

            {/* Step 2 */}
            <div className="arcade-box p-4">
              <div className="h-14 w-14 bg-arcade-purple rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-xl font-bold">2</span>
              </div>
              <h3 className="text-arcade-neon font-bold text-lg sm:text-xl mb-2">Learn Controls</h3>
              <p className="text-gray-300 text-sm sm:text-base">
                Practice different hand gestures to control the game.
              </p>
            </div>

            {/* Step 3 */}
            <div className="arcade-box p-4">
              <div className="h-14 w-14 bg-arcade-purple rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-xl font-bold">3</span>
              </div>
              <h3 className="text-arcade-neon font-bold text-lg sm:text-xl mb-2">Play Games</h3>
              <p className="text-gray-300 text-sm sm:text-base">
                Start the game and control it with your hand movements.
              </p>
            </div>
          </div>
        </div>
      </main>

      {/* Footer Section */}
      <footer className="py-6 text-center text-gray-400 text-xs sm:text-sm">
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
import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Camera, Shield, Zap, Trophy, Download } from 'lucide-react';

const Landing: React.FC = () => {
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [showInstall, setShowInstall] = useState(false);

  useEffect(() => {
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setShowInstall(true);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    
    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    };
  }, []);

  const handleInstallClick = async () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      if (outcome === 'accepted') {
        setShowInstall(false);
      }
      setDeferredPrompt(null);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 via-gray-800 to-gray-900 text-white p-4">
      {showInstall && (
        <div className="bg-red-600 p-3 rounded-lg mb-6 flex items-center justify-between">
          <div>
            <p className="font-semibold">Install Fitness Boss</p>
            <p className="text-sm opacity-90">Get the full app experience</p>
          </div>
          <button
            onClick={handleInstallClick}
            className="bg-white text-red-600 px-4 py-2 rounded-lg font-semibold flex items-center gap-2"
          >
            <Download size={16} />
            Install
          </button>
        </div>
      )}

      <div className="text-center mb-8">
        <div className="text-6xl mb-4">💪</div>
        <h1 className="text-4xl font-bold mb-2 bg-gradient-to-r from-red-500 to-orange-500 bg-clip-text text-transparent">
          Fitness Boss Fight
        </h1>
        <p className="text-gray-300 text-lg">
          AI-powered workout battles using your camera
        </p>
      </div>

      <div className="space-y-6 mb-8">
        <div className="bg-gray-800 p-6 rounded-xl border border-gray-700">
          <div className="flex items-center gap-3 mb-3">
            <Camera className="text-red-500" size={24} />
            <h3 className="text-xl font-semibold">How It Works</h3>
          </div>
          <ul className="space-y-2 text-gray-300">
            <li>• Choose your boss and exercise</li>
            <li>• Use your camera for AI pose detection</li>
            <li>• Complete reps to damage the boss</li>
            <li>• Win the 2-minute battle!</li>
          </ul>
        </div>

        <div className="bg-gray-800 p-6 rounded-xl border border-gray-700">
          <div className="flex items-center gap-3 mb-3">
            <Shield className="text-green-500" size={24} />
            <h3 className="text-xl font-semibold">Privacy First</h3>
          </div>
          <p className="text-gray-300">
            All processing happens locally in your browser. Your video never leaves your device.
          </p>
        </div>

        <div className="bg-gray-800 p-6 rounded-xl border border-gray-700">
          <div className="flex items-center gap-3 mb-3">
            <Zap className="text-yellow-500" size={24} />
            <h3 className="text-xl font-semibold">Exercises</h3>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-gray-700 p-3 rounded-lg text-center">
              <div className="text-2xl mb-1">🏋️</div>
              <p className="font-semibold">Squats</p>
            </div>
            <div className="bg-gray-700 p-3 rounded-lg text-center">
              <div className="text-2xl mb-1">💪</div>
              <p className="font-semibold">Push-ups</p>
            </div>
          </div>
        </div>

        <div className="bg-gray-800 p-6 rounded-xl border border-gray-700">
          <div className="flex items-center gap-3 mb-3">
            <Trophy className="text-purple-500" size={24} />
            <h3 className="text-xl font-semibold">Bosses</h3>
          </div>
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span>🧌 Training Goblin</span>
              <span className="text-green-500">30 HP</span>
            </div>
            <div className="flex items-center justify-between">
              <span>👹 Fitness Orc</span>
              <span className="text-yellow-500">60 HP</span>
            </div>
            <div className="flex items-center justify-between">
              <span>🐲 Gym Dragon</span>
              <span className="text-red-500">100 HP</span>
            </div>
          </div>
        </div>
      </div>

      <Link
        to="/play"
        className="w-full bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white font-bold py-4 px-6 rounded-xl text-lg transition-all duration-200 transform hover:scale-105 shadow-lg flex items-center justify-center gap-2"
      >
        <Play size={24} />
        Start Battle
      </Link>
    </div>
  );
};

export default Landing;
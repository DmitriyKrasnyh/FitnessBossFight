import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Camera, Shield, Zap, Trophy, Download, Play } from 'lucide-react';

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed'; platform: string }>;
}

const Landing: React.FC = () => {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [showInstall, setShowInstall] = useState(false);

  useEffect(() => {
    const handleBeforeInstallPrompt = (e: BeforeInstallPromptEvent) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setShowInstall(true);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt as EventListener);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt as EventListener);
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
      <div className="max-w-3xl mx-auto">
      {showInstall && (
        <div className="bg-red-600/90 backdrop-blur p-3 rounded-xl mb-6 flex items-center justify-between shadow-lg">
          <div>
            <p className="font-semibold">Установить Fitness Boss</p>
            <p className="text-sm opacity-90">Получите полный опыт приложения</p>
          </div>
          <button
            onClick={handleInstallClick}
            className="bg-white text-red-600 px-4 py-2 rounded-lg font-semibold flex items-center gap-2"
          >
            <Download size={16} />
            Установить
          </button>
        </div>
      )}

      <div className="text-center mb-8">
        <div className="text-6xl mb-4">💪</div>
        <h1 className="text-4xl font-bold mb-2 bg-gradient-to-r from-red-500 to-orange-500 bg-clip-text text-transparent">
          Битва Фитнес Босса
        </h1>
        <p className="text-gray-300 text-lg">
          Тренировки с ИИ через вашу камеру
        </p>
      </div>

      <div className="space-y-6 mb-8">
        <div className="bg-gray-800/80 backdrop-blur p-6 rounded-xl shadow-lg">
          <div className="flex items-center gap-3 mb-3">
            <Camera className="text-red-500" size={24} />
            <h3 className="text-xl font-semibold">Как это работает</h3>
          </div>
          <ul className="space-y-2 text-gray-300">
            <li>• Выберите босса и упражнение</li>
            <li>• Используйте камеру для распознавания поз</li>
            <li>• Выполняйте повторы, чтобы наносить урон боссу</li>
            <li>• Победите в 2-минутной битве!</li>
          </ul>
        </div>

        <div className="bg-gray-800/80 backdrop-blur p-6 rounded-xl shadow-lg">
          <div className="flex items-center gap-3 mb-3">
            <Shield className="text-green-500" size={24} />
            <h3 className="text-xl font-semibold">Конфиденциальность прежде всего</h3>
          </div>
          <p className="text-gray-300">
            Вся обработка происходит локально в вашем браузере. Видео никогда не покидает ваше устройство.
          </p>
        </div>

        <div className="bg-gray-800/80 backdrop-blur p-6 rounded-xl shadow-lg">
          <div className="flex items-center gap-3 mb-3">
            <Zap className="text-yellow-500" size={24} />
            <h3 className="text-xl font-semibold">Упражнения</h3>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-gray-700 p-3 rounded-lg text-center">
              <div className="text-2xl mb-1">🏋️</div>
              <p className="font-semibold">Приседания</p>
            </div>
            <div className="bg-gray-700 p-3 rounded-lg text-center">
              <div className="text-2xl mb-1">💪</div>
              <p className="font-semibold">Отжимания</p>
            </div>
          </div>
        </div>

        <div className="bg-gray-800/80 backdrop-blur p-6 rounded-xl shadow-lg">
          <div className="flex items-center gap-3 mb-3">
            <Trophy className="text-purple-500" size={24} />
            <h3 className="text-xl font-semibold">Боссы</h3>
          </div>
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span>🧌 Тренировочный гоблин</span>
              <span className="text-green-500">30 HP</span>
            </div>
            <div className="flex items-center justify-between">
              <span>👹 Фитнес орк</span>
              <span className="text-yellow-500">60 HP</span>
            </div>
            <div className="flex items-center justify-between">
              <span>🐲 Дракон спортзала</span>
              <span className="text-red-500">100 HP</span>
            </div>
          </div>
        </div>
      </div>

      <Link
        to="/play"
        className="w-full bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white font-bold py-4 px-6 rounded-xl text-lg transition-all duration-200 transform hover:scale-105 shadow-xl flex items-center justify-center gap-2"
      >
        <Play size={24} />
        Начать битву
      </Link>
      </div>
    </div>
  );
};

export default Landing;

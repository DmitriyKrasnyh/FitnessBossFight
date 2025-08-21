import React from 'react';
import { Outlet, useLocation, Link } from 'react-router-dom';
import { Home, Play, User, BarChart3 } from 'lucide-react';

const Layout: React.FC = () => {
  const location = useLocation();
  const isPlayPage = location.pathname.startsWith('/play');

  if (isPlayPage) {
    return <Outlet />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 via-gray-800 to-gray-900 text-white">
      <nav className="bg-gray-800/80 backdrop-blur border-b border-gray-700 shadow-lg">
        <div className="max-w-md md:max-w-2xl lg:max-w-4xl mx-auto px-4">
          <div className="flex items-center justify-between h-16">
            <Link to="/" className="font-bold text-xl text-red-500">
              💪 Фитнес Босс
            </Link>
          </div>
        </div>
      </nav>

      <main className="max-w-md md:max-w-2xl lg:max-w-4xl mx-auto">
        <Outlet />
      </main>

      <nav className="fixed bottom-4 left-1/2 transform -translate-x-1/2 w-[calc(100%-2rem)] max-w-md md:max-w-2xl lg:max-w-4xl bg-gray-800/80 backdrop-blur border border-gray-700 rounded-full shadow-lg">
        <div className="grid grid-cols-4 h-16">
          <Link
            to="/"
            className={`flex flex-col items-center justify-center text-xs rounded-full ${
              location.pathname === '/' ? 'text-red-500' : 'text-gray-400'
            } hover:bg-gray-700/50`}
          >
            <Home size={20} />
            <span>Главная</span>
          </Link>
          <Link
            to="/play"
            className={`flex flex-col items-center justify-center text-xs rounded-full ${
              location.pathname === '/play' ? 'text-red-500' : 'text-gray-400'
            } hover:bg-gray-700/50`}
          >
            <Play size={20} />
            <span>Игра</span>
          </Link>
          <Link
            to="/results"
            className={`flex flex-col items-center justify-center text-xs rounded-full ${
              location.pathname === '/results' ? 'text-red-500' : 'text-gray-400'
            } hover:bg-gray-700/50`}
          >
            <BarChart3 size={20} />
            <span>Статистика</span>
          </Link>
          <Link
            to="/profile"
            className={`flex flex-col items-center justify-center text-xs rounded-full ${
              location.pathname === '/profile' ? 'text-red-500' : 'text-gray-400'
            } hover:bg-gray-700/50`}
          >
            <User size={20} />
            <span>Профиль</span>
          </Link>
        </div>
      </nav>
    </div>
  );
};

export default Layout;

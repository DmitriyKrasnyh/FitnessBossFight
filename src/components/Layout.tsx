import React from 'react';
import { Outlet, useLocation, Link } from 'react-router-dom';
import { Home, Play, User, BarChart3 } from 'lucide-react';

const Layout: React.FC = () => {
  const location = useLocation();
  const isPlayPage = location.pathname === '/play';

  if (isPlayPage) {
    return <Outlet />;
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      <nav className="bg-gray-800 border-b border-gray-700">
        <div className="max-w-md mx-auto px-4">
          <div className="flex items-center justify-between h-16">
            <Link to="/" className="font-bold text-xl text-red-500">
              💪 Fitness Boss
            </Link>
          </div>
        </div>
      </nav>

      <main className="max-w-md mx-auto">
        <Outlet />
      </main>

      <nav className="fixed bottom-0 left-1/2 transform -translate-x-1/2 w-full max-w-md bg-gray-800 border-t border-gray-700">
        <div className="grid grid-cols-4 h-16">
          <Link
            to="/"
            className={`flex flex-col items-center justify-center text-xs ${
              location.pathname === '/' ? 'text-red-500' : 'text-gray-400'
            }`}
          >
            <Home size={20} />
            <span>Home</span>
          </Link>
          <Link
            to="/play"
            className={`flex flex-col items-center justify-center text-xs ${
              location.pathname === '/play' ? 'text-red-500' : 'text-gray-400'
            }`}
          >
            <Play size={20} />
            <span>Play</span>
          </Link>
          <Link
            to="/results"
            className={`flex flex-col items-center justify-center text-xs ${
              location.pathname === '/results' ? 'text-red-500' : 'text-gray-400'
            }`}
          >
            <BarChart3 size={20} />
            <span>Results</span>
          </Link>
          <Link
            to="/profile"
            className={`flex flex-col items-center justify-center text-xs ${
              location.pathname === '/profile' ? 'text-red-500' : 'text-gray-400'
            }`}
          >
            <User size={20} />
            <span>Profile</span>
          </Link>
        </div>
      </nav>
    </div>
  );
};

export default Layout;
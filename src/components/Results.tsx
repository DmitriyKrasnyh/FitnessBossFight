import React from 'react';
import { Trophy, Target, Clock, Zap } from 'lucide-react';
import { StorageManager } from '../utils/storage';
import type { GameSession } from '../types';
import bossesData from '../data/bosses.json';
import exercisesData from '../data/exercises.json';

const difficultyLabels: Record<string, string> = {
  easy: 'легкий',
  medium: 'средний',
  hard: 'сложный'
};

const Results: React.FC = () => {
  const storageManager = new StorageManager();
  const sessions = storageManager.getSessions();
  const stats = storageManager.getStats();

  const getBossById = (id: string) => bossesData.find(b => b.id === id);
  const getExerciseById = (id: string) => exercisesData.find(e => e.id === id);

  const recentSessions = sessions.slice(0, 10);

  return (
    <div className="p-4 pb-20 max-w-3xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">Результаты битв</h1>

      {/* Stats Overview */}
      <div className="grid grid-cols-2 gap-4 mb-6">
        <div className="bg-gray-800/80 backdrop-blur p-4 rounded-xl shadow-lg">
          <div className="flex items-center gap-2 mb-2">
            <Trophy className="text-yellow-500" size={20} />
            <span className="text-sm text-gray-300">Победы</span>
          </div>
          <div className="text-2xl font-bold">{stats.victories}</div>
          <div className="text-xs text-gray-400">
            {stats.totalSessions > 0 ? Math.round((stats.victories / stats.totalSessions) * 100) : 0}% процент побед
          </div>
        </div>

        <div className="bg-gray-800/80 backdrop-blur p-4 rounded-xl shadow-lg">
          <div className="flex items-center gap-2 mb-2">
            <Zap className="text-orange-500" size={20} />
            <span className="text-sm text-gray-300">Текущая серия</span>
          </div>
          <div className="text-2xl font-bold">{stats.streak}</div>
          <div className="text-xs text-gray-400">битв</div>
        </div>

        <div className="bg-gray-800/80 backdrop-blur p-4 rounded-xl shadow-lg">
          <div className="flex items-center gap-2 mb-2">
            <Target className="text-blue-500" size={20} />
            <span className="text-sm text-gray-300">Всего повторов</span>
          </div>
          <div className="text-2xl font-bold">{stats.totalReps}</div>
          <div className="text-xs text-gray-400">
            {stats.totalSessions > 0 ? Math.round(stats.totalReps / stats.totalSessions) : 0} в среднем за сессию
          </div>
        </div>

        <div className="bg-gray-800/80 backdrop-blur p-4 rounded-xl shadow-lg">
          <div className="flex items-center gap-2 mb-2">
            <Clock className="text-green-500" size={20} />
            <span className="text-sm text-gray-300">Лучшая точность</span>
          </div>
          <div className="text-2xl font-bold">{Math.round(stats.bestAccuracy)}%</div>
          <div className="text-xs text-gray-400">пиковая форма</div>
        </div>
      </div>

      {/* Recent Sessions */}
      <div className="mb-6">
        <h2 className="text-xl font-semibold mb-4">Недавние битвы</h2>
        
        {recentSessions.length === 0 ? (
          <div className="bg-gray-800/80 backdrop-blur p-6 rounded-xl shadow-lg text-center">
            <div className="text-4xl mb-3">⚔️</div>
            <p className="text-gray-300">Пока нет битв!</p>
            <p className="text-sm text-gray-400 mt-1">Начните первую битву, чтобы увидеть результаты здесь</p>
          </div>
        ) : (
          <div className="space-y-3">
            {recentSessions.map((session: GameSession) => {
              const boss = getBossById(session.bossId);
              const exercise = getExerciseById(session.exerciseId);
              
              return (
                <div
                  key={session.id}
                  className={`bg-gray-800/80 backdrop-blur p-4 rounded-xl border-2 shadow-lg ${
                    session.victory ? 'border-green-500/50' : 'border-red-500/50'
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <span className="text-2xl">{boss?.avatar || '❓'}</span>
                      <div>
                        <div className="font-semibold text-sm">{boss?.name || 'Неизвестный босс'}</div>
                        <div className="text-xs text-gray-400">
                          {exercise?.name || 'Неизвестное упражнение'}
                        </div>
                      </div>
                    </div>
                    <div className={`text-2xl ${session.victory ? 'text-green-500' : 'text-red-500'}`}>
                      {session.victory ? '🏆' : '💀'}
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-3 gap-4 text-center">
                    <div>
                      <div className="text-lg font-bold text-blue-500">{session.reps}</div>
                      <div className="text-xs text-gray-400">Повторы</div>
                    </div>
                    <div>
                      <div className="text-lg font-bold text-purple-500">{Math.round(session.accuracy)}%</div>
                      <div className="text-xs text-gray-400">Точность</div>
                    </div>
                    <div>
                      <div className="text-lg font-bold text-orange-500">{session.duration}s</div>
                      <div className="text-xs text-gray-400">Длительность</div>
                    </div>
                  </div>
                  
                  <div className="text-xs text-gray-500 mt-2">
                    {new Date(session.timestamp).toLocaleDateString()} в {new Date(session.timestamp).toLocaleTimeString()}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Boss Progress */}
      <div className="mb-6">
        <h2 className="text-xl font-semibold mb-4">Прогресс боссов</h2>
        <div className="space-y-3">
          {bossesData.map((boss) => {
            const bossVictories = sessions.filter(s => s.bossId === boss.id && s.victory).length;
            const bossAttempts = sessions.filter(s => s.bossId === boss.id).length;
            const winRate = bossAttempts > 0 ? Math.round((bossVictories / bossAttempts) * 100) : 0;
            
            return (
              <div key={boss.id} className="bg-gray-800/80 backdrop-blur p-4 rounded-xl shadow-lg border border-gray-700">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <span className="text-2xl">{boss.avatar}</span>
                    <div>
                      <div className="font-semibold">{boss.name}</div>
                      <div className={`text-xs capitalize ${
                        boss.difficulty === 'easy' ? 'text-green-500' :
                        boss.difficulty === 'medium' ? 'text-yellow-500' : 'text-red-500'
                      }`}>
                        {difficultyLabels[boss.difficulty]} - {boss.maxHP} HP
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-lg font-bold">{bossVictories}/{bossAttempts}</div>
                    <div className="text-xs text-gray-400">{winRate}% процент побед</div>
                  </div>
                </div>
                
                {bossAttempts > 0 && (
                  <div className="w-full bg-gray-700 rounded-full h-2">
                    <div
                      className="bg-gradient-to-r from-green-500 to-green-600 h-2 rounded-full"
                      style={{ width: `${winRate}%` }}
                    />
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default Results;

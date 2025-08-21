import type { GameSession, UserStats } from '../types';

export class StorageManager {
  private readonly SESSIONS_KEY = 'fitness-boss-sessions';
  private readonly STATS_KEY = 'fitness-boss-stats';
  private readonly SETTINGS_KEY = 'fitness-boss-settings';

  saveSession(session: GameSession) {
    const sessions = this.getSessions();
    sessions.unshift(session);
    
    // Keep only last 100 sessions
    if (sessions.length > 100) {
      sessions.splice(100);
    }
    
    localStorage.setItem(this.SESSIONS_KEY, JSON.stringify(sessions));
    this.updateStats(session);
  }

  getSessions(): GameSession[] {
    const data = localStorage.getItem(this.SESSIONS_KEY);
    return data ? JSON.parse(data) : [];
  }

  getStats(): UserStats {
    const data = localStorage.getItem(this.STATS_KEY);
    return data ? JSON.parse(data) : {
      totalReps: 0,
      totalSessions: 0,
      victories: 0,
      streak: 0,
      bestAccuracy: 0
    };
  }

  private updateStats(session: GameSession) {
    const stats = this.getStats();
    
    stats.totalReps += session.reps;
    stats.totalSessions++;
    stats.bestAccuracy = Math.max(stats.bestAccuracy, session.accuracy);
    
    if (session.victory) {
      stats.victories++;
      stats.streak++;
    } else {
      stats.streak = 0;
    }
    
    localStorage.setItem(this.STATS_KEY, JSON.stringify(stats));
  }

  getSettings() {
    const data = localStorage.getItem(this.SETTINGS_KEY);
    return data ? JSON.parse(data) : {
      soundEnabled: true,
      vibrationEnabled: true,
      cameraPermission: false
    };
  }

  saveSettings(settings: any) {
    localStorage.setItem(this.SETTINGS_KEY, JSON.stringify(settings));
  }
}
import type { GameSession, UserStats, UserSettings } from '../types';

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
    if (!data) return [];
    try {
      return JSON.parse(data) as GameSession[];
    } catch {
      return [];
    }
  }

  getStats(): UserStats {
    const data = localStorage.getItem(this.STATS_KEY);
    const defaults: UserStats = {
      totalReps: 0,
      totalSessions: 0,
      victories: 0,
      streak: 0,
      bestAccuracy: 0
    };
    if (!data) return defaults;
    try {
      return JSON.parse(data) as UserStats;
    } catch {
      return defaults;
    }
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

  getSettings(): UserSettings {
    const defaults: UserSettings = {
      soundEnabled: true,
      vibrationEnabled: true,
      cameraPermission: false
    };
    const data = localStorage.getItem(this.SETTINGS_KEY);
    if (!data) return defaults;
    try {
      return JSON.parse(data) as UserSettings;
    } catch {
      return defaults;
    }
  }

  saveSettings(settings: UserSettings) {
    localStorage.setItem(this.SETTINGS_KEY, JSON.stringify(settings));
  }
}
import React, { useState } from 'react';
import { Settings, Volume2, VolumeX, Smartphone, Camera, Trash2 } from 'lucide-react';
import { StorageManager } from '../utils/storage';
import type { UserSettings } from '../types';

const Profile: React.FC = () => {
  const storageManager = new StorageManager();
  const [settings, setSettings] = useState<UserSettings>(storageManager.getSettings());
  const stats = storageManager.getStats();

  const updateSettings = (newSettings: UserSettings) => {
    setSettings(newSettings);
    storageManager.saveSettings(newSettings);
  };

  const clearAllData = () => {
    if (confirm('Are you sure you want to clear all data? This cannot be undone.')) {
      localStorage.clear();
      window.location.reload();
    }
  };

    const requestCameraPermission = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ video: true });
        stream.getTracks().forEach(track => track.stop());
        updateSettings({ ...settings, cameraPermission: true });
        alert('Camera permission granted!');
      } catch {
        alert('Camera permission denied. Please enable camera access in your browser settings.');
      }
    };

  return (
    <div className="p-4 pb-20">
      <h1 className="text-2xl font-bold mb-6">Profile & Settings</h1>

      {/* User Stats */}
      <div className="bg-gray-800 p-6 rounded-xl border border-gray-700 mb-6">
        <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
          <Settings size={24} />
          Your Stats
        </h2>
        
        <div className="space-y-3">
          <div className="flex justify-between">
            <span className="text-gray-300">Total Sessions</span>
            <span className="font-semibold">{stats.totalSessions}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-300">Total Reps</span>
            <span className="font-semibold">{stats.totalReps}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-300">Victories</span>
            <span className="font-semibold text-green-500">{stats.victories}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-300">Current Streak</span>
            <span className="font-semibold text-orange-500">{stats.streak}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-300">Best Accuracy</span>
            <span className="font-semibold text-blue-500">{Math.round(stats.bestAccuracy)}%</span>
          </div>
        </div>
      </div>

      {/* Settings */}
      <div className="bg-gray-800 p-6 rounded-xl border border-gray-700 mb-6">
        <h2 className="text-xl font-semibold mb-4">Settings</h2>
        
        <div className="space-y-4">
          {/* Sound Toggle */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              {settings.soundEnabled ? <Volume2 size={20} /> : <VolumeX size={20} />}
              <span>Sound Effects</span>
            </div>
            <button
              onClick={() => updateSettings({ ...settings, soundEnabled: !settings.soundEnabled })}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                settings.soundEnabled ? 'bg-red-600' : 'bg-gray-600'
              }`}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                  settings.soundEnabled ? 'translate-x-6' : 'translate-x-1'
                }`}
              />
            </button>
          </div>

          {/* Vibration Toggle */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Smartphone size={20} />
              <span>Vibration</span>
            </div>
            <button
              onClick={() => updateSettings({ ...settings, vibrationEnabled: !settings.vibrationEnabled })}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                settings.vibrationEnabled ? 'bg-red-600' : 'bg-gray-600'
              }`}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                  settings.vibrationEnabled ? 'translate-x-6' : 'translate-x-1'
                }`}
              />
            </button>
          </div>

          {/* Camera Permission */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Camera size={20} />
              <span>Camera Access</span>
            </div>
            {settings.cameraPermission ? (
              <span className="text-green-500 text-sm">✓ Granted</span>
            ) : (
              <button
                onClick={requestCameraPermission}
                className="bg-red-600 hover:bg-red-700 px-4 py-2 rounded-lg text-sm"
              >
                Grant Access
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Privacy Info */}
      <div className="bg-gray-800 p-6 rounded-xl border border-gray-700 mb-6">
        <h2 className="text-xl font-semibold mb-4">Privacy & Data</h2>
        <div className="space-y-3 text-sm text-gray-300">
          <p>✅ All video processing happens locally on your device</p>
          <p>✅ No video data is ever sent to servers</p>
          <p>✅ Only session statistics are stored locally</p>
          <p>✅ No personal data is collected or shared</p>
          <p>✅ Works completely offline after initial load</p>
        </div>
      </div>

      {/* Data Management */}
      <div className="bg-gray-800 p-6 rounded-xl border border-gray-700">
        <h2 className="text-xl font-semibold mb-4 text-red-400">Data Management</h2>
        <p className="text-gray-300 text-sm mb-4">
          This will permanently delete all your session data, statistics, and settings.
        </p>
        <button
          onClick={clearAllData}
          className="bg-red-600 hover:bg-red-700 text-white font-bold py-3 px-6 rounded-lg flex items-center gap-2 transition-colors"
        >
          <Trash2 size={20} />
          Clear All Data
        </button>
      </div>
    </div>
  );
};

export default Profile;
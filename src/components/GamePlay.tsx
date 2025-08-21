import React, { useRef, useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Play, Pause, Home, Settings } from 'lucide-react';
import { ExerciseDetector } from '../utils/exerciseDetector';
import { AudioManager } from '../utils/audio';
import { StorageManager } from '../utils/storage';
import type { Boss, Exercise, ExerciseState, GameSession } from '../types';
import bossesData from '../data/bosses.json';
import exercisesData from '../data/exercises.json';

const GamePlay: React.FC = () => {
  const navigate = useNavigate();
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [hasCamera, setHasCamera] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [timeLeft, setTimeLeft] = useState(120); // 2 minutes
  const [selectedBoss, setSelectedBoss] = useState<Boss>(bossesData[0] as Boss);
  const [selectedExercise, setSelectedExercise] = useState<Exercise>(exercisesData[0] as Exercise);
  const [exerciseState, setExerciseState] = useState<ExerciseState>({
    phase: 'neutral',
    reps: 0,
    lastTransition: 0,
    angles: [],
    combo: 0
  });
  const [bossHP, setBossHP] = useState(selectedBoss.maxHP);
  const [gamePhase, setGamePhase] = useState<'setup' | 'playing' | 'finished'>('setup');
  const [gameResult, setGameResult] = useState<'victory' | 'defeat' | null>(null);

  const exerciseDetector = useRef(new ExerciseDetector());
  const audioManager = useRef(new AudioManager());
  const storageManager = useRef(new StorageManager());
  const animationId = useRef<number>();
  const gameTimer = useRef<NodeJS.Timeout>();

  const initializeCamera = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { 
          width: 640, 
          height: 480, 
          facingMode: 'user' 
        }
      });
      
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        setHasCamera(true);
      }
    } catch (error) {
      console.error('Camera access denied:', error);
      setHasCamera(false);
    }
  }, []);

  const startGame = useCallback(async () => {
    await exerciseDetector.current.initialize();
    await audioManager.current.initialize();
    
    setBossHP(selectedBoss.maxHP);
    exerciseDetector.current.reset();
    setTimeLeft(120);
    setGamePhase('playing');
    setIsPlaying(true);
    setGameResult(null);

    // Start game timer
    gameTimer.current = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          endGame('defeat');
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  }, [selectedBoss]);

  const pauseGame = useCallback(() => {
    setIsPlaying(!isPlaying);
    if (gameTimer.current) {
      if (isPlaying) {
        clearInterval(gameTimer.current);
      } else {
        gameTimer.current = setInterval(() => {
          setTimeLeft((prev) => {
            if (prev <= 1) {
              endGame('defeat');
              return 0;
            }
            return prev - 1;
          });
        }, 1000);
      }
    }
  }, [isPlaying]);

  const endGame = useCallback((result: 'victory' | 'defeat') => {
    if (gameTimer.current) {
      clearInterval(gameTimer.current);
    }
    if (animationId.current) {
      cancelAnimationFrame(animationId.current);
    }

    setIsPlaying(false);
    setGamePhase('finished');
    setGameResult(result);

    // Play audio feedback
    if (result === 'victory') {
      audioManager.current.playVictory();
      audioManager.current.vibrate([100, 100, 100]);
    } else {
      audioManager.current.playDefeat();
      audioManager.current.vibrate(500);
    }

    // Save session
    const session: GameSession = {
      id: Date.now().toString(),
      bossId: selectedBoss.id,
      exerciseId: selectedExercise.id,
      reps: exerciseState.reps,
      accuracy: exerciseState.reps > 0 ? Math.min(exerciseState.combo / exerciseState.reps * 100, 100) : 0,
      duration: 120 - timeLeft,
      victory: result === 'victory',
      timestamp: Date.now()
    };

    storageManager.current.saveSession(session);
  }, [selectedBoss, selectedExercise, exerciseState, timeLeft]);

  const processFrame = useCallback(async () => {
    if (!isPlaying || !videoRef.current || gamePhase !== 'playing') return;

    const newRep = await exerciseDetector.current.processFrame(videoRef.current, selectedExercise);
    const state = exerciseDetector.current.getState();
    
    setExerciseState(state);

    if (newRep) {
      const damage = 1;
      setBossHP((prev) => {
        const newHP = Math.max(0, prev - damage);
        if (newHP === 0) {
          endGame('victory');
        }
        return newHP;
      });
      
      audioManager.current.playSuccess();
      audioManager.current.vibrate(50);
    }

    // Draw pose overlay
    drawPoseOverlay();

    if (isPlaying) {
      animationId.current = requestAnimationFrame(processFrame);
    }
  }, [isPlaying, selectedExercise, gamePhase, endGame]);

  const drawPoseOverlay = () => {
    const canvas = canvasRef.current;
    const video = videoRef.current;
    if (!canvas || !video) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // Draw exercise guidance
    ctx.fillStyle = exerciseState.phase === 'down' ? '#ef4444' : exerciseState.phase === 'up' ? '#22c55e' : '#6b7280';
    ctx.font = '24px Arial';
    ctx.fillText(`${selectedExercise.name}: ${exerciseState.phase}`, 20, 40);
  };

  useEffect(() => {
    const initialize = async () => {
      setIsLoading(true);
      await initializeCamera();
      setIsLoading(false);
    };
    
    initialize();

    return () => {
      if (animationId.current) {
        cancelAnimationFrame(animationId.current);
      }
      if (gameTimer.current) {
        clearInterval(gameTimer.current);
      }
    };
  }, [initializeCamera]);

  useEffect(() => {
    if (isPlaying && hasCamera) {
      processFrame();
    }
  }, [isPlaying, hasCamera, processFrame]);

  const handleKeyPress = useCallback((event: KeyboardEvent) => {
    if (event.code === 'Space' && !hasCamera && gamePhase === 'playing') {
      event.preventDefault();
      // Fallback rep counting for no camera
      setExerciseState(prev => ({ ...prev, reps: prev.reps + 1 }));
      setBossHP(prev => {
        const newHP = Math.max(0, prev - 1);
        if (newHP === 0) {
          endGame('victory');
        }
        return newHP;
      });
    }
  }, [hasCamera, gamePhase, endGame]);

  useEffect(() => {
    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [handleKeyPress]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-900 text-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin text-4xl mb-4">⚡</div>
          <p>Loading AI models...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white overflow-hidden">
      {/* Header */}
      <div className="bg-gray-800 border-b border-gray-700 p-4">
        <div className="flex items-center justify-between">
          <button onClick={() => navigate('/')} className="p-2">
            <Home size={24} />
          </button>
          <div className="text-center">
            <div className="text-2xl font-bold">
              {Math.floor(timeLeft / 60)}:{(timeLeft % 60).toString().padStart(2, '0')}
            </div>
          </div>
          <button className="p-2">
            <Settings size={24} />
          </button>
        </div>
      </div>

      {/* Game Setup */}
      {gamePhase === 'setup' && (
        <div className="p-4 space-y-6">
          <div>
            <h3 className="text-lg font-semibold mb-3">Choose Boss</h3>
            <div className="grid grid-cols-1 gap-3">
              {bossesData.map((boss) => (
                <button
                  key={boss.id}
                  onClick={() => setSelectedBoss(boss as Boss)}
                  className={`p-4 rounded-lg border-2 text-left ${
                    selectedBoss.id === boss.id
                      ? 'border-red-500 bg-red-500/20'
                      : 'border-gray-600 bg-gray-800'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-2xl">{boss.avatar}</span>
                        <span className="font-semibold">{boss.name}</span>
                      </div>
                      <p className="text-sm text-gray-300">{boss.description}</p>
                    </div>
                    <div className="text-right">
                      <div className="font-bold text-lg">{boss.maxHP} HP</div>
                      <div className={`text-sm capitalize ${
                        boss.difficulty === 'easy' ? 'text-green-500' :
                        boss.difficulty === 'medium' ? 'text-yellow-500' : 'text-red-500'
                      }`}>
                        {boss.difficulty}
                      </div>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </div>

          <div>
            <h3 className="text-lg font-semibold mb-3">Choose Exercise</h3>
            <div className="grid grid-cols-2 gap-3">
              {exercisesData.map((exercise) => (
                <button
                  key={exercise.id}
                  onClick={() => setSelectedExercise(exercise as Exercise)}
                  className={`p-4 rounded-lg border-2 text-center ${
                    selectedExercise.id === exercise.id
                      ? 'border-red-500 bg-red-500/20'
                      : 'border-gray-600 bg-gray-800'
                  }`}
                >
                  <div className="text-3xl mb-2">{exercise.icon}</div>
                  <div className="font-semibold">{exercise.name}</div>
                </button>
              ))}
            </div>
          </div>

          {!hasCamera && (
            <div className="bg-yellow-600/20 border border-yellow-600 p-4 rounded-lg">
              <p className="text-yellow-200 text-sm">
                No camera detected. You can still play using the spacebar to count reps, but progress won't be saved.
              </p>
            </div>
          )}

          <button
            onClick={startGame}
            className="w-full bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white font-bold py-4 px-6 rounded-xl text-lg transition-all duration-200 transform hover:scale-105 shadow-lg flex items-center justify-center gap-2"
          >
            <Play size={24} />
            Start Battle
          </button>
        </div>
      )}

      {/* Game Playing */}
      {gamePhase === 'playing' && (
        <div className="relative">
          {/* Camera/Video */}
          {hasCamera && (
            <div className="relative">
              <video
                ref={videoRef}
                autoPlay
                playsInline
                muted
                className="w-full h-64 bg-black object-cover"
              />
              <canvas
                ref={canvasRef}
                className="absolute top-0 left-0 w-full h-64 pointer-events-none"
              />
            </div>
          )}

          {/* HUD */}
          <div className="bg-gray-800/90 backdrop-blur p-4">
            {/* Boss HP */}
            <div className="mb-4">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <span className="text-2xl">{selectedBoss.avatar}</span>
                  <span className="font-semibold">{selectedBoss.name}</span>
                </div>
                <span className="text-sm text-gray-300">
                  {bossHP}/{selectedBoss.maxHP} HP
                </span>
              </div>
              <div className="w-full bg-gray-700 rounded-full h-3">
                <div
                  className="bg-gradient-to-r from-red-500 to-red-600 h-3 rounded-full transition-all duration-300"
                  style={{ width: `${(bossHP / selectedBoss.maxHP) * 100}%` }}
                />
              </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-4 mb-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-500">{exerciseState.reps}</div>
                <div className="text-xs text-gray-300">Reps</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-green-500">{exerciseState.combo}</div>
                <div className="text-xs text-gray-300">Combo</div>
              </div>
              <div className="text-center">
                <div className={`text-2xl font-bold ${
                  exerciseState.phase === 'down' ? 'text-red-500' :
                  exerciseState.phase === 'up' ? 'text-green-500' : 'text-gray-500'
                }`}>
                  {exerciseState.phase === 'neutral' ? '⚪' :
                   exerciseState.phase === 'down' ? '🔴' : '🟢'}
                </div>
                <div className="text-xs text-gray-300 capitalize">{exerciseState.phase}</div>
              </div>
            </div>

            {/* Exercise Info */}
            <div className="bg-gray-700 p-3 rounded-lg mb-4">
              <div className="flex items-center gap-2 mb-1">
                <span className="text-xl">{selectedExercise.icon}</span>
                <span className="font-semibold">{selectedExercise.name}</span>
              </div>
              <p className="text-sm text-gray-300">{selectedExercise.description}</p>
            </div>

            {/* Controls */}
            <button
              onClick={pauseGame}
              className="w-full bg-gray-700 hover:bg-gray-600 text-white font-bold py-3 px-6 rounded-lg flex items-center justify-center gap-2"
            >
              {isPlaying ? <Pause size={20} /> : <Play size={20} />}
              {isPlaying ? 'Pause' : 'Resume'}
            </button>
          </div>
        </div>
      )}

      {/* Game Result */}
      {gamePhase === 'finished' && (
        <div className="p-6 text-center">
          <div className="text-6xl mb-4">
            {gameResult === 'victory' ? '🏆' : '💀'}
          </div>
          <h2 className={`text-3xl font-bold mb-2 ${
            gameResult === 'victory' ? 'text-green-500' : 'text-red-500'
          }`}>
            {gameResult === 'victory' ? 'Victory!' : 'Defeat!'}
          </h2>
          <p className="text-gray-300 mb-6">
            You completed {exerciseState.reps} reps in {120 - timeLeft} seconds
          </p>

          <div className="space-y-4">
            <button
              onClick={() => {
                setGamePhase('setup');
                setBossHP(selectedBoss.maxHP);
                exerciseDetector.current.reset();
              }}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-6 rounded-lg"
            >
              Play Again
            </button>
            <button
              onClick={() => navigate('/results')}
              className="w-full bg-gray-700 hover:bg-gray-600 text-white font-bold py-3 px-6 rounded-lg"
            >
              View Results
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default GamePlay;
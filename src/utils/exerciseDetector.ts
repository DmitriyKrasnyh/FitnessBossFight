import type { Pose, Exercise, ExerciseState } from '../types';
import { PoseDetector } from './poseDetection';

export class ExerciseDetector {
  private poseDetector = new PoseDetector();
  private state: ExerciseState = {
    phase: 'neutral',
    reps: 0,
    lastTransition: 0,
    angles: [],
    combo: 0
  };
  private smoothingBuffer: number[] = [];
  private readonly SMOOTHING_SIZE = 5;

  async initialize() {
    await this.poseDetector.initialize();
  }

  reset() {
    this.state = {
      phase: 'neutral',
      reps: 0,
      lastTransition: 0,
      angles: [],
      combo: 0
    };
    this.smoothingBuffer = [];
  }

  getState(): ExerciseState {
    return { ...this.state };
  }

  async processFrame(video: HTMLVideoElement, exercise: Exercise): Promise<boolean> {
    const pose = await this.poseDetector.detectPose(video);
    if (!pose) return false;

    const angle = this.calculateExerciseAngle(pose, exercise);
    if (angle === null) return false;

    const smoothedAngle = this.smoothAngle(angle);
    const now = Date.now();
    
    return this.updateExerciseState(smoothedAngle, exercise, now);
  }

  private calculateExerciseAngle(pose: Pose, exercise: Exercise): number | null {
    if (exercise.id === 'squat') {
      return this.calculateSquatAngle(pose);
    } else if (exercise.id === 'pushup') {
      return this.calculatePushupAngle(pose);
    }
    return null;
  }

  private calculateSquatAngle(pose: Pose): number | null {
    const hip = this.poseDetector.getKeypoint(pose, 'left_hip') || this.poseDetector.getKeypoint(pose, 'right_hip');
    const knee = this.poseDetector.getKeypoint(pose, 'left_knee') || this.poseDetector.getKeypoint(pose, 'right_knee');
    const ankle = this.poseDetector.getKeypoint(pose, 'left_ankle') || this.poseDetector.getKeypoint(pose, 'right_ankle');

    if (!hip || !knee || !ankle || hip.score < 0.5 || knee.score < 0.5 || ankle.score < 0.5) {
      return null;
    }

    return this.poseDetector.calculateAngle(hip, knee, ankle);
  }

  private calculatePushupAngle(pose: Pose): number | null {
    const shoulder = this.poseDetector.getKeypoint(pose, 'left_shoulder') || this.poseDetector.getKeypoint(pose, 'right_shoulder');
    const elbow = this.poseDetector.getKeypoint(pose, 'left_elbow') || this.poseDetector.getKeypoint(pose, 'right_elbow');
    const wrist = this.poseDetector.getKeypoint(pose, 'left_wrist') || this.poseDetector.getKeypoint(pose, 'right_wrist');

    if (!shoulder || !elbow || !wrist || shoulder.score < 0.5 || elbow.score < 0.5 || wrist.score < 0.5) {
      return null;
    }

    return this.poseDetector.calculateAngle(shoulder, elbow, wrist);
  }

  private smoothAngle(angle: number): number {
    this.smoothingBuffer.push(angle);
    if (this.smoothingBuffer.length > this.SMOOTHING_SIZE) {
      this.smoothingBuffer.shift();
    }
    
    return this.smoothingBuffer.reduce((sum, val) => sum + val, 0) / this.smoothingBuffer.length;
  }

  private updateExerciseState(angle: number, exercise: Exercise, timestamp: number): boolean {
    const { downAngle, upAngle, holdDuration } = exercise.detection;
    let newRep = false;

    const timeSinceTransition = timestamp - this.state.lastTransition;

    if (this.state.phase === 'neutral' || this.state.phase === 'up') {
      if (angle <= downAngle && timeSinceTransition >= holdDuration) {
        this.state.phase = 'down';
        this.state.lastTransition = timestamp;
      }
    } else if (this.state.phase === 'down') {
      if (angle >= upAngle && timeSinceTransition >= holdDuration) {
        this.state.phase = 'up';
        this.state.lastTransition = timestamp;
        this.state.reps++;
        this.state.combo++;
        newRep = true;
      }
    }

    this.state.angles.push(angle);
    if (this.state.angles.length > 100) {
      this.state.angles.shift();
    }

    return newRep;
  }
}
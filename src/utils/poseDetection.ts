import * as tf from '@tensorflow/tfjs';
import { createDetector, SupportedModels, type PoseDetector as TFPoseDetector } from '@tensorflow-models/pose-detection';
import type { Pose } from '../types';

export class PoseDetector {
  private detector: TFPoseDetector | null = null;
  private isLoaded = false;

  async initialize() {
    if (this.isLoaded) return;
    
    await tf.setBackend('webgl');
    await tf.ready();
    
    this.detector = await createDetector(SupportedModels.MoveNet, {
      modelType: 'SINGLEPOSE_LIGHTNING'
    });
    
    this.isLoaded = true;
  }

  async detectPose(video: HTMLVideoElement): Promise<Pose | null> {
    if (!this.detector || !this.isLoaded) return null;

    try {
      const poses = await this.detector.estimatePoses(video);
      return poses[0] || null;
    } catch (error) {
      console.error('Pose detection error:', error);
      return null;
    }
  }

  calculateAngle(point1: {x: number, y: number}, point2: {x: number, y: number}, point3: {x: number, y: number}): number {
    const radians = Math.atan2(point3.y - point2.y, point3.x - point2.x) - 
                   Math.atan2(point1.y - point2.y, point1.x - point2.x);
    let angle = Math.abs(radians * 180.0 / Math.PI);
    if (angle > 180.0) {
      angle = 360 - angle;
    }
    return angle;
  }

  getKeypoint(pose: Pose, name: string) {
    return pose.keypoints.find(kp => kp.name === name);
  }
}
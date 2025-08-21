export class AudioManager {
  private audioContext: AudioContext | null = null;
  private sounds: Map<string, AudioBuffer> = new Map();

  async initialize() {
    if (!this.audioContext) {
      type ExtendedWindow = Window & { webkitAudioContext?: typeof AudioContext };
      const AudioContextClass =
        (window as ExtendedWindow).AudioContext ||
        (window as ExtendedWindow).webkitAudioContext;
      if (AudioContextClass) {
        this.audioContext = new AudioContextClass();
      }
    }
  }

  playBeep(frequency: number = 440, duration: number = 100) {
    if (!this.audioContext) return;

    const oscillator = this.audioContext.createOscillator();
    const gainNode = this.audioContext.createGain();

    oscillator.connect(gainNode);
    gainNode.connect(this.audioContext.destination);

    oscillator.frequency.value = frequency;
    oscillator.type = 'sine';

    gainNode.gain.setValueAtTime(0.1, this.audioContext.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + duration / 1000);

    oscillator.start(this.audioContext.currentTime);
    oscillator.stop(this.audioContext.currentTime + duration / 1000);
  }

  playSuccess() {
    this.playBeep(523, 150); // C5
  }

  playVictory() {
    // Play victory chord
    setTimeout(() => this.playBeep(523, 200), 0);   // C5
    setTimeout(() => this.playBeep(659, 200), 100); // E5
    setTimeout(() => this.playBeep(784, 300), 200); // G5
  }

  playDefeat() {
    // Play descending notes
    setTimeout(() => this.playBeep(392, 200), 0);   // G4
    setTimeout(() => this.playBeep(349, 200), 150); // F4
    setTimeout(() => this.playBeep(294, 400), 300); // D4
  }

  vibrate(pattern: number | number[] = 100) {
    if (navigator.vibrate) {
      navigator.vibrate(pattern);
    }
  }
}
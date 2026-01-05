
class AudioEngine {
  private context: AudioContext | null = null;
  private volume: number = 0.7;
  private enabled: boolean = true;

  private getContext() {
    if (!this.context) {
      this.context = new (window.AudioContext || (window as any).webkitAudioContext)();
    }
    if (this.context.state === 'suspended') {
      this.context.resume();
    }
    return this.context;
  }

  setVolume(vol: number) {
    this.volume = vol / 100;
  }

  setEnabled(enabled: boolean) {
    this.enabled = enabled;
  }

  // Soft wooden/bubble click for UI interactions
  playClick() {
    if (!this.enabled) return;
    try {
      const ctx = this.getContext();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      
      osc.type = 'sine';
      osc.frequency.setValueAtTime(600, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(100, ctx.currentTime + 0.1);
      
      gain.gain.setValueAtTime(0, ctx.currentTime);
      gain.gain.linearRampToValueAtTime(this.volume * 0.2, ctx.currentTime + 0.01);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.1);

      osc.connect(gain);
      gain.connect(ctx.destination);
      
      osc.start();
      osc.stop(ctx.currentTime + 0.1);
    } catch (e) {
      console.error("Audio play failed", e);
    }
  }

  // Gentle chime for segment changes
  playSegmentChange() {
    if (!this.enabled) return;
    try {
      const ctx = this.getContext();
      const t = ctx.currentTime;
      
      // Fundamental
      const osc1 = ctx.createOscillator();
      const gain1 = ctx.createGain();
      osc1.type = 'sine';
      osc1.frequency.value = 440; // A4
      gain1.gain.setValueAtTime(0, t);
      gain1.gain.linearRampToValueAtTime(this.volume * 0.5, t + 0.05);
      gain1.gain.exponentialRampToValueAtTime(0.001, t + 2);
      
      // Overtone
      const osc2 = ctx.createOscillator();
      const gain2 = ctx.createGain();
      osc2.type = 'sine';
      osc2.frequency.value = 880; // A5
      gain2.gain.setValueAtTime(0, t);
      gain2.gain.linearRampToValueAtTime(this.volume * 0.3, t + 0.05);
      gain2.gain.exponentialRampToValueAtTime(0.001, t + 1.5);

      osc1.connect(gain1);
      osc2.connect(gain2);
      gain1.connect(ctx.destination);
      gain2.connect(ctx.destination);
      
      osc1.start(t);
      osc2.start(t);
      osc1.stop(t + 2.5);
      osc2.stop(t + 2.5);
    } catch (e) { console.error(e); }
  }

  // Resonant Bell for Session Finish
  playSessionComplete() {
    if (!this.enabled) return;
    try {
      const ctx = this.getContext();
      const t = ctx.currentTime;
      
      const frequencies = [523.25, 783.99, 1046.50]; // C Major chord
      
      frequencies.forEach((freq, i) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'triangle'; // Richer sound
        osc.frequency.value = freq;
        
        gain.gain.setValueAtTime(0, t);
        gain.gain.linearRampToValueAtTime(this.volume * 0.4, t + 0.1 + (i * 0.05)); // Staggered attack
        gain.gain.exponentialRampToValueAtTime(0.001, t + 6); // Long decay

        // Lowpass filter to soften the triangle wave
        const filter = ctx.createBiquadFilter();
        filter.type = 'lowpass';
        filter.frequency.value = 2000;

        osc.connect(filter);
        filter.connect(gain);
        gain.connect(ctx.destination);
        
        osc.start(t);
        osc.stop(t + 7);
      });
    } catch (e) { console.error(e); }
  }
}

export const audio = new AudioEngine();

export type AmbientTrackId =
  | 'rain-library'
  | 'warm-lofi'
  | 'brown-noise'
  | 'alpha-focus'
  | 'fireplace';

export interface AmbientTrack {
  id: AmbientTrackId;
  title: string;
  subtitle: string;
  durationLabel: string;
}

export const AMBIENT_TRACKS: AmbientTrack[] = [
  {
    id: 'rain-library',
    title: 'Midnight Library Rain',
    subtitle: 'Soft window rainfall & warm room acoustics',
    durationLabel: 'Continuous',
  },
  {
    id: 'warm-lofi',
    title: 'Warm Rhodes Study Pad',
    subtitle: 'Slow harmonic lo-fi chords over soft air',
    durationLabel: 'Continuous',
  },
  {
    id: 'brown-noise',
    title: 'Deep Brown Noise',
    subtitle: 'Low-frequency acoustic masking for reading',
    durationLabel: 'Continuous',
  },
  {
    id: 'alpha-focus',
    title: 'Alpha Wave Drift',
    subtitle: 'Warm 10 Hz focus resonance',
    durationLabel: 'Continuous',
  },
  {
    id: 'fireplace',
    title: 'Hearth & Cedar Study',
    subtitle: 'Low amber crackle & quiet library warmth',
    durationLabel: 'Continuous',
  },
];

export function playTimerCompletionBeep(): void {
  try {
    const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    if (!AudioCtx) return;
    const ctx = new AudioCtx();
    const now = ctx.currentTime;

    const beeps = [
      { start: 0, freq: 880, dur: 0.16 },
      { start: 0.24, freq: 880, dur: 0.16 },
      { start: 0.48, freq: 1046.5, dur: 0.28 },
      { start: 0.95, freq: 880, dur: 0.16 },
      { start: 1.19, freq: 1046.5, dur: 0.36 },
    ];

    beeps.forEach(({ start, freq, dur }) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, now + start);

      gain.gain.setValueAtTime(0.001, now + start);
      gain.gain.exponentialRampToValueAtTime(0.24, now + start + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.001, now + start + dur);

      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(now + start);
      osc.stop(now + start + dur + 0.02);
    });

    setTimeout(() => {
      ctx.close().catch(() => {});
    }, 2200);
  } catch {
    // Audio playback blocked or unavailable
  }
}

class AmbientSoundEngine {
  private ctx: AudioContext | null = null;
  private masterGain: GainNode | null = null;
  private activeNodes: AudioNode[] = [];
  private activeTimers: number[] = [];
  private currentTrack: AmbientTrackId = 'rain-library';
  private playing = false;
  private volume = 0.45;

  private ensureContext(): AudioContext {
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      this.ctx = new AudioCtx();
      this.masterGain = this.ctx.createGain();
      this.masterGain.gain.value = this.volume;
      this.masterGain.connect(this.ctx.destination);
    }
    if (this.ctx.state === 'suspended') {
      this.ctx.resume().catch(() => {});
    }
    return this.ctx;
  }

  private clearNodes() {
    this.activeTimers.forEach((id) => window.clearInterval(id));
    this.activeTimers = [];
    this.activeNodes.forEach((node) => {
      try {
        if ('stop' in node && typeof (node as AudioScheduledSourceNode).stop === 'function') {
          (node as AudioScheduledSourceNode).stop();
        }
        node.disconnect();
      } catch {
        // Ignore already stopped nodes
      }
    });
    this.activeNodes = [];
  }

  private createNoiseBuffer(ctx: AudioContext, seconds = 4, type: 'pink' | 'brown' = 'pink'): AudioBuffer {
    const bufferSize = ctx.sampleRate * seconds;
    const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const data = buffer.getChannelData(0);

    if (type === 'brown') {
      let lastOut = 0;
      for (let i = 0; i < bufferSize; i++) {
        const white = Math.random() * 2 - 1;
        data[i] = (lastOut + 0.02 * white) / 1.02;
        lastOut = data[i];
        data[i] *= 3.2;
      }
    } else {
      let b0 = 0, b1 = 0, b2 = 0, b3 = 0, b4 = 0, b5 = 0, b6 = 0;
      for (let i = 0; i < bufferSize; i++) {
        const white = Math.random() * 2 - 1;
        b0 = 0.99886 * b0 + white * 0.0555179;
        b1 = 0.99332 * b1 + white * 0.0750759;
        b2 = 0.96900 * b2 + white * 0.1538520;
        b3 = 0.86650 * b3 + white * 0.3104856;
        b4 = 0.55000 * b4 + white * 0.5329522;
        b5 = -0.7616 * b5 - white * 0.0168980;
        data[i] = b0 + b1 + b2 + b3 + b4 + b5 + b6 + white * 0.5362;
        data[i] *= 0.09;
        b6 = white * 0.115926;
      }
    }
    return buffer;
  }

  private buildTrack(track: AmbientTrackId) {
    this.clearNodes();
    const ctx = this.ensureContext();
    if (!this.masterGain) return;

    if (track === 'rain-library') {
      const noise = ctx.createBufferSource();
      noise.buffer = this.createNoiseBuffer(ctx, 5, 'pink');
      noise.loop = true;

      const bandpass = ctx.createBiquadFilter();
      bandpass.type = 'lowpass';
      bandpass.frequency.value = 1400;

      const highpass = ctx.createBiquadFilter();
      highpass.type = 'highpass';
      highpass.frequency.value = 160;

      const rainGain = ctx.createGain();
      rainGain.gain.value = 0.55;

      noise.connect(highpass);
      highpass.connect(bandpass);
      bandpass.connect(rainGain);
      rainGain.connect(this.masterGain);
      noise.start();
      this.activeNodes.push(noise, highpass, bandpass, rainGain);
    } else if (track === 'brown-noise') {
      const noise = ctx.createBufferSource();
      noise.buffer = this.createNoiseBuffer(ctx, 5, 'brown');
      noise.loop = true;

      const lp = ctx.createBiquadFilter();
      lp.type = 'lowpass';
      lp.frequency.value = 420;

      const gain = ctx.createGain();
      gain.gain.value = 0.65;

      noise.connect(lp);
      lp.connect(gain);
      gain.connect(this.masterGain);
      noise.start();
      this.activeNodes.push(noise, lp, gain);
    } else if (track === 'warm-lofi') {
      const chords = [
        [174.61, 220.0, 261.63, 329.63], // Fmaj7
        [164.81, 196.0, 246.94, 293.66], // Em7
        [146.83, 174.61, 220.0, 261.63], // Dm7
        [130.81, 164.81, 196.0, 246.94], // Cmaj7
      ];
      let chordIndex = 0;

      // Subtle rain underlay
      const noise = ctx.createBufferSource();
      noise.buffer = this.createNoiseBuffer(ctx, 4, 'pink');
      noise.loop = true;
      const lp = ctx.createBiquadFilter();
      lp.type = 'lowpass';
      lp.frequency.value = 900;
      const airGain = ctx.createGain();
      airGain.gain.value = 0.14;
      noise.connect(lp);
      lp.connect(airGain);
      airGain.connect(this.masterGain);
      noise.start();
      this.activeNodes.push(noise, lp, airGain);

      const triggerChord = () => {
        if (!this.ctx || !this.masterGain || !this.playing) return;
        const now = this.ctx.currentTime;
        const freqs = chords[chordIndex % chords.length];
        chordIndex++;

        freqs.forEach((f) => {
          if (!this.ctx || !this.masterGain) return;
          const osc = this.ctx.createOscillator();
          const filter = this.ctx.createBiquadFilter();
          const env = this.ctx.createGain();
          osc.type = 'triangle';
          osc.frequency.value = f;
          filter.type = 'lowpass';
          filter.frequency.value = 680;

          env.gain.setValueAtTime(0.001, now);
          env.gain.linearRampToValueAtTime(0.055, now + 0.9);
          env.gain.exponentialRampToValueAtTime(0.001, now + 4.8);

          osc.connect(filter);
          filter.connect(env);
          env.connect(this.masterGain);
          osc.start(now);
          osc.stop(now + 5.0);
        });
      };

      triggerChord();
      const timerId = window.setInterval(triggerChord, 4600);
      this.activeTimers.push(timerId);
    } else if (track === 'alpha-focus') {
      const leftOsc = ctx.createOscillator();
      const rightOsc = ctx.createOscillator();
      const gain = ctx.createGain();
      leftOsc.type = 'sine';
      rightOsc.type = 'sine';
      leftOsc.frequency.value = 216;
      rightOsc.frequency.value = 226; // 10 Hz gentle alpha beat
      gain.gain.value = 0.11;

      leftOsc.connect(gain);
      rightOsc.connect(gain);
      gain.connect(this.masterGain);
      leftOsc.start();
      rightOsc.start();
      this.activeNodes.push(leftOsc, rightOsc, gain);
    } else if (track === 'fireplace') {
      const noise = ctx.createBufferSource();
      noise.buffer = this.createNoiseBuffer(ctx, 5, 'brown');
      noise.loop = true;

      const lp = ctx.createBiquadFilter();
      lp.type = 'lowpass';
      lp.frequency.value = 320;
      const rumbleGain = ctx.createGain();
      rumbleGain.gain.value = 0.45;
      noise.connect(lp);
      lp.connect(rumbleGain);
      rumbleGain.connect(this.masterGain);
      noise.start();
      this.activeNodes.push(noise, lp, rumbleGain);

      const crackleTimer = window.setInterval(() => {
        if (!this.ctx || !this.masterGain || !this.playing) return;
        if (Math.random() > 0.55) return;
        const now = this.ctx.currentTime;
        const popBuf = this.ctx.createBuffer(1, 512, this.ctx.sampleRate);
        const d = popBuf.getChannelData(0);
        for (let i = 0; i < d.length; i++) {
          d[i] = (Math.random() * 2 - 1) * Math.exp(-i / 60);
        }
        const src = this.ctx.createBufferSource();
        src.buffer = popBuf;
        const hp = this.ctx.createBiquadFilter();
        hp.type = 'bandpass';
        hp.frequency.value = 1800 + Math.random() * 1800;
        const g = this.ctx.createGain();
        g.gain.value = 0.08 + Math.random() * 0.12;
        src.connect(hp);
        hp.connect(g);
        g.connect(this.masterGain);
        src.start(now);
      }, 280);
      this.activeTimers.push(crackleTimer);
    }
  }

  public start(track?: AmbientTrackId) {
    if (track) this.currentTrack = track;
    this.playing = true;
    this.buildTrack(this.currentTrack);
  }

  public stop() {
    this.playing = false;
    this.clearNodes();
  }

  public setTrack(track: AmbientTrackId) {
    this.currentTrack = track;
    if (this.playing) {
      this.buildTrack(track);
    }
  }

  public setVolume(vol: number) {
    this.volume = Math.max(0, Math.min(1, vol));
    if (this.masterGain && this.ctx) {
      this.masterGain.gain.setTargetAtTime(this.volume, this.ctx.currentTime, 0.05);
    }
  }

  public isPlaying() {
    return this.playing;
  }
}

export const ambientEngine = new AmbientSoundEngine();

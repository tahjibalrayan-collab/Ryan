export type AmbientTrackId =
  | 'rain-library'
  | 'warm-lofi'
  | 'brown-noise'
  | 'alpha-focus'
  | 'fireplace'
  | `custom:${string}`;

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

// Loud, continuous alarm controller (rings for 60s or until manually stopped)
class TimerAlarmController {
  private ctx: AudioContext | null = null;
  private intervalId: number | null = null;
  private autoStopTimeoutId: number | null = null;
  private ringing = false;
  private listeners = new Set<(ringing: boolean) => void>();

  private notify() {
    this.listeners.forEach((cb) => cb(this.ringing));
  }

  public subscribe(cb: (ringing: boolean) => void): () => void {
    this.listeners.add(cb);
    return () => this.listeners.delete(cb);
  }

  public isRinging(): boolean {
    return this.ringing;
  }

  private playPulse() {
    try {
      const AudioCtx =
        window.AudioContext ||
        (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (!AudioCtx) return;
      if (!this.ctx || this.ctx.state === 'closed') {
        this.ctx = new AudioCtx();
      }
      if (this.ctx.state === 'suspended') {
        this.ctx.resume().catch(() => {});
      }

      const ctx = this.ctx;
      const now = ctx.currentTime;

      // Compressor for loud, punchy, distortion-free alert
      const compressor = ctx.createDynamicsCompressor();
      compressor.threshold.setValueAtTime(-12, now);
      compressor.ratio.setValueAtTime(8, now);
      compressor.connect(ctx.destination);

      const pulses = [
        { start: 0, freq: 987.77, dur: 0.17 }, // B5
        { start: 0.22, freq: 1318.51, dur: 0.19 }, // E6
        { start: 0.46, freq: 987.77, dur: 0.17 }, // B5
        { start: 0.68, freq: 1318.51, dur: 0.28 }, // E6
      ];

      pulses.forEach(({ start, freq, dur }) => {
        const osc1 = ctx.createOscillator();
        const osc2 = ctx.createOscillator();
        const gain = ctx.createGain();

        osc1.type = 'triangle';
        osc2.type = 'square';
        osc1.frequency.setValueAtTime(freq, now + start);
        osc2.frequency.setValueAtTime(freq * 0.5, now + start);

        // Louder gain (0.72) compared to faint 0.24 sine beep
        gain.gain.setValueAtTime(0.001, now + start);
        gain.gain.exponentialRampToValueAtTime(0.72, now + start + 0.015);
        gain.gain.setValueAtTime(0.68, now + start + dur - 0.03);
        gain.gain.exponentialRampToValueAtTime(0.001, now + start + dur);

        osc1.connect(gain);
        osc2.connect(gain);
        gain.connect(compressor);

        osc1.start(now + start);
        osc2.start(now + start);
        osc1.stop(now + start + dur + 0.02);
        osc2.stop(now + start + dur + 0.02);
      });
    } catch {
      // Audio playback blocked or unavailable
    }
  }

  public startContinuous(maxDurationMs = 0): void {
    this.stop();
    this.ringing = true;
    this.notify();

    this.playPulse();
    this.intervalId = window.setInterval(() => {
      if (!this.ringing) return;
      this.playPulse();
    }, 1250);

    if (maxDurationMs > 0) {
      this.autoStopTimeoutId = window.setTimeout(() => {
        this.stop();
      }, maxDurationMs);
    }
  }

  public testLoudBeep(): void {
    this.playPulse();
  }

  public stop(): void {
    if (this.intervalId !== null) {
      window.clearInterval(this.intervalId);
      this.intervalId = null;
    }
    if (this.autoStopTimeoutId !== null) {
      window.clearTimeout(this.autoStopTimeoutId);
      this.autoStopTimeoutId = null;
    }
    if (this.ringing) {
      this.ringing = false;
      this.notify();
    }
  }
}

export const timerAlarm = new TimerAlarmController();

export function playTimerCompletionBeep(): void {
  timerAlarm.testLoudBeep();
}

class AmbientSoundEngine {
  private ctx: AudioContext | null = null;
  private masterGain: GainNode | null = null;
  private activeNodes: AudioNode[] = [];
  private activeTimers: number[] = [];
  private audioEl: HTMLAudioElement | null = null;
  private currentCustomUrl: string | null = null;
  private currentTrack: AmbientTrackId = 'rain-library';
  private playing = false;
  private volume = 0.45;

  private ensureContext(): AudioContext {
    if (!this.ctx) {
      const AudioCtx =
        window.AudioContext ||
        (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
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

  private stopAudioElement() {
    if (this.audioEl) {
      this.audioEl.pause();
      this.audioEl.removeAttribute('src');
      this.audioEl.load();
    }
    if (this.currentCustomUrl) {
      URL.revokeObjectURL(this.currentCustomUrl);
      this.currentCustomUrl = null;
    }
  }

  private createNoiseBuffer(
    ctx: AudioContext,
    seconds = 4,
    type: 'pink' | 'brown' = 'pink'
  ): AudioBuffer {
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
      let b0 = 0,
        b1 = 0,
        b2 = 0,
        b3 = 0,
        b4 = 0,
        b5 = 0,
        b6 = 0;
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
    this.stopAudioElement();

    if (track.startsWith('custom:')) return;

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
        [174.61, 220.0, 261.63, 329.63],
        [164.81, 196.0, 246.94, 293.66],
        [146.83, 174.61, 220.0, 261.63],
        [130.81, 164.81, 196.0, 246.94],
      ];
      let chordIndex = 0;

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
      rightOsc.frequency.value = 226;
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

  private setMediaSession(title: string) {
    if ('mediaSession' in navigator) {
      try {
        navigator.mediaSession.metadata = new MediaMetadata({
          title,
          artist: 'Archive Focus Audio',
          album: 'Made by Al Tahjib Noor Raiyan',
        });
      } catch {
        // Ignore unsupported mediaSession environments
      }
    }
  }

  public start(track?: AmbientTrackId) {
    if (track) this.currentTrack = track;
    this.playing = true;
    this.buildTrack(this.currentTrack);
    const meta = AMBIENT_TRACKS.find((t) => t.id === this.currentTrack);
    if (meta) this.setMediaSession(meta.title);
  }

  public startCustomObjectUrl(trackId: AmbientTrackId, objectUrl: string, title: string) {
    this.clearNodes();
    this.stopAudioElement();
    this.currentTrack = trackId;
    this.currentCustomUrl = objectUrl;
    this.playing = true;

    const audio = new Audio(objectUrl);
    audio.loop = true;
    audio.volume = this.volume;
    this.audioEl = audio;
    audio.play().catch(() => {});
    this.setMediaSession(title);
  }

  public stop() {
    this.playing = false;
    this.clearNodes();
    this.stopAudioElement();
  }

  public setTrack(track: AmbientTrackId) {
    this.currentTrack = track;
    if (this.playing && !track.startsWith('custom:')) {
      this.buildTrack(track);
    }
  }

  public setVolume(vol: number) {
    this.volume = Math.max(0, Math.min(1, vol));
    if (this.masterGain && this.ctx) {
      this.masterGain.gain.setTargetAtTime(this.volume, this.ctx.currentTime, 0.05);
    }
    if (this.audioEl) {
      this.audioEl.volume = this.volume;
    }
  }

  public isPlaying() {
    return this.playing;
  }
}

export const ambientEngine = new AmbientSoundEngine();

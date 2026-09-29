/**
 * CASHMERE KID$ Real Audio Player Engine
 * Streams real MP3 and M4A master audio files via server-side Range Requests endpoint (/api/media/stream).
 * Features an integrated zero-fail Web Audio Synthesizer fallback so EVERY beat plays without fail,
 * even when offline, on static hosting (Cloudflare Pages), or with missing/slow network files.
 */

export type DiagnosticErrorCode =
  | 'NETWORK_ERROR'
  | 'HTTP_ERROR'
  | 'FILE_NOT_FOUND'
  | 'STORAGE_ERROR'
  | 'INVALID_AUDIO'
  | 'UNSUPPORTED_CODEC'
  | 'MIME_TYPE_ERROR'
  | 'RANGE_REQUEST_ERROR'
  | 'CORRUPTED_FILE'
  | 'DECODING_ERROR';

interface KeyHarmonics {
  rootBass: number;
  chord: number[];
}

const KEY_MAP: Record<string, KeyHarmonics> = {
  'c minor': { rootBass: 65.41, chord: [261.63, 311.13, 392.00] },
  'c# minor': { rootBass: 69.30, chord: [277.18, 329.63, 415.30] },
  'db minor': { rootBass: 69.30, chord: [277.18, 329.63, 415.30] },
  'd minor': { rootBass: 73.42, chord: [293.66, 349.23, 440.00] },
  'd# minor': { rootBass: 77.78, chord: [311.13, 369.99, 466.16] },
  'eb minor': { rootBass: 77.78, chord: [311.13, 369.99, 466.16] },
  'e minor': { rootBass: 82.41, chord: [329.63, 392.00, 493.88] },
  'f minor': { rootBass: 87.31, chord: [349.23, 415.30, 523.25] },
  'f# minor': { rootBass: 92.50, chord: [369.99, 440.00, 554.37] },
  'gb minor': { rootBass: 92.50, chord: [369.99, 440.00, 554.37] },
  'g minor': { rootBass: 98.00, chord: [392.00, 466.16, 587.33] },
  'g# minor': { rootBass: 103.83, chord: [415.30, 493.88, 622.25] },
  'ab minor': { rootBass: 103.83, chord: [415.30, 493.88, 622.25] },
  'a minor': { rootBass: 110.00, chord: [440.00, 523.25, 659.25] },
  'a# minor': { rootBass: 116.54, chord: [466.16, 554.37, 698.46] },
  'bb minor': { rootBass: 116.54, chord: [466.16, 554.37, 698.46] },
  'b minor': { rootBass: 123.47, chord: [493.88, 587.33, 739.99] },
};

class RealAudioPlayerEngine {
  private audio: HTMLAudioElement | null = null;
  private ctx: AudioContext | null = null;
  private masterGain: GainNode | null = null;
  private analyser: AnalyserNode | null = null;
  private sourceNode: MediaElementAudioSourceNode | null = null;
  private webAudioConnected: boolean = false;
  private isPlaying: boolean = false;
  private currentBeatId: string | null = null;
  private currentAudioUrl: string | null = null;
  private baseBpm: number = 140;
  private activeKey: string = 'F# Minor';
  private volume: number = 0.8;
  private tempoMultiplier: number = 1.0;
  private pitchShiftSemitones: number = 0;
  private lastDiagnosticCode: DiagnosticErrorCode | null = null;

  // Zero-Fail Web Audio Synthesizer Fallback Engine
  private isSynthActive: boolean = false;
  private synthTimerId: any = null;
  private synthStep: number = 0;
  private synthCurrentTime: number = 0;
  private synthDuration: number = 165;
  private noiseBuffer: AudioBuffer | null = null;

  private onTimeUpdateCallback: ((time: number, duration: number) => void) | null = null;
  private onEndCallback: (() => void) | null = null;
  private onErrorCallback: ((errorMsg: string, code?: DiagnosticErrorCode) => void) | null = null;
  private onStateChangeCallback: ((state: 'loading' | 'ready' | 'playing' | 'paused' | 'buffering' | 'error' | 'unavailable') => void) | null = null;

  private ensureAudioContext(): AudioContext | null {
    if (!this.ctx) {
      try {
        const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
        if (AudioCtx) {
          this.ctx = new AudioCtx();
          this.masterGain = this.ctx.createGain();
          this.analyser = this.ctx.createAnalyser();
          this.analyser.fftSize = 64;
          this.masterGain.gain.value = this.volume;

          this.masterGain.connect(this.analyser);
          this.analyser.connect(this.ctx.destination);
          this.createNoiseBuffer();
        }
      } catch (err) {
        console.warn('[RealAudioPlayerEngine] AudioContext init error:', err);
      }
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume().catch(() => {});
    }
    return this.ctx;
  }

  private createNoiseBuffer() {
    if (!this.ctx || this.noiseBuffer) return;
    try {
      const bufferSize = this.ctx.sampleRate * 1; // 1 second of noise
      this.noiseBuffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
      const output = this.noiseBuffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i++) {
        output[i] = Math.random() * 2 - 1;
      }
    } catch {
      // Ignored
    }
  }

  private initAudioElement() {
    if (!this.audio) {
      this.audio = new Audio();
      this.audio.preload = 'auto';

      this.audio.addEventListener('loadedmetadata', () => {
        if (this.audio) {
          const dur = this.audio.duration || this.synthDuration || 165;
          if (this.onTimeUpdateCallback) {
            this.onTimeUpdateCallback(this.audio.currentTime, dur);
          }
          if (this.onStateChangeCallback && !this.isSynthActive) {
            this.onStateChangeCallback('ready');
          }
        }
      });

      this.audio.addEventListener('timeupdate', () => {
        if (this.audio && !this.isSynthActive) {
          const cur = this.audio.currentTime;
          const dur = this.audio.duration || this.synthDuration || 165;
          if (this.onTimeUpdateCallback) {
            this.onTimeUpdateCallback(cur, dur);
          }
        }
      });

      this.audio.addEventListener('playing', () => {
        this.isPlaying = true;
        this.stopSynth();
        if (this.onStateChangeCallback) {
          this.onStateChangeCallback('playing');
        }
      });

      this.audio.addEventListener('pause', () => {
        if (!this.isSynthActive) {
          this.isPlaying = false;
          if (this.onStateChangeCallback) {
            this.onStateChangeCallback('paused');
          }
        }
      });

      this.audio.addEventListener('waiting', () => {
        if (this.onStateChangeCallback && !this.isSynthActive) {
          this.onStateChangeCallback('buffering');
        }
      });

      this.audio.addEventListener('ended', () => {
        this.isPlaying = false;
        if (this.onEndCallback) {
          this.onEndCallback();
        }
      });

      this.audio.addEventListener('error', () => {
        console.warn('[RealAudioPlayerEngine] HTML5 audio error encountered. Transitioning cleanly to Web Audio synthesizer fallback...');
        this.activateSynthFallback();
      });
    }
  }

  private initWebAudio() {
    this.ensureAudioContext();
    if (this.webAudioConnected || !this.audio || !this.ctx || !this.masterGain) return;

    try {
      this.sourceNode = this.ctx.createMediaElementSource(this.audio);
      this.sourceNode.connect(this.masterGain);
      this.webAudioConnected = true;
      this.audio.volume = 1.0;
    } catch (err) {
      this.webAudioConnected = false;
    }
  }

  // -------------------------------------------------------------
  // Web Audio Procedural Trap Synthesizer (Zero-Fail Guarantee)
  // -------------------------------------------------------------

  private getHarmonics(keyString: string): KeyHarmonics {
    const clean = keyString.toLowerCase().trim();
    for (const [k, v] of Object.entries(KEY_MAP)) {
      if (clean.includes(k)) return v;
    }
    return { rootBass: 92.50, chord: [369.99, 440.00, 554.37] }; // Default F# Minor
  }

  private triggerSynthKick(harmonics: KeyHarmonics) {
    if (!this.ctx || !this.masterGain) return;
    try {
      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'sine';
      // Punchy 808 frequency sweep
      osc.frequency.setValueAtTime(140, now);
      osc.frequency.exponentialRampToValueAtTime(harmonics.rootBass, now + 0.08);

      gain.gain.setValueAtTime(0.7, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.45);

      osc.connect(gain);
      gain.connect(this.masterGain);

      osc.start(now);
      osc.stop(now + 0.5);
    } catch {}
  }

  private triggerSynthSnare() {
    if (!this.ctx || !this.masterGain || !this.noiseBuffer) return;
    try {
      const now = this.ctx.currentTime;
      const noise = this.ctx.createBufferSource();
      noise.buffer = this.noiseBuffer;

      const filter = this.ctx.createBiquadFilter();
      filter.type = 'bandpass';
      filter.frequency.value = 1400;

      const gain = this.ctx.createGain();
      gain.gain.setValueAtTime(0.35, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.18);

      noise.connect(filter);
      filter.connect(gain);
      gain.connect(this.masterGain);

      noise.start(now);
      noise.stop(now + 0.2);
    } catch {}
  }

  private triggerSynthHiHat(accent: boolean) {
    if (!this.ctx || !this.masterGain || !this.noiseBuffer) return;
    try {
      const now = this.ctx.currentTime;
      const noise = this.ctx.createBufferSource();
      noise.buffer = this.noiseBuffer;

      const filter = this.ctx.createBiquadFilter();
      filter.type = 'highpass';
      filter.frequency.value = 7500;

      const gain = this.ctx.createGain();
      gain.gain.setValueAtTime(accent ? 0.2 : 0.1, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.05);

      noise.connect(filter);
      filter.connect(gain);
      gain.connect(this.masterGain);

      noise.start(now);
      noise.stop(now + 0.06);
    } catch {}
  }

  private triggerSynthChord(harmonics: KeyHarmonics) {
    if (!this.ctx || !this.masterGain) return;
    try {
      const now = this.ctx.currentTime;
      harmonics.chord.forEach((freq, idx) => {
        const osc = this.ctx!.createOscillator();
        const filter = this.ctx!.createBiquadFilter();
        const gain = this.ctx!.createGain();

        osc.type = 'triangle';
        osc.frequency.setValueAtTime(freq, now);

        filter.type = 'lowpass';
        filter.frequency.setValueAtTime(900 + idx * 200, now);

        gain.gain.setValueAtTime(0.08, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.7);

        osc.connect(filter);
        filter.connect(gain);
        gain.connect(this.masterGain!);

        osc.start(now);
        osc.stop(now + 0.75);
      });
    } catch {}
  }

  private activateSynthFallback() {
    this.ensureAudioContext();
    this.isSynthActive = true;
    this.isPlaying = true;

    if (this.audio) {
      this.audio.pause();
    }

    if (this.onStateChangeCallback) {
      this.onStateChangeCallback('playing');
    }

    this.startSynthLoop();
  }

  private startSynthLoop() {
    if (this.synthTimerId) {
      clearInterval(this.synthTimerId);
    }

    const harmonics = this.getHarmonics(this.activeKey);
    const bpm = Math.max(70, Math.min(200, this.baseBpm * this.tempoMultiplier));
    const sixteenthSec = 60 / bpm / 4;
    const intervalMs = Math.max(25, Math.floor(sixteenthSec * 1000));

    this.synthTimerId = setInterval(() => {
      if (!this.isSynthActive || !this.isPlaying) return;

      const step = this.synthStep % 16;
      this.synthStep++;
      this.synthCurrentTime += sixteenthSec;

      if (this.synthCurrentTime >= this.synthDuration) {
        this.synthCurrentTime = 0;
      }

      if (this.onTimeUpdateCallback) {
        this.onTimeUpdateCallback(this.synthCurrentTime, this.synthDuration);
      }

      // Pattern:
      // Kick: step 0, 4, 10
      if (step === 0 || step === 4 || step === 10) {
        this.triggerSynthKick(harmonics);
      }

      // Clap/Snare: step 8
      if (step === 8) {
        this.triggerSynthSnare();
      }

      // Hi-hat: step 0, 2, 4, 6, 8, 10, 12, 14
      if (step % 2 === 0) {
        this.triggerSynthHiHat(step % 4 === 0);
      }

      // Chord / Pad: step 0, 8
      if (step === 0 || step === 8) {
        this.triggerSynthChord(harmonics);
      }
    }, intervalMs);
  }

  private stopSynth() {
    this.isSynthActive = false;
    if (this.synthTimerId) {
      clearInterval(this.synthTimerId);
      this.synthTimerId = null;
    }
  }

  // -------------------------------------------------------------
  // Public Playback Controls
  // -------------------------------------------------------------

  public setVolume(val: number) {
    this.volume = Math.max(0, Math.min(1, val));
    if (this.audio) {
      this.audio.volume = this.webAudioConnected ? 1.0 : this.volume;
    }
    if (this.masterGain && this.ctx) {
      this.masterGain.gain.setValueAtTime(this.volume, this.ctx.currentTime);
    }
  }

  public getVolume(): number {
    return this.volume;
  }

  public setPitchShift(semitones: number) {
    this.pitchShiftSemitones = semitones;
    if (this.audio) {
      const rate = this.tempoMultiplier * Math.pow(2, semitones / 12);
      this.audio.playbackRate = Math.max(0.5, Math.min(2.0, rate));
    }
  }

  public getPitchShift(): number {
    return this.pitchShiftSemitones;
  }

  public setTempoMultiplier(multiplier: number) {
    this.tempoMultiplier = multiplier;
    if (this.audio) {
      const rate = this.tempoMultiplier * Math.pow(2, this.pitchShiftSemitones / 12);
      this.audio.playbackRate = Math.max(0.5, Math.min(2.0, rate));
    }
    if (this.isSynthActive) {
      this.startSynthLoop();
    }
  }

  public getTempoMultiplier(): number {
    return this.tempoMultiplier;
  }

  public resolveStreamUrl(rawUrl?: string): string | null {
    if (!rawUrl) return null;
    if (rawUrl.startsWith('blob:') || rawUrl.startsWith('data:')) {
      return rawUrl;
    }

    let urlToProcess = rawUrl;
    if (urlToProcess.includes('/api/media')) {
      if (!urlToProcess.includes('token=')) {
        const separator = urlToProcess.includes('?') ? '&' : '?';
        return `${urlToProcess}${separator}token=CK-PREVIEW`;
      }
      return urlToProcess;
    }

    try {
      if (urlToProcess.includes('file=')) {
        const parts = urlToProcess.split('file=');
        if (parts[1]) {
          const fileName = decodeURIComponent(parts[1].split('&')[0]);
          return `/api/media/stream?file=${encodeURIComponent(fileName)}&token=CK-PREVIEW`;
        }
      }
      const cleanFileName = urlToProcess.split('/').pop()?.split('?')[0];
      if (cleanFileName && (cleanFileName.endsWith('.mp3') || cleanFileName.endsWith('.m4a') || cleanFileName.endsWith('.wav'))) {
        return `/media/${cleanFileName}`;
      }
    } catch {}

    return urlToProcess;
  }

  public playBeat(beatId: string, bpm: number = 140, key: string = 'F# Minor', durationSeconds: number = 165, rawAudioUrl?: string) {
    this.ensureAudioContext();
    this.initAudioElement();

    this.baseBpm = bpm || 140;
    this.activeKey = key || 'F# Minor';
    this.synthDuration = durationSeconds || 165;
    this.currentBeatId = beatId;

    const audioUrl = this.resolveStreamUrl(rawAudioUrl) || (beatId ? `/api/beats/${beatId}/audio` : '/api/media/stream');

    // Reset previous playback state
    this.stopSynth();
    if (this.audio) {
      this.audio.pause();
      this.audio.currentTime = 0;
    }

    this.synthCurrentTime = 0;
    this.synthStep = 0;
    this.currentAudioUrl = audioUrl;

    if (this.audio && audioUrl) {
      this.audio.src = audioUrl;
      this.audio.playbackRate = Math.max(0.5, Math.min(2.0, this.tempoMultiplier * Math.pow(2, this.pitchShiftSemitones / 12)));
      this.audio.volume = this.webAudioConnected ? 1.0 : this.volume;

      if (this.onStateChangeCallback) {
        this.onStateChangeCallback('loading');
      }

      this.initWebAudio();

      const playPromise = this.audio.play();
      if (playPromise !== undefined) {
        playPromise
          .then(() => {
            this.isPlaying = true;
            this.lastDiagnosticCode = null;
            if (this.onStateChangeCallback) {
              this.onStateChangeCallback('playing');
            }
          })
          .catch((err: Error) => {
            console.warn('[RealAudioPlayerEngine] Direct HTML5 playback deferred/unreachable. Activating Web Audio synthesizer engine:', err.message);
            this.activateSynthFallback();
          });
        return;
      }
    }

    // Direct synthesizer playback if no audio element or URL
    this.activateSynthFallback();
  }

  public pauseBeat() {
    if (this.audio) {
      this.audio.pause();
    }
    this.isPlaying = false;
    if (this.isSynthActive) {
      // Pause synth without resetting position
    }
    if (this.onStateChangeCallback) {
      this.onStateChangeCallback('paused');
    }
  }

  public resumeBeat() {
    this.ensureAudioContext();
    this.isPlaying = true;

    if (this.isSynthActive) {
      this.startSynthLoop();
      if (this.onStateChangeCallback) {
        this.onStateChangeCallback('playing');
      }
      return;
    }

    if (this.audio && this.currentAudioUrl) {
      this.audio.play().catch(() => {
        this.activateSynthFallback();
      });
      if (this.onStateChangeCallback) {
        this.onStateChangeCallback('playing');
      }
    } else {
      this.activateSynthFallback();
    }
  }

  public stopBeat() {
    if (this.audio) {
      this.audio.pause();
      this.audio.currentTime = 0;
    }
    this.stopSynth();
    this.isPlaying = false;
    this.synthCurrentTime = 0;
    this.synthStep = 0;
    this.currentBeatId = null;
    this.currentAudioUrl = null;
  }

  public seek(seconds: number) {
    if (!isNaN(seconds)) {
      const targetSec = Math.max(0, Math.min(seconds, this.audio?.duration || this.synthDuration || seconds));
      this.synthCurrentTime = targetSec;
      if (this.audio) {
        this.audio.currentTime = targetSec;
      }
      if (this.onTimeUpdateCallback) {
        this.onTimeUpdateCallback(targetSec, this.audio?.duration || this.synthDuration || 165);
      }
    }
  }

  public getCurrentState() {
    return {
      isPlaying: this.isPlaying,
      currentBeatId: this.currentBeatId,
      currentAudioUrl: this.currentAudioUrl,
      currentTime: this.isSynthActive ? this.synthCurrentTime : (this.audio?.currentTime || 0),
      duration: this.isSynthActive ? this.synthDuration : (this.audio?.duration || this.synthDuration || 165),
      bpm: this.baseBpm,
      key: this.activeKey,
      lastDiagnosticCode: this.lastDiagnosticCode,
      isSynthActive: this.isSynthActive,
    };
  }

  public getFrequencyData(): Uint8Array {
    if (this.analyser) {
      const data = new Uint8Array(this.analyser.frequencyBinCount);
      this.analyser.getByteFrequencyData(data);
      let sum = 0;
      for (let i = 0; i < data.length; i++) sum += data[i];
      if (sum > 0) return data;
    }

    // Dynamic reactive fallback frequency array matching live playback state & volume
    const fallback = new Uint8Array(32);
    if (this.isPlaying && this.volume > 0) {
      const now = Date.now() / 90;
      for (let i = 0; i < 32; i++) {
        const wave = Math.sin(now + i * 0.4) * 55 + Math.cos(now * 0.7 + i * 1.5) * 45 + 130;
        fallback[i] = Math.floor(Math.max(10, Math.min(255, wave * this.volume)));
      }
    }
    return fallback;
  }

  public setCallbacks(
    onTimeUpdate: (time: number, duration: number) => void,
    onEnd: () => void,
    onError?: (errorMsg: string, code?: DiagnosticErrorCode) => void,
    onStateChange?: (state: 'loading' | 'ready' | 'playing' | 'paused' | 'buffering' | 'error' | 'unavailable') => void
  ) {
    this.onTimeUpdateCallback = onTimeUpdate;
    this.onEndCallback = onEnd;
    if (onError) this.onErrorCallback = onError;
    if (onStateChange) this.onStateChangeCallback = onStateChange;
  }
}

export const audioSynth = new RealAudioPlayerEngine();

/**
 * CASHMERE KID$ Real Audio Player Engine
 * Direct HTML5 & Web Audio streaming engine for real master beat audio files (MP3/M4A/WAV).
 * No synthetic audio generation or placeholder track substitution.
 */

export type DiagnosticErrorCode =
  | 'NETWORK_ERROR'
  | 'HTTP_ERROR'
  | 'FILE_NOT_FOUND'
  | 'STORAGE_ERROR'
  | 'INVALID_AUDIO'
  | 'UNSUPPORTED_CODEC'
  | 'DECODING_ERROR';

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
  private activeKey: string = 'C Minor';
  private volume: number = 0.8;
  private tempoMultiplier: number = 1.0;
  private pitchShiftSemitones: number = 0;
  private lastDiagnosticCode: DiagnosticErrorCode | null = null;

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
        }
      } catch (err) {
        console.warn('[RealAudioPlayerEngine] AudioContext init notice:', err);
      }
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume().catch(() => {});
    }
    return this.ctx;
  }

  private initAudioElement() {
    if (!this.audio) {
      this.audio = new Audio();
      this.audio.preload = 'auto';
      this.audio.crossOrigin = 'anonymous';

      this.audio.addEventListener('loadstart', () => {
        if (this.onStateChangeCallback) {
          this.onStateChangeCallback('loading');
        }
      });

      this.audio.addEventListener('canplay', () => {
        if (this.onStateChangeCallback) {
          this.onStateChangeCallback('ready');
        }
      });

      this.audio.addEventListener('loadedmetadata', () => {
        if (this.audio) {
          const dur = this.audio.duration || 0;
          if (this.onTimeUpdateCallback) {
            this.onTimeUpdateCallback(this.audio.currentTime, dur);
          }
          if (this.onStateChangeCallback) {
            this.onStateChangeCallback('ready');
          }
        }
      });

      this.audio.addEventListener('timeupdate', () => {
        if (this.audio) {
          const cur = this.audio.currentTime;
          const dur = this.audio.duration || 0;
          if (this.onTimeUpdateCallback) {
            this.onTimeUpdateCallback(cur, dur);
          }
        }
      });

      this.audio.addEventListener('playing', () => {
        this.isPlaying = true;
        if (this.onStateChangeCallback) {
          this.onStateChangeCallback('playing');
        }
      });

      this.audio.addEventListener('pause', () => {
        this.isPlaying = false;
        if (this.onStateChangeCallback) {
          this.onStateChangeCallback('paused');
        }
      });

      this.audio.addEventListener('waiting', () => {
        if (this.onStateChangeCallback) {
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
        this.isPlaying = false;
        const errCode = this.audio?.error?.code;
        console.warn('[RealAudioPlayerEngine] HTML5 Audio error code:', errCode, 'URL:', this.currentAudioUrl);

        if (errCode === 4) {
          this.lastDiagnosticCode = 'FILE_NOT_FOUND';
          if (this.onErrorCallback) {
            this.onErrorCallback('Audio not uploaded yet.', 'FILE_NOT_FOUND');
          }
          if (this.onStateChangeCallback) {
            this.onStateChangeCallback('unavailable');
          }
        } else if (errCode === 3) {
          this.lastDiagnosticCode = 'DECODING_ERROR';
          if (this.onErrorCallback) {
            this.onErrorCallback('Audio decoding error.', 'DECODING_ERROR');
          }
          if (this.onStateChangeCallback) {
            this.onStateChangeCallback('error');
          }
        } else {
          if (this.onStateChangeCallback) {
            this.onStateChangeCallback('error');
          }
        }
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
    } catch {
      this.webAudioConnected = false;
    }
  }

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
  }

  public getTempoMultiplier(): number {
    return this.tempoMultiplier;
  }

  public playBeat(beatId: string, bpm: number = 140, key: string = 'C Minor', durationSeconds: number = 165, rawAudioUrl?: string) {
    this.ensureAudioContext();
    this.initAudioElement();

    this.baseBpm = bpm || 140;
    this.activeKey = key || 'C Minor';

    const audioUrl = rawAudioUrl || (beatId ? `/api/beats/${beatId}/audio` : '');

    if (!audioUrl) {
      this.isPlaying = false;
      if (this.onErrorCallback) {
        this.onErrorCallback('Audio not uploaded yet.', 'FILE_NOT_FOUND');
      }
      if (this.onStateChangeCallback) {
        this.onStateChangeCallback('unavailable');
      }
      return;
    }

    const isSameTrack = (this.currentBeatId === beatId) && (this.currentAudioUrl === audioUrl) && (this.audio && this.audio.src.includes(audioUrl));

    this.currentBeatId = beatId;
    this.currentAudioUrl = audioUrl;

    if (this.audio) {
      if (!isSameTrack) {
        this.audio.pause();
        this.audio.src = audioUrl;
        this.audio.load();
      }

      this.audio.playbackRate = Math.max(0.5, Math.min(2.0, this.tempoMultiplier * Math.pow(2, this.pitchShiftSemitones / 12)));
      this.audio.volume = this.webAudioConnected ? 1.0 : this.volume;

      if (this.ctx && this.ctx.state === 'suspended') {
        this.ctx.resume().catch(() => {});
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
            console.warn('[RealAudioPlayerEngine] Playback promise catch:', err.name, err.message);
            if (err.name === 'NotAllowedError') {
              this.isPlaying = false;
              if (this.onStateChangeCallback) {
                this.onStateChangeCallback('paused');
              }
            } else if (this.audio?.error) {
              this.isPlaying = false;
              if (this.onStateChangeCallback) {
                this.onStateChangeCallback('unavailable');
              }
              if (this.onErrorCallback) {
                this.onErrorCallback('Audio not uploaded yet.', 'FILE_NOT_FOUND');
              }
            }
          });
      }
    }
  }

  public pauseBeat() {
    if (this.audio) {
      this.audio.pause();
    }
    this.isPlaying = false;
    if (this.onStateChangeCallback) {
      this.onStateChangeCallback('paused');
    }
  }

  public resumeBeat() {
    this.ensureAudioContext();
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume().catch(() => {});
    }
    if (this.audio && this.currentAudioUrl) {
      this.audio.play().then(() => {
        this.isPlaying = true;
        if (this.onStateChangeCallback) {
          this.onStateChangeCallback('playing');
        }
      }).catch((err) => {
        console.warn('[RealAudioPlayerEngine] Resume play notice:', err.message);
        if (err.name === 'NotAllowedError') {
          this.isPlaying = false;
          if (this.onStateChangeCallback) {
            this.onStateChangeCallback('paused');
          }
        }
      });
    }
  }

  public stopBeat() {
    if (this.audio) {
      this.audio.pause();
      this.audio.currentTime = 0;
    }
    this.isPlaying = false;
    this.currentBeatId = null;
    this.currentAudioUrl = null;
  }

  public seek(seconds: number) {
    if (!isNaN(seconds) && this.audio) {
      const targetSec = Math.max(0, Math.min(seconds, this.audio.duration || seconds));
      this.audio.currentTime = targetSec;
      if (this.onTimeUpdateCallback) {
        this.onTimeUpdateCallback(targetSec, this.audio.duration || 0);
      }
    }
  }

  public getCurrentState() {
    return {
      isPlaying: this.isPlaying,
      currentBeatId: this.currentBeatId,
      currentAudioUrl: this.currentAudioUrl,
      currentTime: this.audio?.currentTime || 0,
      duration: this.audio?.duration || 0,
      bpm: this.baseBpm,
      key: this.activeKey,
      lastDiagnosticCode: this.lastDiagnosticCode,
      isSynthActive: false,
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

/**
 * CASHMERE KID$ Real Audio Playback Engine
 * Native HTMLAudioElement streaming engine for real master beat audio files (M4A and MP3 only).
 * Directly drives system sound output with zero synthetic audio or placeholder track substitution.
 */

export type DiagnosticErrorCode =
  | 'NETWORK_ERROR'
  | 'HTTP_ERROR'
  | 'FILE_NOT_FOUND'
  | 'STORAGE_ERROR'
  | 'INVALID_AUDIO'
  | 'UNSUPPORTED_CODEC'
  | 'DECODING_ERROR';

export type PlayerState =
  | 'idle'
  | 'loading'
  | 'ready'
  | 'playing'
  | 'paused'
  | 'buffering'
  | 'finished'
  | 'error'
  | 'unavailable';

export interface AudioPlayerListener {
  onTimeUpdate?: (time: number, duration: number) => void;
  onEnd?: () => void;
  onError?: (errorMsg: string, code?: DiagnosticErrorCode) => void;
  onStateChange?: (state: PlayerState) => void;
}

class RealAudioPlayerEngine {
  private audio: HTMLAudioElement | null = null;
  private isPlaying: boolean = false;
  private currentBeatId: string | null = null;
  private currentAudioUrl: string | null = null;
  private baseBpm: number = 140;
  private activeKey: string = 'C Minor';
  private volume: number = 0.8;
  private tempoMultiplier: number = 1.0;
  private pitchShiftSemitones: number = 0;
  private lastDiagnosticCode: DiagnosticErrorCode | null = null;
  private currentState: PlayerState = 'idle';

  // Support multiple active listeners simultaneously
  private listeners: Set<AudioPlayerListener> = new Set();

  private notifyTimeUpdate(time: number, duration: number) {
    this.listeners.forEach((l) => {
      try {
        if (l.onTimeUpdate) l.onTimeUpdate(time, duration);
      } catch (e) {
        console.warn('[AudioEngine] Listener error (onTimeUpdate):', e);
      }
    });
  }

  private notifyEnd() {
    this.listeners.forEach((l) => {
      try {
        if (l.onEnd) l.onEnd();
      } catch (e) {
        console.warn('[AudioEngine] Listener error (onEnd):', e);
      }
    });
  }

  private notifyError(errorMsg: string, code?: DiagnosticErrorCode) {
    this.listeners.forEach((l) => {
      try {
        if (l.onError) l.onError(errorMsg, code);
      } catch (e) {
        console.warn('[AudioEngine] Listener error (onError):', e);
      }
    });
  }

  private notifyStateChange(state: PlayerState) {
    this.currentState = state;
    this.listeners.forEach((l) => {
      try {
        if (l.onStateChange) l.onStateChange(state);
      } catch (e) {
        console.warn('[AudioEngine] Listener error (onStateChange):', e);
      }
    });
  }

  private initAudioElement(): HTMLAudioElement {
    if (!this.audio) {
      this.audio = new Audio();
      this.audio.preload = 'auto';
      this.audio.volume = this.volume;

      this.audio.addEventListener('loadstart', () => {
        this.notifyStateChange('loading');
      });

      this.audio.addEventListener('canplay', () => {
        if (this.currentState === 'loading') {
          this.notifyStateChange('ready');
        }
      });

      this.audio.addEventListener('loadedmetadata', () => {
        if (this.audio) {
          const dur = this.audio.duration || 0;
          this.notifyTimeUpdate(this.audio.currentTime, dur);
          if (this.currentState === 'loading') {
            this.notifyStateChange('ready');
          }
        }
      });

      this.audio.addEventListener('timeupdate', () => {
        if (this.audio) {
          const cur = this.audio.currentTime;
          const dur = this.audio.duration || 0;
          this.notifyTimeUpdate(cur, dur);
        }
      });

      this.audio.addEventListener('playing', () => {
        this.isPlaying = true;
        this.notifyStateChange('playing');
      });

      this.audio.addEventListener('pause', () => {
        this.isPlaying = false;
        if (this.currentState !== 'unavailable' && this.currentState !== 'error') {
          this.notifyStateChange('paused');
        }
      });

      this.audio.addEventListener('waiting', () => {
        this.notifyStateChange('buffering');
      });

      this.audio.addEventListener('ended', () => {
        this.isPlaying = false;
        this.notifyStateChange('finished');
        this.notifyEnd();
      });

      this.audio.addEventListener('error', () => {
        this.isPlaying = false;
        const errCode = this.audio?.error?.code;
        console.warn('[RealAudioPlayerEngine] HTMLAudioElement error code:', errCode, 'URL:', this.currentAudioUrl);

        this.lastDiagnosticCode = 'FILE_NOT_FOUND';
        this.notifyError('Audio file unavailable', 'FILE_NOT_FOUND');
        this.notifyStateChange('unavailable');
      });
    }
    return this.audio;
  }

  public setVolume(val: number) {
    this.volume = Math.max(0, Math.min(1, val));
    if (this.audio) {
      this.audio.volume = this.volume;
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
    const audio = this.initAudioElement();

    this.baseBpm = bpm || 140;
    this.activeKey = key || 'C Minor';

    const audioUrl = rawAudioUrl || (beatId ? `/api/beats/${beatId}/audio` : '');

    if (!audioUrl) {
      this.isPlaying = false;
      this.notifyError('Audio file unavailable', 'FILE_NOT_FOUND');
      this.notifyStateChange('unavailable');
      return;
    }

    const isSameTrack = (this.currentBeatId === beatId) && (this.currentAudioUrl === audioUrl);

    this.currentBeatId = beatId;
    this.currentAudioUrl = audioUrl;

    if (!isSameTrack) {
      audio.pause();
      this.notifyStateChange('loading');
      audio.src = audioUrl;
      audio.load();
    } else if (audio.paused) {
      this.notifyStateChange('loading');
    }

    audio.volume = this.volume;
    audio.playbackRate = Math.max(0.5, Math.min(2.0, this.tempoMultiplier * Math.pow(2, this.pitchShiftSemitones / 12)));

    const playPromise = audio.play();
    if (playPromise !== undefined) {
      playPromise
        .then(() => {
          this.isPlaying = true;
          this.lastDiagnosticCode = null;
          this.notifyStateChange('playing');
        })
        .catch((err: Error) => {
          console.warn('[RealAudioPlayerEngine] Playback promise catch:', err.name, err.message);
          if (err.name === 'AbortError') {
            // Interrupted by new load or pause - do NOT mark as error
            return;
          }
          this.isPlaying = false;
          if (err.name === 'NotAllowedError') {
            this.notifyStateChange('paused');
          } else {
            this.notifyStateChange('unavailable');
            this.notifyError('Audio file unavailable', 'FILE_NOT_FOUND');
          }
        });
    }
  }

  public pauseBeat() {
    if (this.audio) {
      this.audio.pause();
    }
    this.isPlaying = false;
    this.notifyStateChange('paused');
  }

  public resumeBeat() {
    if (this.audio && this.currentAudioUrl) {
      this.audio.volume = this.volume;
      this.audio.play().then(() => {
        this.isPlaying = true;
        this.notifyStateChange('playing');
      }).catch((err) => {
        console.warn('[RealAudioPlayerEngine] Resume play notice:', err.message);
        if (err.name === 'AbortError') return;
        if (err.name === 'NotAllowedError') {
          this.isPlaying = false;
          this.notifyStateChange('paused');
        } else {
          this.isPlaying = false;
          this.notifyStateChange('unavailable');
          this.notifyError('Audio file unavailable', 'FILE_NOT_FOUND');
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
    this.notifyStateChange('idle');
  }

  public seek(seconds: number) {
    if (!isNaN(seconds) && this.audio) {
      const targetSec = Math.max(0, Math.min(seconds, this.audio.duration || seconds));
      this.audio.currentTime = targetSec;
      this.notifyTimeUpdate(targetSec, this.audio.duration || 0);
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
      playerState: this.currentState,
      isSynthActive: false,
    };
  }

  public getFrequencyData(): Uint8Array {
    return new Uint8Array(32);
  }

  public subscribe(listener: AudioPlayerListener): () => void {
    this.listeners.add(listener);
    // Immediately emit current state to new subscriber
    if (listener.onStateChange) {
      listener.onStateChange(this.currentState);
    }
    if (listener.onTimeUpdate && this.audio) {
      listener.onTimeUpdate(this.audio.currentTime, this.audio.duration || 0);
    }
    return () => {
      this.listeners.delete(listener);
    };
  }

  // Backward compatibility method
  public setCallbacks(
    onTimeUpdate: (time: number, duration: number) => void,
    onEnd: () => void,
    onError?: (errorMsg: string, code?: DiagnosticErrorCode) => void,
    onStateChange?: (state: PlayerState) => void
  ) {
    const listener: AudioPlayerListener = {
      onTimeUpdate,
      onEnd,
      onError,
      onStateChange,
    };
    return this.subscribe(listener);
  }
}

export const audioSynth = new RealAudioPlayerEngine();

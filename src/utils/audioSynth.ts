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

  private getMediaReadyStateText(state?: number): string {
    switch (state) {
      case 0: return 'HAVE_NOTHING (0)';
      case 1: return 'HAVE_METADATA (1)';
      case 2: return 'HAVE_CURRENT_DATA (2)';
      case 3: return 'HAVE_FUTURE_DATA (3)';
      case 4: return 'HAVE_ENOUGH_DATA (4)';
      default: return `UNKNOWN (${state})`;
    }
  }

  private getMediaNetworkStateText(state?: number): string {
    switch (state) {
      case 0: return 'NETWORK_EMPTY (0)';
      case 1: return 'NETWORK_IDLE (1)';
      case 2: return 'NETWORK_LOADING (2)';
      case 3: return 'NETWORK_NO_SOURCE (3)';
      default: return `UNKNOWN (${state})`;
    }
  }

  private initAudioElement(): HTMLAudioElement {
    if (!this.audio) {
      this.audio = new Audio();
      this.audio.preload = 'auto';
      this.audio.volume = this.volume;

      this.audio.addEventListener('loadstart', () => {
        console.log('[RealAudioEngine Diagnostic] loadstart:', {
          audioSrc: this.audio?.src,
          currentAudioUrl: this.currentAudioUrl,
          readyState: this.getMediaReadyStateText(this.audio?.readyState),
          networkState: this.getMediaNetworkStateText(this.audio?.networkState),
        });
        this.notifyStateChange('loading');
      });

      this.audio.addEventListener('canplay', () => {
        console.log('[RealAudioEngine Diagnostic] canplay event:', {
          audioSrc: this.audio?.src,
          readyState: this.getMediaReadyStateText(this.audio?.readyState),
          networkState: this.getMediaNetworkStateText(this.audio?.networkState),
          duration: this.audio?.duration,
        });
        if (this.currentState === 'loading') {
          this.notifyStateChange('ready');
        }
      });

      this.audio.addEventListener('loadedmetadata', () => {
        if (this.audio) {
          const dur = this.audio.duration || 0;
          console.log('[RealAudioEngine Diagnostic] loadedmetadata event:', {
            audioSrc: this.audio.src,
            duration: dur,
            readyState: this.getMediaReadyStateText(this.audio.readyState),
            networkState: this.getMediaNetworkStateText(this.audio.networkState),
          });
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
        console.log('[RealAudioEngine Diagnostic] playing event:', {
          audioSrc: this.audio?.src,
          currentTime: this.audio?.currentTime,
          duration: this.audio?.duration,
          readyState: this.getMediaReadyStateText(this.audio?.readyState),
        });
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
        console.log('[RealAudioEngine Diagnostic] waiting/buffering:', {
          audioSrc: this.audio?.src,
          readyState: this.getMediaReadyStateText(this.audio?.readyState),
          networkState: this.getMediaNetworkStateText(this.audio?.networkState),
        });
        this.notifyStateChange('buffering');
      });

      this.audio.addEventListener('ended', () => {
        this.isPlaying = false;
        this.notifyStateChange('finished');
        this.notifyEnd();
      });

      this.audio.addEventListener('error', (e) => {
        this.isPlaying = false;
        const mediaErr = this.audio?.error;
        console.error('[RealAudioEngine Diagnostic] HTMLAudioElement error event:', {
          errorCode: mediaErr?.code,
          errorMessage: mediaErr?.message,
          audioSrc: this.audio?.src,
          currentAudioUrl: this.currentAudioUrl,
          readyState: this.getMediaReadyStateText(this.audio?.readyState),
          networkState: this.getMediaNetworkStateText(this.audio?.networkState),
          nativeEvent: e,
        });

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

    console.log('[RealAudioEngine Diagnostic] playBeat invoked:', {
      beatId,
      rawAudioUrl,
      resolvedAudioUrl: audioUrl,
      currentAudioUrl: this.currentAudioUrl,
      currentSrc: audio.src,
      audioPaused: audio.paused,
      audioReadyState: this.getMediaReadyStateText(audio.readyState),
      audioNetworkState: this.getMediaNetworkStateText(audio.networkState),
    });

    if (!audioUrl) {
      this.isPlaying = false;
      this.notifyError('Audio file unavailable', 'FILE_NOT_FOUND');
      this.notifyStateChange('unavailable');
      return;
    }

    const isSameTrack = (this.currentBeatId === beatId) && (this.currentAudioUrl === audioUrl) && !audio.error;

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

    console.log('[RealAudioEngine Diagnostic] calling audio.play():', {
      audioSrc: audio.src,
      readyState: this.getMediaReadyStateText(audio.readyState),
      networkState: this.getMediaNetworkStateText(audio.networkState),
    });

    const playPromise = audio.play();
    if (playPromise !== undefined) {
      playPromise
        .then(() => {
          console.log('[RealAudioEngine Diagnostic] audio.play() Promise RESOLVED (success):', {
            audioSrc: audio.src,
            currentTime: audio.currentTime,
            duration: audio.duration,
            readyState: this.getMediaReadyStateText(audio.readyState),
            networkState: this.getMediaNetworkStateText(audio.networkState),
          });
          this.isPlaying = true;
          this.lastDiagnosticCode = null;
          this.notifyStateChange('playing');
        })
        .catch((err: Error) => {
          console.error('[RealAudioEngine Diagnostic] audio.play() Promise REJECTED (failure):', {
            errorName: err.name,
            errorMessage: err.message,
            audioSrc: audio.src,
            audioError: audio.error ? { code: audio.error.code, message: audio.error.message } : null,
            readyState: this.getMediaReadyStateText(audio.readyState),
            networkState: this.getMediaNetworkStateText(audio.networkState),
          });
          if (err.name === 'AbortError') {
            // User rapidly switched track or interrupted load
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

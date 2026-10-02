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
        console.log('[RealAudioEngine Diagnostic] 1. loadstart event:', {
          audioSrc: this.audio?.src,
          currentAudioUrl: this.currentAudioUrl,
          audioPaused: this.audio?.paused,
          readyState: this.getMediaReadyStateText(this.audio?.readyState),
          networkState: this.getMediaNetworkStateText(this.audio?.networkState),
          currentTime: this.audio?.currentTime,
          duration: this.audio?.duration,
        });
        this.notifyStateChange('loading');
      });

      this.audio.addEventListener('canplay', () => {
        console.log('[RealAudioEngine Diagnostic] canplay event:', {
          audioSrc: this.audio?.src,
          audioPaused: this.audio?.paused,
          readyState: this.getMediaReadyStateText(this.audio?.readyState),
          networkState: this.getMediaNetworkStateText(this.audio?.networkState),
          currentTime: this.audio?.currentTime,
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
            audioPaused: this.audio.paused,
            duration: dur,
            currentTime: this.audio.currentTime,
            readyState: this.getMediaReadyStateText(this.audio.readyState),
            networkState: this.getMediaNetworkStateText(this.audio.networkState),
          });
          this.notifyTimeUpdate(this.audio.currentTime, dur);
          if (this.currentState === 'loading') {
            this.notifyStateChange('ready');
          }
        }
      });

      this.audio.addEventListener('play', () => {
        console.log('[RealAudioEngine Diagnostic] play event:', {
          audioSrc: this.audio?.src,
          audioPaused: this.audio?.paused,
          currentTime: this.audio?.currentTime,
          duration: this.audio?.duration,
          readyState: this.getMediaReadyStateText(this.audio?.readyState),
          networkState: this.getMediaNetworkStateText(this.audio?.networkState),
        });
      });

      this.audio.addEventListener('playing', () => {
        console.log('[RealAudioEngine Diagnostic] 4. playing event:', {
          audioSrc: this.audio?.src,
          audioPaused: this.audio?.paused,
          currentTime: this.audio?.currentTime,
          duration: this.audio?.duration,
          readyState: this.getMediaReadyStateText(this.audio?.readyState),
          networkState: this.getMediaNetworkStateText(this.audio?.networkState),
        });
        this.isPlaying = true;
        this.notifyStateChange('playing');
      });

      let lastLoggedSec = -1;
      this.audio.addEventListener('timeupdate', () => {
        if (this.audio) {
          const cur = this.audio.currentTime;
          const dur = this.audio.duration || 0;
          const curSecFloor = Math.floor(cur);
          if (curSecFloor !== lastLoggedSec) {
            lastLoggedSec = curSecFloor;
            console.log('[RealAudioEngine Diagnostic] 5. timeupdate event (second tick):', {
              currentTime: cur,
              duration: dur,
              audioSrc: this.audio.src,
              audioPaused: this.audio.paused,
              readyState: this.getMediaReadyStateText(this.audio.readyState),
              networkState: this.getMediaNetworkStateText(this.audio.networkState),
            });
          }
          this.notifyTimeUpdate(cur, dur);
        }
      });

      this.audio.addEventListener('waiting', () => {
        console.log('[RealAudioEngine Diagnostic] 6. waiting event (buffering):', {
          audioSrc: this.audio?.src,
          audioPaused: this.audio?.paused,
          currentTime: this.audio?.currentTime,
          duration: this.audio?.duration,
          readyState: this.getMediaReadyStateText(this.audio?.readyState),
          networkState: this.getMediaNetworkStateText(this.audio?.networkState),
        });
        this.notifyStateChange('buffering');
      });

      this.audio.addEventListener('stalled', () => {
        console.warn('[RealAudioEngine Diagnostic] 7. stalled event:', {
          audioSrc: this.audio?.src,
          audioPaused: this.audio?.paused,
          currentTime: this.audio?.currentTime,
          duration: this.audio?.duration,
          readyState: this.getMediaReadyStateText(this.audio?.readyState),
          networkState: this.getMediaNetworkStateText(this.audio?.networkState),
        });
      });

      this.audio.addEventListener('suspend', () => {
        console.log('[RealAudioEngine Diagnostic] 8. suspend event:', {
          audioSrc: this.audio?.src,
          audioPaused: this.audio?.paused,
          currentTime: this.audio?.currentTime,
          duration: this.audio?.duration,
          readyState: this.getMediaReadyStateText(this.audio?.readyState),
          networkState: this.getMediaNetworkStateText(this.audio?.networkState),
        });
      });

      this.audio.addEventListener('pause', () => {
        console.log('[RealAudioEngine Diagnostic] 9. pause event:', {
          audioSrc: this.audio?.src,
          audioPaused: this.audio?.paused,
          currentTime: this.audio?.currentTime,
          duration: this.audio?.duration,
          readyState: this.getMediaReadyStateText(this.audio?.readyState),
          networkState: this.getMediaNetworkStateText(this.audio?.networkState),
        });
        this.isPlaying = false;
        if (this.currentState !== 'unavailable' && this.currentState !== 'error') {
          this.notifyStateChange('paused');
        }
      });

      this.audio.addEventListener('ended', () => {
        console.log('[RealAudioEngine Diagnostic] 10. ended event:', {
          audioSrc: this.audio?.src,
          audioPaused: this.audio?.paused,
          currentTime: this.audio?.currentTime,
          duration: this.audio?.duration,
          readyState: this.getMediaReadyStateText(this.audio?.readyState),
          networkState: this.getMediaNetworkStateText(this.audio?.networkState),
        });
        this.isPlaying = false;
        this.notifyStateChange('finished');
        this.notifyEnd();
      });

      this.audio.addEventListener('error', (e) => {
        this.isPlaying = false;
        const mediaErr = this.audio?.error;
        console.error('[RealAudioEngine Diagnostic] 11. error event:', {
          errorCode: mediaErr?.code,
          errorMessage: mediaErr?.message,
          audioSrc: this.audio?.src,
          audioPaused: this.audio?.paused,
          currentTime: this.audio?.currentTime,
          duration: this.audio?.duration,
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

    // Normalize URLs to pathname to prevent relative vs absolute mismatch reload loops
    let currentPath = '';
    let targetPath = '';
    try {
      currentPath = audio.src ? new URL(audio.src, window.location.origin).pathname : '';
      targetPath = audioUrl ? new URL(audioUrl, window.location.origin).pathname : '';
    } catch {
      currentPath = audio.src || '';
      targetPath = audioUrl || '';
    }

    console.log('[RealAudioEngine Diagnostic] playBeat invoked:', {
      beatId,
      rawAudioUrl,
      resolvedAudioUrl: audioUrl,
      currentAudioUrl: this.currentAudioUrl,
      '1. audio.src': audio.src,
      '2. audio.paused before play()': audio.paused,
      '14. audio.readyState': this.getMediaReadyStateText(audio.readyState),
      '15. audio.networkState': this.getMediaNetworkStateText(audio.networkState),
      '16. audio.currentTime': audio.currentTime,
      '17. audio.duration': audio.duration,
    });

    if (!audioUrl) {
      console.warn('[AudioStateTrace] playBeat: audioUrl is empty, marking unavailable');
      this.isPlaying = false;
      this.notifyError('Audio file unavailable', 'FILE_NOT_FOUND');
      this.notifyStateChange('unavailable');
      return;
    }

    const isSameTrack = (this.currentBeatId === beatId) && (currentPath === targetPath) && !audio.error;

    this.currentBeatId = beatId;
    this.currentAudioUrl = audioUrl;

    if (!isSameTrack) {
      console.log('[AudioStateTrace] audio.pause() called from playBeat (track switch):', {
        previousBeatId: this.currentBeatId,
        newBeatId: beatId,
        previousSrc: audio.src,
        newSrc: audioUrl,
      });
      audio.pause();
      this.notifyStateChange('loading');

      console.log('[AudioStateTrace] audio.src = … assigned in playBeat:', audioUrl);
      audio.src = audioUrl;

      console.log('[AudioStateTrace] audio.load() called in playBeat');
      audio.load();
    } else if (audio.paused) {
      console.log('[AudioStateTrace] playBeat: Resuming same track (audio was paused)');
      this.notifyStateChange('loading');
    } else {
      console.log('[AudioStateTrace] playBeat: Track already playing and active, preserving stream');
    }

    audio.volume = this.volume;
    audio.playbackRate = Math.max(0.5, Math.min(2.0, this.tempoMultiplier * Math.pow(2, this.pitchShiftSemitones / 12)));

    console.log('[RealAudioEngine Diagnostic] calling audio.play():', {
      '1. audio.src': audio.src,
      '2. audio.paused before play()': audio.paused,
      '14. audio.readyState': this.getMediaReadyStateText(audio.readyState),
      '15. audio.networkState': this.getMediaNetworkStateText(audio.networkState),
      '16. audio.currentTime': audio.currentTime,
      '17. audio.duration': audio.duration,
    });

    const playPromise = audio.play();
    if (playPromise !== undefined) {
      playPromise
        .then(() => {
          console.log('[RealAudioEngine Diagnostic] 3. audio.play() promise RESOLVED (success):', {
            '1. audio.src': audio.src,
            '2. audio.paused': audio.paused,
            '14. audio.readyState': this.getMediaReadyStateText(audio.readyState),
            '15. audio.networkState': this.getMediaNetworkStateText(audio.networkState),
            '16. audio.currentTime': audio.currentTime,
            '17. audio.duration': audio.duration,
          });
          this.isPlaying = true;
          this.lastDiagnosticCode = null;
          this.notifyStateChange('playing');
        })
        .catch((err: Error) => {
          console.error('[RealAudioEngine Diagnostic] 3. audio.play() promise REJECTED (failure):', {
            errorName: err.name,
            errorMessage: err.message,
            '1. audio.src': audio.src,
            audioError: audio.error ? { code: audio.error.code, message: audio.error.message } : null,
            '14. audio.readyState': this.getMediaReadyStateText(audio.readyState),
            '15. audio.networkState': this.getMediaNetworkStateText(audio.networkState),
            '16. audio.currentTime': audio.currentTime,
            '17. audio.duration': audio.duration,
          });
          if (err.name === 'AbortError') {
            console.warn('[AudioStateTrace] playPromise AbortError: play request was superseded by another operation');
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

  public pauseBeat(caller: string = 'unknown') {
    console.log(`[AudioStateTrace] audio.pause() called from pauseBeat (caller: ${caller})`, {
      audioSrc: this.audio?.src,
      audioPaused: this.audio?.paused,
      currentTime: this.audio?.currentTime,
      duration: this.audio?.duration,
    });
    if (this.audio) {
      this.audio.pause();
    }
    this.isPlaying = false;
    this.notifyStateChange('paused');
  }

  public resumeBeat(caller: string = 'unknown') {
    console.log(`[AudioStateTrace] resumeBeat called (caller: ${caller})`, {
      audioSrc: this.audio?.src,
      audioPaused: this.audio?.paused,
    });
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

  public stopBeat(caller: string = 'unknown') {
    console.log(`[AudioStateTrace] audio.pause() called from stopBeat (caller: ${caller})`);
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

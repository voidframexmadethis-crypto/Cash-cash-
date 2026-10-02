/**
 * CASHMERE KID$ Native HTMLAudioElement Audio Engine
 * Pure, isolated, browser-native audio engine for master beat audio streaming (MP3 and M4A).
 * Directly drives system sound output with zero synthetic audio, fake timers, or demo substitution.
 */

export type PlayerState =
  | 'idle'
  | 'loading'
  | 'ready'
  | 'playing'
  | 'paused'
  | 'buffering'
  | 'finished'
  | 'unavailable'
  | 'error';

export interface AudioEngineListener {
  onTimeUpdate?: (time: number, duration: number) => void;
  onEnd?: () => void;
  onError?: (errorMsg: string, code?: number) => void;
  onStateChange?: (state: PlayerState) => void;
}

export interface EngineDiagnosticState {
  src: string;
  currentTime: number;
  duration: number;
  paused: boolean;
  readyState: number;
  readyStateText: string;
  networkState: number;
  networkStateText: string;
  errorCode: number | null;
  errorMessage: string | null;
  playerState: PlayerState;
  isPlaying: boolean;
}

class NativeAudioEngine {
  private audio: HTMLAudioElement | null = null;
  private isPlaying: boolean = false;
  private currentBeatId: string | null = null;
  private currentAudioUrl: string | null = null;
  private volume: number = 0.8;
  private currentState: PlayerState = 'idle';
  private errorMessage: string | null = null;
  private listeners: Set<AudioEngineListener> = new Set();

  constructor() {
    this.initAudioElement();
  }

  public getReadyStateText(state?: number): string {
    switch (state) {
      case 0: return 'HAVE_NOTHING (0)';
      case 1: return 'HAVE_METADATA (1)';
      case 2: return 'HAVE_CURRENT_DATA (2)';
      case 3: return 'HAVE_FUTURE_DATA (3)';
      case 4: return 'HAVE_ENOUGH_DATA (4)';
      default: return `UNKNOWN (${state})`;
    }
  }

  public getNetworkStateText(state?: number): string {
    switch (state) {
      case 0: return 'NETWORK_EMPTY (0)';
      case 1: return 'NETWORK_IDLE (1)';
      case 2: return 'NETWORK_LOADING (2)';
      case 3: return 'NETWORK_NO_SOURCE (3)';
      default: return `UNKNOWN (${state})`;
    }
  }

  private initAudioElement(): HTMLAudioElement {
    if (typeof window !== 'undefined' && (window as any).__CASHMERE_NATIVE_AUDIO__) {
      this.audio = (window as any).__CASHMERE_NATIVE_AUDIO__;
      return this.audio!;
    }

    if (typeof window !== 'undefined') {
      console.log('[NativeAudioEngine] Initializing single authoritative HTMLAudioElement singleton');
      this.audio = new Audio();
      (window as any).__CASHMERE_NATIVE_AUDIO__ = this.audio;
      this.audio.preload = 'auto';
      this.audio.volume = this.volume;
      this.audio.loop = true; // Seamless continuous looping for master beat playback

      // 1. loadstart
      this.audio.addEventListener('loadstart', () => {
        console.log('[NativeAudioEngine Event] loadstart', this.getDiagnosticState());
        this.notifyStateChange('loading');
      });

      // 2. loadedmetadata
      this.audio.addEventListener('loadedmetadata', () => {
        const dur = this.audio?.duration || 0;
        console.log('[NativeAudioEngine Event] loadedmetadata', this.getDiagnosticState());
        this.notifyTimeUpdate(this.audio?.currentTime || 0, dur);
        if (this.currentState === 'loading') {
          this.notifyStateChange('ready');
        }
      });

      // 3. canplay
      this.audio.addEventListener('canplay', () => {
        console.log('[NativeAudioEngine Event] canplay', this.getDiagnosticState());
        if (this.currentState === 'loading') {
          this.notifyStateChange('ready');
        }
      });

      // 4. play
      this.audio.addEventListener('play', () => {
        console.log('[NativeAudioEngine Event] play', this.getDiagnosticState());
      });

      // 5. playing
      this.audio.addEventListener('playing', () => {
        console.log('[NativeAudioEngine Event] playing', this.getDiagnosticState());
        this.isPlaying = true;
        this.errorMessage = null;
        this.notifyStateChange('playing');
      });

      // 6. timeupdate
      this.audio.addEventListener('timeupdate', () => {
        if (this.audio) {
          const cur = this.audio.currentTime;
          const dur = this.audio.duration || 0;
          this.notifyTimeUpdate(cur, dur);
        }
      });

      // 7. waiting
      this.audio.addEventListener('waiting', () => {
        console.log('[NativeAudioEngine Event] waiting (buffering)', this.getDiagnosticState());
        this.notifyStateChange('buffering');
      });

      // 8. stalled
      this.audio.addEventListener('stalled', () => {
        console.warn('[NativeAudioEngine Event] stalled', this.getDiagnosticState());
      });

      // 9. pause
      this.audio.addEventListener('pause', () => {
        console.log('[NativeAudioEngine Event] pause', this.getDiagnosticState());
        this.isPlaying = false;
        if (this.currentState !== 'unavailable' && this.currentState !== 'error') {
          this.notifyStateChange('paused');
        }
      });

      // 10. ended
      this.audio.addEventListener('ended', () => {
        console.log('[NativeAudioEngine Event] ended', this.getDiagnosticState());
        this.isPlaying = false;
        this.notifyStateChange('finished');
        this.notifyEnd();
      });

      // 11. error
      this.audio.addEventListener('error', () => {
        this.isPlaying = false;
        const err = this.audio?.error;
        const diag = this.getDiagnosticState();
        console.error('[NativeAudioEngine Event] error (BROWSER MEDIA ERROR):', diag);

        const errMsg = err?.message ? `Media error (code ${err.code}): ${err.message}` : `Media error (code ${err?.code || 'UNKNOWN'})`;
        this.errorMessage = errMsg;
        this.notifyError(errMsg, err?.code);
        this.notifyStateChange('unavailable');
      });
    }

    return this.audio!;
  }

  private notifyTimeUpdate(time: number, duration: number) {
    this.listeners.forEach((l) => {
      try {
        if (l.onTimeUpdate) l.onTimeUpdate(time, duration);
      } catch (e) {
        console.warn('[NativeAudioEngine] Listener error (onTimeUpdate):', e);
      }
    });
  }

  private notifyEnd() {
    this.listeners.forEach((l) => {
      try {
        if (l.onEnd) l.onEnd();
      } catch (e) {
        console.warn('[NativeAudioEngine] Listener error (onEnd):', e);
      }
    });
  }

  private notifyError(errorMsg: string, code?: number) {
    this.listeners.forEach((l) => {
      try {
        if (l.onError) l.onError(errorMsg, code);
      } catch (e) {
        console.warn('[NativeAudioEngine] Listener error (onError):', e);
      }
    });
  }

  private notifyStateChange(state: PlayerState) {
    this.currentState = state;
    this.listeners.forEach((l) => {
      try {
        if (l.onStateChange) l.onStateChange(state);
      } catch (e) {
        console.warn('[NativeAudioEngine] Listener error (onStateChange):', e);
      }
    });
  }

  public getDiagnosticState(): EngineDiagnosticState {
    const audio = this.audio;
    return {
      src: audio?.src || '',
      currentTime: audio?.currentTime || 0,
      duration: audio?.duration || 0,
      paused: audio?.paused ?? true,
      readyState: audio?.readyState ?? 0,
      readyStateText: this.getReadyStateText(audio?.readyState),
      networkState: audio?.networkState ?? 0,
      networkStateText: this.getNetworkStateText(audio?.networkState),
      errorCode: audio?.error?.code ?? null,
      errorMessage: audio?.error?.message ?? this.errorMessage,
      playerState: this.currentState,
      isPlaying: this.isPlaying,
    };
  }

  public loadBeat(beatId: string, rawAudioUrl: string): boolean {
    const audio = this.initAudioElement();
    const resolvedUrl = rawAudioUrl || (beatId ? `/api/beats/${beatId}/audio` : '');

    if (!resolvedUrl) {
      console.warn('[NativeAudioEngine] loadBeat: audioUrl is empty, marking unavailable');
      this.isPlaying = false;
      this.notifyError('Audio file unavailable');
      this.notifyStateChange('unavailable');
      return false;
    }

    // Normalize URLs to pathnames for exact comparison
    let currentPath = '';
    let targetPath = '';
    try {
      currentPath = audio.src ? new URL(audio.src, window.location.origin).pathname : '';
      targetPath = new URL(resolvedUrl, window.location.origin).pathname;
    } catch {
      currentPath = audio.src || '';
      targetPath = resolvedUrl;
    }

    const isSameTrack = (this.currentBeatId === beatId) && (currentPath === targetPath);

    if (isSameTrack && audio.src) {
      console.log('[NativeAudioEngine] Same track already loaded:', { beatId, resolvedUrl });
      return true;
    }

    console.log('[NativeAudioEngine] Loading new track:', { beatId, previousSrc: audio.src, newSrc: resolvedUrl });
    this.currentBeatId = beatId;
    this.currentAudioUrl = resolvedUrl;

    audio.pause();
    this.notifyStateChange('loading');
    audio.src = resolvedUrl;
    audio.loop = true;
    audio.volume = this.volume;
    audio.load();

    return true;
  }

  public async play(): Promise<boolean> {
    const audio = this.initAudioElement();
    if (!audio.src) {
      console.warn('[NativeAudioEngine] Cannot play: no audio.src loaded');
      this.notifyError('Audio file unavailable');
      this.notifyStateChange('unavailable');
      return false;
    }

    console.log('[NativeAudioEngine] Calling audio.play()', this.getDiagnosticState());
    try {
      await audio.play();
      this.isPlaying = true;
      this.notifyStateChange('playing');
      return true;
    } catch (err: any) {
      console.error('[NativeAudioEngine] audio.play() rejected:', err);
      this.isPlaying = false;
      if (err.name === 'NotAllowedError') {
        this.notifyStateChange('paused');
      } else if (err.name === 'AbortError') {
        console.warn('[NativeAudioEngine] Play promise aborted (superseded by new load)');
      } else {
        this.notifyError(`Playback failed: ${err.message}`);
        this.notifyStateChange('unavailable');
      }
      return false;
    }
  }

  public pause(): void {
    if (this.audio) {
      console.log('[NativeAudioEngine] Calling audio.pause()', this.getDiagnosticState());
      this.audio.pause();
    }
    this.isPlaying = false;
    this.notifyStateChange('paused');
  }

  public togglePlayPause(): void {
    if (this.audio) {
      if (this.audio.paused) {
        this.play();
      } else {
        this.pause();
      }
    }
  }

  public seek(seconds: number): void {
    if (this.audio && !isNaN(seconds)) {
      const targetSec = Math.max(0, Math.min(seconds, this.audio.duration || seconds));
      console.log('[NativeAudioEngine] Seeking to:', targetSec);
      this.audio.currentTime = targetSec;
      this.notifyTimeUpdate(targetSec, this.audio.duration || 0);
    }
  }

  public setVolume(val: number): void {
    this.volume = Math.max(0, Math.min(1, val));
    if (this.audio) {
      this.audio.volume = this.volume;
    }
  }

  public getVolume(): number {
    return this.volume;
  }

  public getCurrentState() {
    return {
      isPlaying: this.isPlaying,
      currentBeatId: this.currentBeatId,
      currentAudioUrl: this.currentAudioUrl,
      currentTime: this.audio?.currentTime || 0,
      duration: this.audio?.duration || 0,
      volume: this.volume,
      playerState: this.currentState,
      errorMessage: this.errorMessage,
    };
  }

  public subscribe(listener: AudioEngineListener): () => void {
    this.listeners.add(listener);
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
}

export const audioEngine = new NativeAudioEngine();
if (typeof window !== 'undefined') {
  (window as any).audioEngine = audioEngine;
}

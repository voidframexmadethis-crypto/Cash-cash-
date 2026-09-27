/**
 * CASHMERE KID$ Real Audio Player Engine
 * Streams real MP3 and M4A master audio files via server-side Range Requests endpoint (/api/media/stream).
 * Features rich diagnostic codes for precise error reporting (NETWORK_ERROR, FILE_NOT_FOUND, DECODING_ERROR, etc.).
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

  private onTimeUpdateCallback: ((time: number, duration: number) => void) | null = null;
  private onEndCallback: (() => void) | null = null;
  private onErrorCallback: ((errorMsg: string, code?: DiagnosticErrorCode) => void) | null = null;
  private onStateChangeCallback: ((state: 'loading' | 'ready' | 'playing' | 'paused' | 'buffering' | 'error' | 'unavailable') => void) | null = null;

  private initAudioElement() {
    if (!this.audio) {
      this.audio = new Audio();
      this.audio.preload = 'auto';

      this.audio.addEventListener('loadedmetadata', () => {
        if (this.audio) {
          if (this.onTimeUpdateCallback) {
            this.onTimeUpdateCallback(this.audio.currentTime, this.audio.duration || 0);
          }
          if (this.onStateChangeCallback) {
            this.onStateChangeCallback('ready');
          }
        }
      });

      this.audio.addEventListener('timeupdate', () => {
        if (this.audio && this.onTimeUpdateCallback) {
          this.onTimeUpdateCallback(this.audio.currentTime, this.audio.duration || 0);
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
        const err = this.audio?.error;
        let code: DiagnosticErrorCode = 'STORAGE_ERROR';
        let msg = '[STORAGE_ERROR] Unable to stream real audio file.';

        if (err) {
          if (err.code === err.MEDIA_ERR_SRC_NOT_SUPPORTED) {
            code = 'UNSUPPORTED_CODEC';
            msg = '[UNSUPPORTED_CODEC] Audio format not supported or media URL unreachable.';
          } else if (err.code === err.MEDIA_ERR_NETWORK) {
            code = 'NETWORK_ERROR';
            msg = '[NETWORK_ERROR] Network connection interrupted while streaming media.';
          } else if (err.code === err.MEDIA_ERR_DECODE) {
            code = 'DECODING_ERROR';
            msg = '[DECODING_ERROR] Corrupted audio file or decoding error.';
          }
        }

        this.lastDiagnosticCode = code;
        if (this.onErrorCallback) {
          this.onErrorCallback(msg, code);
        }
        if (this.onStateChangeCallback) {
          this.onStateChangeCallback('error');
        }
      });
    }
  }

  private initWebAudio() {
    if (this.webAudioConnected || !this.audio) return;

    try {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      this.ctx = new AudioCtx();
      if (this.ctx.state === 'suspended') {
        this.ctx.resume();
      }
      this.masterGain = this.ctx.createGain();
      this.analyser = this.ctx.createAnalyser();
      this.analyser.fftSize = 64;
      this.masterGain.gain.value = this.volume;

      this.sourceNode = this.ctx.createMediaElementSource(this.audio);
      this.sourceNode.connect(this.masterGain);
      this.masterGain.connect(this.analyser);
      this.analyser.connect(this.ctx.destination);
      this.webAudioConnected = true;
    } catch (err) {
      this.webAudioConnected = false;
      console.warn('[RealAudioPlayerEngine] WebAudio node binding deferred (native HTML5 streaming active):', err);
    }
  }

  public setVolume(val: number) {
    this.volume = Math.max(0, Math.min(1, val));
    if (this.audio) {
      this.audio.volume = this.volume;
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

  public resolveStreamUrl(rawUrl?: string): string | null {
    if (!rawUrl) return null;
    
    if (rawUrl.startsWith('blob:') || rawUrl.startsWith('data:')) {
      return rawUrl;
    }

    let urlToProcess = rawUrl;
    
    // Check if it already contains /api/media/stream or /api/media
    if (urlToProcess.includes('/api/media')) {
      if (!urlToProcess.includes('token=')) {
        const separator = urlToProcess.includes('?') ? '&' : '?';
        return `${urlToProcess}${separator}token=CK-PREVIEW`;
      }
      return urlToProcess;
    }

    // Otherwise, try to extract file parameter or filename
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
        return `/api/media/stream?file=${encodeURIComponent(cleanFileName)}&token=CK-PREVIEW`;
      }
    } catch (e) {
      console.error('[resolveStreamUrl] Error resolving stream URL:', e);
    }
    
    return urlToProcess;
  }

  public playBeat(beatId: string, bpm: number = 140, key: string = 'F# Minor', durationSeconds: number = 165, rawAudioUrl?: string) {
    this.initAudioElement();

    if (!this.audio) return;

    this.baseBpm = bpm;
    this.activeKey = key;

    const audioUrl = this.resolveStreamUrl(rawAudioUrl);

    if (!audioUrl) {
      this.stopBeat();
      this.lastDiagnosticCode = 'FILE_NOT_FOUND';
      if (this.onErrorCallback) {
        this.onErrorCallback('[FILE_NOT_FOUND] No audio stream URL associated with this product.', 'FILE_NOT_FOUND');
      }
      if (this.onStateChangeCallback) {
        this.onStateChangeCallback('unavailable');
      }
      return;
    }

    // Check if switching tracks
    if (this.currentAudioUrl !== audioUrl || this.currentBeatId !== beatId) {
      this.currentBeatId = beatId;
      this.currentAudioUrl = audioUrl;
      this.audio.src = audioUrl;
      this.audio.playbackRate = Math.max(0.5, Math.min(2.0, this.tempoMultiplier * Math.pow(2, this.pitchShiftSemitones / 12)));
      this.audio.volume = this.volume;
      if (this.onStateChangeCallback) {
        this.onStateChangeCallback('loading');
      }
      this.audio.load();
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
          console.error('[RealAudioPlayerEngine] HTML5 Play error:', err);
          this.isPlaying = false;
          const code: DiagnosticErrorCode = 'UNSUPPORTED_CODEC';
          this.lastDiagnosticCode = code;
          if (this.onErrorCallback) {
            this.onErrorCallback(`[${code}] ${err.message || 'Media playback failed or was blocked by browser.'}`, code);
          }
          if (this.onStateChangeCallback) {
            this.onStateChangeCallback('error');
          }
        });
    }
  }

  public pauseBeat() {
    if (this.audio) {
      this.audio.pause();
    }
    this.isPlaying = false;
  }

  public resumeBeat() {
    if (this.audio && this.currentAudioUrl) {
      this.audio.play().catch((err) => console.error('[RealAudioPlayerEngine] Resume failed:', err));
      this.isPlaying = true;
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
    if (this.audio && !isNaN(seconds)) {
      this.audio.currentTime = Math.max(0, Math.min(seconds, this.audio.duration || seconds));
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
    };
  }

  public getFrequencyData(): Uint8Array {
    if (this.analyser && this.webAudioConnected) {
      const data = new Uint8Array(this.analyser.frequencyBinCount);
      this.analyser.getByteFrequencyData(data);
      return data;
    }
    // Fallback frequency array matching live playback state & volume
    const fallback = new Uint8Array(32);
    if (this.isPlaying && this.volume > 0) {
      const now = Date.now() / 100;
      for (let i = 0; i < 32; i++) {
        fallback[i] = Math.floor(
          (Math.sin(now + i) * 60 + Math.cos(now * 0.5 + i * 2) * 50 + 120) * this.volume
        );
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

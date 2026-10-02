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

export type DiagnosticCategory =
  | 'A' // play() fails immediately
  | 'B' // play() succeeds and then the browser reports a media error
  | 'C' // play() succeeds and our application calls pause()
  | 'D' // the AudioElement is destroyed/recreated
  | 'E' // the audio source changes
  | 'F' // playback continues but the UI incorrectly says it stopped
  | 'PLAYING_CONTINUOUSLY'; // playback succeeds and continues without interruption

export interface PlaybackDiagnosticRecord {
  category: DiagnosticCategory | null;
  description: string;
  timestamp: string;
  beatId: string | null;
  srcBeforePlay: string;
  srcImmediatelyAfterPlay: string;
  srcAtOneSecond: string | null;
  didSrcChange: boolean;
  playPromiseResult: 'pending' | 'resolved' | 'rejected' | null;
  playPromiseError?: { name: string; message: string; stack?: string } | null;
  lastPauseCallerStack?: string | null;
  browserMediaError?: { code?: number; message?: string } | null;
  audioStateAtVerdict?: {
    currentTime: number;
    duration: number;
    paused: boolean;
    readyState: string;
    networkState: string;
    src: string;
  };
  eventSequence: string[];
}

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

  // Last caller stack traces for tracking what code changes audio state
  private lastPauseCallerStack: string | null = null;
  private lastPauseCallerTime: number = 0;
  private lastSrcAssignmentStack: string | null = null;
  private lastLoadCallerStack: string | null = null;
  private lastPlayCallerStack: string | null = null;

  // Active diagnostic record for the current playback session
  private activeDiagnostic: PlaybackDiagnosticRecord = {
    category: null,
    description: 'No playback initiated yet',
    timestamp: new Date().toISOString(),
    beatId: null,
    srcBeforePlay: '',
    srcImmediatelyAfterPlay: '',
    srcAtOneSecond: null,
    didSrcChange: false,
    playPromiseResult: null,
    eventSequence: [],
  };

  // Support multiple active listeners simultaneously
  private listeners: Set<AudioPlayerListener> = new Set();

  private recordEvent(eventName: string, details?: Record<string, any>) {
    const timestampStr = new Date().toISOString().substring(11, 23);
    const eventSummary = `[${timestampStr}] ${eventName} (time=${details?.currentTime?.toFixed(2) ?? '?'}, ready=${details?.readyState ?? '?'}, paused=${details?.paused ?? '?'})`;
    this.activeDiagnostic.eventSequence.push(eventSummary);

    // Keep global timeline for external inspection in DevTools console
    if (typeof window !== 'undefined') {
      if (!(window as any).__CASHMERE_PLAYBACK_HISTORY__) {
        (window as any).__CASHMERE_PLAYBACK_HISTORY__ = [];
      }
      (window as any).__CASHMERE_PLAYBACK_HISTORY__.push({
        timestamp: timestampStr,
        event: eventName,
        ...details,
      });
      (window as any).__CASHMERE_PLAYBACK_DIAGNOSTIC__ = this.activeDiagnostic;
    }
  }

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

  public getMediaReadyStateText(state?: number): string {
    switch (state) {
      case 0: return 'HAVE_NOTHING (0)';
      case 1: return 'HAVE_METADATA (1)';
      case 2: return 'HAVE_CURRENT_DATA (2)';
      case 3: return 'HAVE_FUTURE_DATA (3)';
      case 4: return 'HAVE_ENOUGH_DATA (4)';
      default: return `UNKNOWN (${state})`;
    }
  }

  public getMediaNetworkStateText(state?: number): string {
    switch (state) {
      case 0: return 'NETWORK_EMPTY (0)';
      case 1: return 'NETWORK_IDLE (1)';
      case 2: return 'NETWORK_LOADING (2)';
      case 3: return 'NETWORK_NO_SOURCE (3)';
      default: return `UNKNOWN (${state})`;
    }
  }

  public getPlaybackDiagnostic(): PlaybackDiagnosticRecord {
    return this.activeDiagnostic;
  }

  private evaluateVerdict(reason: string) {
    const audio = this.audio;
    const diag = this.activeDiagnostic;

    if (!audio) {
      diag.category = 'D';
      diag.description = 'The AudioElement is destroyed or missing';
      return;
    }

    diag.audioStateAtVerdict = {
      currentTime: audio.currentTime,
      duration: audio.duration,
      paused: audio.paused,
      readyState: this.getMediaReadyStateText(audio.readyState),
      networkState: this.getMediaNetworkStateText(audio.networkState),
      src: audio.src,
    };

    if (diag.playPromiseResult === 'rejected') {
      diag.category = 'A';
      diag.description = `A. play() failed immediately: ${diag.playPromiseError?.name} - ${diag.playPromiseError?.message}`;
    } else if (audio.error || diag.browserMediaError) {
      diag.category = 'B';
      const code = audio.error?.code || diag.browserMediaError?.code;
      const msg = audio.error?.message || diag.browserMediaError?.message;
      diag.category = 'B';
      diag.description = `B. play() succeeded and then the browser reported a media error (code ${code}: ${msg})`;
    } else if (diag.didSrcChange && diag.srcAtOneSecond && diag.srcAtOneSecond !== diag.srcBeforePlay) {
      diag.category = 'E';
      diag.description = `E. the audio source changed after play() began (from ${diag.srcBeforePlay} to ${diag.srcAtOneSecond})`;
    } else if (audio.paused && diag.lastPauseCallerStack) {
      diag.category = 'C';
      diag.description = `C. play() succeeded and our application called pause()`;
    } else if (!audio.paused && audio.currentTime > 0) {
      diag.category = 'PLAYING_CONTINUOUSLY';
      diag.description = `Playback active and playing continuously (currentTime=${audio.currentTime.toFixed(2)}s)`;
    }

    if (typeof window !== 'undefined') {
      (window as any).__CASHMERE_PLAYBACK_DIAGNOSTIC__ = diag;
    }

    console.log(`%c[RealAudioEngine Verdict] ${diag.category}: ${diag.description} (triggered by: ${reason})`, 'background: #00FF66; color: #000; font-weight: bold; padding: 2px 6px; border-radius: 4px;');
  }

  private initAudioElement(): HTMLAudioElement {
    // Ensure persistent singleton AudioElement on window to prevent recreation during re-renders
    if (typeof window !== 'undefined' && (window as any).__CASHMERE_AUDIO_ELEMENT__) {
      this.audio = (window as any).__CASHMERE_AUDIO_ELEMENT__;
    }

    if (!this.audio) {
      console.log('[RealAudioEngine Diagnostic] Creating persistent HTMLAudioElement singleton');
      this.audio = new Audio();
      if (typeof window !== 'undefined') {
        (window as any).__CASHMERE_AUDIO_ELEMENT__ = this.audio;
      }
      this.audio.preload = 'auto';
      this.audio.volume = this.volume;
      // Loop audio seamlessly so real uploaded beats and loops continue playing continuously without stopping
      this.audio.loop = true;

      // Intercept and instrument audio.pause() to capture caller call stacks
      const originalPause = this.audio.pause.bind(this.audio);
      this.audio.pause = () => {
        this.lastPauseCallerStack = new Error().stack || '';
        this.lastPauseCallerTime = Date.now();
        console.log('[RealAudioEngine Diagnostic] >>> audio.pause() CALLED by application <<<', {
          '1. audio.src': this.audio?.src,
          '16. audio.currentTime': this.audio?.currentTime,
          '17. audio.duration': this.audio?.duration,
          '14. audio.readyState': this.getMediaReadyStateText(this.audio?.readyState),
          '15. audio.networkState': this.getMediaNetworkStateText(this.audio?.networkState),
          callStack: this.lastPauseCallerStack,
        });
        this.activeDiagnostic.lastPauseCallerStack = this.lastPauseCallerStack;
        this.evaluateVerdict('audio.pause() called');
        return originalPause();
      };

      // Intercept audio.load() to capture caller call stacks
      const originalLoad = this.audio.load.bind(this.audio);
      this.audio.load = () => {
        this.lastLoadCallerStack = new Error().stack || '';
        console.log('[RealAudioEngine Diagnostic] >>> audio.load() CALLED by application <<<', {
          '1. audio.src': this.audio?.src,
          callStack: this.lastLoadCallerStack,
        });
        return originalLoad();
      };

      // Intercept audio.play() to capture caller call stacks
      const originalPlay = this.audio.play.bind(this.audio);
      this.audio.play = () => {
        this.lastPlayCallerStack = new Error().stack || '';
        return originalPlay();
      };

      // 1. loadstart event
      this.audio.addEventListener('loadstart', () => {
        const details = {
          event: 'loadstart',
          src: this.audio?.src,
          currentTime: this.audio?.currentTime,
          duration: this.audio?.duration,
          paused: this.audio?.paused,
          readyState: this.getMediaReadyStateText(this.audio?.readyState),
          networkState: this.getMediaNetworkStateText(this.audio?.networkState),
        };
        console.log('[RealAudioEngine Diagnostic] Event 1/12: loadstart', details);
        this.recordEvent('loadstart', details);
        this.notifyStateChange('loading');
      });

      // 2. loadedmetadata event
      this.audio.addEventListener('loadedmetadata', () => {
        const dur = this.audio?.duration || 0;
        const details = {
          event: 'loadedmetadata',
          src: this.audio?.src,
          currentTime: this.audio?.currentTime,
          duration: dur,
          paused: this.audio?.paused,
          readyState: this.getMediaReadyStateText(this.audio?.readyState),
          networkState: this.getMediaNetworkStateText(this.audio?.networkState),
        };
        console.log('[RealAudioEngine Diagnostic] Event 2/12: loadedmetadata', details);
        this.recordEvent('loadedmetadata', details);
        this.notifyTimeUpdate(this.audio?.currentTime || 0, dur);
        if (this.currentState === 'loading') {
          this.notifyStateChange('ready');
        }
      });

      // 3. canplay event
      this.audio.addEventListener('canplay', () => {
        const details = {
          event: 'canplay',
          src: this.audio?.src,
          currentTime: this.audio?.currentTime,
          duration: this.audio?.duration,
          paused: this.audio?.paused,
          readyState: this.getMediaReadyStateText(this.audio?.readyState),
          networkState: this.getMediaNetworkStateText(this.audio?.networkState),
        };
        console.log('[RealAudioEngine Diagnostic] Event 3/12: canplay', details);
        this.recordEvent('canplay', details);
        if (this.currentState === 'loading') {
          this.notifyStateChange('ready');
        }
      });

      // 4. play event
      this.audio.addEventListener('play', () => {
        const details = {
          event: 'play',
          src: this.audio?.src,
          currentTime: this.audio?.currentTime,
          duration: this.audio?.duration,
          paused: this.audio?.paused,
          readyState: this.getMediaReadyStateText(this.audio?.readyState),
          networkState: this.getMediaNetworkStateText(this.audio?.networkState),
        };
        console.log('[RealAudioEngine Diagnostic] Event 4/12: play', details);
        this.recordEvent('play', details);
      });

      // 5. playing event
      this.audio.addEventListener('playing', () => {
        const details = {
          event: 'playing',
          src: this.audio?.src,
          currentTime: this.audio?.currentTime,
          duration: this.audio?.duration,
          paused: this.audio?.paused,
          readyState: this.getMediaReadyStateText(this.audio?.readyState),
          networkState: this.getMediaNetworkStateText(this.audio?.networkState),
        };
        console.log('[RealAudioEngine Diagnostic] Event 5/12: playing', details);
        this.recordEvent('playing', details);
        this.isPlaying = true;
        this.notifyStateChange('playing');
        this.evaluateVerdict('playing event');
      });

      // 6. timeupdate event (logged on each second tick to avoid console flooding)
      let lastLoggedSec = -1;
      this.audio.addEventListener('timeupdate', () => {
        if (this.audio) {
          const cur = this.audio.currentTime;
          const dur = this.audio.duration || 0;
          const curSecFloor = Math.floor(cur);
          if (curSecFloor !== lastLoggedSec) {
            lastLoggedSec = curSecFloor;
            const details = {
              event: 'timeupdate',
              src: this.audio.src,
              currentTime: cur,
              duration: dur,
              paused: this.audio.paused,
              readyState: this.getMediaReadyStateText(this.audio.readyState),
              networkState: this.getMediaNetworkStateText(this.audio.networkState),
            };
            console.log('[RealAudioEngine Diagnostic] Event 6/12: timeupdate (second tick)', details);
            this.recordEvent(`timeupdate (sec ${curSecFloor})`, details);
            if (cur >= 10) {
              this.evaluateVerdict('10 seconds continuous playback reached');
            }
          }
          this.notifyTimeUpdate(cur, dur);
        }
      });

      // 7. waiting event
      this.audio.addEventListener('waiting', () => {
        const details = {
          event: 'waiting',
          src: this.audio?.src,
          currentTime: this.audio?.currentTime,
          duration: this.audio?.duration,
          paused: this.audio?.paused,
          readyState: this.getMediaReadyStateText(this.audio?.readyState),
          networkState: this.getMediaNetworkStateText(this.audio?.networkState),
        };
        console.log('[RealAudioEngine Diagnostic] Event 7/12: waiting (buffering)', details);
        this.recordEvent('waiting', details);
        this.notifyStateChange('buffering');
      });

      // 8. stalled event
      this.audio.addEventListener('stalled', () => {
        const details = {
          event: 'stalled',
          src: this.audio?.src,
          currentTime: this.audio?.currentTime,
          duration: this.audio?.duration,
          paused: this.audio?.paused,
          readyState: this.getMediaReadyStateText(this.audio?.readyState),
          networkState: this.getMediaNetworkStateText(this.audio?.networkState),
        };
        console.warn('[RealAudioEngine Diagnostic] Event 8/12: stalled', details);
        this.recordEvent('stalled', details);
      });

      // 9. suspend event
      this.audio.addEventListener('suspend', () => {
        const details = {
          event: 'suspend',
          src: this.audio?.src,
          currentTime: this.audio?.currentTime,
          duration: this.audio?.duration,
          paused: this.audio?.paused,
          readyState: this.getMediaReadyStateText(this.audio?.readyState),
          networkState: this.getMediaNetworkStateText(this.audio?.networkState),
        };
        console.log('[RealAudioEngine Diagnostic] Event 9/12: suspend', details);
        this.recordEvent('suspend', details);
      });

      // 10. pause event
      this.audio.addEventListener('pause', () => {
        const details = {
          event: 'pause',
          src: this.audio?.src,
          currentTime: this.audio?.currentTime,
          duration: this.audio?.duration,
          paused: this.audio?.paused,
          readyState: this.getMediaReadyStateText(this.audio?.readyState),
          networkState: this.getMediaNetworkStateText(this.audio?.networkState),
          lastPauseCallerStack: this.lastPauseCallerStack,
        };
        console.log('[RealAudioEngine Diagnostic] Event 10/12: pause', details);
        this.recordEvent('pause', details);
        this.isPlaying = false;
        if (this.currentState !== 'unavailable' && this.currentState !== 'error') {
          this.notifyStateChange('paused');
        }
        this.evaluateVerdict('pause event');
      });

      // 11. ended event
      this.audio.addEventListener('ended', () => {
        const details = {
          event: 'ended',
          src: this.audio?.src,
          currentTime: this.audio?.currentTime,
          duration: this.audio?.duration,
          paused: this.audio?.paused,
          readyState: this.getMediaReadyStateText(this.audio?.readyState),
          networkState: this.getMediaNetworkStateText(this.audio?.networkState),
        };
        console.log('[RealAudioEngine Diagnostic] Event 11/12: ended', details);
        this.recordEvent('ended', details);
        this.isPlaying = false;
        this.notifyStateChange('finished');
        this.notifyEnd();
      });

      // 12. error event
      this.audio.addEventListener('error', (e) => {
        this.isPlaying = false;
        const mediaErr = this.audio?.error;
        const details = {
          event: 'error',
          '12. error.code': mediaErr?.code,
          '13. error.message': mediaErr?.message,
          src: this.audio?.src,
          currentTime: this.audio?.currentTime,
          duration: this.audio?.duration,
          paused: this.audio?.paused,
          readyState: this.getMediaReadyStateText(this.audio?.readyState),
          networkState: this.getMediaNetworkStateText(this.audio?.networkState),
          nativeEvent: e,
        };
        console.error('[RealAudioEngine Diagnostic] Event 12/12: error (BROWSER MEDIA ERROR)', details);
        this.recordEvent('error', details);

        this.activeDiagnostic.browserMediaError = {
          code: mediaErr?.code,
          message: mediaErr?.message,
        };
        this.evaluateVerdict('error event');

        this.lastDiagnosticCode = 'FILE_NOT_FOUND';
        this.notifyError(`Browser audio error: ${mediaErr?.message || 'Code ' + mediaErr?.code}`, 'FILE_NOT_FOUND');
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

    const isSameTrack = (this.currentBeatId === beatId) && (currentPath === targetPath);

    console.log('[RealAudioEngine Diagnostic] playBeat invoked:', {
      beatId,
      rawAudioUrl,
      resolvedAudioUrl: audioUrl,
      currentAudioUrl: this.currentAudioUrl,
      isSameTrack,
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

    // Initialize diagnostic session for this play attempt
    this.activeDiagnostic = {
      category: null,
      description: 'Playback initiated, awaiting outcome...',
      timestamp: new Date().toISOString(),
      beatId,
      srcBeforePlay: audio.src,
      srcImmediatelyAfterPlay: '',
      srcAtOneSecond: null,
      didSrcChange: false,
      playPromiseResult: 'pending',
      eventSequence: [],
    };
    this.recordEvent('playBeat_invoked', {
      beatId,
      audioUrl,
      currentSrc: audio.src,
      audioPaused: audio.paused,
      isSameTrack,
    });

    // If exact same track is already playing smoothly, preserve uninterrupted stream!
    if (isSameTrack && !audio.paused) {
      console.log('[AudioStateTrace] playBeat: Track already playing and active, preserving stream without interruption');
      this.isPlaying = true;
      this.notifyStateChange('playing');
      return;
    }

    this.currentBeatId = beatId;
    this.currentAudioUrl = audioUrl;

    if (!isSameTrack) {
      console.log('[AudioStateTrace] Changing audio source (track switch):', {
        previousBeatId: this.currentBeatId,
        newBeatId: beatId,
        previousSrc: audio.src,
        newSrc: audioUrl,
        callerStack: new Error().stack,
      });
      this.lastSrcAssignmentStack = new Error().stack || '';
      audio.pause();
      this.notifyStateChange('loading');

      console.log('[AudioStateTrace] audio.src assigned in playBeat:', audioUrl);
      audio.src = audioUrl;

      console.log('[AudioStateTrace] audio.load() called in playBeat');
      audio.load();
    } else if (audio.paused) {
      console.log('[AudioStateTrace] playBeat: Resuming same track (audio was paused)');
      this.notifyStateChange('loading');
    }

    audio.volume = this.volume;
    audio.playbackRate = Math.max(0.5, Math.min(2.0, this.tempoMultiplier * Math.pow(2, this.pitchShiftSemitones / 12)));

    const srcBeforePlay = audio.src;
    this.activeDiagnostic.srcBeforePlay = srcBeforePlay;

    console.log('[RealAudioEngine Diagnostic] calling audio.play():', {
      '1. audio.src before play()': srcBeforePlay,
      '2. audio.paused before play()': audio.paused,
      '14. audio.readyState': this.getMediaReadyStateText(audio.readyState),
      '15. audio.networkState': this.getMediaNetworkStateText(audio.networkState),
      '16. audio.currentTime': audio.currentTime,
      '17. audio.duration': audio.duration,
    });

    const playPromise = audio.play();

    // Check src immediately after play()
    this.activeDiagnostic.srcImmediatelyAfterPlay = audio.src;
    console.log('[RealAudioEngine Diagnostic] audio.src immediately after play():', audio.src);

    // Instrument 1-second check to determine if audio source changed or playback stopped after 1s
    setTimeout(() => {
      const srcAtOneSec = this.audio?.src || '';
      const didSrcChange = (srcAtOneSec !== srcBeforePlay);
      this.activeDiagnostic.srcAtOneSecond = srcAtOneSec;
      this.activeDiagnostic.didSrcChange = didSrcChange;

      console.log('[RealAudioEngine Diagnostic] >>> audio.src ONE SECOND AFTER play() <<<:', {
        src: srcAtOneSec,
        srcBeforePlay,
        didSrcChange,
        paused: this.audio?.paused,
        currentTime: this.audio?.currentTime,
        duration: this.audio?.duration,
        readyState: this.getMediaReadyStateText(this.audio?.readyState),
        networkState: this.getMediaNetworkStateText(this.audio?.networkState),
        lastPauseCallerStack: this.lastPauseCallerStack,
      });

      this.recordEvent('checkpoint_one_second_after_play', {
        srcAtOneSec,
        srcBeforePlay,
        didSrcChange,
        paused: this.audio?.paused,
        currentTime: this.audio?.currentTime,
      });

      this.evaluateVerdict('1 second checkpoint');
    }, 1000);

    if (playPromise !== undefined) {
      playPromise
        .then(() => {
          this.activeDiagnostic.playPromiseResult = 'resolved';
          console.log('[RealAudioEngine Diagnostic] 3. audio.play() promise RESOLVED (success):', {
            '1. audio.src': audio.src,
            '2. audio.paused': audio.paused,
            '14. audio.readyState': this.getMediaReadyStateText(audio.readyState),
            '15. audio.networkState': this.getMediaNetworkStateText(audio.networkState),
            '16. audio.currentTime': audio.currentTime,
            '17. audio.duration': audio.duration,
          });
          this.recordEvent('play_promise_resolved', {
            currentTime: audio.currentTime,
            duration: audio.duration,
            paused: audio.paused,
          });
          this.isPlaying = true;
          this.lastDiagnosticCode = null;
          this.notifyStateChange('playing');
          this.evaluateVerdict('play promise resolved');
        })
        .catch((err: Error) => {
          this.activeDiagnostic.playPromiseResult = 'rejected';
          this.activeDiagnostic.playPromiseError = {
            name: err.name,
            message: err.message,
            stack: err.stack,
          };
          console.error('[RealAudioEngine Diagnostic] 3. audio.play() promise REJECTED (failure):', {
            errorName: err.name,
            errorMessage: err.message,
            errorStack: err.stack,
            '1. audio.src': audio.src,
            '12. audio.error.code': audio.error?.code,
            '13. audio.error.message': audio.error?.message,
            '14. audio.readyState': this.getMediaReadyStateText(audio.readyState),
            '15. audio.networkState': this.getMediaNetworkStateText(audio.networkState),
            '16. audio.currentTime': audio.currentTime,
            '17. audio.duration': audio.duration,
          });
          this.recordEvent('play_promise_rejected', {
            errorName: err.name,
            errorMessage: err.message,
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
            this.notifyError(`Playback error: ${err.message}`, 'FILE_NOT_FOUND');
          }
          this.evaluateVerdict('play promise rejected');
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
if (typeof window !== 'undefined') {
  (window as any).audioSynth = audioSynth;
}

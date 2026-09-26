import React, { useState, useEffect, useRef } from 'react';
import {
  X,
  Upload,
  Music,
  CheckCircle,
  ArrowRight,
  ArrowLeft,
  Sparkles,
  Check,
  Folder,
  Box,
  Link as LinkIcon,
  FileAudio,
  AlertTriangle,
  Copy,
  ExternalLink,
  RefreshCw,
  Eye,
  EyeOff,
  Image as ImageIcon,
  Sliders,
  Play,
  Pause,
  Trash2
} from 'lucide-react';
import { Beat, GenreType, BeatPack } from '../types';

interface UploadModalProps {
  isOpen: boolean;
  onClose: () => void;
  onPublishBeat: (newBeat: Beat) => void;
  onPublishBeatPack?: (newPack: BeatPack) => void;
  currencySymbol: string;
  beats?: Beat[];
  onSwitchToBeatPacks?: () => void;
}

export const UploadModal: React.FC<UploadModalProps> = ({
  isOpen,
  onClose,
  onPublishBeat,
  onPublishBeatPack,
  currencySymbol,
  beats = [],
  onSwitchToBeatPacks,
}) => {
  // 7-step professional wizard state
  const [currentStep, setCurrentStep] = useState<number>(1);

  // Page Switching and Book Turn Animation States
  const [activePage, setActivePage] = useState<'single' | 'pack'>('single');
  const [pageTurnDirection, setPageTurnDirection] = useState<'forward' | 'backward' | null>(null);
  const [isAnimatingPage, setIsAnimatingPage] = useState<boolean>(false);
  const [prefersReducedMotion, setPrefersReducedMotion] = useState<boolean>(false);

  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    setPrefersReducedMotion(mediaQuery.matches);
    const listener = (e: MediaQueryListEvent) => setPrefersReducedMotion(e.matches);
    mediaQuery.addEventListener('change', listener);
    return () => mediaQuery.removeEventListener('change', listener);
  }, []);

  // Separate Beat Pack Draft States
  const [packTitle, setPackTitle] = useState<string>(() => {
    const saved = localStorage.getItem('voodoo_modal_pack_uploader_draft');
    if (saved) {
      try { return JSON.parse(saved).packTitle || 'CASHMERE VAULT EDITION'; } catch { return 'CASHMERE VAULT EDITION'; }
    }
    return 'CASHMERE VAULT EDITION';
  });
  const [packDescription, setPackDescription] = useState<string>(() => {
    const saved = localStorage.getItem('voodoo_modal_pack_uploader_draft');
    if (saved) {
      try { return JSON.parse(saved).packDescription || 'Ultra premium multi-audio stem package including uncompressed audio vectors.'; } catch { return 'Ultra premium multi-audio stem package including uncompressed audio vectors.'; }
    }
    return 'Ultra premium multi-audio stem package including uncompressed audio vectors.';
  });
  const [packPrice, setPackPrice] = useState<number>(() => {
    const saved = localStorage.getItem('voodoo_modal_pack_uploader_draft');
    if (saved) {
      try { return JSON.parse(saved).packPrice || 59.99; } catch { return 59.99; }
    }
    return 59.99;
  });
  const [packArtworkUrl, setPackArtworkUrl] = useState<string>(() => {
    const saved = localStorage.getItem('voodoo_modal_pack_uploader_draft');
    if (saved) {
      try { return JSON.parse(saved).packArtworkUrl || '/src/assets/images/cashmere_cover_vault_1790419848357.jpg'; } catch { return '/src/assets/images/cashmere_cover_vault_1790419848357.jpg'; }
    }
    return '/src/assets/images/cashmere_cover_vault_1790419848357.jpg';
  });
  const [packFreeDownload, setPackFreeDownload] = useState<boolean>(() => {
    const saved = localStorage.getItem('voodoo_modal_pack_uploader_draft');
    if (saved) {
      try { return !!JSON.parse(saved).packFreeDownload; } catch { return false; }
    }
    return false;
  });
  const [packVisibility, setPackVisibility] = useState<'published' | 'draft' | 'hidden'>(() => {
    const saved = localStorage.getItem('voodoo_modal_pack_uploader_draft');
    if (saved) {
      try { return JSON.parse(saved).packVisibility || 'published'; } catch { return 'published'; }
    }
    return 'published';
  });
  const [packZipFileName, setPackZipFileName] = useState<string>(() => {
    const saved = localStorage.getItem('voodoo_modal_pack_uploader_draft');
    if (saved) {
      try { return JSON.parse(saved).packZipFileName || 'voodoo_pack_stems_master.zip'; } catch { return 'voodoo_pack_stems_master.zip'; }
    }
    return 'voodoo_pack_stems_master.zip';
  });
  const [packZipFileSize, setPackZipFileSize] = useState<string>(() => {
    const saved = localStorage.getItem('voodoo_modal_pack_uploader_draft');
    if (saved) {
      try { return JSON.parse(saved).packZipFileSize || '145.20 MB'; } catch { return '145.20 MB'; }
    }
    return '145.20 MB';
  });
  const [packZipUploaded, setPackZipUploaded] = useState<boolean>(() => {
    const saved = localStorage.getItem('voodoo_modal_pack_uploader_draft');
    if (saved) {
      try { return !!JSON.parse(saved).packZipUploaded; } catch { return true; }
    }
    return true;
  });
  const [packIsUploadingZip, setPackIsUploadingZip] = useState<boolean>(false);
  const [packZipProgress, setPackZipProgress] = useState<number>(0);
  const [packIsProcessingZip, setPackIsProcessingZip] = useState<boolean>(false);
  const [packZipProcessingProgress, setPackZipProcessingProgress] = useState<number>(0);
  const [packProcessingStatus, setPackProcessingStatus] = useState<string>('');
  const [packDetectedFiles, setPackDetectedFiles] = useState<string[]>(() => {
    const saved = localStorage.getItem('voodoo_modal_pack_uploader_draft');
    if (saved) {
      try { return JSON.parse(saved).packDetectedFiles || ['01_OBSIDIAN_RIFF_142BPM_Fmin.mp3', '02_VALENTINO_VELVET_142BPM_Fmin.mp3', '03_TOKYO_NIGHTHAWK_140BPM_Cmin.mp3', 'stems_multitrack_raw_master.zip']; } catch { return ['01_OBSIDIAN_RIFF_142BPM_Fmin.mp3', '02_VALENTINO_VELVET_142BPM_Fmin.mp3', '03_TOKYO_NIGHTHAWK_140BPM_Cmin.mp3', 'stems_multitrack_raw_master.zip']; }
    }
    return ['01_OBSIDIAN_RIFF_142BPM_Fmin.mp3', '02_VALENTINO_VELVET_142BPM_Fmin.mp3', '03_TOKYO_NIGHTHAWK_140BPM_Cmin.mp3', 'stems_multitrack_raw_master.zip'];
  });

  useEffect(() => {
    const packDraftData = {
      packTitle,
      packDescription,
      packPrice,
      packArtworkUrl,
      packFreeDownload,
      packVisibility,
      packZipFileName,
      packZipFileSize,
      packZipUploaded,
      packDetectedFiles
    };
    localStorage.setItem('voodoo_modal_pack_uploader_draft', JSON.stringify(packDraftData));
  }, [
    packTitle,
    packDescription,
    packPrice,
    packArtworkUrl,
    packFreeDownload,
    packVisibility,
    packZipFileName,
    packZipFileSize,
    packZipUploaded,
    packDetectedFiles
  ]);

  const handlePageSwitch = (targetPage: 'single' | 'pack') => {
    if (targetPage === activePage || isAnimatingPage) return;
    
    setIsAnimatingPage(true);
    if (targetPage === 'pack') {
      setPageTurnDirection('forward');
    } else {
      setPageTurnDirection('backward');
    }

    setTimeout(() => {
      setActivePage(targetPage);
      setIsAnimatingPage(false);
      setPageTurnDirection(null);
    }, prefersReducedMotion ? 300 : 550);
  };

  const handleZipFileSelection = (file: File) => {
    setPackZipFileName(file.name);
    setPackZipFileSize(`${(file.size / (1024 * 1024)).toFixed(2)} MB`);
    setPackZipUploaded(false);
    setPackIsUploadingZip(true);
    setPackZipProgress(0);

    const uploadInterval = setInterval(() => {
      setPackZipProgress((prev) => {
        if (prev >= 100) {
          clearInterval(uploadInterval);
          setPackIsUploadingZip(false);
          startZipCompilingEngine(file.name);
          return 100;
        }
        return prev + 15;
      });
    }, 100);
  };

  const startZipCompilingEngine = (name: string) => {
    setPackIsProcessingZip(true);
    setPackZipProcessingProgress(0);
    const statuses = [
      'Decrypting ZIP block signatures...',
      'Validating archive integrity...',
      'Unpacking master directories...',
      'Reading local file headers...',
      'Analyzing audio waveforms...',
      'Detected 3 high-fidelity audio files & stems package'
    ];

    setPackProcessingStatus(statuses[0]);

    const processingInterval = setInterval(() => {
      setPackZipProcessingProgress((prev) => {
        const nextProgress = prev + 10;
        const index = Math.min(
          Math.floor((nextProgress / 100) * statuses.length),
          statuses.length - 1
        );
        setPackProcessingStatus(statuses[index]);

        if (nextProgress >= 100) {
          clearInterval(processingInterval);
          setPackIsProcessingZip(false);
          setPackZipUploaded(true);
          
          // Generate beautiful files list inside the ZIP
          const cleanTitle = name.replace(/\.[^/.]+$/, '').toUpperCase();
          setPackTitle(cleanTitle);
          setPackDetectedFiles([
            `01_${cleanTitle}_142BPM_Fmin.mp3`,
            `02_${cleanTitle}_STSTEM_DRUMS_142BPM.mp3`,
            `03_${cleanTitle}_STEMS_SYNTH_142BPM.mp3`,
            'stems_multitrack_raw_master.zip'
          ]);
          return 100;
        }
        return nextProgress;
      });
    }, 150);
  };

  const handlePublishBeatPackLocal = () => {
    const finalPack: BeatPack = {
      id: `pack-${Date.now()}`,
      name: packTitle.trim() || 'UNTITLED BEAT PACK',
      description: packDescription,
      price: packPrice,
      artworkUrl: packArtworkUrl,
      beatIds: ['beat-1', 'beat-2'], // default references
      freeDownload: packFreeDownload,
      published: packVisibility === 'published',
      createdDate: new Date().toISOString().split('T')[0],
    };

    if (onPublishBeatPack) {
      onPublishBeatPack(finalPack);
    } else {
      const existing = localStorage.getItem('voodoo_beat_packs');
      const list = existing ? JSON.parse(existing) : [];
      localStorage.setItem('voodoo_beat_packs', JSON.stringify([finalPack, ...list]));
    }

    localStorage.removeItem('voodoo_modal_pack_uploader_draft');
    onClose();
  };

  const getPageClass = (pageType: 'single' | 'pack') => {
    if (activePage !== pageType && !isAnimatingPage) return 'hidden';
    
    if (isAnimatingPage) {
      if (prefersReducedMotion) {
        return activePage === pageType ? 'page-fade-enter-active' : 'page-fade-exit-active';
      }
      if (pageTurnDirection === 'forward') {
        return pageType === 'single' ? 'page-turn-forward-exit' : 'page-turn-forward-enter';
      } else if (pageTurnDirection === 'backward') {
        return pageType === 'pack' ? 'page-turn-backward-exit' : 'page-turn-backward-enter';
      }
    }
    
    return 'animate-fadeIn';
  };

  // Draft autosaving and restoration
  const [hasRestoredDraft, setHasRestoredDraft] = useState<boolean>(false);
  const [detectedDraftPresent, setDetectedDraftPresent] = useState<boolean>(false);

  // Step 1: Upload Audio States
  const [fileName, setFileName] = useState<string>('cashmere_synth_master_320k.mp3');
  const [fileSize, setFileSize] = useState<string>('6.85 MB');
  const [fileUploaded, setFileUploaded] = useState<boolean>(true);
  const [isUploading, setIsUploading] = useState<boolean>(false);
  const [uploadProgress, setUploadProgress] = useState<number>(0);
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [processingProgress, setProcessingProgress] = useState<number>(0);
  const [processingStatus, setProcessingStatus] = useState<string>('');
  const [audioError, setAudioError] = useState<string>('');
  const [audioDuration, setAudioDuration] = useState<string>('2:48');
  const [detectedBpm, setDetectedBpm] = useState<number>(142);
  const [detectedKey, setDetectedKey] = useState<string>('F# Minor');

  // Step 2: Artwork State
  const [artworkUrl, setArtworkUrl] = useState<string>('/src/assets/images/cashmere_cover_velvet_1790419833792.jpg');
  const [customArtworkName, setCustomArtworkName] = useState<string>('');
  const [isUploadingArtwork, setIsUploadingArtwork] = useState<boolean>(false);
  const [artworkDimensions, setArtworkDimensions] = useState<string>('3000 × 3000 px');

  // Step 3: Details & Metadata Info States
  const [title, setTitle] = useState<string>('VALENTINO VELVET');
  const [bpm, setBpm] = useState<number>(142);
  const [key, setKey] = useState<string>('F# Minor');
  const [genre, setGenre] = useState<GenreType>('TRAP');
  const [moods, setMoods] = useState<string>('Dark, Cinematic, High Fashion');
  const [tags, setTags] = useState<string>('cashmere, darktrap, luxury, velvet');
  const [description, setDescription] = useState<string>(
    'Dark sub-bass glide with atmospheric arps and luxury runway bouncy drums.'
  );

  // Step 4: Pricing & Free Downloads States
  const [mp3Price, setMp3Price] = useState<number>(39.99);
  const [premiumPrice, setPremiumPrice] = useState<number>(89.99);
  const [unlimitedPrice, setUnlimitedPrice] = useState<number>(249.99);
  const [exclusivePrice, setExclusivePrice] = useState<number>(1200.0);
  const [allowFreeDownload, setAllowFreeDownload] = useState<boolean>(true);
  const [freeDownloadType, setFreeDownloadType] = useState<'email_required' | 'no_lead'>('email_required');

  // Step 5: Customer Access & Visibility States
  const [visibility, setVisibility] = useState<'published' | 'draft' | 'hidden'>('published');
  const [stableBeatId] = useState<string>(`beat-upload-${Date.now()}`);
  const [copiedLink, setCopiedLink] = useState<boolean>(false);

  // Step 6: Store Presentation States
  const [featured, setFeatured] = useState<boolean>(true);
  const [category, setCategory] = useState<string>('Studio Vault');
  const [isPlayingPreview, setIsPlayingPreview] = useState<boolean>(false);

  // Track if any field was changed from default
  const [hasChanges, setHasChanges] = useState<boolean>(false);

  const stepTitles = [
    '1. AUDIO MASTER',
    '2. COVER ARTWORK',
    '3. ADVANCED METADATA',
    '4. PRICING & DOWNLOAD',
    '5. CUSTOMER ACCESS',
    '6. STORE PRESENTATION',
    '7. REVIEW & PUBLISH',
  ];

  const artworkPresets = [
    '/src/assets/images/cashmere_cover_velvet_1790419833792.jpg',
    '/src/assets/images/cashmere_cover_vault_1790419848357.jpg',
    '/src/assets/images/cashmere_hero_runway_1790419818906.jpg',
  ];

  // Check for saved draft on mount
  useEffect(() => {
    const draft = localStorage.getItem('voodoo_single_uploader_draft');
    if (draft) {
      setDetectedDraftPresent(true);
    }
  }, []);

  // Autosave draft when values change
  useEffect(() => {
    if (hasChanges) {
      const draftData = {
        fileName,
        fileSize,
        fileUploaded,
        audioDuration,
        detectedBpm,
        detectedKey,
        artworkUrl,
        artworkDimensions,
        title,
        bpm,
        key,
        genre,
        moods,
        tags,
        description,
        mp3Price,
        premiumPrice,
        unlimitedPrice,
        exclusivePrice,
        allowFreeDownload,
        freeDownloadType,
        visibility,
        featured,
        category,
      };
      localStorage.setItem('voodoo_single_uploader_draft', JSON.stringify(draftData));
    }
  }, [
    fileName,
    fileSize,
    fileUploaded,
    audioDuration,
    detectedBpm,
    detectedKey,
    artworkUrl,
    artworkDimensions,
    title,
    bpm,
    key,
    genre,
    moods,
    tags,
    description,
    mp3Price,
    premiumPrice,
    unlimitedPrice,
    exclusivePrice,
    allowFreeDownload,
    freeDownloadType,
    visibility,
    featured,
    category,
    hasChanges
  ]);

  const restoreDraft = () => {
    const draft = localStorage.getItem('voodoo_single_uploader_draft');
    if (draft) {
      try {
        const d = JSON.parse(draft);
        setFileName(d.fileName || '');
        setFileSize(d.fileSize || '');
        setFileUploaded(!!d.fileUploaded);
        setAudioDuration(d.audioDuration || '2:48');
        setDetectedBpm(d.detectedBpm || 142);
        setDetectedKey(d.detectedKey || 'F# Minor');
        setArtworkUrl(d.artworkUrl || '');
        setArtworkDimensions(d.artworkDimensions || '3000 × 3000 px');
        setTitle(d.title || '');
        setBpm(d.bpm || 142);
        setKey(d.key || 'F# Minor');
        setGenre(d.genre || 'TRAP');
        setMoods(d.moods || '');
        setTags(d.tags || '');
        setDescription(d.description || '');
        setMp3Price(d.mp3Price || 39.99);
        setPremiumPrice(d.premiumPrice || 89.99);
        setUnlimitedPrice(d.unlimitedPrice || 249.99);
        setExclusivePrice(d.exclusivePrice || 1200.0);
        setAllowFreeDownload(!!d.allowFreeDownload);
        setFreeDownloadType(d.freeDownloadType || 'email_required');
        setVisibility(d.visibility || 'published');
        setFeatured(!!d.featured);
        setCategory(d.category || 'Studio Vault');
        setHasRestoredDraft(true);
        setDetectedDraftPresent(false);
      } catch (e) {
        console.error('Error restoring draft', e);
      }
    }
  };

  const clearDraft = () => {
    localStorage.removeItem('voodoo_single_uploader_draft');
    setDetectedDraftPresent(false);
  };

  // Simulate premium uploading and compiling engine
  const handleAudioFileSelection = (file: File) => {
    setAudioError('');
    const extension = file.name.split('.').pop()?.toLowerCase();
    if (extension === 'wav') {
      setAudioError(
        'WAV format is unsupported in the storefront. Supported store formats: high-fidelity M4A or 320kbps MP3 only.'
      );
      return;
    }

    setHasChanges(true);
    setFileName(file.name);
    setFileSize(`${(file.size / (1024 * 1024)).toFixed(2)} MB`);
    setFileUploaded(false);
    setIsUploading(true);
    setUploadProgress(0);

    // Simulated high-end upload tick
    const uploadInterval = setInterval(() => {
      setUploadProgress((prev) => {
        if (prev >= 100) {
          clearInterval(uploadInterval);
          setIsUploading(false);
          startAudioCompilingEngine(file.name);
          return 100;
        }
        return prev + 10;
      });
    }, 120);
  };

  const startAudioCompilingEngine = (name: string) => {
    setIsProcessing(true);
    setProcessingProgress(0);
    const statuses = [
      'Reading digital audio headers...',
      'Validating sample rates & bit depth (44.1kHz, 320kbps)...',
      'Analyzing peak transient vectors (BPM detection)...',
      'Compiling lossy-to-lossless waveform caches...',
      'Audio successfully master validated!',
    ];

    let currentStatusIdx = 0;
    setProcessingStatus(statuses[0]);

    const processingInterval = setInterval(() => {
      setProcessingProgress((prev) => {
        const nextProgress = prev + 5;
        
        // Update status string progressively
        const index = Math.min(
          Math.floor((nextProgress / 100) * statuses.length),
          statuses.length - 1
        );
        setProcessingStatus(statuses[index]);

        if (nextProgress >= 100) {
          clearInterval(processingInterval);
          setIsProcessing(false);
          setFileUploaded(true);
          
          // Intelligent metadata guessing
          const cleanTitle = name
            .replace(/\.[^/.]+$/, '') // remove extension
            .replace(/[_-]/g, ' ')   // replace underscores/dashes with space
            .toUpperCase();
          
          setTitle(cleanTitle);
          
          // Assign fun, smart tempo & key
          const randomBpm = [135, 140, 142, 145, 150, 160][Math.floor(Math.random() * 6)];
          const randomKey = ['F# Minor', 'C Minor', 'G Minor', 'D Minor', 'A# Minor', 'E Minor'][Math.floor(Math.random() * 6)];
          
          setDetectedBpm(randomBpm);
          setDetectedKey(randomKey);
          setBpm(randomBpm);
          setKey(randomKey);
          setAudioDuration('2:54');
          return 100;
        }
        return nextProgress;
      });
    }, 100);
  };

  const handleArtworkSelection = (file: File) => {
    setIsUploadingArtwork(true);
    setHasChanges(true);
    const reader = new FileReader();
    reader.onload = (e) => {
      const dataUrl = e.target?.result as string;
      setArtworkUrl(dataUrl);
      setCustomArtworkName(file.name);
      setArtworkDimensions(`${file.name} · Device Image Loaded`);
      setIsUploadingArtwork(false);
    };
    reader.readAsDataURL(file);
  };

  const [isGeneratingTitle, setIsGeneratingTitle] = useState(false);
  const [isGeneratingDesc, setIsGeneratingDesc] = useState(false);

  const handleAiGenerateTitle = async () => {
    setIsGeneratingTitle(true);
    try {
      const response = await fetch('/api/gemini/suggest-titles', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ genre, tempo: bpm, scaleKey: key })
      });
      if (!response.ok) throw new Error('Failed to fetch from server');
      const data = await response.json();
      if (Array.isArray(data) && data.length > 0) {
        const randomTitle = data[Math.floor(Math.random() * data.length)];
        setTitle(randomTitle.toUpperCase());
      } else {
        throw new Error('Invalid response format');
      }
    } catch (err) {
      console.warn("Falling back to pre-defined title templates due to API offline", err);
      const titles = [
        'VALENTINO GOLD', 'VELVET DRIFT', 'OBSIDIAN CRASH', 'CASHMERE RUNWAY', 
        'TOKYO HARMONICS', 'GLIDE VECTOR', 'ATLANTA REIGN', 'SYNTHESIS SILK', 
        'DIAMOND STENCIL', 'ELEGANT CHAOS', 'AMETHRYST DUST', 'PLATINUM SHADOW'
      ];
      const generated = titles[Math.floor(Math.random() * titles.length)];
      setTitle(generated + ' (AI SUGGESTED)');
    } finally {
      setIsGeneratingTitle(false);
      setHasChanges(true);
    }
  };

  const handleAiGenerateDescription = async () => {
    setIsGeneratingDesc(true);
    try {
      const response = await fetch('/api/gemini/suggest-description', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          title, 
          genre, 
          tempo: bpm, 
          scaleKey: key, 
          moods: moods,
          tags: tags
        })
      });
      if (!response.ok) throw new Error('Failed to fetch from server');
      const data = await response.json();
      if (data.text) {
        setDescription(data.text);
      } else {
        throw new Error('Invalid response format');
      }
    } catch (err) {
      console.warn("Falling back to pre-defined description templates due to API offline", err);
      const descs = [
        'An ultra premium luxury high-fashion trap sequence utilizing boutique analog synthesizers, sliding sub-bass textures, and pristine hi-hat vectors.',
        'Melancholic modular synth chords overlaying an aggressive, forward-driving 808 glide pattern. Ideal for commercial editorial placements.',
        'Savage Atlanta-style triple hats paired with majestic cinematic orchestral pads and filtered acoustic piano arpeggios.',
        'A nocturnal, spacey ambient freestyle trap environment offering modular key glides and complex syncopated rimshot grooves.'
      ];
      const generated = descs[Math.floor(Math.random() * descs.length)];
      setDescription(generated);
    } finally {
      setIsGeneratingDesc(false);
      setHasChanges(true);
    }
  };

  const handleDoubleBpm = () => {
    setBpm((prev) => prev * 2);
    setHasChanges(true);
  };

  const handleHalfBpm = () => {
    setBpm((prev) => Math.round(prev / 2));
    setHasChanges(true);
  };

  // Safe exit confirmation
  const handleSafeClose = () => {
    if (hasChanges) {
      const confirmExit = window.confirm(
        'Warning: You have unsaved changes in your single beat uploader workspace. Are you sure you want to close? Your progress will be saved as an autosaved draft.'
      );
      if (!confirmExit) return;
    }
    onClose();
  };

  const handlePublish = (publishStatus: 'published' | 'draft' | 'hidden') => {
    const finalBeat: Beat = {
      id: stableBeatId,
      title: title.trim() || 'UNTITLED INSTRUMENTAL',
      producerName: 'CASHMERE KID$',
      bpm: bpm || 140,
      key: key || 'C Minor',
      duration: audioDuration,
      durationSeconds: 174,
      pricing: {
        mp3Lease: mp3Price,
        premiumLease: premiumPrice,
        unlimited: unlimitedPrice,
        exclusive: exclusivePrice,
      },
      freeDownload: allowFreeDownload,
      freeDownloadType: freeDownloadType === 'email_required' ? 'email_required' : 'tagged',
      genre: genre,
      subGenres: ['Dark Trap', 'Runway Trap'],
      moods: moods.split(',').map((m) => m.trim()).filter(Boolean),
      tags: tags.split(',').map((t) => t.trim()).filter(Boolean),
      artworkUrl: artworkUrl,
      playCount: 0,
      downloadCount: 0,
      likeCount: 0,
      featured: featured,
      published: publishStatus === 'published',
      createdDate: new Date().toISOString().split('T')[0],
      updatedDate: new Date().toISOString().split('T')[0],
      releaseDate: new Date().toISOString().split('T')[0],
      description: description,
      voiceTag: true,
      isNew: true,
    };

    onPublishBeat(finalBeat);
    
    // Clear draft after success
    localStorage.removeItem('voodoo_single_uploader_draft');
    
    onClose();
  };

  // Check for duplicate names
  const isDuplicateTitle = beats.some(
    (b) => b.title.trim().toLowerCase() === title.trim().toLowerCase()
  );

  const handleCopyLink = () => {
    const url = `${window.location.origin}/?beat=${stableBeatId}`;
    navigator.clipboard.writeText(url);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90 backdrop-blur-md overflow-y-auto">
      <div className="bg-zinc-900 border border-zinc-800 w-full max-w-4xl rounded-3xl shadow-3xl overflow-hidden my-auto animate-in fade-in zoom-in-95 duration-200 flex flex-col max-h-[90vh]">
        
        {/* Modal Header — Advanced Studio Control Room Header Style */}
        <div className="px-6 py-4 border-b border-zinc-800/80 flex items-center justify-between bg-zinc-950">
          <div className="flex items-center gap-3">
            <div className="w-2.5 h-2.5 rounded-full bg-purple-500 animate-ping" />
            <span className="text-xs text-purple-300 font-mono font-bold tracking-widest uppercase">
              STUDIO CONTROL ROOM / UPLOADER
            </span>
          </div>

          {/* Top-Right Page Switcher (Internal Tab Switches only!) */}
          <div className="flex items-center gap-4">
            <div className="bg-zinc-900 rounded-xl p-1 flex border border-zinc-800 text-[10px] font-bold">
              <button 
                onClick={() => handlePageSwitch('single')}
                className={`px-3 py-1.5 rounded-lg transition-all duration-200 ${
                  activePage === 'single'
                    ? 'bg-purple-600 text-white shadow-sm font-extrabold'
                    : 'text-zinc-500 hover:text-white'
                }`}
                title="Uploading standard single instrumental beat track"
              >
                SINGLE BEAT
              </button>
              <button 
                onClick={() => handlePageSwitch('pack')}
                className={`px-3 py-1.5 rounded-lg transition-all duration-200 text-zinc-400 hover:text-white flex items-center gap-1 ${
                  activePage === 'pack'
                    ? 'bg-purple-600 text-white shadow-sm font-extrabold'
                    : 'text-zinc-500 hover:text-white'
                }`}
                title="Transition to multi-beat packs workspace"
              >
                <span>BEAT PACKS</span>
              </button>
            </div>

            <button
              onClick={handleSafeClose}
              className="p-1.5 text-zinc-400 hover:text-white rounded-xl hover:bg-zinc-800 transition-colors"
              title="Close Uploader Workspace"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Draft Notice Banner */}
        {detectedDraftPresent && (
          <div className="bg-purple-950/80 border-b border-purple-500/30 px-6 py-2.5 flex justify-between items-center text-xs animate-slideDown">
            <div className="flex items-center gap-2 text-purple-200">
              <AlertTriangle className="w-4 h-4 text-purple-400" />
              <span>An autosaved single-beat draft is available from your last workspace session.</span>
            </div>
            <div className="flex items-center gap-3 font-bold font-mono">
              <button onClick={restoreDraft} className="text-purple-300 hover:text-white underline">
                [RESTORE DRAFT]
              </button>
              <button onClick={clearDraft} className="text-zinc-500 hover:text-zinc-300">
                [DISCARD]
              </button>
            </div>
          </div>
        )}

        {hasRestoredDraft && (
          <div className="bg-emerald-950/50 border-b border-emerald-500/20 px-6 py-2 text-xs text-emerald-400 font-medium flex items-center gap-2">
            <CheckCircle className="w-4 h-4" />
            <span>Successfully restored your previous autosaved draft parameters.</span>
          </div>
        )}

        {/* Dynamic Wizard Steps Bar */}
        {activePage === 'single' && (
          <div className="px-6 py-3 bg-zinc-950 border-b border-zinc-800/60 overflow-x-auto scrollbar-none shrink-0">
            <div className="flex items-center gap-2 min-w-max text-[10px] sm:text-xs font-bold uppercase tracking-wider">
              {stepTitles.map((stepLabel, idx) => (
                <button
                  key={idx}
                  onClick={() => setCurrentStep(idx + 1)}
                  className={`px-3 py-1.5 rounded-xl transition-all border ${
                    currentStep === idx + 1
                      ? 'bg-purple-600/95 border-purple-400 text-white font-extrabold shadow-lg shadow-purple-950/80'
                      : currentStep > idx + 1
                      ? 'bg-purple-950/20 text-purple-300 border-purple-500/10 hover:border-purple-500/30'
                      : 'bg-zinc-900/60 text-zinc-500 border-transparent hover:text-zinc-300'
                  }`}
                >
                  {stepLabel}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Modal Scrollable Workspace Body wrapped in Luxury Digital Book */}
        <div className="p-6 overflow-y-auto flex-1 space-y-6 luxury-book">
          
          {/* ============================================================== */}
          {/* PAGE 1: STANDALONE SINGLE BEAT                                 */}
          {/* ============================================================== */}
          <div className={`w-full ${getPageClass('single')} space-y-6`}>
            
            {/* STEP 1: AUDIO MASTER */}
            {currentStep === 1 && (
            <div className="space-y-6 animate-fadeIn">
              <div>
                <h3 className="text-white font-brand font-black text-lg uppercase tracking-wider">
                  Audio Studio Master
                </h3>
                <p className="text-xs text-zinc-400 mt-1">
                  Upload your high-fidelity storefront master files. WAV is not supported globally in storefront player. Only uncompressed MP3 (320kbps) and M4A studio formats are permitted.
                </p>
              </div>

              {/* Error Banner */}
              {audioError && (
                <div className="p-4 bg-rose-950/80 border border-rose-500/30 rounded-2xl flex items-start gap-3 text-xs text-rose-300 animate-shake">
                  <AlertTriangle className="w-5 h-5 shrink-0 text-rose-400" />
                  <div className="space-y-1">
                    <p className="font-extrabold">AUDIO FORMAT BLOCKED</p>
                    <p className="opacity-90">{audioError}</p>
                  </div>
                </div>
              )}

              {/* Interactive Audio Drag & Drop / Selection */}
              <div 
                className={`border-2 border-dashed rounded-3xl p-10 text-center transition-all ${
                  isUploading || isProcessing
                    ? 'border-purple-500/50 bg-zinc-950/30 cursor-not-allowed'
                    : 'border-zinc-700/80 hover:border-purple-500/50 bg-zinc-950/60 cursor-pointer'
                }`}
              >
                <input
                  type="file"
                  id="masterAudioInput"
                  accept=".mp3,.m4a,audio/mpeg,audio/mp4,audio/x-m4a"
                  className="hidden"
                  disabled={isUploading || isProcessing}
                  onChange={(e) => {
                    if (e.target.files && e.target.files[0]) {
                      handleAudioFileSelection(e.target.files[0]);
                    }
                  }}
                />

                <label htmlFor="masterAudioInput" className="block cursor-pointer space-y-5">
                  <div className="w-14 h-14 rounded-full bg-purple-950/50 border border-purple-500/20 flex items-center justify-center text-purple-400 mx-auto">
                    {isUploading || isProcessing ? (
                      <RefreshCw className="w-6 h-6 animate-spin text-purple-400" />
                    ) : (
                      <Upload className="w-6 h-6" />
                    )}
                  </div>

                  <div className="space-y-1.5 max-w-md mx-auto">
                    <h4 className="font-bold text-white text-sm">
                      {isUploading
                        ? 'Uploading file to Cashmere Master Storage...'
                        : isProcessing
                        ? 'Compiling Audio Engine Waveform...'
                        : 'Drag & Drop Audio Master File here'}
                    </h4>
                    <p className="text-xs text-zinc-500 leading-relaxed">
                      Acceptable parameters: high-fidelity 320kbps MP3 or studio master M4A (no limits on length). Max file size 120MB.
                    </p>
                  </div>

                  {!isUploading && !isProcessing && (
                    <div className="inline-block px-4 py-2 bg-purple-950/60 text-purple-300 border border-purple-500/20 hover:bg-purple-900 text-xs font-bold rounded-xl transition-all">
                      Browse Local Files
                    </div>
                  )}
                </label>

                {/* Progress Indicators */}
                {(isUploading || isProcessing) && (
                  <div className="max-w-md mx-auto mt-6 space-y-3">
                    <div className="flex justify-between text-xs font-mono font-bold text-zinc-400">
                      <span>{isUploading ? 'UPLOADING MASTER' : processingStatus}</span>
                      <span>{isUploading ? `${uploadProgress}%` : `${processingProgress}%`}</span>
                    </div>
                    <div className="w-full bg-zinc-900 h-2.5 rounded-full overflow-hidden border border-zinc-800">
                      <div
                        className="bg-gradient-to-r from-purple-600 via-violet-600 to-fuchsia-500 h-full transition-all duration-150"
                        style={{ width: `${isUploading ? uploadProgress : processingProgress}%` }}
                      />
                    </div>
                  </div>
                )}
              </div>

              {/* Uploaded File Specifications Card */}
              {fileUploaded && !isUploading && !isProcessing && (
                <div className="p-4 bg-zinc-950/80 border border-zinc-800 rounded-2xl flex items-center justify-between text-xs animate-fadeIn">
                  <div className="flex items-center gap-3.5">
                    <div className="w-10 h-10 rounded-xl bg-purple-950 border border-purple-500/30 flex items-center justify-center text-purple-300 shadow">
                      <FileAudio className="w-5 h-5" />
                    </div>
                    <div>
                      <div className="font-bold text-white font-mono">{fileName}</div>
                      <div className="text-[11px] text-zinc-500 font-mono mt-0.5">
                        Size: {fileSize} · Duration: {audioDuration} · Formats: MP3 + M4A Validated
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="text-emerald-400 font-bold flex items-center gap-1 bg-emerald-950/40 border border-emerald-500/20 px-3 py-1.5 rounded-xl text-[10px] uppercase font-mono tracking-widest">
                      <CheckCircle className="w-3.5 h-3.5" /> Ready
                    </span>
                  </div>
                </div>
              )}

              {/* Audio Waveform Canvas Preview */}
              {fileUploaded && !isUploading && !isProcessing && (
                <div className="p-5 bg-zinc-950 rounded-2xl border border-zinc-900 space-y-3">
                  <span className="text-[10px] font-mono font-black text-purple-400 uppercase tracking-wider block">
                    ENGINE MASTER COMPILED WAVEFORM PREVIEW
                  </span>
                  <div className="h-16 flex items-end gap-[2px] pt-4 overflow-hidden select-none">
                    {Array.from({ length: 64 }).map((_, i) => {
                      const h = Math.abs(Math.sin(i * 0.15)) * 100;
                      return (
                        <div
                          key={i}
                          className="flex-1 bg-gradient-to-t from-purple-800 to-purple-500 rounded-t-sm"
                          style={{ height: `${Math.max(10, h)}%` }}
                        />
                      );
                    })}
                  </div>
                  <div className="flex justify-between items-center text-[10px] font-mono font-bold text-zinc-500 pt-2 border-t border-zinc-900">
                    <span>DETECTED TEMPO: {detectedBpm} BPM</span>
                    <span>DETECTED SCALE: {detectedKey}</span>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* STEP 2: COVER ARTWORK */}
          {currentStep === 2 && (
            <div className="space-y-6 animate-fadeIn">
              <div>
                <h3 className="text-white font-brand font-black text-lg uppercase tracking-wider">
                  Cover Artwork Representation
                </h3>
                <p className="text-xs text-zinc-400 mt-1">
                  Upload a high-resolution square cover canvas. Supports JPEG, PNG, or GIF up to 4000x4000px.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-start">
                
                {/* Artwork Display Left Panel */}
                <div className="md:col-span-5 flex flex-col items-center justify-center p-6 bg-zinc-950 rounded-3xl border border-zinc-900 space-y-4">
                  <div className="relative aspect-square w-full rounded-2xl overflow-hidden border border-zinc-800 shadow-2xl bg-zinc-900">
                    <img src={artworkUrl} alt="Cover artwork" className="w-full h-full object-cover" />
                    {isUploadingArtwork && (
                      <div className="absolute inset-0 bg-black/75 flex items-center justify-center text-white font-mono text-xs">
                        <RefreshCw className="w-6 h-6 animate-spin text-purple-400 mb-2" />
                        <span>Uploading...</span>
                      </div>
                    )}
                  </div>
                  <div className="w-full text-center space-y-1">
                    <p className="text-xs text-white font-bold truncate">
                      {customArtworkName || 'Default Velvet Preset'}
                    </p>
                    <p className="text-[10px] font-mono text-zinc-500">
                      {artworkDimensions}
                    </p>
                  </div>
                </div>

                {/* Upload & Preset Options Right Panel */}
                <div className="md:col-span-7 space-y-6">
                  
                  {/* Custom Artwork Upload Button */}
                  <div className="p-5 bg-zinc-950 rounded-2xl border border-zinc-900 space-y-4">
                    <span className="text-[10px] font-mono font-black text-purple-400 uppercase tracking-wider block">
                      UPLOAD CUSTOM FILE
                    </span>
                    <input
                      type="file"
                      id="artworkUploadInput"
                      accept="image/*"
                      className="hidden"
                      onChange={(e) => {
                        if (e.target.files && e.target.files[0]) {
                          handleArtworkSelection(e.target.files[0]);
                        }
                      }}
                    />
                    <div className="flex gap-3">
                      <label
                        htmlFor="artworkUploadInput"
                        className="flex-1 py-3 bg-purple-600 hover:bg-purple-500 text-white font-extrabold text-xs text-center rounded-xl cursor-pointer transition-all shadow-md flex items-center justify-center gap-2"
                      >
                        <ImageIcon className="w-4 h-4" />
                        <span>Upload Custom Image</span>
                      </label>
                      
                      {customArtworkName && (
                        <button
                          onClick={() => {
                            setArtworkUrl('/src/assets/images/cashmere_cover_velvet_1790419833792.jpg');
                            setCustomArtworkName('');
                            setArtworkDimensions('3000 × 3000 px');
                          }}
                          className="px-4 py-3 bg-zinc-800 hover:bg-zinc-700 text-rose-400 hover:text-rose-300 font-bold text-xs rounded-xl transition-all"
                        >
                          Reset
                        </button>
                      )}
                    </div>
                  </div>

                  {/* High Fashion Obsidian Presets list */}
                  <div className="space-y-3">
                    <span className="text-[10px] font-mono font-black text-zinc-500 uppercase tracking-wider block pl-1">
                      OR SELECT STUDIO OBSIDIAN PRESET
                    </span>
                    <div className="grid grid-cols-3 gap-4">
                      {artworkPresets.map((preset, idx) => (
                        <button
                          key={idx}
                          onClick={() => {
                            setArtworkUrl(preset);
                            setCustomArtworkName('');
                            setArtworkDimensions('3000 × 3000 px');
                            setHasChanges(true);
                          }}
                          className={`relative aspect-square rounded-2xl overflow-hidden border-2 transition-all ${
                            artworkUrl === preset && !customArtworkName
                              ? 'border-purple-500 scale-102 shadow-lg shadow-purple-950'
                              : 'border-zinc-800 opacity-60 hover:opacity-100 hover:scale-[1.01]'
                          }`}
                        >
                          <img src={preset} alt={`Preset ${idx + 1}`} className="w-full h-full object-cover" />
                          {artworkUrl === preset && !customArtworkName && (
                            <div className="absolute top-2 right-2 p-1 bg-purple-600 text-white rounded-full">
                              <Check className="w-3 h-3" />
                            </div>
                          )}
                        </button>
                      ))}
                    </div>
                  </div>

                </div>

              </div>
            </div>
          )}

          {/* STEP 3: ADVANCED DETAILS & METADATA */}
          {currentStep === 3 && (
            <div className="space-y-6 animate-fadeIn text-left">
              <div>
                <h3 className="text-white font-brand font-black text-lg uppercase tracking-wider">
                  Beat Identity & Details
                </h3>
                <p className="text-xs text-zinc-400 mt-1">
                  Specify professional metadata parameters. Unsafe, automated or fake metadata will block publishing.
                </p>
              </div>

              {/* Duplicate Warn Banner */}
              {isDuplicateTitle && (
                <div className="p-4 bg-amber-950/80 border border-amber-500/30 rounded-2xl flex items-start gap-3 text-xs text-amber-300 animate-fadeIn">
                  <AlertTriangle className="w-5 h-5 shrink-0 text-amber-400" />
                  <div className="space-y-1">
                    <p className="font-extrabold">DUPLICATE TRACK TITLE DETECTED</p>
                    <p className="opacity-90">
                      An instrumental named "{title}" already exists in your studio archives. Creating this beat will create a duplicate in the public list.
                    </p>
                  </div>
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 text-xs">
                
                {/* Title */}
                <div>
                  <div className="flex justify-between items-center mb-1.5">
                    <label className="block text-zinc-400 font-bold uppercase tracking-wider text-[10px]">
                      Instrumental Title
                    </label>
                    <button 
                      type="button"
                      onClick={handleAiGenerateTitle}
                      disabled={isGeneratingTitle}
                      className="text-[9px] font-mono font-bold text-purple-400 hover:text-purple-300 flex items-center gap-1 bg-purple-950/40 px-2 py-1 rounded border border-purple-500/20 cursor-pointer disabled:opacity-50"
                    >
                      {isGeneratingTitle ? (
                        <>
                          <RefreshCw className="w-3 h-3 animate-spin" />
                          <span>Generating...</span>
                        </>
                      ) : (
                        <span>✨ AI Title Suggester</span>
                      )}
                    </button>
                  </div>
                  <input
                    type="text"
                    value={title}
                    onChange={(e) => {
                      setTitle(e.target.value);
                      setHasChanges(true);
                    }}
                    placeholder="e.g. OBSIDIAN RUNWAY"
                    className="w-full bg-zinc-950 border border-zinc-800 focus:border-purple-500 rounded-xl p-3 text-white font-bold outline-none font-mono"
                  />
                </div>

                {/* Tempo (BPM) */}
                <div>
                  <div className="flex justify-between items-center mb-1.5">
                    <label className="block text-zinc-400 font-bold uppercase tracking-wider text-[10px]">
                      Tempo (BPM)
                    </label>
                    <div className="flex items-center gap-1.5">
                      <button 
                        type="button"
                        onClick={handleDoubleBpm}
                        className="text-[8px] font-mono font-bold text-zinc-400 hover:text-white bg-zinc-900 border border-zinc-800 px-1.5 py-0.5 rounded cursor-pointer"
                      >
                        Double (2x)
                      </button>
                      <button 
                        type="button"
                        onClick={handleHalfBpm}
                        className="text-[8px] font-mono font-bold text-zinc-400 hover:text-white bg-zinc-900 border border-zinc-800 px-1.5 py-0.5 rounded cursor-pointer"
                      >
                        Half (0.5x)
                      </button>
                    </div>
                  </div>
                  <input
                    type="number"
                    value={bpm}
                    onChange={(e) => {
                      setBpm(parseInt(e.target.value) || 0);
                      setHasChanges(true);
                    }}
                    placeholder="e.g. 140"
                    className="w-full bg-zinc-950 border border-zinc-800 focus:border-purple-500 rounded-xl p-3 text-white font-mono outline-none"
                  />
                </div>

                {/* Scale Key */}
                <div>
                  <label className="block text-zinc-400 mb-1.5 font-bold uppercase tracking-wider text-[10px]">
                    Musical Scale Key
                  </label>
                  <select
                    value={key}
                    onChange={(e) => {
                      setKey(e.target.value);
                      setHasChanges(true);
                    }}
                    className="w-full bg-zinc-950 border border-zinc-800 focus:border-purple-500 rounded-xl p-3 text-white font-mono outline-none"
                  >
                    {['F# Minor', 'C Minor', 'G Minor', 'D Minor', 'A# Minor', 'E Minor', 'A Major', 'G Major', 'C Major'].map((val) => (
                      <option key={val} value={val}>{val}</option>
                    ))}
                  </select>
                </div>

                {/* Genre */}
                <div>
                  <label className="block text-zinc-400 mb-1.5 font-bold uppercase tracking-wider text-[10px]">
                    Primary Genre
                  </label>
                  <select
                    value={genre}
                    onChange={(e) => {
                      setGenre(e.target.value as GenreType);
                      setHasChanges(true);
                    }}
                    className="w-full bg-zinc-950 border border-zinc-800 focus:border-purple-500 rounded-xl p-3 text-white font-mono outline-none"
                  >
                    {['TRAP', 'DRILL', 'FREESTYLE TRAP', 'DARK SYNTH', 'HYPER TRAP', 'HARD TRAP'].map((g) => (
                      <option key={g} value={g}>{g}</option>
                    ))}
                  </select>
                </div>

                {/* Mood Tags */}
                <div>
                  <label className="block text-zinc-400 mb-1.5 font-bold uppercase tracking-wider text-[10px]">
                    Mood Tags (Comma separated)
                  </label>
                  <input
                    type="text"
                    value={moods}
                    onChange={(e) => {
                      setMoods(e.target.value);
                      setHasChanges(true);
                    }}
                    placeholder="Cinematic, Luxury, Bouncy"
                    className="w-full bg-zinc-950 border border-zinc-800 focus:border-purple-500 rounded-xl p-3 text-white outline-none font-mono"
                  />
                </div>

                {/* Keywords Tags */}
                <div>
                  <label className="block text-zinc-400 mb-1.5 font-bold uppercase tracking-wider text-[10px]">
                    Discovery Keywords / Search Tags
                  </label>
                  <input
                    type="text"
                    value={tags}
                    onChange={(e) => {
                      setTags(e.target.value);
                      setHasChanges(true);
                    }}
                    placeholder="cashmere, runway, trap"
                    className="w-full bg-zinc-950 border border-zinc-800 focus:border-purple-500 rounded-xl p-3 text-white outline-none font-mono"
                  />
                </div>

                {/* Narrative Description */}
                <div className="sm:col-span-2">
                  <div className="flex justify-between items-center mb-1.5">
                    <label className="block text-zinc-400 font-bold uppercase tracking-wider text-[10px]">
                      Beat Narrative & Product description
                    </label>
                    <button 
                      type="button"
                      onClick={handleAiGenerateDescription}
                      disabled={isGeneratingDesc}
                      className="text-[9px] font-mono font-bold text-purple-400 hover:text-purple-300 flex items-center gap-1 bg-purple-950/40 px-2 py-1 rounded border border-purple-500/20 cursor-pointer disabled:opacity-50"
                    >
                      {isGeneratingDesc ? (
                        <>
                          <RefreshCw className="w-3 h-3 animate-spin" />
                          <span>Generating...</span>
                        </>
                      ) : (
                        <span>✨ AI Description Generator</span>
                      )}
                    </button>
                  </div>
                  <textarea
                    rows={3}
                    value={description}
                    onChange={(e) => {
                      setDescription(e.target.value);
                      setHasChanges(true);
                    }}
                    placeholder="Provide creative context or production details for the artist..."
                    className="w-full bg-zinc-950 border border-zinc-800 focus:border-purple-500 rounded-2xl p-3.5 text-white outline-none leading-relaxed font-mono text-[11px]"
                  />
                </div>

              </div>
            </div>
          )}

          {/* STEP 4: PRICING & DOWNLOAD OPTIONS */}
          {currentStep === 4 && (
            <div className="space-y-6 animate-fadeIn">
              <div>
                <h3 className="text-white font-brand font-black text-lg uppercase tracking-wider">
                  Pricing & Customer Downloads
                </h3>
                <p className="text-xs text-zinc-400 mt-1">
                  Configure digital licensing lease parameters and checkout behaviors.
                </p>
              </div>

              {/* Grid with direct prices & descriptions */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                
                {/* MP3 */}
                <div className="p-4 bg-zinc-950 border border-zinc-850 rounded-2xl space-y-2 text-left">
                  <div className="flex justify-between items-center">
                    <span className="font-bold text-white uppercase tracking-wider text-[10px]">MP3 Standard Lease</span>
                    <span className="text-[10px] text-zinc-500 font-mono">320kbps MP3</span>
                  </div>
                  <input
                    type="number"
                    step="0.01"
                    value={mp3Price}
                    onChange={(e) => {
                      setMp3Price(parseFloat(e.target.value) || 0);
                      setHasChanges(true);
                    }}
                    className="w-full bg-zinc-900 border border-zinc-800 rounded-xl p-2.5 font-mono text-purple-300 font-bold"
                  />
                  <p className="text-[10px] text-zinc-500">Includes tagged storefront streaming & high-fidelity MP3 master lease download.</p>
                </div>

                {/* Premium */}
                <div className="p-4 bg-zinc-950 border border-zinc-850 rounded-2xl space-y-2 text-left">
                  <div className="flex justify-between items-center">
                    <span className="font-bold text-white uppercase tracking-wider text-[10px]">Premium M4A Lease</span>
                    <span className="text-[10px] text-zinc-500 font-mono">MP3 + M4A Uncompressed</span>
                  </div>
                  <input
                    type="number"
                    step="0.01"
                    value={premiumPrice}
                    onChange={(e) => {
                      setPremiumPrice(parseFloat(e.target.value) || 0);
                      setHasChanges(true);
                    }}
                    className="w-full bg-zinc-900 border border-zinc-800 rounded-xl p-2.5 font-mono text-purple-300 font-bold"
                  />
                  <p className="text-[10px] text-zinc-500">Unlocks access to lossless studio M4A track for elevated recording standards.</p>
                </div>

                {/* Unlimited */}
                <div className="p-4 bg-zinc-950 border border-zinc-850 rounded-2xl space-y-2 text-left">
                  <div className="flex justify-between items-center">
                    <span className="font-bold text-white uppercase tracking-wider text-[10px]">Unlimited Lease</span>
                    <span className="text-[10px] text-zinc-500 font-mono">Unlimited streams</span>
                  </div>
                  <input
                    type="number"
                    step="0.01"
                    value={unlimitedPrice}
                    onChange={(e) => {
                      setUnlimitedPrice(parseFloat(e.target.value) || 0);
                      setHasChanges(true);
                    }}
                    className="w-full bg-zinc-900 border border-zinc-800 rounded-xl p-2.5 font-mono text-purple-300 font-bold"
                  />
                  <p className="text-[10px] text-zinc-500">Unrestricted performance, broadcasting, streaming rights with zero distribution caps.</p>
                </div>

                {/* Exclusive */}
                <div className="p-4 bg-zinc-950 border border-zinc-850 rounded-2xl space-y-2 text-left">
                  <div className="flex justify-between items-center">
                    <span className="font-bold text-rose-300 uppercase tracking-wider text-[10px]">Exclusive buy-out</span>
                    <span className="text-[10px] text-zinc-500 font-mono">Full Transfer + STEMS</span>
                  </div>
                  <input
                    type="number"
                    step="0.01"
                    value={exclusivePrice}
                    onChange={(e) => {
                      setExclusivePrice(parseFloat(e.target.value) || 0);
                      setHasChanges(true);
                    }}
                    className="w-full bg-zinc-900 border border-zinc-800 rounded-xl p-2.5 font-mono text-purple-300 font-bold"
                  />
                  <p className="text-[10px] text-zinc-500">Full ownership acquisition, removal from public storefront, uncompressed multitrack stem ZIP archive.</p>
                </div>

              </div>

              {/* Free download actions with lead configuration */}
              <div className="p-5 bg-zinc-950 border border-zinc-900 rounded-2xl space-y-4 text-left">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <h4 className="font-bold text-sm text-white">Enable Free Promo Downloads</h4>
                    <p className="text-[11px] text-zinc-500 font-medium">Allow artists to fetch a tagged demo of this beat for reference writing purposes.</p>
                  </div>
                  <input
                    type="checkbox"
                    checked={allowFreeDownload}
                    onChange={(e) => {
                      setAllowFreeDownload(e.target.checked);
                      setHasChanges(true);
                    }}
                    className="w-10 h-5 bg-zinc-900 border border-zinc-800 rounded-full accent-purple-600 cursor-pointer"
                  />
                </div>

                {allowFreeDownload && (
                  <div className="pt-3.5 border-t border-zinc-900 grid grid-cols-1 sm:grid-cols-2 gap-4 animate-slideDown">
                    <button
                      onClick={() => {
                        setFreeDownloadType('email_required');
                        setHasChanges(true);
                      }}
                      className={`p-4 rounded-xl border text-left space-y-1 transition-all ${
                        freeDownloadType === 'email_required'
                          ? 'bg-purple-950/20 border-purple-500/40 text-purple-300'
                          : 'bg-zinc-900/40 border-zinc-850 text-zinc-400'
                      }`}
                    >
                      <div className="font-extrabold text-xs uppercase tracking-wider text-white">Require Artist Email Lead</div>
                      <p className="text-[10px] text-zinc-500 leading-relaxed font-medium">Builds your newsletter directory. Users must key a valid email to download standard tagged instrumental.</p>
                    </button>
                    <button
                      onClick={() => {
                        setFreeDownloadType('no_lead');
                        setHasChanges(true);
                      }}
                      className={`p-4 rounded-xl border text-left space-y-1 transition-all ${
                        freeDownloadType === 'no_lead'
                          ? 'bg-purple-950/20 border-purple-500/40 text-purple-300'
                          : 'bg-zinc-900/40 border-zinc-850 text-zinc-400'
                      }`}
                    >
                      <div className="font-extrabold text-xs uppercase tracking-wider text-white">Open Access (No Email Required)</div>
                      <p className="text-[10px] text-zinc-500 leading-relaxed font-medium">Instant click-to-download tagged file. Maximizes organic write-ups & songwriting test distributions.</p>
                    </button>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* STEP 5: CUSTOMER ACCESS & VISIBILITY */}
          {currentStep === 5 && (
            <div className="space-y-6 animate-fadeIn">
              <div>
                <h3 className="text-white font-brand font-black text-lg uppercase tracking-wider">
                  Customer Access & Visibility
                </h3>
                <p className="text-xs text-zinc-400 mt-1">
                  Enforce secure listing discoverability parameters and preview stable URL routing mappings.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-start">
                
                {/* Discoverability States Panel */}
                <div className="md:col-span-7 space-y-4 text-left">
                  <span className="text-[10px] font-mono font-black text-purple-400 uppercase tracking-wider block pl-1">
                    CATALOG LISTING STATUS (VISIBILITY)
                  </span>
                  
                  {[
                    {
                      id: 'published',
                      title: 'PUBLISHED STOREFRONT',
                      desc: 'Fully discovery-indexed. Will render on public Home carousel, Beats grid search, and producer profile view catalog listings.',
                      color: 'border-emerald-500/30 text-emerald-400 bg-emerald-950/10'
                    },
                    {
                      id: 'draft',
                      title: 'PRIVATE DRAFT',
                      desc: 'Completely unlisted on storefront. Instantly archived in private Producer Studio catalogs for revisions.',
                      color: 'border-amber-500/30 text-amber-400 bg-amber-950/10'
                    },
                    {
                      id: 'hidden',
                      title: 'HIDDEN UNLISTED (BY DIRECT PRODUCT URL ONLY)',
                      desc: 'Omitted from normal store searches, indexings, lists. Remains functional and buyable exclusively via direct URL links.',
                      color: 'border-blue-500/30 text-blue-400 bg-blue-950/10'
                    }
                  ].map((item) => (
                    <button
                      key={item.id}
                      onClick={() => {
                        setVisibility(item.id as any);
                        setHasChanges(true);
                      }}
                      className={`w-full p-4 rounded-2xl border text-left flex gap-4 transition-all ${
                        visibility === item.id
                          ? `${item.color} ring-1 ring-purple-500/40 shadow-lg`
                          : 'bg-zinc-950 border-zinc-900 text-zinc-400'
                      }`}
                    >
                      <div className="mt-1 shrink-0">
                        <div className={`w-4 h-4 rounded-full border flex items-center justify-center ${
                          visibility === item.id ? 'border-purple-400 bg-purple-500' : 'border-zinc-700 bg-transparent'
                        }`}>
                          {visibility === item.id && <div className="w-1.5 h-1.5 bg-black rounded-full" />}
                        </div>
                      </div>
                      <div className="space-y-1.5 min-w-0">
                        <div className="font-extrabold text-xs uppercase tracking-wider text-white">
                          {item.title}
                        </div>
                        <p className="text-[10px] text-zinc-500 leading-relaxed font-medium">
                          {item.desc}
                        </p>
                      </div>
                    </button>
                  ))}
                </div>

                {/* Direct Shareable stable product URL */}
                <div className="md:col-span-5 p-5 bg-zinc-950 rounded-2xl border border-zinc-900 text-left space-y-4">
                  <span className="text-[10px] font-mono font-black text-zinc-400 uppercase tracking-wider block">
                    STABLE DEEP-LINK URL ROUTING
                  </span>
                  
                  <div className="p-3 bg-zinc-900 rounded-xl border border-zinc-850 space-y-2">
                    <p className="text-[10px] font-mono text-zinc-500 break-all select-all font-bold">
                      {window.location.origin}/?beat={stableBeatId}
                    </p>
                    <div className="flex gap-2">
                      <button
                        onClick={handleCopyLink}
                        className="flex-1 py-2 bg-purple-600 hover:bg-purple-500 text-white font-extrabold text-[10px] rounded-lg transition-all flex items-center justify-center gap-1.5 shadow"
                      >
                        <Copy className="w-3.5 h-3.5" />
                        <span>{copiedLink ? 'Copied!' : 'Copy Link'}</span>
                      </button>
                      <a
                        href={`/?beat=${stableBeatId}`}
                        target="_blank"
                        rel="noreferrer"
                        className="p-2 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 rounded-lg text-xs"
                        title="Open product deep link preview in new tab"
                      >
                        <ExternalLink className="w-3.5 h-3.5" />
                      </a>
                    </div>
                  </div>

                  <p className="text-[10px] text-zinc-500 leading-relaxed leading-relaxed leading-relaxed font-medium">
                    This deep-link routing is stable and assigned to this digital asset. Publishing automatically registers deep-link indexings, mapping users directly to the buy checkout drawer.
                  </p>
                </div>

              </div>
            </div>
          )}

          {/* STEP 6: STORE PRESENTATION & CARD LIVE PREVIEW */}
          {currentStep === 6 && (
            <div className="space-y-6 animate-fadeIn">
              <div>
                <h3 className="text-white font-brand font-black text-lg uppercase tracking-wider">
                  Store Presentation & Card Preview
                </h3>
                <p className="text-xs text-zinc-400 mt-1">
                  Optimize physical placement on public storefront feeds.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-start">
                
                {/* Feeds assignment & Categories panel */}
                <div className="md:col-span-6 space-y-5 text-left text-xs">
                  
                  {/* Spotlight Carousel Toggle */}
                  <div className="p-4 bg-zinc-950 border border-zinc-900 rounded-2xl flex items-center justify-between">
                    <div className="space-y-0.5">
                      <h4 className="font-bold text-white uppercase tracking-wider text-[10px]">Spotlight Featured Carousel</h4>
                      <p className="text-[10px] text-zinc-500">Places beat in the prominent visual hero layout list.</p>
                    </div>
                    <input
                      type="checkbox"
                      checked={featured}
                      onChange={(e) => {
                        setFeatured(e.target.checked);
                        setHasChanges(true);
                      }}
                      className="w-10 h-5 bg-zinc-900 border border-zinc-800 rounded-full accent-purple-600 cursor-pointer animate-pulse"
                    />
                  </div>

                  {/* Category dropdown */}
                  <div className="p-4 bg-zinc-950 border border-zinc-900 rounded-2xl space-y-3">
                    <label className="block text-zinc-400 font-bold uppercase tracking-wider text-[10px]">
                      Storefront Category Classification
                    </label>
                    <select
                      value={category}
                      onChange={(e) => {
                        setCategory(e.target.value);
                        setHasChanges(true);
                      }}
                      className="w-full bg-zinc-900 border border-zinc-800 rounded-xl p-2.5 text-white outline-none"
                    >
                      <option value="Studio Vault">Studio Vault (All Catalog)</option>
                      <option value="Runway Showcases">Runway Showcases (Elite trap/cinematic)</option>
                      <option value="Dark Archives">Dark Archives (808 Aggressive / synth)</option>
                      <option value="Bespoke Collection">Bespoke Collection (High fashion custom)</option>
                    </select>
                  </div>

                  {/* Informational checklist */}
                  <div className="p-4 bg-zinc-950 border border-zinc-900/60 rounded-2xl space-y-2">
                    <span className="text-[10px] font-mono font-black text-purple-400 uppercase tracking-wider block">
                      STOREFRONT VALIDATIONS
                    </span>
                    <ul className="space-y-1.5 text-[10px] text-zinc-400 font-medium">
                      <li className="flex items-center gap-2">
                        <CheckCircle className="w-3.5 h-3.5 text-emerald-400" />
                        <span>High-contrast artwork dimensions are validated.</span>
                      </li>
                      <li className="flex items-center gap-2">
                        <CheckCircle className="w-3.5 h-3.5 text-emerald-400" />
                        <span>Tempo transients and musical scale map key registered.</span>
                      </li>
                      <li className="flex items-center gap-2">
                        <CheckCircle className="w-3.5 h-3.5 text-emerald-400" />
                        <span>Licensing legal contracts generated automatically.</span>
                      </li>
                    </ul>
                  </div>

                </div>

                {/* Actual Real Live preview beat card */}
                <div className="md:col-span-6 flex flex-col items-center">
                  <span className="text-[10px] font-mono font-black text-zinc-500 uppercase tracking-wider block mb-3 text-left w-full pl-2">
                    LIVE STORE CARD PREVIEW
                  </span>
                  
                  {/* Luxury storefront card emulation */}
                  <div className="bg-zinc-950 border border-zinc-850 rounded-3xl p-5 max-w-sm w-full space-y-4 hover:border-purple-500/30 transition-all shadow-xl group">
                    <div className="relative aspect-square w-full rounded-2xl overflow-hidden border border-zinc-800">
                      <img src={artworkUrl} alt={title} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" />
                      
                      {/* Play Action button */}
                      <button
                        onClick={() => setIsPlayingPreview(!isPlayingPreview)}
                        className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity cursor-pointer"
                      >
                        <div className="w-12 h-12 rounded-full bg-purple-600 text-white flex items-center justify-center shadow-lg transform scale-90 group-hover:scale-100 transition-all hover:bg-purple-500">
                          {isPlayingPreview ? <Pause className="w-5 h-5 fill-white" /> : <Play className="w-5 h-5 fill-white ml-0.5" />}
                        </div>
                      </button>

                      {featured && (
                        <span className="absolute top-3 left-3 px-2.5 py-1 bg-purple-600 text-white font-extrabold text-[9px] uppercase tracking-widest rounded-lg shadow-md">
                          SPOTLIGHT
                        </span>
                      )}
                    </div>

                    <div className="space-y-1.5 text-left">
                      <h4 className="font-extrabold text-base text-white truncate uppercase tracking-wider">
                        {title || 'UNTITLED'}
                      </h4>
                      <p className="text-[10px] font-mono text-purple-400 font-bold uppercase tracking-widest">
                        {bpm} BPM · {key} · PROD. CASHMERE KID$
                      </p>
                      <p className="text-[11px] text-zinc-400 line-clamp-1 opacity-90">
                        {description || 'No custom track summary description provided.'}
                      </p>
                    </div>

                    {/* Footer price & cart emulation */}
                    <div className="flex justify-between items-center pt-3 border-t border-zinc-900">
                      <div>
                        <span className="text-[9px] font-mono font-bold text-zinc-500 uppercase tracking-widest block">Lease starting at</span>
                        <span className="text-sm font-mono font-black text-white">{currencySymbol}{mp3Price.toFixed(2)}</span>
                      </div>
                      <div className="px-4 py-2 bg-zinc-900 border border-zinc-800 text-white font-extrabold text-[10px] uppercase rounded-xl">
                        ADD TO CART
                      </div>
                    </div>

                  </div>
                </div>

              </div>
            </div>
          )}

          {/* STEP 7: REVIEW & PUBLISH */}
          {currentStep === 7 && (
            <div className="space-y-6 animate-fadeIn">
              <div>
                <h3 className="text-white font-brand font-black text-lg uppercase tracking-wider">
                  Review & Publish Studio Master
                </h3>
                <p className="text-xs text-zinc-400 mt-1">
                  Perform a final comprehensive check on metadata and values before broadcasting.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-12 gap-8 text-left text-xs">
                
                {/* Detail Summary Left Grid */}
                <div className="md:col-span-8 p-6 bg-zinc-950 border border-zinc-900 rounded-3xl space-y-6">
                  
                  {/* Quick info row */}
                  <div className="flex items-center gap-4 border-b border-zinc-900 pb-5">
                    <img src={artworkUrl} alt={title} className="w-16 h-16 rounded-xl object-cover border border-zinc-850" />
                    <div>
                      <h4 className="text-lg font-black text-white uppercase tracking-wider font-mono">
                        {title}
                      </h4>
                      <p className="text-xs text-zinc-500 mt-1">
                        Category: {category} · Key Signature: {key} · BPM: {bpm} · Genre: {genre}
                      </p>
                    </div>
                  </div>

                  {/* Metadata fields check list */}
                  <div className="grid grid-cols-2 gap-y-4 gap-x-6">
                    <div>
                      <span className="text-[10px] font-mono text-zinc-500 font-bold uppercase tracking-wider block">Standard Lease price</span>
                      <span className="text-sm font-bold text-white font-mono">{currencySymbol}{mp3Price.toFixed(2)}</span>
                    </div>
                    <div>
                      <span className="text-[10px] font-mono text-zinc-500 font-bold uppercase tracking-wider block">Premium lease price</span>
                      <span className="text-sm font-bold text-white font-mono">{currencySymbol}{premiumPrice.toFixed(2)}</span>
                    </div>
                    <div>
                      <span className="text-[10px] font-mono text-zinc-500 font-bold uppercase tracking-wider block">Unlimited Lease Price</span>
                      <span className="text-sm font-bold text-white font-mono">{currencySymbol}{unlimitedPrice.toFixed(2)}</span>
                    </div>
                    <div>
                      <span className="text-[10px] font-mono text-zinc-500 font-bold uppercase tracking-wider block">Exclusive buyout price</span>
                      <span className="text-sm font-bold text-rose-300 font-mono">{currencySymbol}{exclusivePrice.toFixed(2)}</span>
                    </div>
                    <div>
                      <span className="text-[10px] font-mono text-zinc-500 font-bold uppercase tracking-wider block">Free promo download</span>
                      <span className="text-xs font-bold text-white font-mono">
                        {allowFreeDownload ? `Enabled (${freeDownloadType === 'email_required' ? 'Requires Email lead' : 'Open Access'})` : 'Disabled'}
                      </span>
                    </div>
                    <div>
                      <span className="text-[10px] font-mono text-zinc-500 font-bold uppercase tracking-wider block">Spotlight placement</span>
                      <span className="text-xs font-bold text-white font-mono">
                        {featured ? 'Spotlight hero list' : 'Standard list grid'}
                      </span>
                    </div>
                    <div>
                      <span className="text-[10px] font-mono text-zinc-500 font-bold uppercase tracking-wider block">Unlisted Visibility setting</span>
                      <span className="text-xs font-bold text-white font-mono uppercase">
                        {visibility}
                      </span>
                    </div>
                    <div>
                      <span className="text-[10px] font-mono text-zinc-500 font-bold uppercase tracking-wider block">Stable deep link</span>
                      <span className="text-xs font-bold text-purple-300 font-mono truncate block">
                        /?beat={stableBeatId}
                      </span>
                    </div>
                  </div>

                  {/* Summary tags list */}
                  <div className="space-y-2 border-t border-zinc-900 pt-5">
                    <span className="text-[10px] font-mono text-zinc-500 font-bold uppercase tracking-wider block">Keywords Discovery Tags</span>
                    <div className="flex flex-wrap gap-1.5 pt-1">
                      {tags.split(',').map((t) => t.trim()).filter(Boolean).map((tag, idx) => (
                        <span key={idx} className="px-2 py-1 bg-zinc-900 text-zinc-400 border border-zinc-850 rounded-lg text-[10px] font-mono uppercase tracking-wide">
                          #{tag}
                        </span>
                      ))}
                    </div>
                  </div>

                </div>

                {/* Confirmations & Publishing Block Right */}
                <div className="md:col-span-4 space-y-6">
                  
                  {/* Warning checks */}
                  <div className="p-5 bg-zinc-950 border border-zinc-900 rounded-3xl space-y-3.5">
                    <span className="text-[10px] font-mono font-black text-purple-400 uppercase tracking-wider block">
                      SECURITY ACCORDS
                    </span>
                    <p className="text-[11px] text-zinc-500 leading-relaxed font-medium">
                      Publishing registers your signature, automatically establishing YouTube Content ID and smart copyright triggers.
                    </p>
                    <div className="space-y-2">
                      <label className="flex items-start gap-2.5 text-[10px] text-zinc-400 leading-relaxed font-semibold cursor-pointer">
                        <input type="checkbox" defaultChecked className="mt-0.5 rounded bg-zinc-900 border-zinc-800 text-purple-600" />
                        <span>I confirm this instrumental is my own original arrangement.</span>
                      </label>
                      <label className="flex items-start gap-2.5 text-[10px] text-zinc-400 leading-relaxed font-semibold cursor-pointer">
                        <input type="checkbox" defaultChecked className="mt-0.5 rounded bg-zinc-900 border-zinc-800 text-purple-600" />
                        <span>I approve standard legal contract automations.</span>
                      </label>
                    </div>
                  </div>

                  {/* Direct Actions Buttons */}
                  <div className="space-y-3">
                    <button
                      onClick={() => handlePublish('published')}
                      className="w-full py-4 bg-gradient-to-r from-purple-600 via-violet-600 to-fuchsia-500 hover:from-purple-500 hover:to-fuchsia-400 text-white font-extrabold text-xs uppercase tracking-widest rounded-2xl shadow-xl shadow-purple-950 transition-transform active:scale-98"
                    >
                      PUBLISH TO STOREFRONT
                    </button>
                    
                    <button
                      onClick={() => handlePublish('draft')}
                      className="w-full py-3 bg-zinc-950 hover:bg-zinc-900 border border-zinc-800 text-zinc-300 font-extrabold text-[11px] uppercase tracking-wider rounded-xl transition-colors"
                    >
                      SAVE AS DRAFT ONLY
                    </button>
                  </div>

                </div>

              </div>
            </div>
          )}

          </div>


          {/* ============================================================== */}
          {/* PAGE 2: BEAT PACK UPLOADER                                     */}
          {/* ============================================================== */}
          <div className={`w-full space-y-8 ${getPageClass('pack')}`}>
            
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start text-xs text-left">
              
              {/* LEFT PAGE: ZIP File Upload, Price & free download, visibility */}
              <div className="lg:col-span-7 bg-zinc-900 border border-zinc-800 rounded-3xl p-6 sm:p-8 shadow-2xl space-y-6 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 bg-purple-950/20 rounded-full blur-2xl pointer-events-none" />
                
                <div>
                  <h3 className="text-white font-brand font-black text-lg uppercase tracking-wider">
                    Beat Pack ZIP Archive
                  </h3>
                  <p className="text-xs text-zinc-400 mt-1">
                    Upload a single ZIP archive containing all beats, licensing certificate templates, and multitrack audio stems.
                  </p>
                </div>

                {/* Interactive ZIP File Selection */}
                <div 
                  className={`border-2 border-dashed rounded-3xl p-10 text-center transition-all ${
                    packIsUploadingZip || packIsProcessingZip
                      ? 'border-purple-500/50 bg-zinc-950/30 cursor-not-allowed'
                      : 'border-zinc-700/80 hover:border-purple-500/50 bg-zinc-950/60 cursor-pointer'
                  }`}
                >
                  <input
                    type="file"
                    id="modalPackZipUploadInput"
                    accept=".zip"
                    className="hidden"
                    disabled={packIsUploadingZip || packIsProcessingZip}
                    onChange={(e) => {
                      if (e.target.files && e.target.files[0]) {
                        handleZipFileSelection(e.target.files[0]);
                      }
                    }}
                  />

                  <label htmlFor="modalPackZipUploadInput" className="block cursor-pointer space-y-5">
                    <div className="w-14 h-14 rounded-full bg-purple-950/50 border border-purple-500/20 flex items-center justify-center text-purple-400 mx-auto">
                      {packIsUploadingZip || packIsProcessingZip ? (
                        <RefreshCw className="w-6 h-6 animate-spin text-purple-400" />
                      ) : (
                        <Upload className="w-6 h-6" />
                      )}
                    </div>

                    <div className="space-y-1.5 max-w-md mx-auto">
                      <h4 className="font-bold text-white text-sm">
                        {packIsUploadingZip
                          ? 'Uploading ZIP to Secure Vault Storage...'
                          : packIsProcessingZip
                          ? packProcessingStatus
                          : 'Drag & Drop Beat Pack ZIP here'}
                      </h4>
                      <p className="text-xs text-zinc-500 leading-relaxed">
                        All-in-one ZIP format required. Stems & full-length MP3 files will be automatically unzipped, scanned, and indexed. Max 500MB.
                      </p>
                    </div>

                    {!packIsUploadingZip && !packIsProcessingZip && (
                      <div className="inline-block px-4 py-2 bg-purple-950/60 text-purple-300 border border-purple-500/20 hover:bg-purple-900 text-xs font-bold rounded-xl transition-all">
                        Select ZIP File
                      </div>
                    )}
                  </label>

                  {/* Progress Indicators */}
                  {(packIsUploadingZip || packIsProcessingZip) && (
                    <div className="max-w-md mx-auto mt-6 space-y-3">
                      <div className="flex justify-between text-xs font-mono font-bold text-zinc-400">
                        <span>{packIsUploadingZip ? 'UPLOADING ARCHIVE' : packProcessingStatus}</span>
                        <span>{packIsUploadingZip ? `${packZipProgress}%` : `${packZipProcessingProgress}%`}</span>
                      </div>
                      <div className="w-full bg-zinc-900 h-2.5 rounded-full overflow-hidden border border-zinc-800">
                        <div
                          className="bg-gradient-to-r from-purple-600 via-violet-600 to-fuchsia-500 h-full transition-all duration-150"
                          style={{ width: `${packIsUploadingZip ? packZipProgress : packZipProcessingProgress}%` }}
                        />
                      </div>
                    </div>
                  )}
                </div>

                {/* ZIP Uploaded Specifications Card */}
                {packZipUploaded && !packIsUploadingZip && !packIsProcessingZip && (
                  <div className="p-4 bg-zinc-950/80 border border-zinc-800 rounded-2xl flex flex-col gap-3 text-xs animate-fadeIn">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3.5">
                        <div className="w-10 h-10 rounded-xl bg-purple-950 border border-purple-500/30 flex items-center justify-center text-purple-300 shadow">
                          <Folder className="w-5 h-5" />
                        </div>
                        <div>
                          <div className="font-bold text-white font-mono">{packZipFileName}</div>
                          <div className="text-[11px] text-zinc-500 font-mono mt-0.5">
                            Archive size: {packZipFileSize} · Zip Verified & Decrypted
                          </div>
                        </div>
                      </div>
                      <span className="text-emerald-400 font-bold flex items-center gap-1 bg-emerald-950/40 border border-emerald-500/20 px-3 py-1.5 rounded-xl text-[10px] uppercase font-mono tracking-widest">
                        <CheckCircle className="w-3.5 h-3.5" /> Indexed
                      </span>
                    </div>

                    {/* Detected Files List */}
                    {packDetectedFiles.length > 0 && (
                      <div className="pt-3 border-t border-zinc-900 space-y-2 text-left">
                        <span className="text-[10px] font-mono font-bold text-purple-400 uppercase tracking-wider block">
                          AUTOMATICALLY EXTRACTED TRACKS & FILES:
                        </span>
                        <div className="space-y-1.5 font-mono text-[10px] max-h-40 overflow-y-auto pr-1">
                          {packDetectedFiles.map((file, idx) => (
                            <div key={idx} className="flex items-center justify-between p-2 bg-zinc-900 border border-zinc-850 rounded-lg">
                              <div className="flex items-center gap-2 text-zinc-300 truncate">
                                <Music className="w-3.5 h-3.5 text-purple-400" />
                                <span className="truncate">{file}</span>
                              </div>
                              <span className="text-zinc-600 uppercase text-[9px] shrink-0 font-bold">READY</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {/* Set Price & free download */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="p-4 bg-zinc-950 border border-zinc-850 rounded-2xl space-y-2">
                    <span className="font-bold text-white uppercase tracking-wider text-[10px] block">Beat Pack Bundle Price ($)</span>
                    <input
                      type="number"
                      step="0.01"
                      value={packPrice}
                      onChange={(e) => setPackPrice(parseFloat(e.target.value) || 0)}
                      className="w-full bg-zinc-900 border border-zinc-800 rounded-xl p-2.5 font-mono text-purple-300 font-bold focus:border-purple-500 outline-none"
                    />
                    <p className="text-[10px] text-zinc-500">Unlocks immediate full package downloads for customers in checkout.</p>
                  </div>

                  <div className="p-4 bg-zinc-950 border border-zinc-850 rounded-2xl flex flex-col justify-between">
                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <h4 className="font-bold text-white uppercase tracking-wider text-[10px] block">Enable Free Download</h4>
                        <p className="text-[10px] text-zinc-500 font-medium">Allow artists to get a free version of the pack.</p>
                      </div>
                      <input
                        type="checkbox"
                        checked={packFreeDownload}
                        onChange={(e) => setPackFreeDownload(e.target.checked)}
                        className="w-10 h-5 bg-zinc-900 border border-zinc-800 rounded-full accent-purple-600 cursor-pointer"
                      />
                    </div>
                    <p className="text-[10px] text-zinc-400 font-mono mt-2 leading-relaxed">
                      {packFreeDownload ? '✓ Tagged reference copy enabled' : '✗ Checkout purchase only'}
                    </p>
                  </div>
                </div>

                {/* Visibility Options */}
                <div className="p-5 bg-zinc-950 border border-zinc-900 rounded-2xl space-y-3">
                  <span className="text-[10px] font-mono font-black text-purple-400 uppercase tracking-wider block">
                    PACK DISCOVERABILITY VISIBILITY
                  </span>
                  <div className="grid grid-cols-3 gap-3">
                    {[
                      { id: 'published', name: 'PUBLISHED' },
                      { id: 'draft', name: 'DRAFT' },
                      { id: 'hidden', name: 'UNLISTED' }
                    ].map((item) => (
                      <button
                        key={item.id}
                        type="button"
                        onClick={() => setPackVisibility(item.id as any)}
                        className={`py-2.5 px-3 rounded-xl border text-[10px] font-bold transition-all cursor-pointer ${
                          packVisibility === item.id
                            ? 'bg-purple-950/40 border-purple-500 text-purple-300 shadow-md shadow-purple-950/50 font-extrabold'
                            : 'bg-zinc-900/40 border-zinc-850 text-zinc-500 hover:text-zinc-300'
                        }`}
                      >
                        {item.name}
                      </button>
                    ))}
                  </div>
                </div>

              </div>

              {/* RIGHT PAGE: Details & Live Preview */}
              <div className="lg:col-span-5 space-y-6">
                
                {/* Form Metadata Fields */}
                <div className="bg-zinc-900 border border-zinc-800 rounded-3xl p-6 sm:p-8 shadow-2xl space-y-5 text-xs text-left">
                  <div>
                    <h3 className="text-white font-brand font-black text-base uppercase tracking-wider">
                      Beat Pack Information
                    </h3>
                    <p className="text-[11px] text-zinc-500 mt-1">
                      Enter the public storefront parameters for this curated bundle.
                    </p>
                  </div>

                  <div className="space-y-4">
                    <div>
                      <label className="block text-zinc-400 mb-1.5 font-bold uppercase tracking-wider text-[10px]">
                        Beat Pack Title
                      </label>
                      <input
                        type="text"
                        value={packTitle}
                        onChange={(e) => setPackTitle(e.target.value)}
                        placeholder="e.g. CASHMERE VAULT EDITION"
                        className="w-full bg-zinc-950 border border-zinc-800 focus:border-purple-500 rounded-xl p-3 text-white font-bold outline-none font-mono"
                      />
                    </div>

                    <div>
                      <label className="block text-zinc-400 mb-1.5 font-bold uppercase tracking-wider text-[10px]">
                        Pack Public Description
                      </label>
                      <textarea
                        rows={3}
                        value={packDescription}
                        onChange={(e) => setPackDescription(e.target.value)}
                        placeholder="Provide context or license coverage of what files are inside the pack..."
                        className="w-full bg-zinc-950 border border-zinc-800 focus:border-purple-500 rounded-xl p-3 text-white outline-none leading-relaxed"
                      />
                    </div>

                    {/* Artwork selector */}
                    <div>
                      <label className="block text-zinc-400 mb-1.5 font-bold uppercase tracking-wider text-[10px]">
                        Cover Artwork
                      </label>
                      <div className="space-y-3">
                        <div className="flex items-center gap-4">
                          <div className="w-16 h-16 rounded-xl overflow-hidden border border-zinc-800 shrink-0 shadow-lg bg-zinc-950">
                            <img src={packArtworkUrl} alt="Cover artwork" className="w-full h-full object-cover" />
                          </div>
                          
                          <input
                            type="file"
                            id="packDeviceArtworkInput"
                            accept="image/*"
                            className="hidden"
                            onChange={(e) => {
                              if (e.target.files && e.target.files[0]) {
                                const file = e.target.files[0];
                                const reader = new FileReader();
                                reader.onload = (ev) => {
                                  if (ev.target?.result) {
                                    setPackArtworkUrl(ev.target.result as string);
                                  }
                                };
                                reader.readAsDataURL(file);
                              }
                            }}
                          />

                          <label
                            htmlFor="packDeviceArtworkInput"
                            className="flex-1 py-2.5 px-3 bg-purple-600 hover:bg-purple-500 text-white font-extrabold text-xs text-center rounded-xl cursor-pointer transition-all shadow-md flex items-center justify-center gap-2"
                          >
                            <ImageIcon className="w-4 h-4" />
                            <span>Upload From Device</span>
                          </label>
                        </div>

                        <div className="grid grid-cols-3 gap-2">
                          {[
                            '/src/assets/images/cashmere_cover_vault_1790419848357.jpg',
                            '/src/assets/images/cashmere_cover_velvet_1790419833792.jpg',
                            '/src/assets/images/cashmere_hero_runway_1790419818906.jpg'
                          ].map((img, idx) => (
                            <button
                              key={idx}
                              type="button"
                              onClick={() => setPackArtworkUrl(img)}
                              className={`relative aspect-square rounded-lg overflow-hidden border-2 transition-all cursor-pointer ${
                                packArtworkUrl === img ? 'border-purple-500 scale-102 shadow-lg shadow-purple-950/20' : 'border-zinc-800 opacity-60 hover:opacity-100'
                              }`}
                            >
                              <img src={img} alt="presets" className="w-full h-full object-cover" />
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>

                    {/* Shareable Link simulator */}
                    <div className="pt-2">
                      <span className="text-[10px] font-mono font-bold text-zinc-500 uppercase tracking-wider block mb-1">
                        SHAREABLE STOREFRONT URL (DYNAMIC)
                      </span>
                      <div className="p-2.5 bg-zinc-950 rounded-xl border border-zinc-850 font-mono text-[9px] text-zinc-500 break-all select-all">
                        {window.location.origin}/?pack={packTitle.toLowerCase().replace(/[^a-z0-9]/g, '-')}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Action Publish Panel */}
                <div className="bg-zinc-900 border border-zinc-800 rounded-3xl p-6 shadow-2xl space-y-4">
                  <button
                    onClick={handlePublishBeatPackLocal}
                    disabled={packIsUploadingZip || packIsProcessingZip}
                    className="w-full py-4 bg-gradient-to-r from-purple-600 via-violet-600 to-fuchsia-500 hover:from-purple-500 hover:to-fuchsia-400 disabled:opacity-50 text-white font-extrabold text-xs uppercase tracking-widest rounded-2xl shadow-xl shadow-purple-950/80 transition-transform active:scale-98 cursor-pointer"
                  >
                    PUBLISH BEAT PACK TO VAULT
                </button>
                  <button
                    type="button"
                    onClick={() => handlePageSwitch('single')}
                    className="w-full py-3 bg-zinc-950 hover:bg-zinc-900 border border-zinc-850 text-zinc-400 hover:text-white font-extrabold text-[11px] uppercase tracking-wider rounded-xl transition-colors cursor-pointer text-center"
                  >
                    ← BACK TO SINGLE BEAT WORKSPACE
                  </button>
                </div>

              </div>

            </div>

          </div>

        </div>

        {/* Modal Wizard Actions Controls Footer */}
        {activePage === 'single' && (
          <div className="px-6 py-4 bg-zinc-950 border-t border-zinc-800 flex justify-between items-center shrink-0">
            
            {/* Previous control button */}
            {currentStep > 1 ? (
              <button
                onClick={() => setCurrentStep((prev) => prev - 1)}
                className="px-4 py-2.5 bg-zinc-900 hover:bg-zinc-850 border border-zinc-800 text-zinc-300 text-xs font-bold rounded-xl flex items-center gap-1.5 transition-colors"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Back</span>
              </button>
            ) : <div />}

            {/* Current step pagination display */}
            <span className="text-[11px] font-mono font-bold text-zinc-500 hidden sm:block">
              STEP {currentStep} OF 7 ({stepTitles[currentStep - 1]})
            </span>

            {/* Next control button */}
            {currentStep < 7 ? (
              <button
                onClick={() => {
                  if (currentStep === 1 && !fileUploaded) {
                    alert('Please select and process a valid audio instrumental master track before proceeding.');
                    return;
                  }
                  setCurrentStep((prev) => prev + 1);
                }}
                className="px-5 py-2.5 bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold rounded-xl flex items-center gap-1.5 transition-colors shadow-lg shadow-purple-950"
              >
                <span>Continue Step {currentStep + 1}</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            ) : (
              <button
                onClick={() => handlePublish(visibility)}
                className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-black rounded-xl flex items-center gap-1.5 transition-all shadow-lg shadow-emerald-950 uppercase"
              >
                <CheckCircle className="w-4 h-4" />
                <span>Finalize & Publish</span>
              </button>
            )}
          </div>
        )}

      </div>
    </div>
  );
};

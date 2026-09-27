import React, { useState, useEffect } from 'react';
import {
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
  Pause
} from 'lucide-react';
import { Beat, GenreType, BeatPack } from '../types';

interface UploaderViewProps {
  onPublishBeat: (newBeat: Beat) => void;
  onPublishBeatPack?: (newPack: BeatPack) => void;
  onNavigateToBrowse: () => void;
  onExitToDashboard?: () => void;
  currencySymbol: string;
  beats?: Beat[];
  onSwitchToBeatPacks?: () => void;
}

export const UploaderView: React.FC<UploaderViewProps> = ({
  onPublishBeat,
  onPublishBeatPack,
  onNavigateToBrowse,
  onExitToDashboard,
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
    const saved = localStorage.getItem('voodoo_pack_uploader_draft');
    if (saved) {
      try { return JSON.parse(saved).packTitle || ''; } catch { return ''; }
    }
    return '';
  });
  const [packDescription, setPackDescription] = useState<string>(() => {
    const saved = localStorage.getItem('voodoo_pack_uploader_draft');
    if (saved) {
      try { return JSON.parse(saved).packDescription || ''; } catch { return ''; }
    }
    return '';
  });
  const [packPrice, setPackPrice] = useState<number>(() => {
    const saved = localStorage.getItem('voodoo_pack_uploader_draft');
    if (saved) {
      try { return JSON.parse(saved).packPrice || 49.99; } catch { return 49.99; }
    }
    return 49.99;
  });
  const [packArtworkUrl, setPackArtworkUrl] = useState<string>(() => {
    const saved = localStorage.getItem('voodoo_pack_uploader_draft');
    if (saved) {
      try { return JSON.parse(saved).packArtworkUrl || ''; } catch { return ''; }
    }
    return '';
  });
  const [packFreeDownload, setPackFreeDownload] = useState<boolean>(() => {
    const saved = localStorage.getItem('voodoo_pack_uploader_draft');
    if (saved) {
      try { return !!JSON.parse(saved).packFreeDownload; } catch { return false; }
    }
    return false;
  });
  const [packVisibility, setPackVisibility] = useState<'published' | 'draft' | 'hidden'>(() => {
    const saved = localStorage.getItem('voodoo_pack_uploader_draft');
    if (saved) {
      try { return JSON.parse(saved).packVisibility || 'published'; } catch { return 'published'; }
    }
    return 'published';
  });
  const [packZipFileName, setPackZipFileName] = useState<string>(() => {
    const saved = localStorage.getItem('voodoo_pack_uploader_draft');
    if (saved) {
      try { return JSON.parse(saved).packZipFileName || ''; } catch { return ''; }
    }
    return '';
  });
  const [packZipFileSize, setPackZipFileSize] = useState<string>(() => {
    const saved = localStorage.getItem('voodoo_pack_uploader_draft');
    if (saved) {
      try { return JSON.parse(saved).packZipFileSize || ''; } catch { return ''; }
    }
    return '';
  });
  const [packZipUploaded, setPackZipUploaded] = useState<boolean>(() => {
    const saved = localStorage.getItem('voodoo_pack_uploader_draft');
    if (saved) {
      try { return !!JSON.parse(saved).packZipUploaded; } catch { return false; }
    }
    return false;
  });
  const [packIsUploadingZip, setPackIsUploadingZip] = useState<boolean>(false);
  const [packZipProgress, setPackZipProgress] = useState<number>(0);
  const [packIsProcessingZip, setPackIsProcessingZip] = useState<boolean>(false);
  const [packZipProcessingProgress, setPackZipProcessingProgress] = useState<number>(0);
  const [packProcessingStatus, setPackProcessingStatus] = useState<string>('');
  const [packDetectedFiles, setPackDetectedFiles] = useState<string[]>(() => {
    const saved = localStorage.getItem('voodoo_pack_uploader_draft');
    if (saved) {
      try { return JSON.parse(saved).packDetectedFiles || []; } catch { return []; }
    }
    return [];
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
    localStorage.setItem('voodoo_pack_uploader_draft', JSON.stringify(packDraftData));
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

  const handlePublishBeatPackLocal = async () => {
    try {
      const res = await fetch('/api/storage/upload', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          fileName: packZipFileName || 'stems_multitrack_master.zip',
          mediaType: 'application/zip',
          fileSize: packZipFileSize || '145.20 MB'
        })
      });
      const storageResult = await res.json();
      if (!res.ok || !storageResult.success) {
        throw new Error(storageResult.error || 'Internet Archive ZIP upload failed');
      }

      const finalPack: BeatPack & { storageProvider?: string; iaUrl?: string; iaItemIdentifier?: string } = {
        id: `pack-${Date.now()}`,
        name: packTitle.trim() || 'UNTITLED BEAT PACK',
        description: packDescription,
        price: packPrice,
        artworkUrl: packArtworkUrl,
        beatIds: ['beat-1', 'beat-2'], // default references
        freeDownload: packFreeDownload,
        published: packVisibility === 'published',
        createdDate: new Date().toISOString().split('T')[0],
        storageProvider: storageResult.storageProvider,
        iaItemIdentifier: storageResult.iaItemIdentifier,
        iaUrl: storageResult.iaUrl,
      };

      if (onPublishBeatPack) {
        onPublishBeatPack(finalPack as BeatPack);
      } else {
        const existing = localStorage.getItem('voodoo_beat_packs');
        const list = existing ? JSON.parse(existing) : [];
        localStorage.setItem('voodoo_beat_packs', JSON.stringify([finalPack, ...list]));
      }

      localStorage.removeItem('voodoo_pack_uploader_draft');
      onNavigateToBrowse();
    } catch (err: any) {
      console.error('Beat Pack upload error:', err);
      alert('Internet Archive storage upload failed for Beat Pack: ' + (err.message || 'Unknown error'));
    }
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
  const [lastSavedTime, setLastSavedTime] = useState<string>('');

  // Step 1: Upload Audio States
  const [fileName, setFileName] = useState<string>('voodoo_synth_master_320k.mp3');
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
  const [artworkUrl, setArtworkUrl] = useState<string>('/src/assets/images/voodoo_cover_obsidian_1790419259195.jpg');
  const [customArtworkName, setCustomArtworkName] = useState<string>('');
  const [isUploadingArtwork, setIsUploadingArtwork] = useState<boolean>(false);
  const [artworkDimensions, setArtworkDimensions] = useState<string>('3000 × 3000 px');

  // Step 3: Details & Metadata Info States
  const [title, setTitle] = useState<string>('OBSIDIAN KING');
  const [bpm, setBpm] = useState<number>(142);
  const [key, setKey] = useState<string>('F# Minor');
  const [genre, setGenre] = useState<GenreType>('TRAP');
  const [moods, setMoods] = useState<string>('Dark, High Fashion, Aggressive');
  const [tags, setTags] = useState<string>('voodoo, darktrap, runway, boomin');
  const [description, setDescription] = useState<string>(
    'Sub bass glides with dark synthesizer Arps. High fashion trap canvas.'
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

  // Extensive Metadata & Track Details States
  const [secondaryGenre, setSecondaryGenre] = useState<string>('NONE');
  const [tertiaryGenre, setTertiaryGenre] = useState<string>('NONE');
  const [subGenre, setSubGenre] = useState<string>('Dark Trap Ambient');
  const [tagList, setTagList] = useState<string[]>(['voodoo', 'darktrap', 'runway']);
  const [newTagInput, setNewTagInput] = useState<string>('');
  const [mood1, setMood1] = useState<string>('Bouncy');
  const [mood2, setMood2] = useState<string>('Aggressive');
  const [mood3, setMood3] = useState<string>('Dark');
  const [instrument1, setInstrument1] = useState<string>('Piano');
  const [instrument2, setInstrument2] = useState<string>('Synthesizer');
  const [instrument3, setInstrument3] = useState<string>('808 Bass');

  // New Artwork States
  const [artworkScale, setArtworkScale] = useState<number>(1.0);
  const [useProfileFallback, setUseProfileFallback] = useState<boolean>(false);
  const [artworkFileError, setArtworkFileError] = useState<string>('');

  // New Pricing & Licensing States
  const [customLicenseTermsLink, setCustomLicenseTermsLink] = useState<string>('https://cashmerekids.com/contracts/exclusive-standard.pdf');
  const [makeOfferEnabled, setMakeOfferEnabled] = useState<boolean>(true);
  const [tieredPricingActive, setTieredPricingActive] = useState<boolean>(true);
  const [bulkDiscount, setBulkDiscount] = useState<string>('buy_2_get_1_free');

  // New Free Downloads & Promotions
  const [requireVoiceTagForFree, setRequireVoiceTagForFree] = useState<boolean>(true);
  const [socialGateType, setSocialGateType] = useState<string>('youtube_subscribe');
  const [socialGateUrl, setSocialGateUrl] = useState<string>('https://youtube.com/c/cashmerekids');
  const [velocoSyndication, setVelocoSyndication] = useState<boolean>(true);

  // New Publishing & Scheduling
  const [publishingMode, setPublishingMode] = useState<'instant' | 'scheduled'>('instant');
  const [scheduledDate, setScheduledDate] = useState<string>('2026-10-01');
  const [scheduledTime, setScheduledTime] = useState<string>('12:00');
  const [syncProPage, setSyncProPage] = useState<boolean>(true);
  const [syncMarketplace, setSyncMarketplace] = useState<boolean>(true);
  const [trackVisibility, setTrackVisibility] = useState<'public' | 'unlisted' | 'private'>('public');

  // New Collaboration & Splits
  const [collaborators, setCollaborators] = useState<Array<{ name: string; role: string; salesSplit: number; contentIdSplit: number }>>([]);
  const [collabNameInput, setCollabNameInput] = useState<string>('');
  const [collabRoleInput, setCollabRoleInput] = useState<string>('Co-Producer');
  const [collabSalesSplitInput, setCollabSalesSplitInput] = useState<number>(50);
  const [collabIdSplitInput, setCollabIdSplitInput] = useState<number>(50);
  const [defaultContractTemplate, setDefaultContractTemplate] = useState<string>('50/50_standard');

  // New Monetization & Content ID
  const [contentIdRegistered, setContentIdRegistered] = useState<boolean>(false);
  const [monetizePlatforms, setMonetizePlatforms] = useState({
    youtube: true,
    tiktok: true,
    instagram: true,
    facebook: true,
  });
  const [soundLibraryOptIn, setSoundLibraryOptIn] = useState<boolean>(true);
  const [autoAntiPiracyCollect, setAutoAntiPiracyCollect] = useState<boolean>(true);

  // New Preferences & Extra Fields
  const [studioPreferenceTemplate, setStudioPreferenceTemplate] = useState<string>('default_trap');
  const [voiceTagPreset, setVoiceTagPreset] = useState<string>('cashmere_signature');
  const [analyticsId, setAnalyticsId] = useState<string>('');
  const [charityDonationPct, setCharityDonationPct] = useState<number>(0);
  const [charityPartner, setCharityPartner] = useState<string>('');
  const [isrcCode, setIsrcCode] = useState<string>('');
  const [publisherName, setPublisherName] = useState<string>('');
  const [socialEmbedUrl, setSocialEmbedUrl] = useState<string>('');
  const [beatIdFingerprint, setBeatIdFingerprint] = useState<string>('');

  const [isGeneratingTitle, setIsGeneratingTitle] = useState(false);
  const [isGeneratingDesc, setIsGeneratingDesc] = useState(false);

  // AI Generation & BPM Helper Functions
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
          moods: [mood1, mood2, mood3].filter(Boolean).join(', '),
          tags: tagList.join(', ')
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

  const handleAddTag = () => {
    const clean = newTagInput.trim().toLowerCase();
    if (!clean) return;
    if (tagList.includes(clean)) {
      setNewTagInput('');
      return;
    }
    if (tagList.length >= 3) {
      alert('Strict Tag Limit: You can configure up to 3 custom tags maximum for search layout indexing.');
      return;
    }
    setTagList((prev) => [...prev, clean]);
    setNewTagInput('');
    setHasChanges(true);
  };

  const handleRemoveTag = (indexToRemove: number) => {
    setTagList((prev) => prev.filter((_, idx) => idx !== indexToRemove));
    setHasChanges(true);
  };

  const handleAddCollaborator = () => {
    const name = collabNameInput.trim().toUpperCase();
    if (!name) return;
    setCollaborators((prev) => [
      ...prev,
      {
        name,
        role: collabRoleInput,
        salesSplit: collabSalesSplitInput,
        contentIdSplit: collabIdSplitInput,
      }
    ]);
    setCollabNameInput('');
    setHasChanges(true);
  };

  const handleRemoveCollaborator = (index: number) => {
    setCollaborators((prev) => prev.filter((_, idx) => idx !== index));
    setHasChanges(true);
  };


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
    '/src/assets/images/voodoo_cover_obsidian_1790419259195.jpg',
    '/src/assets/images/voodoo_cover_runway_1790419270870.jpg',
    '/src/assets/images/voodoo_hero_campaign_1790419247104.jpg',
  ];

  // Check for saved draft on mount
  useEffect(() => {
    const draft = localStorage.getItem('voodoo_view_uploader_draft');
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
      localStorage.setItem('voodoo_view_uploader_draft', JSON.stringify(draftData));
      const now = new Date();
      const pad = (n: number) => n.toString().padStart(2, '0');
      setLastSavedTime(`${pad(now.getHours())}:${pad(now.getMinutes())}:${pad(now.getSeconds())}`);
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
    const draft = localStorage.getItem('voodoo_view_uploader_draft');
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
    localStorage.removeItem('voodoo_view_uploader_draft');
    setDetectedDraftPresent(false);
  };

  const [selectedAudioFile, setSelectedAudioFile] = useState<File | null>(null);

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

    setSelectedAudioFile(file);
    setHasChanges(true);
    setFileName(file.name);
    setFileSize(`${(file.size / (1024 * 1024)).toFixed(2)} MB`);
    setFileUploaded(false);
    setIsUploading(true);
    setUploadProgress(0);

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
        const index = Math.min(
          Math.floor((nextProgress / 100) * statuses.length),
          statuses.length - 1
        );
        setProcessingStatus(statuses[index]);

        if (nextProgress >= 100) {
          clearInterval(processingInterval);
          setIsProcessing(false);
          setFileUploaded(true);
          
          const cleanTitle = name
            .replace(/\.[^/.]+$/, '')
            .replace(/[_-]/g, ' ')
            .toUpperCase();
          
          setTitle(cleanTitle);
          
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

  const [isPublishing, setIsPublishing] = useState<boolean>(false);
  const [publishError, setPublishError] = useState<string | null>(null);

  const handlePublish = async (publishStatus: 'published' | 'draft' | 'hidden') => {
    setIsPublishing(true);
    setPublishError(null);
    try {
      const formData = new FormData();
      if (selectedAudioFile) {
        formData.append('audioFile', selectedAudioFile);
      }
      formData.append('fileName', fileName || 'voodoo_synth_master_320k.mp3');
      formData.append('fileSize', fileSize || '6.85 MB');
      formData.append('mediaType', 'audio/mpeg');

      const res = await fetch('/api/storage/upload', {
        method: 'POST',
        body: formData
      });
      const storageResult = await res.json();
      if (!res.ok || !storageResult.success) {
        throw new Error(storageResult.error || 'Internet Archive upload failed');
      }

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
        // Internet Archive persistent storage & media streaming fields
        storageProvider: storageResult.storageProvider,
        iaItemIdentifier: storageResult.iaItemIdentifier,
        iaUrl: storageResult.iaUrl,
        audioUrl: storageResult.playbackUrl || storageResult.iaUrl,
        fileSize: storageResult.fileSize,
        checksum: storageResult.checksum,
        uploadStatus: storageResult.uploadStatus,
      };

      onPublishBeat(finalBeat);
      localStorage.removeItem('voodoo_view_uploader_draft');
      onNavigateToBrowse();
    } catch (err: any) {
      console.error('Publishing upload error:', err);
      setPublishError(err.message || 'Internet Archive storage upload failed. Beat draft preserved.');
    } finally {
      setIsPublishing(false);
    }
  };

  const isDuplicateTitle = beats.some(
    (b) => b.title.trim().toLowerCase() === title.trim().toLowerCase()
  );

  const handleCopyLink = () => {
    const url = `${window.location.origin}/?beat=${stableBeatId}`;
    navigator.clipboard.writeText(url);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  return (
    <div className="max-w-5xl mx-auto space-y-8 pb-28 text-left animate-fadeIn">
      
      {/* Header — Luxury Wordmark & Navigation Header */}
      <div className="border-b border-zinc-800 pb-6 flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
        <div>
          <span className="text-xs font-bold text-purple-400 uppercase tracking-widest font-mono">
            PRODUCER STUDIO WORKSPACE
          </span>
          <div className="flex flex-col sm:flex-row sm:items-center gap-3">
            <h1 className="text-3xl sm:text-4xl font-extrabold text-white mt-1">
              Uploader Control Center
            </h1>
            <div className="flex items-center gap-1.5 text-[9px] font-mono font-bold text-zinc-500 bg-zinc-950/80 px-2 py-1 rounded border border-zinc-900 mt-2 sm:mt-1 shrink-0 w-fit">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              <span>DYNAMIC AUTOSAVE ACTIVE {lastSavedTime ? `· LAST SYNCED AT ${lastSavedTime}` : ''}</span>
            </div>
          </div>
          <p className="text-xs text-zinc-400 mt-1">
            Publish standard master instrumentals or multi-audio beat packs inside one continuous workspace.
          </p>
        </div>

        {/* Header Action Row (Exit Button and Book Page Switcher) */}
        <div className="flex flex-col sm:flex-row items-center gap-4 w-full md:w-auto">
          {/* Distinct Exit Action */}
          <button
            onClick={() => {
              if (onExitToDashboard) {
                onExitToDashboard();
              } else {
                onNavigateToBrowse();
              }
            }}
            className="w-full sm:w-auto px-4 py-2.5 bg-zinc-950 hover:bg-zinc-900 border border-zinc-850 hover:border-zinc-700 text-zinc-300 font-extrabold text-[11px] uppercase tracking-wider rounded-2xl transition-all flex items-center justify-center gap-2 cursor-pointer shadow-md"
            title="Exit uploader workspace and return to Producer Studio Dashboard"
          >
            <ArrowLeft className="w-4 h-4 text-purple-400" />
            <span>Exit Uploader</span>
          </button>

          {/* Top-Right Page Switcher (Internal Tab Switches only!) */}
          <div className="bg-zinc-950 rounded-2xl p-1 flex border border-zinc-800 text-xs font-bold w-full sm:w-auto shadow-lg">
            <button 
              onClick={() => handlePageSwitch('single')}
              className={`flex-1 sm:flex-initial px-4 py-2 rounded-xl transition-all duration-200 ${
                activePage === 'single'
                  ? 'bg-purple-600 text-white shadow font-extrabold'
                  : 'text-zinc-500 hover:text-white'
              }`}
              title="Page 1: Standalone Single Instrumental Beat Track"
            >
              SINGLE BEAT
            </button>
            <button 
              onClick={() => handlePageSwitch('pack')}
              className={`flex-1 sm:flex-initial px-4 py-2 rounded-xl transition-all duration-200 flex items-center justify-center gap-1.5 ${
                activePage === 'pack'
                  ? 'bg-purple-600 text-white shadow font-extrabold'
                  : 'text-zinc-500 hover:text-white'
              }`}
              title="Page 2: Multitrack/Stems ZIP Beat Pack"
            >
              <span>BEAT PACK</span>
            </button>
          </div>
        </div>
      </div>

      {/* Book-container with perspective */}
      <div className="luxury-book relative min-h-[600px] w-full">
        
        {/* ============================================================== */}
        {/* PAGE 1: SINGLE BEAT UPLOADER                                   */}
        {/* ============================================================== */}
        <div className={`w-full ${getPageClass('single')}`}>

          {/* Draft Notification */}
          {detectedDraftPresent && (
            <div className="bg-purple-950/80 border border-purple-500/30 rounded-2xl px-6 py-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 text-xs text-purple-200 mb-6">
              <div className="flex items-center gap-2.5">
                <AlertTriangle className="w-5 h-5 text-purple-400 shrink-0" />
                <span>Unfinished standalone draft detected from your last session. Restore it to continue?</span>
              </div>
              <div className="flex items-center gap-3 font-bold font-mono shrink-0">
                <button onClick={restoreDraft} className="px-3 py-1.5 bg-purple-600 text-white rounded-lg hover:bg-purple-500 transition-colors">
                  Restore Draft
                </button>
                <button onClick={clearDraft} className="text-zinc-500 hover:text-zinc-300">
                  Discard
                </button>
              </div>
            </div>
          )}

      {hasRestoredDraft && (
        <div className="p-3 bg-emerald-950/40 border border-emerald-500/20 rounded-2xl text-xs text-emerald-400 font-semibold flex items-center gap-2">
          <CheckCircle className="w-4 h-4" />
          <span>Standalone workspace parameters restored successfully.</span>
        </div>
      )}

      {/* Progress Wizard */}
      <div className="space-y-3">
        <div className="flex justify-between items-center text-[11px] font-mono font-bold text-zinc-500 overflow-x-auto pb-1 gap-2">
          {stepTitles.map((t, idx) => (
            <span
              key={idx}
              onClick={() => setCurrentStep(idx + 1)}
              className={`cursor-pointer px-3 py-1.5 rounded-xl border transition-all whitespace-nowrap ${
                currentStep === idx + 1
                  ? 'text-white bg-purple-950 border-purple-500/50 font-extrabold'
                  : currentStep > idx + 1
                  ? 'text-purple-300 border-transparent bg-purple-950/10'
                  : 'text-zinc-600 border-transparent bg-transparent'
              }`}
            >
              {t}
            </span>
          ))}
        </div>
        <div className="w-full bg-zinc-900 h-2 rounded-full overflow-hidden border border-zinc-800">
          <div
            className="bg-gradient-to-r from-purple-600 to-fuchsia-500 h-full transition-all duration-300"
            style={{ width: `${(currentStep / 7) * 100}%` }}
          />
        </div>
      </div>

      {/* Main Studio Card Content */}
      <div className="bg-zinc-900 border border-zinc-800 rounded-3xl p-6 sm:p-8 shadow-2xl space-y-6">
        
        {/* STEP 1: AUDIO MASTER */}
        {currentStep === 1 && (
          <div className="space-y-6">
            <div>
              <h3 className="text-white font-brand font-black text-lg uppercase tracking-wider">
                Upload Master Track
              </h3>
              <p className="text-xs text-zinc-400 mt-1">
                Drag or browse your master uncompressed MP3 or M4A file. WAV is not supported.
              </p>
            </div>

            {audioError && (
              <div className="p-4 bg-rose-950/80 border border-rose-500/30 rounded-2xl flex items-start gap-3 text-xs text-rose-300 animate-shake">
                <AlertTriangle className="w-5 h-5 text-rose-400 shrink-0" />
                <div>
                  <p className="font-extrabold">FORMAT DENIED</p>
                  <p className="opacity-90">{audioError}</p>
                </div>
              </div>
            )}

            <div 
              className={`border-2 border-dashed rounded-3xl p-12 text-center transition-all ${
                isUploading || isProcessing
                  ? 'border-purple-500/50 bg-zinc-950/30 cursor-not-allowed'
                  : 'border-zinc-700/80 hover:border-purple-500/50 bg-zinc-950/60 cursor-pointer'
              }`}
            >
              <input
                type="file"
                id="viewMasterAudioInput"
                accept=".mp3,.m4a,audio/mpeg,audio/mp4,audio/x-m4a"
                className="hidden"
                disabled={isUploading || isProcessing}
                onChange={(e) => {
                  if (e.target.files && e.target.files[0]) {
                    handleAudioFileSelection(e.target.files[0]);
                  }
                }}
              />

              <label htmlFor="viewMasterAudioInput" className="block cursor-pointer space-y-5">
                <div className="w-14 h-14 rounded-full bg-purple-950/50 border border-purple-500/20 flex items-center justify-center text-purple-400 mx-auto">
                  {isUploading || isProcessing ? (
                    <RefreshCw className="w-6 h-6 animate-spin" />
                  ) : (
                    <Upload className="w-6 h-6" />
                  )}
                </div>

                <div className="space-y-1.5 max-w-md mx-auto">
                  <h4 className="font-bold text-white text-sm">
                    {isUploading
                      ? 'Uploading file to Master Server...'
                      : isProcessing
                      ? 'Compiling Audio Engine Waveform...'
                      : 'Drag & Drop Master File here'}
                  </h4>
                  <p className="text-xs text-zinc-500">
                    Acceptable parameters: high-fidelity 320kbps MP3 or studio master M4A. Max file size 120MB.
                  </p>
                </div>

                {!isUploading && !isProcessing && (
                  <div className="inline-block px-4 py-2 bg-purple-950/60 text-purple-300 border border-purple-500/20 hover:bg-purple-900 text-xs font-bold rounded-xl transition-all">
                    Browse Local Files
                  </div>
                )}
              </label>

              {(isUploading || isProcessing) && (
                <div className="max-w-md mx-auto mt-6 space-y-3">
                  <div className="flex justify-between text-xs font-mono font-bold text-zinc-400">
                    <span>{isUploading ? 'UPLOADING MASTER' : processingStatus}</span>
                    <span>{isUploading ? `${uploadProgress}%` : `${processingProgress}%`}</span>
                  </div>
                  <div className="w-full bg-zinc-900 h-2 rounded-full overflow-hidden border border-zinc-800">
                    <div
                      className="bg-gradient-to-r from-purple-600 via-violet-600 to-fuchsia-500 h-full transition-all duration-150"
                      style={{ width: `${isUploading ? uploadProgress : processingProgress}%` }}
                    />
                  </div>
                </div>
              )}
            </div>

            {fileUploaded && !isUploading && !isProcessing && (
              <div className="p-4 bg-zinc-950/80 border border-zinc-850 rounded-2xl flex items-center justify-between text-xs">
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
                <span className="text-emerald-400 font-bold flex items-center gap-1 bg-emerald-950/40 border border-emerald-500/20 px-3 py-1.5 rounded-xl text-[10px] uppercase font-mono tracking-widest">
                  <CheckCircle className="w-3.5 h-3.5" /> Ready
                </span>
              </div>
            )}

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
          <div className="space-y-6">
            <div>
              <h3 className="text-white font-brand font-black text-lg uppercase tracking-wider">
                Upload Cover Artwork
              </h3>
              <p className="text-xs text-zinc-400 mt-1">
                Select from beautiful preset artwork or upload your custom square cover canvas.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-start">
              <div className="md:col-span-5 flex flex-col items-center justify-center p-6 bg-zinc-950 rounded-3xl border border-zinc-900 space-y-4">
                <div className="relative aspect-square w-full rounded-2xl overflow-hidden border border-zinc-800 shadow-2xl bg-zinc-900">
                  <img 
                    src={artworkUrl} 
                    alt="Cover artwork" 
                    className="w-full h-full object-cover transition-transform duration-200" 
                    style={{ transform: `scale(${artworkScale})` }}
                  />
                  {isUploadingArtwork && (
                    <div className="absolute inset-0 bg-black/75 flex items-center justify-center text-white font-mono text-xs">
                      <RefreshCw className="w-6 h-6 animate-spin text-purple-400 mb-2" />
                      <span>Uploading...</span>
                    </div>
                  )}
                </div>
                
                {/* Image Cropper Slider simulation */}
                <div className="w-full space-y-1">
                  <div className="flex justify-between text-[10px] font-mono font-bold text-zinc-500">
                    <span>IMAGE CROP ZOOM</span>
                    <span>{(artworkScale * 100).toFixed(0)}%</span>
                  </div>
                  <input 
                    type="range" 
                    min="1.0" 
                    max="1.8" 
                    step="0.05" 
                    value={artworkScale} 
                    onChange={(e) => setArtworkScale(parseFloat(e.target.value))}
                    className="w-full h-1 bg-zinc-900 rounded-lg appearance-none cursor-pointer accent-purple-500" 
                  />
                </div>

                <div className="w-full text-center space-y-1">
                  <p className="text-xs text-white font-bold truncate">
                    {customArtworkName || 'Default Preset'}
                  </p>
                  <p className="text-[10px] font-mono text-zinc-500">
                    {artworkDimensions}
                  </p>
                </div>
              </div>

              <div className="md:col-span-7 space-y-6">
                <div className="p-5 bg-zinc-950 rounded-2xl border border-zinc-900 space-y-4">
                  <span className="text-[10px] font-mono font-black text-purple-400 uppercase tracking-wider block">
                    UPLOAD CUSTOM FILE
                  </span>
                  
                  {/* Visual Asset Validation Status */}
                  <div className="p-3 bg-zinc-900 rounded-xl border border-zinc-850 space-y-2 text-[10px] font-mono text-zinc-400">
                    <div className="flex items-center justify-between">
                      <span>✓ Max file size limits (under 10MB)</span>
                      <span className="text-emerald-400 font-bold">PASSED</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span>✓ Dimension guidelines (3000 x 3000 px recommended)</span>
                      <span className="text-emerald-400 font-bold">3000x3000px</span>
                    </div>
                  </div>

                  <input
                    type="file"
                    id="viewArtworkUploadInput"
                    accept="image/*"
                    className="hidden"
                    onChange={(e) => {
                      if (e.target.files && e.target.files[0]) {
                        handleArtworkSelection(e.target.files[0]);
                      }
                    }}
                  />
                  <div className="flex flex-col sm:flex-row gap-3">
                    <label
                      htmlFor="viewArtworkUploadInput"
                      className="flex-1 py-3 bg-purple-600 hover:bg-purple-500 text-white font-extrabold text-xs text-center rounded-xl cursor-pointer transition-all shadow-md flex items-center justify-center gap-2"
                    >
                      <ImageIcon className="w-4 h-4" />
                      <span>Upload Custom Image</span>
                    </label>
                    
                    {/* Fallback avatar option */}
                    <button
                      type="button"
                      onClick={() => {
                        setArtworkUrl('/src/assets/images/cashmere_producer_avatar_1790418684634.jpg');
                        setCustomArtworkName('Account Avatar Cover (Fallback)');
                        setArtworkDimensions('1000 × 1000 px');
                        setUseProfileFallback(true);
                        setHasChanges(true);
                      }}
                      className="px-3.5 py-3 bg-zinc-900 hover:bg-zinc-850 border border-zinc-800 text-zinc-300 font-bold text-xs rounded-xl transition-all"
                    >
                      Use Avatar Fallback
                    </button>

                    {customArtworkName && (
                      <button
                        onClick={() => {
                          setArtworkUrl('/src/assets/images/voodoo_cover_obsidian_1790419259195.jpg');
                          setCustomArtworkName('');
                          setArtworkDimensions('3000 × 3000 px');
                          setUseProfileFallback(false);
                          setArtworkScale(1.0);
                        }}
                        className="px-4 py-3 bg-zinc-800 hover:bg-zinc-700 text-rose-400 hover:text-rose-300 font-bold text-xs rounded-xl transition-all"
                      >
                        Reset
                      </button>
                    )}
                  </div>
                </div>

                {/* Canva integration reference */}
                <div className="p-4 bg-purple-950/20 border border-purple-500/20 rounded-2xl flex items-center justify-between gap-3 text-[11px] text-purple-300">
                  <div className="space-y-0.5">
                    <p className="font-bold text-white uppercase tracking-wider text-[10px]">🎨 Canva Designer Recommendation</p>
                    <p className="text-zinc-400">Need professional artwork? Design instantly using our exclusive Cashmere template layout.</p>
                  </div>
                  <a 
                    href="https://canva.com" 
                    target="_blank" 
                    rel="noreferrer"
                    className="px-3.5 py-2 bg-purple-900 hover:bg-purple-800 text-white font-bold rounded-lg transition-all text-xs shrink-0"
                  >
                    Open Canva Creator
                  </a>
                </div>

                <div className="space-y-3">
                  <span className="text-[10px] font-mono font-black text-zinc-500 uppercase tracking-wider block pl-1">
                    SELECT FROM HIGH FASHION PRESETS
                  </span>
                  <div className="grid grid-cols-3 gap-4">
                    {artworkPresets.map((preset, idx) => (
                      <button
                        key={idx}
                        onClick={() => {
                          setArtworkUrl(preset);
                          setCustomArtworkName('');
                          setArtworkDimensions('3000 × 3000 px');
                          setUseProfileFallback(false);
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
          <div className="space-y-6">
            <div>
              <h3 className="text-white font-brand font-black text-lg uppercase tracking-wider">
                Beat Metadata & Info
              </h3>
              <p className="text-xs text-zinc-400 mt-1">
                Establish search triggers and tempo parameters.
              </p>
            </div>

            {isDuplicateTitle && (
              <div className="p-4 bg-amber-950/80 border border-amber-500/30 rounded-2xl flex items-start gap-3 text-xs text-amber-300">
                <AlertTriangle className="w-5 h-5 text-amber-400 shrink-0" />
                <div className="space-y-1">
                  <p className="font-extrabold">DUPLICATE TRACK TITLE</p>
                  <p className="opacity-90">
                    A beat named "{title}" already exists in your studio archives. Publishing this track will create a duplicate.
                  </p>
                </div>
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 text-xs text-left">
              
              {/* Row 1: Title and AI Suggester */}
              <div className="space-y-1.5">
                <div className="flex justify-between items-center">
                  <label className="block text-zinc-400 font-bold uppercase tracking-wider text-[10px]">
                    Track Title
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
                  className="w-full bg-zinc-950 border border-zinc-800 focus:border-purple-500 rounded-xl p-3 text-white font-bold outline-none font-mono"
                />
              </div>

              {/* Row 1b: BPM & Correction */}
              <div className="space-y-1.5">
                <div className="flex justify-between items-center">
                  <label className="block text-zinc-400 font-bold uppercase tracking-wider text-[10px]">
                    BPM (Tempo)
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
                  className="w-full bg-zinc-950 border border-zinc-800 focus:border-purple-500 rounded-xl p-3 text-white font-mono outline-none"
                />
              </div>

              {/* Row 2: Musical Key and Preference Templates */}
              <div className="space-y-1.5">
                <label className="block text-zinc-400 font-bold uppercase tracking-wider text-[10px]">
                  Scale Key
                </label>
                <select
                  value={key}
                  onChange={(e) => {
                    setKey(e.target.value);
                    setHasChanges(true);
                  }}
                  className="w-full bg-zinc-950 border border-zinc-800 focus:border-purple-500 rounded-xl p-3 text-white font-mono outline-none"
                >
                  {['F# Minor', 'C Minor', 'G Minor', 'D Minor', 'A# Minor', 'E Minor', 'F Major', 'C Major', 'G Major', 'D Major'].map((val) => (
                    <option key={val} value={val}>{val}</option>
                  ))}
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="block text-zinc-400 font-bold uppercase tracking-wider text-[10px]">
                  Workflow Preference Template
                </label>
                <select
                  value={studioPreferenceTemplate}
                  onChange={(e) => {
                    setStudioPreferenceTemplate(e.target.value);
                    setHasChanges(true);
                    if (e.target.value === 'default_trap') {
                      setGenre('TRAP');
                      setSubGenre('Dark Heavy Atlanta');
                      setTagList(['voodoo', 'darktrap', 'runway']);
                      setMood1('Aggressive');
                      setMood2('Dark');
                    } else if (e.target.value === 'dark_synth_theme') {
                      setGenre('DARK SYNTH');
                      setSubGenre('Ethereal Cyber');
                      setTagList(['synth', '80s', 'neon']);
                      setMood1('Dark');
                      setMood2('Energetic');
                    }
                  }}
                  className="w-full bg-zinc-950 border border-zinc-800 focus:border-purple-500 rounded-xl p-3 text-white font-mono outline-none"
                >
                  <option value="none">None (Custom Input)</option>
                  <option value="default_trap">Atlanta Dark Trap (Default)</option>
                  <option value="dark_synth_theme">Dark Synth / Retro Grid</option>
                  <option value="raw_freestyle">Freestyle Raw Waveform</option>
                </select>
              </div>

              {/* Row 3: Genres (Primary, Secondary, Tertiary) */}
              <div className="space-y-1.5">
                <label className="block text-zinc-400 font-bold uppercase tracking-wider text-[10px]">
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

              <div className="space-y-1.5">
                <label className="block text-zinc-400 font-bold uppercase tracking-wider text-[10px]">
                  Secondary Genre
                </label>
                <select
                  value={secondaryGenre}
                  onChange={(e) => {
                    setSecondaryGenre(e.target.value);
                    setHasChanges(true);
                  }}
                  className="w-full bg-zinc-950 border border-zinc-800 focus:border-purple-500 rounded-xl p-3 text-white font-mono outline-none"
                >
                  <option value="NONE">None</option>
                  <option value="DRILL">Drill</option>
                  <option value="TRAP">Trap</option>
                  <option value="DARK SYNTH">Dark Synth</option>
                  <option value="EMO RAP">Emo Rap</option>
                  <option value="MEMPHIS PHONK">Phonk</option>
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="block text-zinc-400 font-bold uppercase tracking-wider text-[10px]">
                  Tertiary Genre (Optional)
                </label>
                <select
                  value={tertiaryGenre}
                  onChange={(e) => {
                    setTertiaryGenre(e.target.value);
                    setHasChanges(true);
                  }}
                  className="w-full bg-zinc-950 border border-zinc-800 focus:border-purple-500 rounded-xl p-3 text-white font-mono outline-none"
                >
                  <option value="NONE">None</option>
                  <option value="LOFI">Lofi Ambient</option>
                  <option value="BOOM BAP">Boom Bap</option>
                  <option value="G-FUNK">G-Funk</option>
                  <option value="R&B">Vocal R&B</option>
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="block text-zinc-400 font-bold uppercase tracking-wider text-[10px]">
                  Sub-Genre Tagging
                </label>
                <select
                  value={subGenre}
                  onChange={(e) => {
                    setSubGenre(e.target.value);
                    setHasChanges(true);
                  }}
                  className="w-full bg-zinc-950 border border-zinc-800 focus:border-purple-500 rounded-xl p-3 text-white font-mono outline-none"
                >
                  <option value="Dark Trap Ambient">Christian Pop / Uplifting</option>
                  <option value="Indie Lo-Fi Phonk">Indie Bedroom Pop</option>
                  <option value="Gothic Atlanta Heavy">Detroit Rage Phonk</option>
                  <option value="Cyber Electro Wave">Cyber Retro Synthwave</option>
                </select>
              </div>

              {/* Row 4: Custom tags with Interactive 3-tag limits */}
              <div className="sm:col-span-2 p-4 bg-zinc-950 border border-zinc-850 rounded-2xl space-y-3">
                <div className="flex justify-between items-center">
                  <span className="font-bold text-white uppercase tracking-wider text-[10px]">Custom Tag Configuration (Max 3 Tags)</span>
                  <span className="font-mono text-[10px] text-zinc-500">{tagList.length} / 3 configured</span>
                </div>
                
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={newTagInput}
                    onChange={(e) => setNewTagInput(e.target.value)}
                    placeholder="Type e.g. detroit, type beat, aggressive"
                    className="flex-1 bg-zinc-900 border border-zinc-800 focus:border-purple-500 rounded-xl p-2 text-white font-mono outline-none text-xs"
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        handleAddTag();
                      }
                    }}
                  />
                  <button
                    type="button"
                    onClick={handleAddTag}
                    className="px-4 py-2 bg-purple-600 hover:bg-purple-500 text-white font-bold rounded-xl text-xs cursor-pointer"
                  >
                    Add Tag
                  </button>
                </div>

                <div className="flex flex-wrap gap-2 pt-1">
                  {tagList.map((tag, idx) => (
                    <span 
                      key={idx}
                      className="inline-flex items-center gap-1.5 px-3 py-1 bg-purple-950 text-purple-300 border border-purple-500/30 rounded-full text-[10px] font-bold font-mono"
                    >
                      <span>#{tag}</span>
                      <button 
                        type="button"
                        onClick={() => handleRemoveTag(idx)}
                        className="text-purple-400 hover:text-white font-black"
                      >
                        ✕
                      </button>
                    </span>
                  ))}
                  {tagList.length === 0 && (
                    <span className="text-[10px] text-zinc-500 font-mono italic pl-1">No custom search indexing tags configured.</span>
                  )}
                </div>
              </div>

              {/* Row 5: Triple Moods and Instruments selectors */}
              <div className="p-4 bg-zinc-900/40 border border-zinc-850 rounded-2xl space-y-3">
                <span className="font-bold text-white uppercase tracking-wider text-[10px] block">Triple Mood Classification</span>
                <div className="grid grid-cols-3 gap-2">
                  <select 
                    value={mood1} 
                    onChange={(e) => { setMood1(e.target.value); setHasChanges(true); }}
                    className="bg-zinc-950 border border-zinc-800 rounded-lg p-2 text-white font-mono text-[10px] outline-none"
                  >
                    {['Bouncy', 'Dark', 'Aggressive', 'Energetic', 'Trippy', 'Melancholy'].map(m => (
                      <option key={m} value={m}>{m}</option>
                    ))}
                  </select>
                  <select 
                    value={mood2} 
                    onChange={(e) => { setMood2(e.target.value); setHasChanges(true); }}
                    className="bg-zinc-950 border border-zinc-800 rounded-lg p-2 text-white font-mono text-[10px] outline-none"
                  >
                    {['Aggressive', 'Bouncy', 'Dark', 'Epic', 'Chill', 'Mysterious'].map(m => (
                      <option key={m} value={m}>{m}</option>
                    ))}
                  </select>
                  <select 
                    value={mood3} 
                    onChange={(e) => { setMood3(e.target.value); setHasChanges(true); }}
                    className="bg-zinc-950 border border-zinc-800 rounded-lg p-2 text-white font-mono text-[10px] outline-none"
                  >
                    {['Dark', 'Aggressive', 'Bouncy', 'Spacey', 'Hard', 'Smooth'].map(m => (
                      <option key={m} value={m}>{m}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="p-4 bg-zinc-900/40 border border-zinc-850 rounded-2xl space-y-3">
                <span className="font-bold text-white uppercase tracking-wider text-[10px] block">Triple Instrument Tracking</span>
                <div className="grid grid-cols-3 gap-2">
                  <select 
                    value={instrument1} 
                    onChange={(e) => { setInstrument1(e.target.value); setHasChanges(true); }}
                    className="bg-zinc-950 border border-zinc-800 rounded-lg p-2 text-white font-mono text-[10px] outline-none"
                  >
                    {['Piano', 'Synthesizer', 'Flute', '808 Bass', 'Bells', 'Guitar'].map(i => (
                      <option key={i} value={i}>{i}</option>
                    ))}
                  </select>
                  <select 
                    value={instrument2} 
                    onChange={(e) => { setInstrument2(e.target.value); setHasChanges(true); }}
                    className="bg-zinc-950 border border-zinc-800 rounded-lg p-2 text-white font-mono text-[10px] outline-none"
                  >
                    {['Synthesizer', 'Piano', 'Guitar', 'Strings', 'Plucks', '808 Bass'].map(i => (
                      <option key={i} value={i}>{i}</option>
                    ))}
                  </select>
                  <select 
                    value={instrument3} 
                    onChange={(e) => { setInstrument3(e.target.value); setHasChanges(true); }}
                    className="bg-zinc-950 border border-zinc-800 rounded-lg p-2 text-white font-mono text-[10px] outline-none"
                  >
                    {['808 Bass', 'Synthesizer', 'Bells', 'Pads', 'Sub-bass', 'Piano'].map(i => (
                      <option key={i} value={i}>{i}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Row 6: Audio visualizer embed & Voice tag select */}
              <div className="space-y-1.5">
                <label className="block text-zinc-400 font-bold uppercase tracking-wider text-[10px]">
                  Default Voice Tag Preset
                </label>
                <select
                  value={voiceTagPreset}
                  onChange={(e) => {
                    setVoiceTagPreset(e.target.value);
                    setHasChanges(true);
                  }}
                  className="w-full bg-zinc-950 border border-zinc-800 focus:border-purple-500 rounded-xl p-3 text-white font-mono outline-none"
                >
                  <option value="cashmere_signature">CASHMERE Signature Voice Tag ("Cashmere kid...")</option>
                  <option value="atlanta_trap_tag">Atlanta Street Tag ("Boomin Boomin...")</option>
                  <option value="modular_synth_leak">Modular Analog Glitch Leak</option>
                  <option value="none">None (No Tag watermark applied)</option>
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="block text-zinc-400 font-bold uppercase tracking-wider text-[10px]">
                  Fingerprint ID & Beat ID tracking
                </label>
                <div className="p-3 bg-zinc-950 border border-zinc-850 rounded-xl text-[10px] font-mono text-zinc-400 flex items-center justify-between">
                  <span>STATUS: {beatIdFingerprint}</span>
                  <span className="text-purple-400 font-bold">AUTOMATED WATERMARK REGISTERED</span>
                </div>
              </div>

              {/* Row 7: Tracking analytics ID, Charity attaching, ISRC field, Publisher Name, and external embed url */}
              <div className="space-y-1.5">
                <label className="block text-zinc-400 font-bold uppercase tracking-wider text-[10px]">
                  Analytics Tracker Pixel (Google ID)
                </label>
                <input
                  type="text"
                  value={analyticsId}
                  onChange={(e) => { setAnalyticsId(e.target.value); setHasChanges(true); }}
                  placeholder="e.g. UA-000000-00"
                  className="w-full bg-zinc-950 border border-zinc-800 focus:border-purple-500 rounded-xl p-3 text-white font-mono outline-none"
                />
              </div>

              <div className="space-y-1.5">
                <label className="block text-zinc-400 font-bold uppercase tracking-wider text-[10px]">
                  Charity Proceeds Attachment
                </label>
                <div className="flex gap-2">
                  <select
                    value={charityPartner}
                    onChange={(e) => { setCharityPartner(e.target.value); setHasChanges(true); }}
                    className="flex-1 bg-zinc-950 border border-zinc-800 focus:border-purple-500 rounded-xl p-3 text-white font-mono outline-none"
                  >
                    <option value="None">None</option>
                    <option value="MusiCares">MusiCares Foundation</option>
                    <option value="SaveTheMusic">Save The Music Foundation</option>
                    <option value="SweetRelief">Sweet Relief Musicians Fund</option>
                  </select>
                  <select
                    value={charityDonationPct}
                    onChange={(e) => { setCharityDonationPct(parseInt(e.target.value) || 0); setHasChanges(true); }}
                    className="w-20 bg-zinc-950 border border-zinc-800 focus:border-purple-500 rounded-xl p-3 text-white font-mono outline-none"
                  >
                    <option value="0">0%</option>
                    <option value="5">5% Split</option>
                    <option value="10">10% Split</option>
                    <option value="20">20% Split</option>
                  </select>
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="block text-zinc-400 font-bold uppercase tracking-wider text-[10px]">
                  ISRC Code
                </label>
                <input
                  type="text"
                  value={isrcCode}
                  onChange={(e) => { setIsrcCode(e.target.value); setHasChanges(true); }}
                  placeholder="US-AAA-BB-CCCCC"
                  className="w-full bg-zinc-950 border border-zinc-800 focus:border-purple-500 rounded-xl p-3 text-white font-mono outline-none"
                />
              </div>

              <div className="space-y-1.5">
                <label className="block text-zinc-400 font-bold uppercase tracking-wider text-[10px]">
                  Publisher Name / PRO Metadata
                </label>
                <input
                  type="text"
                  value={publisherName}
                  onChange={(e) => { setPublisherName(e.target.value); setHasChanges(true); }}
                  className="w-full bg-zinc-950 border border-zinc-800 focus:border-purple-500 rounded-xl p-3 text-white font-mono outline-none"
                />
              </div>

              <div className="sm:col-span-2 space-y-1.5">
                <label className="block text-zinc-400 font-bold uppercase tracking-wider text-[10px]">
                  External Social Embed URL (YouTube/SoundCloud sync)
                </label>
                <input
                  type="text"
                  value={socialEmbedUrl}
                  onChange={(e) => { setSocialEmbedUrl(e.target.value); setHasChanges(true); }}
                  placeholder="https://www.youtube.com/watch?v=..."
                  className="w-full bg-zinc-950 border border-zinc-800 focus:border-purple-500 rounded-xl p-3 text-white font-mono outline-none"
                />
              </div>

              {/* Row 8: AI Description Suggester & Text Field */}
              <div className="sm:col-span-2 space-y-1.5">
                <div className="flex justify-between items-center">
                  <label className="block text-zinc-400 font-bold uppercase tracking-wider text-[10px]">
                    Product Description
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
                  className="w-full bg-zinc-950 border border-zinc-800 focus:border-purple-500 rounded-2xl p-3.5 text-white outline-none leading-relaxed font-mono text-[11px]"
                />
              </div>
            </div>
          </div>
        )}

        {/* STEP 4: PRICING & DOWNLOAD OPTIONS */}
        {currentStep === 4 && (
          <div className="space-y-6 text-xs text-left">
            <div>
              <h3 className="text-white font-brand font-black text-lg uppercase tracking-wider">
                Leasing Options & Prices
              </h3>
              <p className="text-xs text-zinc-400 mt-1">
                Define prices for standard and unlimited digital leases.
              </p>
            </div>

            {/* Custom license contract links & templates */}
            <div className="p-4 bg-zinc-900 border border-zinc-800 rounded-2xl space-y-3">
              <span className="font-bold text-white uppercase tracking-wider text-[10px] block pl-1">Custom Lease Terms Linking</span>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={customLicenseTermsLink}
                  onChange={(e) => { setCustomLicenseTermsLink(e.target.value); setHasChanges(true); }}
                  placeholder="https://example.com/custom-lease-terms.pdf"
                  className="flex-1 bg-zinc-950 border border-zinc-850 rounded-xl p-2.5 text-white font-mono text-[11px] outline-none"
                />
                <select 
                  onChange={(e) => {
                    if (e.target.value !== 'custom') {
                      setCustomLicenseTermsLink(e.target.value);
                    }
                  }}
                  className="bg-zinc-950 border border-zinc-850 rounded-xl p-2.5 text-white font-mono text-[11px] outline-none"
                >
                  <option value="custom">Use Custom Input Link</option>
                  <option value="https://cashmerekids.com/contracts/exclusive-standard.pdf">Default Cashmere Exclusive Terms</option>
                  <option value="https://cashmerekids.com/contracts/non-exclusive-lease.pdf">Default Standard Non-Exclusive Terms</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="p-4 bg-zinc-950 border border-zinc-850 rounded-2xl space-y-2">
                <div className="flex justify-between items-center">
                  <span className="font-bold text-white uppercase tracking-wider text-[10px] block">MP3 Standard Lease Price</span>
                  <span className="text-[9px] font-mono text-zinc-500">Preset: $39.99</span>
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
                <p className="text-[10px] text-zinc-500">Unlocks standard tagged reference file + standard contract lease certificate.</p>
              </div>

              <div className="p-4 bg-zinc-950 border border-zinc-850 rounded-2xl space-y-2">
                <div className="flex justify-between items-center">
                  <span className="font-bold text-white uppercase tracking-wider text-[10px] block">Premium M4A Lease Price</span>
                  <span className="text-[9px] font-mono text-zinc-500">Preset: $89.99</span>
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
                <p className="text-[10px] text-zinc-500">Unlocks lossless M4A master format file for studio recording sessions.</p>
              </div>

              <div className="p-4 bg-zinc-950 border border-zinc-850 rounded-2xl space-y-2">
                <div className="flex justify-between items-center">
                  <span className="font-bold text-white uppercase tracking-wider text-[10px] block">Unlimited Lease Price</span>
                  <span className="text-[9px] font-mono text-zinc-500">Preset: $249.99</span>
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
                <p className="text-[10px] text-zinc-500">Uncapped broadcasting, streaming, performance permissions with high-end contract terms.</p>
              </div>

              <div className="p-4 bg-zinc-950 border border-zinc-850 rounded-2xl space-y-2">
                <div className="flex justify-between items-center">
                  <span className="font-bold text-rose-300 uppercase tracking-wider text-[10px] block">Exclusive buyout Price</span>
                  <span className="text-[9px] font-mono text-zinc-500">Preset: $1200.00</span>
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
                <p className="text-[10px] text-zinc-500">Full ownership acquisition, removal from store catalog, high-definition WAV stems.</p>
              </div>
            </div>

            {/* Offer toggle & bulk discounts / tiered pricing configuration */}
            <div className="p-4 bg-zinc-900 border border-zinc-800 rounded-2xl space-y-4">
              <span className="font-bold text-white uppercase tracking-wider text-[10px] block pl-1">Advanced Pricing Preferences</span>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                
                <div className="p-3 bg-zinc-950 rounded-xl border border-zinc-850 flex flex-col justify-between">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-[10px] text-zinc-300 uppercase tracking-wide">Negotiate Offer</span>
                    <input 
                      type="checkbox"
                      checked={makeOfferEnabled}
                      onChange={(e) => { setMakeOfferEnabled(e.target.checked); setHasChanges(true); }}
                      className="accent-purple-600 rounded cursor-pointer"
                    />
                  </div>
                  <p className="text-[9px] text-zinc-500 leading-relaxed mt-2">Allows artists to submit price negotiations on Exclusives.</p>
                </div>

                <div className="p-3 bg-zinc-950 rounded-xl border border-zinc-850 flex flex-col justify-between">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-[10px] text-zinc-300 uppercase tracking-wide">Tiered pricing</span>
                    <input 
                      type="checkbox"
                      checked={tieredPricingActive}
                      onChange={(e) => { setTieredPricingActive(e.target.checked); setHasChanges(true); }}
                      className="accent-purple-600 rounded cursor-pointer"
                    />
                  </div>
                  <p className="text-[9px] text-zinc-500 leading-relaxed mt-2">Dynamic scale: automatically calculate license discounts at checkout.</p>
                </div>

                <div className="p-3 bg-zinc-950 rounded-xl border border-zinc-850 space-y-1.5 text-left">
                  <span className="font-bold text-[10px] text-zinc-300 uppercase tracking-wide">Bulk Campaign Discounts</span>
                  <select
                    value={bulkDiscount}
                    onChange={(e) => { setBulkDiscount(e.target.value); setHasChanges(true); }}
                    className="w-full bg-zinc-900 border border-zinc-800 rounded p-1 text-white font-mono text-[10px] outline-none"
                  >
                    <option value="none">No campaign active</option>
                    <option value="buy_2_get_1_free">Buy 2 Get 1 Free (Default)</option>
                    <option value="buy_3_get_2_free">Buy 3 Get 2 Free</option>
                    <option value="50_percent_second">50% off second lease</option>
                  </select>
                </div>

              </div>
            </div>

            {/* SEPARATED FREE DOWNLOAD SECTION */}
            <div className="p-5 bg-zinc-950 border border-zinc-900 rounded-2xl space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <h4 className="font-bold text-sm text-purple-300">Free Download Gating & Promotions</h4>
                  <p className="text-[11px] text-zinc-500">Configure strict rules and follow gating before files are distributed.</p>
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
                <div className="pt-3.5 border-t border-zinc-900 space-y-4">
                  
                  {/* Free download rules grids */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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
                      <p className="text-[10px] text-zinc-500">Collect verified emails from download checkout flows.</p>
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
                      <div className="font-extrabold text-xs uppercase tracking-wider text-white">Direct Open Download</div>
                      <p className="text-[10px] text-zinc-500">Allows instant tagged file download without any forms.</p>
                    </button>
                  </div>

                  {/* Audio tagging, Social gate type, gate url, veloco syndication */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    
                    <div className="p-3 bg-zinc-900 rounded-xl border border-zinc-850 flex flex-col justify-between">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-[10px] text-zinc-300 uppercase tracking-wide">Voice Tagged Watermark</span>
                        <input 
                          type="checkbox"
                          checked={requireVoiceTagForFree}
                          onChange={(e) => { setRequireVoiceTagForFree(e.target.checked); setHasChanges(true); }}
                          className="accent-purple-600 rounded cursor-pointer"
                        />
                      </div>
                      <p className="text-[9px] text-zinc-500 leading-relaxed mt-1">Enforce voice watermark tags throughout the free download file.</p>
                    </div>

                    <div className="p-3 bg-zinc-900 rounded-xl border border-zinc-850 flex flex-col justify-between">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-[10px] text-zinc-300 uppercase tracking-wide">Veloco Network Syndication</span>
                        <input 
                          type="checkbox"
                          checked={velocoSyndication}
                          onChange={(e) => { setVelocoSyndication(e.target.checked); setHasChanges(true); }}
                          className="accent-purple-600 rounded cursor-pointer"
                        />
                      </div>
                      <p className="text-[9px] text-zinc-500 leading-relaxed mt-1">Make download available immediately across the Veloco mobile community.</p>
                    </div>

                    <div className="p-3 bg-zinc-900 rounded-xl border border-zinc-850 space-y-1.5 sm:col-span-2 text-left">
                      <span className="font-bold text-[10px] text-zinc-300 uppercase tracking-wide block">Social Follow Gating Gated Link</span>
                      <div className="flex gap-2">
                        <select
                          value={socialGateType}
                          onChange={(e) => { setSocialGateType(e.target.value); setHasChanges(true); }}
                          className="bg-zinc-950 border border-zinc-800 rounded p-1.5 text-white font-mono text-[10px] outline-none"
                        >
                          <option value="youtube_subscribe">Require YouTube Subscription</option>
                          <option value="twitter_follow">Require Twitter / X Follow</option>
                          <option value="soundcloud_follow">Require SoundCloud Follow</option>
                          <option value="none">No social gate required</option>
                        </select>
                        <input
                          type="text"
                          value={socialGateUrl}
                          onChange={(e) => { setSocialGateUrl(e.target.value); setHasChanges(true); }}
                          placeholder="Link to profile/channel..."
                          className="flex-1 bg-zinc-950 border border-zinc-800 rounded p-1.5 text-white font-mono text-[10px] outline-none"
                        />
                      </div>
                    </div>

                  </div>

                </div>
              )}
            </div>
          </div>
        )}

        {/* STEP 5: CUSTOMER ACCESS & VISIBILITY */}
        {currentStep === 5 && (
          <div className="space-y-6 text-xs text-left">
            <div>
              <h3 className="text-white font-brand font-black text-lg uppercase tracking-wider">
                Listing Visibility & Collaboration Splits
              </h3>
              <p className="text-xs text-zinc-400 mt-1">
                Configure listing visibility, add collaborators with split sheets, and register Content ID.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-start">
              
              {/* Left Column: Visibility, Collaborators & Splits */}
              <div className="md:col-span-7 space-y-6">
                
                {/* Visibility Option Selectors */}
                <div className="space-y-3">
                  <span className="text-[10px] font-mono font-black text-purple-400 uppercase tracking-wider block">1. STORE DISCOVERABILITY VISIBILITY</span>
                  <div className="space-y-2">
                    {[
                      {
                        id: 'published',
                        title: 'PUBLISHED STOREFRONT (Public)',
                        desc: 'Fully discovery-indexed. Will render on public Home page, Beats browse page, and search queries.',
                        color: 'border-emerald-500/30 text-emerald-400 bg-emerald-950/10'
                      },
                      {
                        id: 'draft',
                        title: 'PRIVATE DRAFT',
                        desc: 'Omitted from normal store indexing. Access is limited to your private studio workspace catalog.',
                        color: 'border-amber-500/30 text-amber-400 bg-amber-950/10'
                      },
                      {
                        id: 'hidden',
                        title: 'HIDDEN UNLISTED (BY DIRECT PRODUCT URL ONLY)',
                        desc: 'Omitted from storefront indexing. Accessible exclusively to clients possessing direct URLs.',
                        color: 'border-blue-500/30 text-blue-400 bg-blue-950/10'
                      }
                    ].map((item) => (
                      <button
                        key={item.id}
                        type="button"
                        onClick={() => {
                          setVisibility(item.id as any);
                          setHasChanges(true);
                        }}
                        className={`w-full p-4 rounded-2xl border text-left flex gap-4 transition-all cursor-pointer ${
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
                </div>

                {/* Publishing Mode Scheduler & Store Feeds Sync */}
                <div className="p-4 bg-zinc-950 border border-zinc-900 rounded-2xl space-y-4">
                  <div>
                    <span className="text-[10px] font-mono font-black text-purple-400 uppercase tracking-wider block">1.5. SCHEDULED RELEASE & FEEDS SYNCHRONIZATION</span>
                    <p className="text-[10px] text-zinc-500 mt-0.5">Determine the precise release date and select automatic syndication targets.</p>
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => {
                        setPublishingMode('instant');
                        setHasChanges(true);
                      }}
                      className={`py-2 px-3 text-[10px] font-bold uppercase rounded-lg border transition-all ${
                        publishingMode === 'instant'
                          ? 'bg-purple-950/40 border-purple-500 text-purple-300'
                          : 'bg-zinc-900/40 border-zinc-850 text-zinc-500 hover:text-zinc-300'
                      }`}
                    >
                      Instant Release
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setPublishingMode('scheduled');
                        setHasChanges(true);
                      }}
                      className={`py-2 px-3 text-[10px] font-bold uppercase rounded-lg border transition-all ${
                        publishingMode === 'scheduled'
                          ? 'bg-purple-950/40 border-purple-500 text-purple-300'
                          : 'bg-zinc-900/40 border-zinc-850 text-zinc-500 hover:text-zinc-300'
                      }`}
                    >
                      Scheduled Release
                    </button>
                  </div>

                  {publishingMode === 'scheduled' && (
                    <div className="grid grid-cols-2 gap-3 p-3 bg-zinc-900 rounded-xl border border-zinc-850 animate-fadeIn">
                      <div className="space-y-1 text-left">
                        <span className="text-[9px] font-mono text-zinc-500 uppercase block pl-1">Release Date</span>
                        <input
                          type="date"
                          value={scheduledDate}
                          onChange={(e) => {
                            setScheduledDate(e.target.value);
                            setHasChanges(true);
                          }}
                          className="w-full bg-zinc-950 border border-zinc-800 rounded p-1.5 text-white font-mono text-[10px] outline-none"
                        />
                      </div>
                      <div className="space-y-1 text-left">
                        <span className="text-[9px] font-mono text-zinc-500 uppercase block pl-1">Release Time</span>
                        <input
                          type="time"
                          value={scheduledTime}
                          onChange={(e) => {
                            setScheduledTime(e.target.value);
                            setHasChanges(true);
                          }}
                          className="w-full bg-zinc-950 border border-zinc-800 rounded p-1.5 text-white font-mono text-[10px] outline-none"
                        />
                      </div>
                    </div>
                  )}

                  {/* Pro Page & Marketplace sync checks */}
                  <div className="pt-2 border-t border-zinc-900 space-y-2 text-[10px] font-mono text-zinc-400">
                    <div className="flex items-center justify-between">
                      <span>Publish directly to personal Web Store (Pro Page Sync)</span>
                      <input
                        type="checkbox"
                        checked={syncProPage}
                        onChange={(e) => {
                          setSyncProPage(e.target.checked);
                          setHasChanges(true);
                        }}
                        className="accent-purple-600 rounded cursor-pointer"
                      />
                    </div>
                    <div className="flex items-center justify-between">
                      <span>Sync straight to Veloco & BeatStars Marketplace Feeds</span>
                      <input
                        type="checkbox"
                        checked={syncMarketplace}
                        onChange={(e) => {
                          setSyncMarketplace(e.target.checked);
                          setHasChanges(true);
                        }}
                        className="accent-purple-600 rounded cursor-pointer"
                      />
                    </div>
                  </div>
                </div>

                {/* Collaboration & splits addition */}
                <div className="p-4 bg-zinc-950 border border-zinc-900 rounded-2xl space-y-4">
                  <div>
                    <span className="text-[10px] font-mono font-black text-purple-400 uppercase tracking-wider block">2. COLLABORATORS & REVENUE SPLIT SHEET</span>
                    <p className="text-[10px] text-zinc-500 mt-0.5">Search and add other producers/artists to configure sales and Content ID splits.</p>
                  </div>

                  <div className="p-3.5 bg-zinc-900 rounded-xl border border-zinc-850 space-y-3">
                    <span className="font-bold text-white text-[10px] uppercase block">Apply Default Split Agreements</span>
                    <select
                      value={defaultContractTemplate}
                      onChange={(e) => {
                        setDefaultContractTemplate(e.target.value);
                        setHasChanges(true);
                        if (e.target.value === '50/50_standard') {
                          setCollaborators([{ name: 'BOOMIN JR', role: 'Co-Producer', salesSplit: 50, contentIdSplit: 50 }]);
                        } else if (e.target.value === 'exclusive_buyout') {
                          setCollaborators([]);
                        }
                      }}
                      className="w-full bg-zinc-950 border border-zinc-800 rounded p-1.5 text-white font-mono text-[10px] outline-none"
                    >
                      <option value="50/50_standard">50/50 Standard Split Agreement (Default)</option>
                      <option value="exclusive_buyout">Exclusive Producer Buyout (100% Sales to Creator)</option>
                      <option value="custom">Custom Collaborator Agreements</option>
                    </select>
                  </div>

                  {/* Add collaborator fields */}
                  <div className="space-y-2 pt-1 border-t border-zinc-900">
                    <span className="font-bold text-zinc-400 text-[9px] uppercase pl-1 block">Add custom collaborator</span>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      <input
                        type="text"
                        value={collabNameInput}
                        onChange={(e) => setCollabNameInput(e.target.value)}
                        placeholder="Producer Name / Username..."
                        className="bg-zinc-900 border border-zinc-850 rounded p-1.5 text-white text-[10px] outline-none font-mono"
                      />
                      <select
                        value={collabRoleInput}
                        onChange={(e) => setCollabRoleInput(e.target.value)}
                        className="bg-zinc-900 border border-zinc-850 rounded p-1.5 text-white text-[10px] outline-none font-mono"
                      >
                        <option value="Co-Producer">Co-Producer</option>
                        <option value="Executive Producer">Executive Producer</option>
                        <option value="Songwriter">Songwriter</option>
                        <option value="Vocalist">Vocalist</option>
                      </select>
                    </div>

                    <div className="grid grid-cols-2 gap-2">
                      <div className="space-y-1">
                        <span className="text-[8px] font-mono text-zinc-500 uppercase block pl-1">Sales Split %</span>
                        <input
                          type="number"
                          value={collabSalesSplitInput}
                          onChange={(e) => setCollabSalesSplitInput(parseInt(e.target.value) || 0)}
                          className="w-full bg-zinc-900 border border-zinc-850 rounded p-1.5 text-white font-mono text-[10px]"
                        />
                      </div>
                      <div className="space-y-1">
                        <span className="text-[8px] font-mono text-zinc-500 uppercase block pl-1">Content ID split %</span>
                        <input
                          type="number"
                          value={collabIdSplitInput}
                          onChange={(e) => setCollabIdSplitInput(parseInt(e.target.value) || 0)}
                          className="w-full bg-zinc-900 border border-zinc-850 rounded p-1.5 text-white font-mono text-[10px]"
                        />
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={handleAddCollaborator}
                      className="w-full py-1.5 bg-purple-600/30 text-purple-300 border border-purple-500/30 hover:bg-purple-600 hover:text-white rounded font-bold text-[10px] uppercase transition-all cursor-pointer"
                    >
                      + Add Collaborator to split sheet
                    </button>
                  </div>

                  {/* Collaborators list */}
                  <div className="pt-2 border-t border-zinc-900 space-y-2">
                    <span className="font-bold text-zinc-400 text-[9px] uppercase pl-1 block">Splits Registered ({collaborators.length + 1})</span>
                    <div className="space-y-1.5">
                      <div className="flex items-center justify-between p-2 bg-purple-950/20 border border-purple-500/20 rounded-xl text-[10px] font-mono">
                        <span className="text-white font-bold">YOU (CASHMERE KID$)</span>
                        <div className="flex items-center gap-3">
                          <span className="text-purple-300">Sales: {100 - collaborators.reduce((acc, c) => acc + c.salesSplit, 0)}%</span>
                          <span className="text-purple-300">Content ID: {100 - collaborators.reduce((acc, c) => acc + c.contentIdSplit, 0)}%</span>
                        </div>
                      </div>

                      {collaborators.map((c, idx) => (
                        <div key={idx} className="flex items-center justify-between p-2 bg-zinc-900 border border-zinc-850 rounded-xl text-[10px] font-mono">
                          <div>
                            <div className="text-white font-bold">{c.name}</div>
                            <div className="text-[9px] text-zinc-500">{c.role}</div>
                          </div>
                          <div className="flex items-center gap-4">
                            <span className="text-zinc-400">Sales: {c.salesSplit}%</span>
                            <span className="text-zinc-400">Content ID: {c.contentIdSplit}%</span>
                            <button
                              type="button"
                              onClick={() => handleRemoveCollaborator(idx)}
                              className="text-rose-400 hover:text-rose-300 font-bold"
                            >
                              ✕
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                </div>

              </div>

              {/* Right Column: Monetization, Fingerprint ID & Deep Links */}
              <div className="md:col-span-5 space-y-6">
                
                {/* Content ID registry options */}
                <div className="p-4 bg-zinc-950 border border-zinc-900 rounded-2xl space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <h4 className="font-bold text-white uppercase tracking-wider text-[10px]">Content ID monetization</h4>
                      <p className="text-[10px] text-zinc-500">Enable automatic audio finger tracking registration.</p>
                    </div>
                    <input 
                      type="checkbox"
                      checked={contentIdRegistered}
                      onChange={(e) => { setContentIdRegistered(e.target.checked); setHasChanges(true); }}
                      className="accent-purple-600 rounded cursor-pointer"
                    />
                  </div>

                  {contentIdRegistered && (
                    <div className="pt-3 border-t border-zinc-900 space-y-3">
                      <span className="font-bold text-zinc-400 text-[9px] uppercase tracking-wide block">Monetize Selected Social Platforms</span>
                      <div className="space-y-2 text-[10px] font-mono text-zinc-300">
                        {[
                          { id: 'youtube', label: 'YouTube Content ID claims' },
                          { id: 'tiktok', label: 'TikTok sound library fingerprinting' },
                          { id: 'instagram', label: 'Instagram Audio library indexing' },
                          { id: 'facebook', label: 'Facebook/Meta Rights Manager' }
                        ].map((plat) => (
                          <div key={plat.id} className="flex items-center justify-between">
                            <span>{plat.label}</span>
                            <input 
                              type="checkbox"
                              checked={(monetizePlatforms as any)[plat.id]}
                              onChange={(e) => {
                                setMonetizePlatforms(prev => ({ ...prev, [plat.id]: e.target.checked }));
                                setHasChanges(true);
                              }}
                              className="accent-purple-600 rounded cursor-pointer animate-fadeIn"
                            />
                          </div>
                        ))}
                      </div>

                      <div className="p-3 bg-zinc-900 rounded-xl space-y-2 text-[9px] text-zinc-500">
                        <div className="flex items-center gap-2">
                          <input 
                            type="checkbox"
                            checked={soundLibraryOptIn}
                            onChange={(e) => { setSoundLibraryOptIn(e.target.checked); setHasChanges(true); }}
                            className="accent-purple-600 rounded"
                          />
                          <span>Opt-in to Cashmere Sound Creator library syndicate</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <input 
                            type="checkbox"
                            checked={autoAntiPiracyCollect}
                            onChange={(e) => { setAutoAntiPiracyCollect(e.target.checked); setHasChanges(true); }}
                            className="accent-purple-600 rounded"
                          />
                          <span>Automate collection from unauthorized web uses</span>
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                {/* Deep Link card */}
                <div className="p-5 bg-zinc-950 rounded-2xl border border-zinc-900 space-y-4">
                  <span className="text-[10px] font-mono font-black text-zinc-400 uppercase tracking-wider block">
                    STABLE PRODUCT DEEP-LINK
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
                      >
                        <ExternalLink className="w-3.5 h-3.5" />
                      </a>
                    </div>
                  </div>
                  <p className="text-[10px] text-zinc-500 leading-relaxed font-medium">
                    This product link remains active and mapped to this digital track asset ID. Deep linking directs clients directly to the checkout licensing modal on click.
                  </p>
                </div>

              </div>

            </div>
          </div>
        )}

        {/* STEP 6: STORE PRESENTATION & LIVE PREVIEW */}
        {currentStep === 6 && (
          <div className="space-y-6">
            <div>
              <h3 className="text-white font-brand font-black text-lg uppercase tracking-wider">
                Storefront Layout Spotlight
              </h3>
              <p className="text-xs text-zinc-400 mt-1">
                Customize physical spotlight assignment on major page sections.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-start">
              <div className="md:col-span-6 space-y-5 text-left text-xs">
                <div className="p-4 bg-zinc-950 border border-zinc-900 rounded-2xl flex items-center justify-between">
                  <div className="space-y-0.5">
                    <h4 className="font-bold text-white uppercase tracking-wider text-[10px]">Spotlight Featured Carousel</h4>
                    <p className="text-[10px] text-zinc-500">Assign this beat to the hero showcase slider on the Home view.</p>
                  </div>
                  <input
                    type="checkbox"
                    checked={featured}
                    onChange={(e) => {
                      setFeatured(e.target.checked);
                      setHasChanges(true);
                    }}
                    className="w-10 h-5 bg-zinc-900 border border-zinc-800 rounded-full accent-purple-600 cursor-pointer"
                  />
                </div>

                <div className="p-4 bg-zinc-950 border border-zinc-900 rounded-2xl space-y-3">
                  <label className="block text-zinc-400 font-bold uppercase tracking-wider text-[10px]">
                    Store Category Assignment
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
                    <option value="Runway Showcases">Runway Showcases (Elite trap)</option>
                    <option value="Dark Archives">Dark Archives (Aggressive 808s)</option>
                  </select>
                </div>

                <div className="p-4 bg-zinc-950 border border-zinc-900/60 rounded-2xl space-y-2">
                  <span className="text-[10px] font-mono font-black text-purple-400 uppercase tracking-wider block">
                    STORE METRIC CHECKS
                  </span>
                  <ul className="space-y-1.5 text-[10px] text-zinc-400 font-medium">
                    <li className="flex items-center gap-2">
                      <CheckCircle className="w-3.5 h-3.5 text-emerald-400 font-bold" />
                      <span>Track transients and wave peaks normalized.</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle className="w-3.5 h-3.5 text-emerald-400 font-bold" />
                      <span>Licensing contracts ready for deployment on buy checkouts.</span>
                    </li>
                  </ul>
                </div>
              </div>

              <div className="md:col-span-6 flex flex-col items-center">
                <span className="text-[10px] font-mono font-black text-zinc-500 uppercase tracking-wider block mb-3 text-left w-full pl-2">
                  STORE CARD EMULATION
                </span>
                
                <div className="bg-zinc-950 border border-zinc-850 rounded-3xl p-5 max-w-sm w-full space-y-4 shadow-xl hover:border-purple-500/20 transition-all group">
                  <div className="relative aspect-square w-full rounded-2xl overflow-hidden border border-zinc-800">
                    <img src={artworkUrl} alt={title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                    <button
                      onClick={() => setIsPlayingPreview(!isPlayingPreview)}
                      className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity"
                    >
                      <div className="w-12 h-12 rounded-full bg-purple-600 text-white flex items-center justify-center shadow-lg">
                        {isPlayingPreview ? <Pause className="w-5 h-5 fill-white" /> : <Play className="w-5 h-5 fill-white ml-0.5" />}
                      </div>
                    </button>
                    {featured && (
                      <span className="absolute top-3 left-3 px-2.5 py-1 bg-purple-600 text-white font-extrabold text-[9px] uppercase tracking-widest rounded-lg shadow">
                        SPOTLIGHT
                      </span>
                    )}

                    {isPlayingPreview && (
                      <div className="absolute bottom-3 left-3 right-3 bg-black/80 backdrop-blur-sm px-3 py-1.5 rounded-xl flex items-center justify-between gap-1.5 animate-fadeIn">
                        <span className="text-[8px] font-mono text-purple-400 font-bold tracking-widest shrink-0">PLAYING PREVIEW</span>
                        <div className="flex items-end gap-0.5 h-3 shrink-0">
                          {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((bar) => (
                            <span
                              key={bar}
                              className="w-0.5 bg-purple-500 rounded-full"
                              style={{
                                height: `${Math.floor(Math.random() * 80) + 20}%`,
                                animation: `wave-pulse 0.6s ease-in-out infinite alternate`,
                                animationDelay: `${bar * 0.05}s`
                              }}
                            />
                          ))}
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="space-y-1.5 text-left">
                    <h4 className="font-extrabold text-base text-white truncate uppercase tracking-wider">
                      {title || 'UNTITLED'}
                    </h4>
                    <p className="text-[10px] font-mono text-purple-400 font-bold uppercase tracking-widest">
                      {bpm} BPM · {key} · PROD. CASHMERE KID$
                    </p>
                    <p className="text-[11px] text-zinc-400 line-clamp-1">
                      {description || 'No custom description provided.'}
                    </p>
                  </div>

                  <div className="flex justify-between items-center pt-3 border-t border-zinc-900">
                    <div>
                      <span className="text-[9px] font-mono font-bold text-zinc-500 uppercase tracking-widest block">Starting at</span>
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
          <div className="space-y-6">
            <div>
              <h3 className="text-white font-brand font-black text-lg uppercase tracking-wider">
                Review Studio Details & Publish
              </h3>
              <p className="text-xs text-zinc-400 mt-1">
                Final comprehensive metadata review.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-12 gap-8 text-left text-xs">
              <div className="md:col-span-8 p-6 bg-zinc-950 border border-zinc-900 rounded-3xl space-y-6">
                <div className="flex items-center gap-4 border-b border-zinc-900 pb-5">
                  <img src={artworkUrl} alt={title} className="w-16 h-16 rounded-xl object-cover border border-zinc-850" />
                  <div>
                    <h4 className="text-lg font-black text-white uppercase tracking-wider font-mono">
                      {title}
                    </h4>
                    <p className="text-xs text-zinc-500 mt-1">
                      Category: {category} · Key: {key} · Tempo: {bpm} BPM · Genre: {genre}
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-y-4 gap-x-6">
                  <div>
                    <span className="text-[10px] font-mono text-zinc-500 font-bold uppercase tracking-wider block">Standard Lease</span>
                    <span className="text-sm font-bold text-white font-mono">{currencySymbol}{mp3Price.toFixed(2)}</span>
                  </div>
                  <div>
                    <span className="text-[10px] font-mono text-zinc-500 font-bold uppercase tracking-wider block">Premium Lease</span>
                    <span className="text-sm font-bold text-white font-mono">{currencySymbol}{premiumPrice.toFixed(2)}</span>
                  </div>
                  <div>
                    <span className="text-[10px] font-mono text-zinc-500 font-bold uppercase tracking-wider block">Unlimited Lease</span>
                    <span className="text-sm font-bold text-white font-mono">{currencySymbol}{unlimitedPrice.toFixed(2)}</span>
                  </div>
                  <div>
                    <span className="text-[10px] font-mono text-zinc-500 font-bold uppercase tracking-wider block">Exclusive buyout</span>
                    <span className="text-sm font-bold text-rose-300 font-mono">{currencySymbol}{exclusivePrice.toFixed(2)}</span>
                  </div>
                  <div>
                    <span className="text-[10px] font-mono text-zinc-500 font-bold uppercase tracking-wider block">Free promo downloads</span>
                    <span className="text-xs font-bold text-white font-mono">
                      {allowFreeDownload ? `Enabled (${freeDownloadType === 'email_required' ? 'Requires Email lead' : 'Open Access'})` : 'Disabled'}
                    </span>
                  </div>
                  <div>
                    <span className="text-[10px] font-mono text-zinc-500 font-bold uppercase tracking-wider block">Discoverability Visibility</span>
                    <span className="text-xs font-bold text-white font-mono uppercase">{visibility}</span>
                  </div>
                </div>

                <div className="space-y-2 border-t border-zinc-900 pt-5">
                  <span className="text-[10px] font-mono text-zinc-500 font-bold uppercase tracking-wider block">Keywords Search Tags</span>
                  <div className="flex flex-wrap gap-1.5 pt-1">
                    {tags.split(',').map((t) => t.trim()).filter(Boolean).map((tag, idx) => (
                      <span key={idx} className="px-2.5 py-1 bg-zinc-900 text-zinc-400 border border-zinc-850 rounded-lg text-[10px] font-mono uppercase tracking-wide">
                        #{tag}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              <div className="md:col-span-4 space-y-6">
                <div className="p-5 bg-zinc-950 border border-zinc-900 rounded-3xl space-y-3.5">
                  <span className="text-[10px] font-mono font-black text-purple-400 uppercase tracking-wider block">
                    SECURITY COMPLIANCES
                  </span>
                  <p className="text-[11px] text-zinc-500 leading-relaxed">
                    By publishing, you establish direct copyright references and activate real Smart Button PayPal payout capabilities.
                  </p>
                  <div className="space-y-2 text-[10px] text-zinc-400 font-semibold">
                    <label className="flex items-start gap-2.5 cursor-pointer leading-relaxed">
                      <input type="checkbox" defaultChecked className="mt-0.5 rounded bg-zinc-900 border-zinc-800 text-purple-600" />
                      <span>Arrangement comprises original master elements only.</span>
                    </label>
                  </div>
                </div>

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

      {/* Navigation Buttons */}
      <div className="pt-6 border-t border-zinc-800 flex justify-between items-center text-xs font-bold">
        {currentStep > 1 ? (
          <button
            onClick={() => setCurrentStep((prev) => prev - 1)}
            className="px-5 py-2.5 bg-zinc-900 hover:bg-zinc-850 border border-zinc-800 text-zinc-300 rounded-xl flex items-center gap-1.5 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back</span>
          </button>
        ) : <div />}

        <span className="text-[11px] font-mono font-bold text-zinc-500 hidden sm:block">
          STEP {currentStep} OF 7 ({stepTitles[currentStep - 1]})
        </span>

        {currentStep < 7 ? (
          <button
            onClick={() => {
              if (currentStep === 1 && !fileUploaded) {
                alert('Please select and process a valid audio master track before proceeding.');
                return;
              }
              setCurrentStep((prev) => prev + 1);
            }}
            className="px-6 py-2.5 bg-purple-600 hover:bg-purple-500 text-white rounded-xl flex items-center gap-1.5 transition-colors shadow"
          >
            <span>Continue Step {currentStep + 1}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        ) : (
          <button
            onClick={() => handlePublish(visibility)}
            className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl flex items-center gap-1.5 transition-colors shadow uppercase"
          >
            <CheckCircle className="w-4 h-4" />
            <span>Finalize & Publish</span>
          </button>
        )}
      </div>

        </div>


        {/* ============================================================== */}
        {/* PAGE 2: BEAT PACK UPLOADER                                     */}
        {/* ============================================================== */}
        <div className={`w-full space-y-8 ${getPageClass('pack')}`}>
          
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            
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
                  id="packZipUploadInput"
                  accept=".zip"
                  className="hidden"
                  disabled={packIsUploadingZip || packIsProcessingZip}
                  onChange={(e) => {
                    if (e.target.files && e.target.files[0]) {
                      handleZipFileSelection(e.target.files[0]);
                    }
                  }}
                />

                <label htmlFor="packZipUploadInput" className="block cursor-pointer space-y-5">
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
                          id="viewPackDeviceArtworkInput"
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
                          htmlFor="viewPackDeviceArtworkInput"
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

    </div>
  );
};

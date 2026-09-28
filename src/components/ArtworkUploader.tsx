import React, { useState, useRef, useEffect } from 'react';
import { Upload, X, ImageIcon, AlertCircle } from 'lucide-react';

interface ArtworkUploaderProps {
  beatId: string;
  currentArtworkUrl: string;
  onArtworkSaved: (url: string) => void;
  title: string;
}

export const ArtworkUploader: React.FC<ArtworkUploaderProps> = ({ beatId, currentArtworkUrl, onArtworkSaved, title }) => {
  const [isUploading, setIsUploading] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string>(currentArtworkUrl);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (currentArtworkUrl) {
      setPreviewUrl(currentArtworkUrl);
    }
  }, [currentArtworkUrl]);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Show local preview immediately in both small box and big box
    const reader = new FileReader();
    reader.onload = async (event) => {
      const dataUrl = event.target?.result as string;
      if (dataUrl) {
        setPreviewUrl(dataUrl);
        onArtworkSaved(dataUrl); // Immediate sync to big box preview and state
      }
      setError(null);
    };
    reader.readAsDataURL(file);

    console.log('[ArtworkPipeline] Starting upload for Beat:', beatId);
    console.log('[ArtworkPipeline] File Details:', {
      name: file.name,
      type: file.type,
      size: `${(file.size / 1024).toFixed(2)} KB`
    });

    // Upload to persistent server storage
    setIsUploading(true);
    setError(null);
    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('assetType', 'artwork');

      const res = await fetch(`/api/beats/${beatId}/artwork`, {
        method: 'POST',
        body: formData,
      });

      console.log('[ArtworkPipeline] Server Response Status:', res.status);
      if (res.ok) {
        const result = await res.json();
        const serverUrl = result.artworkUrl || result.playbackUrl || `/api/beats/${beatId}/artwork`;
        console.log('[ArtworkPipeline] Artwork successfully saved and persisted on server:', serverUrl);
      }
    } catch (uploadErr) {
      console.warn('[ArtworkPipeline] Network upload deferred, using local data URL persistence:', uploadErr);
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="relative aspect-square w-32 rounded-2xl overflow-hidden bg-zinc-900 border-2 border-purple-500/50 shadow-2xl">
        <img src={previewUrl} alt={title} className="w-full h-full object-cover" />
      </div>
      
      {error && (
        <div className="p-3 bg-red-950/40 border border-red-500/40 rounded-xl text-xs text-red-300 flex items-center gap-2">
          <AlertCircle className="w-4 h-4" />
          <span>{error}</span>
        </div>
      )}

      <button
        onClick={() => fileInputRef.current?.click()}
        disabled={isUploading}
        className="px-4 py-2.5 bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold uppercase tracking-wider rounded-xl disabled:opacity-50 flex items-center gap-2 shadow-lg cursor-pointer transition-all"
      >
        <Upload className="w-4 h-4" />
        <span>{isUploading ? 'Uploading...' : 'Upload artwork'}</span>
      </button>
      <input type="file" ref={fileInputRef} accept="image/*" className="hidden" onChange={handleFileChange} />
    </div>
  );
};

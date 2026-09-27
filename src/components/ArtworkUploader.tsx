import React, { useState, useRef } from 'react';
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

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Show local preview immediately
    const reader = new FileReader();
    reader.onload = (e) => {
      setPreviewUrl(e.target?.result as string);
      setError(null);
    };
    reader.readAsDataURL(file);

    // Logging initial operation
    console.log('[ArtworkPipeline] Starting upload for Beat:', beatId);
    console.log('[ArtworkPipeline] File Details:', {
      name: file.name,
      type: file.type,
      size: `${(file.size / 1024).toFixed(2)} KB`
    });

    // Upload
    setIsUploading(true);
    setError(null);
    try {
      const formData = new FormData();
      formData.append('file', file); // Field name must match upload.single('file')
      formData.append('assetType', 'artwork');

      const res = await fetch(`/api/beats/${beatId}/upload`, {
        method: 'POST',
        body: formData,
      });

      console.log('[ArtworkPipeline] Server Response Status:', res.status);
      
      const result = await res.json();
      console.log('[ArtworkPipeline] Server Response Body:', result);

      if (!res.ok) {
        throw new Error(result.error || 'Artwork upload failed');
      }

      const newUrl = result.playbackUrl || result.iaUrl;
      if (!newUrl) {
        throw new Error('Upload successful but URL missing in response');
      }

      console.log('[ArtworkPipeline] Artwork successfully saved and associated with beat.');
      onArtworkSaved(newUrl);
    } catch (err: any) {
      console.error('[ArtworkPipeline] Fatal Error:', err);
      setError(`${err.name}: ${err.message}`);
      
      // Keep existing artwork on failure as requested
      setPreviewUrl(currentArtworkUrl);
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="relative aspect-square w-32 rounded-2xl overflow-hidden bg-zinc-900 border border-zinc-700">
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
        className="px-4 py-2 bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold uppercase rounded-xl disabled:opacity-50 flex items-center gap-2"
      >
        {isUploading ? 'Uploading...' : 'Edit Artwork'}
      </button>
      <input type="file" ref={fileInputRef} accept="image/*" className="hidden" onChange={handleFileChange} />
    </div>
  );
};

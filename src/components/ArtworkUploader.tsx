import React, { useState, useRef } from 'react';
import { Upload, X, ImageIcon, AlertCircle } from 'lucide-react';

interface ArtworkUploaderProps {
  currentArtworkUrl: string;
  onArtworkSaved: (url: string) => void;
  title: string;
}

export const ArtworkUploader: React.FC<ArtworkUploaderProps> = ({ currentArtworkUrl, onArtworkSaved, title }) => {
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

    // Upload
    setIsUploading(true);
    setError(null);
    try {
      const formData = new FormData();
      formData.append('audioFile', file);
      formData.append('fileName', file.name);
      formData.append('mediaType', file.type);

      const res = await fetch('/api/storage/upload', {
        method: 'POST',
        body: formData,
      });

      if (!res.ok) throw new Error('Artwork upload failed');

      const result = await res.json();
      const newUrl = result.iaUrl || result.playbackUrl;
      if (!newUrl) throw new Error('Upload successful but URL missing');

      onArtworkSaved(newUrl);
    } catch (err: any) {
      console.error('Artwork upload error:', err);
      setError(err.message || 'Failed to save artwork');
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

import React from 'react';
import { 
  Music, Headphones, Sparkles, TrendingUp, 
  Video, FileText, Users, ExternalLink 
} from 'lucide-react';

interface ServiceCardProps {
  title: string;
  description: string;
  usefulFor: string;
  link: string;
  icon: any;
}

const ServiceCard: React.FC<ServiceCardProps> = ({ title, description, usefulFor, link, icon: Icon }) => (
  <div className="bg-zinc-950 border border-zinc-800 rounded-3xl p-6 flex flex-col space-y-4 hover:border-purple-500/50 shadow-xl transition-all">
    <div className="w-12 h-12 rounded-2xl bg-zinc-900 border border-zinc-800 flex items-center justify-center">
      <Icon className="w-6 h-6 text-purple-400" />
    </div>
    <h3 className="font-brand font-black text-lg text-white uppercase">{title}</h3>
    <p className="text-xs text-zinc-400 leading-relaxed flex-grow">{description}</p>
    <div className="text-[10px] font-mono text-zinc-500 pt-2 border-t border-zinc-900">
      <span className="text-zinc-400 block mb-1">USEFUL FOR:</span>
      {usefulFor}
    </div>
    <a 
      href={link} 
      target="_blank" 
      rel="noopener noreferrer"
      className="w-full py-3 bg-purple-600 hover:bg-purple-500 text-white font-extrabold text-xs uppercase rounded-2xl text-center flex items-center justify-center gap-2 cursor-pointer"
    >
      Visit Service <ExternalLink className="w-3 h-3" />
    </a>
  </div>
);

export const MusicServicesHub: React.FC = () => {
  const services = [
    { title: 'Distribution', description: 'Get your music onto Spotify, Apple Music, and all major streaming platforms.', usefulFor: 'Releasing singles, EPs, and albums.', link: 'https://distrokid.com', icon: Music },
    { title: 'Mixing & Mastering', description: 'Professional audio engineers to polish your final track mix and master.', usefulFor: 'Radio-ready streaming quality.', link: 'https://soundbetter.com', icon: Headphones },
    { title: 'Cover Art', description: 'Design tools and artists to create stunning visuals for your releases.', usefulFor: 'Brand identity and eye-catching artwork.', link: 'https://canva.com', icon: Sparkles },
    { title: 'Marketing & Promotion', description: 'Platforms to get your music in front of playlist curators and blogs.', usefulFor: 'Increasing listener base and stream counts.', link: 'https://submithub.com', icon: TrendingUp },
    { title: 'Music Videos', description: 'Tools for editing footage and creating engaging visualizers.', usefulFor: 'Social media clips and YouTube video content.', link: 'https://pexels.com', icon: Video },
    { title: 'Publishing / PRO', description: 'Collect performance royalties and register your copyrighted works.', usefulFor: 'Protecting rights and getting paid.', link: 'https://songtrust.com', icon: FileText },
    { title: 'Artist Resources', description: 'Network for finding collaborators and specialized industry help.', usefulFor: 'Building your team and expanding capabilities.', link: 'https://soundbetter.com', icon: Users },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 animate-fadeIn">
      {services.map((service) => (
        <ServiceCard key={service.title} {...service} />
      ))}
    </div>
  );
};

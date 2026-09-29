import React from 'react';
import { MusicServicesHub } from '../components/MusicServicesHub';
import { 
  Users, Cpu, Building2, Sliders, Radio, Sparkles 
} from 'lucide-react';

interface ServicesViewProps {
  currencySymbol: string;
  onNavigateToBrowse: () => void;
  onAddToCart?: (item: any) => void;
}

export const ServicesView: React.FC<ServicesViewProps> = ({ currencySymbol, onNavigateToBrowse }) => {
  return (
    <div className="w-full max-w-7xl mx-auto space-y-12 pb-24 text-left font-sans">
      
      {/* Hero */}
      <div className="relative rounded-3xl overflow-hidden bg-gradient-to-r from-purple-950 via-zinc-900 to-black border border-purple-500/30 p-8 sm:p-12 shadow-2xl">
        <h1 className="text-4xl font-black text-white uppercase font-brand">PRO SERVICES HUB</h1>
        <p className="text-zinc-400 mt-2 max-w-2xl">Bespoke audio services and essential industry tools for artists and managers.</p>
      </div>

      {/* Music Services Hub (Requested Hub) */}
      <section className="space-y-6">
        <h2 className="text-2xl font-bold text-white uppercase">Music Services</h2>
        <MusicServicesHub />
      </section>

      {/* Existing Tools (Simplified) */}
      <section className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-zinc-950 border border-zinc-800 rounded-3xl p-6">
          <h3 className="text-lg font-bold text-white flex items-center gap-2 mb-4"><Users className="text-purple-400"/> Artist Management</h3>
          <p className="text-sm text-zinc-400">Roster management and revenue split tools.</p>
        </div>
        <div className="bg-zinc-950 border border-zinc-800 rounded-3xl p-6">
          <h3 className="text-lg font-bold text-white flex items-center gap-2 mb-4"><Cpu className="text-purple-400"/> AI Developer Tools</h3>
          <p className="text-sm text-zinc-400">Provenance registry and training opt-in tools.</p>
        </div>
      </section>
      
    </div>
  );
};

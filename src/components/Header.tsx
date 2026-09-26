import React, { useState, useEffect } from 'react';
import { ShoppingBag, Menu, X, Sparkles, User, Volume2, Search, Music, Plus } from 'lucide-react';
import { CartItem } from '../types';

interface HeaderProps {
  currentView: string;
  setCurrentView: (view: string) => void;
  cart: CartItem[];
  setIsCartOpen: (open: boolean) => void;
  currencySymbol: string;
  onOpenAudioPlayer?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  currentView,
  setCurrentView,
  cart,
  setIsCartOpen,
  currencySymbol,
  onOpenAudioPlayer,
}) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 20) {
        setScrolled(true);
      } else {
        setScrolled(false);
      }
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <header
      className={`sticky top-0 z-40 transition-all duration-300 border-b ${
        scrolled
          ? 'bg-black/95 backdrop-blur-xl border-zinc-900 py-1 shadow-2xl shadow-purple-950/20'
          : 'bg-zinc-950/90 backdrop-blur-md border-zinc-900/80 py-2'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-14 sm:h-16 flex items-center justify-between">
        {/* Left: Brand Wordmark */}
        <button
          onClick={() => {
            setCurrentView('home');
            window.scrollTo({ top: 0, behavior: 'smooth' });
          }}
          className="flex items-center gap-2.5 text-left group focus:outline-none"
        >
          <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-purple-600 via-purple-900 to-black flex items-center justify-center shadow-lg border border-purple-500/30 group-hover:border-purple-400 transition-all">
            <Volume2 className="w-4 h-4 text-white" />
          </div>
          <div className="flex flex-col">
            <span className="font-brand font-black text-lg tracking-widest text-white uppercase group-hover:text-purple-300 transition-colors">
              CASHMERE KID$
            </span>
            <span className="text-[9px] font-mono text-zinc-500 tracking-wider hidden sm:block">OFFICIAL VAULT</span>
          </div>
        </button>

        {/* Center/Right Primary Navigation Links */}
        <nav className="hidden lg:flex items-center gap-6 text-xs font-semibold text-zinc-400">
          <button
            onClick={() => setCurrentView('home')}
            className={`hover:text-white transition-colors py-1 ${
              currentView === 'home' ? 'text-white font-extrabold border-b-2 border-purple-500' : ''
            }`}
          >
            HOME
          </button>
          <button
            onClick={() => setCurrentView('browse')}
            className={`hover:text-white transition-colors py-1 ${
              currentView === 'browse' ? 'text-white font-extrabold border-b-2 border-purple-500' : ''
            }`}
          >
            BEATS
          </button>
          <button
            onClick={() => setCurrentView('charts')}
            className={`hover:text-white transition-colors py-1 ${
              currentView === 'charts' ? 'text-purple-300 font-extrabold border-b-2 border-purple-500' : ''
            }`}
          >
            FEATURED
          </button>
          <button
            onClick={() => setCurrentView('collections')}
            className={`hover:text-white transition-colors py-1 ${
              currentView === 'collections' ? 'text-white font-extrabold border-b-2 border-purple-500' : ''
            }`}
          >
            COLLECTIONS
          </button>
          <button
            onClick={() => setCurrentView('merch')}
            className={`hover:text-white transition-colors py-1 ${
              currentView === 'merch' ? 'text-white font-extrabold border-b-2 border-purple-500' : ''
            }`}
          >
            MERCH
          </button>
          <button
            onClick={() => setCurrentView('beatpacks')}
            className={`hover:text-white transition-colors py-1 ${
              currentView === 'beatpacks' ? 'text-white font-extrabold border-b-2 border-purple-500' : ''
            }`}
          >
            BEAT PACKS
          </button>
          <button
            onClick={() => setCurrentView('search-by-sound')}
            className={`hover:text-white transition-colors py-1 ${
              currentView === 'search-by-sound' ? 'text-purple-300 font-extrabold border-b-2 border-purple-500' : ''
            }`}
          >
            SEARCH BY SOUND
          </button>
          <button
            onClick={() => {
              if (onOpenAudioPlayer) {
                onOpenAudioPlayer();
              }
            }}
            className="hover:text-white transition-colors py-1 text-purple-300 font-extrabold flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-purple-950/60 border border-purple-500/30 hover:border-purple-400/60 shadow-sm"
            title="Open Audio Player"
          >
            <Volume2 className="w-3.5 h-3.5 text-purple-400" />
            <span>AUDIO PLAYER</span>
          </button>
        </nav>

        {/* Right Area: Search, Cart, Upload Hub, Profile, Studio */}
        <div className="hidden md:flex items-center gap-3">
          {/* Quick Search */}
          <button
            onClick={() => setCurrentView('browse')}
            className="p-2 text-zinc-400 hover:text-white transition-colors rounded-xl hover:bg-zinc-900"
            title="Search Vault"
          >
            <Search className="w-4 h-4" />
          </button>

          {/* Cart Drawer Toggle */}
          <button
            onClick={() => setIsCartOpen(true)}
            className="relative p-2 text-zinc-300 hover:text-white transition-colors rounded-xl hover:bg-zinc-900 flex items-center gap-1"
            title="Cart"
          >
            <ShoppingBag className="w-4 h-4" />
            {cart.length > 0 && (
              <span className="absolute -top-1 -right-1 w-4 h-4 bg-purple-600 text-white font-extrabold text-[10px] rounded-full flex items-center justify-center shadow">
                {cart.length}
              </span>
            )}
          </button>

          {/* Upload Hub Button */}
          <button
            onClick={() => setCurrentView('uploader')}
            className={`px-3 py-1.5 rounded-xl text-xs font-extrabold transition-all flex items-center gap-1.5 border ${
              currentView === 'uploader'
                ? 'bg-purple-950 text-purple-200 border-purple-400 ring-1 ring-purple-400/40'
                : 'bg-zinc-900/80 hover:bg-zinc-850 text-zinc-300 border-zinc-800'
            }`}
            title="Open Upload Hub"
          >
            <Plus className="w-3.5 h-3.5 text-purple-400" />
            <span>Upload</span>
          </button>

          {/* Profile User Button */}
          <button
            onClick={() => setCurrentView('profile')}
            className={`flex items-center gap-2 pl-2.5 border-l border-zinc-800 text-xs font-semibold transition-colors group ${
              currentView === 'profile' ? 'text-purple-300 font-bold' : 'text-zinc-300 hover:text-white'
            }`}
          >
            <div className="w-7 h-7 rounded-full bg-purple-950 border border-purple-500/40 flex items-center justify-center text-purple-300 group-hover:border-purple-400">
              <User className="w-3.5 h-3.5" />
            </div>
            <span className="hidden xl:inline">Profile</span>
          </button>

          {/* Studio Dashboard Button */}
          <button
            onClick={() => setCurrentView('dashboard')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-extrabold transition-all flex items-center gap-1.5 border shadow-md ${
              currentView === 'dashboard'
                ? 'bg-purple-600 text-white border-purple-400 shadow-purple-950 ring-1 ring-purple-400/50'
                : 'bg-zinc-900 hover:bg-zinc-800 text-purple-300 border-purple-500/30'
            }`}
            title="Open Studio Dashboard"
          >
            <Sparkles className="w-3.5 h-3.5 text-purple-400" />
            <span>Studio</span>
          </button>
        </div>

        {/* Mobile controls */}
        <div className="flex md:hidden items-center gap-2">
          <button
            onClick={() => setCurrentView('dashboard')}
            className="px-2.5 py-1 rounded-lg bg-purple-950 border border-purple-500/40 text-purple-300 text-xs font-extrabold flex items-center gap-1"
          >
            <Sparkles className="w-3 h-3 text-purple-400" />
            <span>Studio</span>
          </button>
          <button
            onClick={() => setIsCartOpen(true)}
            className="relative p-2 text-white"
          >
            <ShoppingBag className="w-5 h-5" />
            {cart.length > 0 && (
              <span className="absolute -top-1 -right-1 w-4 h-4 bg-purple-600 text-white font-bold text-[10px] rounded-full flex items-center justify-center">
                {cart.length}
              </span>
            )}
          </button>
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-2 text-zinc-400 hover:text-white"
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-zinc-950 border-b border-zinc-800 px-6 py-4 space-y-3 text-xs font-extrabold text-zinc-300 animate-fadeIn">
          <button
            onClick={() => { setCurrentView('home'); setMobileMenuOpen(false); }}
            className={`block w-full text-left py-2 ${currentView === 'home' ? 'text-purple-400' : 'hover:text-white'}`}
          >
            HOME
          </button>
          <button
            onClick={() => { setCurrentView('browse'); setMobileMenuOpen(false); }}
            className={`block w-full text-left py-2 ${currentView === 'browse' ? 'text-purple-400' : 'hover:text-white'}`}
          >
            BEATS CATALOG
          </button>
          <button
            onClick={() => { setCurrentView('charts'); setMobileMenuOpen(false); }}
            className={`block w-full text-left py-2.5 ${currentView === 'charts' ? 'text-purple-400 font-extrabold' : 'hover:text-white'}`}
          >
            FEATURED & CHARTS
          </button>
          <button
            onClick={() => { setCurrentView('collections'); setMobileMenuOpen(false); }}
            className={`block w-full text-left py-2.5 ${currentView === 'collections' ? 'text-purple-400 font-extrabold' : 'hover:text-white'}`}
          >
            COLLECTIONS
          </button>
          <button
            onClick={() => { setCurrentView('merch'); setMobileMenuOpen(false); }}
            className={`block w-full text-left py-2.5 ${currentView === 'merch' ? 'text-purple-400 font-extrabold' : 'hover:text-white'}`}
          >
            MERCH
          </button>
          <button
            onClick={() => { setCurrentView('beatpacks'); setMobileMenuOpen(false); }}
            className={`block w-full text-left py-2.5 ${currentView === 'beatpacks' ? 'text-purple-400 font-extrabold' : 'hover:text-white'}`}
          >
            BEAT PACKS
          </button>
          <button
            onClick={() => { setCurrentView('search-by-sound'); setMobileMenuOpen(false); }}
            className={`block w-full text-left py-2.5 ${currentView === 'search-by-sound' ? 'text-purple-400 font-extrabold' : 'hover:text-white'}`}
          >
            SEARCH BY SOUND
          </button>
          <button
            onClick={() => {
              if (onOpenAudioPlayer) {
                onOpenAudioPlayer();
              }
              setMobileMenuOpen(false);
            }}
            className="block w-full text-left py-2.5 text-purple-300 font-extrabold flex items-center gap-2 hover:text-white"
          >
            <Volume2 className="w-4 h-4 text-purple-400" />
            <span>AUDIO PLAYER</span>
          </button>
          <button
            onClick={() => { setCurrentView('profile'); setMobileMenuOpen(false); }}
            className="block w-full text-left py-2 text-zinc-400 hover:text-white"
          >
            PRODUCER PROFILE
          </button>
          <button
            onClick={() => { setCurrentView('dashboard'); setMobileMenuOpen(false); }}
            className="block w-full text-left py-2 text-purple-400 hover:text-purple-300 font-extrabold flex items-center gap-1.5"
          >
            <Sparkles className="w-3.5 h-3.5 text-purple-400" />
            <span>STUDIO DASHBOARD</span>
          </button>
        </div>
      )}
    </header>
  );
};

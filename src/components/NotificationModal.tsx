import React, { useState, useEffect } from 'react';
import { X, Bell, BellOff, Smartphone, ShieldCheck, CheckSquare, Sparkles, HelpCircle, ArrowRight } from 'lucide-react';
import {
  isPushSupported,
  isIOS,
  isStandalone,
  getNotificationPermission,
  requestNotificationPermission,
  showLocalNotification,
  NotificationPreferences
} from '../utils/pushProvider';

interface NotificationModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const NotificationModal: React.FC<NotificationModalProps> = ({ isOpen, onClose }) => {
  const [supported, setSupported] = useState(true);
  const [iosDevice, setIosDevice] = useState(false);
  const [standaloneMode, setStandaloneMode] = useState(false);
  const [permission, setPermission] = useState<NotificationPermission>('default');
  const [preferences, setPreferences] = useState<NotificationPreferences>({
    newBeats: true,
    beatPurchases: true,
    beatPacks: true,
    announcements: true,
  });
  const [showIOSGuide, setShowIOSGuide] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  useEffect(() => {
    setSupported(isPushSupported());
    setIosDevice(isIOS());
    setStandaloneMode(isStandalone());
    setPermission(getNotificationPermission());

    const savedPrefs = localStorage.getItem('voodoo_notification_prefs');
    if (savedPrefs) {
      try {
        setPreferences(JSON.parse(savedPrefs));
      } catch (e) {
        console.error(e);
      }
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const savePreferences = (newPrefs: NotificationPreferences) => {
    setPreferences(newPrefs);
    localStorage.setItem('voodoo_notification_prefs', JSON.stringify(newPrefs));
    setSuccessMessage('Notification preferences updated successfully.');
    setTimeout(() => setSuccessMessage(null), 3000);
  };

  const handleTogglePref = (key: keyof NotificationPreferences) => {
    const updated = { ...preferences, [key]: !preferences[key] };
    savePreferences(updated);
  };

  const handleEnableNotifications = async () => {
    // WebKit require user deliberate click to invoke requestPermission
    if (iosDevice && !standaloneMode) {
      setShowIOSGuide(true);
      return;
    }

    try {
      const result = await requestNotificationPermission();
      setPermission(result);
      if (result === 'granted') {
        setSuccessMessage('Notifications enabled! A verification push was sent.');
        // Trigger a friendly standard-compliant verification visible push
        await showLocalNotification(
          'CASHMERE KID$ ACTIVE',
          'Phone push notifications are fully configured on this device!',
          '/checkout/result'
        );
      } else if (result === 'denied') {
        alert('Permission was denied. Please reset notification settings in your browser or system preferences to enable push.');
      }
    } catch (err) {
      console.error('[NotificationModal] Error enabling notifications:', err);
    }
  };

  const handleTurnOffNotifications = () => {
    // In standards Web Push, unregister or set permission mock to turn off
    const disabledPrefs = {
      newBeats: false,
      beatPurchases: false,
      beatPacks: false,
      announcements: false,
    };
    savePreferences(disabledPrefs);
    setSuccessMessage('Notifications disabled for this device.');
  };

  const handleTurnOnNotifications = () => {
    const enabledPrefs = {
      newBeats: true,
      beatPurchases: true,
      beatPacks: true,
      announcements: true,
    };
    savePreferences(enabledPrefs);
    if (permission === 'granted') {
      setSuccessMessage('All notification streams turned back on!');
    } else {
      handleEnableNotifications();
    }
  };

  const isFullyEnabled = permission === 'granted' && (preferences.newBeats || preferences.beatPurchases || preferences.beatPacks || preferences.announcements);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4 animate-fadeIn">
      <div className="w-full max-w-md bg-zinc-950 border border-purple-500/30 rounded-3xl p-6 sm:p-8 shadow-2xl relative space-y-6">
        
        {/* Close Button */}
        <button
          onClick={onClose}
          className="p-2 text-zinc-400 hover:text-white rounded-xl hover:bg-zinc-900 transition-colors absolute top-4 right-4"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header Icon & Title */}
        <div className="text-center space-y-2">
          <div className="w-14 h-14 rounded-full bg-purple-950 border border-purple-500/50 flex items-center justify-center mx-auto text-purple-400 shadow-lg">
            {isFullyEnabled ? <Bell className="w-6 h-6 animate-swing" /> : <BellOff className="w-6 h-6 text-zinc-500" />}
          </div>
          <div className="space-y-1">
            <span className="text-[10px] font-mono font-bold text-purple-400 uppercase tracking-widest block">STAY CONNECTED</span>
            <h3 className="text-xl font-brand font-black text-white uppercase tracking-tight">CUSTOMER PHONE ALERTS</h3>
            <p className="text-xs text-zinc-400 leading-relaxed font-sans max-w-xs mx-auto">
              Receive premium updates, verified licensing stems, and luxury drops directly on your Lock Screen.
            </p>
          </div>
        </div>

        {/* iOS standalone web app warning and instructions */}
        {iosDevice && !standaloneMode && (
          <div className="p-4 bg-purple-950/20 border border-purple-500/20 rounded-2xl text-xs space-y-2 text-left">
            <div className="flex items-center gap-2 font-bold text-purple-300">
              <Smartphone className="w-4 h-4 text-purple-400" />
              <span>iOS Home Screen Setup Required</span>
            </div>
            <p className="text-zinc-400 leading-relaxed text-[11px]">
              Apple WebKit rules require saving CASHMERE KID$ to your Home Screen before granting notification permission.
            </p>
            <button
              onClick={() => setShowIOSGuide(true)}
              className="text-purple-400 hover:underline font-bold text-[11px] flex items-center gap-1"
            >
              How to add to Home Screen <ArrowRight className="w-3 h-3" />
            </button>
          </div>
        )}

        {/* Notification Status Banner */}
        <div className="p-4 bg-zinc-900/60 border border-zinc-800 rounded-2xl text-xs text-left space-y-1">
          <div className="flex justify-between items-center">
            <span className="text-zinc-400">Browser Push Engine:</span>
            <span className={`font-mono font-bold px-2 py-0.5 rounded text-[10px] uppercase ${supported ? 'bg-emerald-950 text-emerald-400 border border-emerald-500/20' : 'bg-red-950 text-red-400 border border-red-500/20'}`}>
              {supported ? 'Supported' : 'Unsupported'}
            </span>
          </div>
          <div className="flex justify-between items-center pt-1.5 border-t border-zinc-800/60">
            <span className="text-zinc-400">Permission Status:</span>
            <span className={`font-mono font-bold px-2 py-0.5 rounded text-[10px] uppercase ${permission === 'granted' ? 'bg-purple-950 text-purple-300 border border-purple-500/20' : 'bg-zinc-800 text-zinc-400'}`}>
              {permission}
            </span>
          </div>
        </div>

        {successMessage && (
          <p className="text-xs text-center text-purple-300 font-bold bg-purple-950/40 border border-purple-500/30 py-2 px-3 rounded-xl animate-fadeIn">
            {successMessage}
          </p>
        )}

        {/* Enable / Disable Button */}
        <div className="space-y-2">
          {permission !== 'granted' ? (
            <button
              onClick={handleEnableNotifications}
              className="w-full py-3.5 bg-gradient-to-r from-purple-600 via-violet-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-extrabold text-xs uppercase tracking-wider rounded-2xl shadow-xl shadow-purple-950/40 flex items-center justify-center gap-2 cursor-pointer"
            >
              <Bell className="w-4 h-4" />
              <span>Enable Phone Notifications</span>
            </button>
          ) : (
            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={handleTurnOffNotifications}
                className="py-3 bg-zinc-900 hover:bg-zinc-850 border border-zinc-800 text-zinc-400 hover:text-white font-bold text-xs uppercase rounded-2xl transition-all cursor-pointer text-center"
              >
                Turn Off
              </button>
              <button
                onClick={handleTurnOnNotifications}
                className="py-3 bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs uppercase rounded-2xl transition-all cursor-pointer text-center"
              >
                Turn Back On
              </button>
            </div>
          )}
        </div>

        {/* Preference Checkboxes */}
        {permission === 'granted' && (
          <div className="space-y-3.5 pt-4 border-t border-zinc-900 text-left">
            <h4 className="text-[10px] font-mono font-bold text-zinc-500 uppercase tracking-widest">Notification Streams</h4>
            <div className="space-y-2.5">
              {[
                { key: 'newBeats', label: 'New Instrumentals', desc: 'Alerts when a premium premium beat drops.' },
                { key: 'beatPurchases', label: 'Stems & License Delivery', desc: 'Instant alerts once checkout payment clears.' },
                { key: 'beatPacks', label: 'Beat Pack Bundle Drops', desc: 'Alerts when mega discount stem packs release.' },
                { key: 'announcements', label: 'Exclusive Studio Announcements', desc: 'Producer discounts, campaigns, and news.' },
              ].map((pref) => {
                const checked = preferences[pref.key as keyof NotificationPreferences];
                return (
                  <button
                    key={pref.key}
                    onClick={() => handleTogglePref(pref.key as keyof NotificationPreferences)}
                    className="w-full flex items-start gap-3 p-2 hover:bg-zinc-900/40 rounded-xl transition-colors text-left"
                  >
                    <div className={`mt-0.5 w-4 h-4 rounded border flex items-center justify-center shrink-0 transition-colors ${checked ? 'bg-purple-600 border-purple-500 text-white' : 'border-zinc-700 bg-zinc-950'}`}>
                      {checked && <CheckSquare className="w-3.5 h-3.5" />}
                    </div>
                    <div className="space-y-0.5">
                      <div className="text-xs font-bold text-zinc-100">{pref.label}</div>
                      <div className="text-[10px] text-zinc-500">{pref.desc}</div>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* iOS Safari Guide Overlay Modal */}
        {showIOSGuide && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 p-4 animate-fadeIn">
            <div className="w-full max-w-sm rounded-3xl bg-zinc-900 border border-zinc-800 p-6 shadow-2xl space-y-5 text-center relative">
              <button
                onClick={() => setShowIOSGuide(false)}
                className="p-1.5 text-zinc-400 hover:text-white rounded-lg hover:bg-zinc-800 absolute top-4 right-4"
              >
                <X className="w-4 h-4" />
              </button>

              <div className="w-12 h-12 rounded-xl bg-purple-950/60 border border-purple-500/40 flex items-center justify-center mx-auto text-purple-400">
                <Smartphone className="w-6 h-6" />
              </div>

              <div className="space-y-2">
                <h4 className="text-md font-brand font-black text-white uppercase tracking-tight">INSTALL ON IPHONE / IPAD</h4>
                <p className="text-xs text-zinc-400 leading-relaxed font-sans">
                  Follow these Safari actions to register standard lock-screen notifications for CASHMERE KID$:
                </p>
              </div>

              <div className="bg-zinc-950 p-4 rounded-2xl text-left text-xs text-zinc-300 space-y-3 font-medium">
                <div className="flex items-center gap-2">
                  <span className="w-5 h-5 rounded-full bg-purple-950 border border-purple-500/40 text-[10px] font-bold text-purple-300 flex items-center justify-center shrink-0">1</span>
                  <span>Tap the <span className="font-bold text-white text-purple-300">Share</span> button in Safari's lower toolbar.</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-5 h-5 rounded-full bg-purple-950 border border-purple-500/40 text-[10px] font-bold text-purple-300 flex items-center justify-center shrink-0">2</span>
                  <span>Scroll down and tap <span className="font-bold text-white text-purple-300">Add to Home Screen</span>.</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-5 h-5 rounded-full bg-purple-950 border border-purple-500/40 text-[10px] font-bold text-purple-300 flex items-center justify-center shrink-0">3</span>
                  <span>Launch from your Home Screen & tap the bell icon.</span>
                </div>
              </div>

              <button
                onClick={() => setShowIOSGuide(false)}
                className="w-full py-2.5 bg-zinc-800 hover:bg-zinc-750 text-white text-xs font-bold rounded-xl transition-all"
              >
                Got It
              </button>
            </div>
          </div>
        )}

      </div>
    </div>
  );
};

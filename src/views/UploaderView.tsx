import React from 'react';
import { Beat, BeatPack } from '../types';
import { BeatUploadingSystem } from '../components/BeatUploadingSystem';

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
}) => {
  return (
    <div className="min-h-screen py-4">
      <BeatUploadingSystem
        onPublishBeat={onPublishBeat}
        onPublishBeatPack={onPublishBeatPack}
        currencySymbol={currencySymbol}
        beats={beats}
        onExitToDashboard={onExitToDashboard}
        onNavigateToBrowse={onNavigateToBrowse}
      />
    </div>
  );
};

/**
 * CASHMERE KID$ High-Resolution Plaque Canvas Exporter
 * Generates pristine 1200x1600 digital master plaque artwork with zero UI elements
 */

import { PlaqueMilestone } from './hallOfFameData';

export function exportPlaqueHighResImage(
  milestone: PlaqueMilestone,
  unlocked: boolean,
  unlockDate: string | null
): void {
  const canvas = document.createElement('canvas');
  const width = 1200;
  const height = 1600;
  canvas.width = width;
  canvas.height = height;

  const ctx = canvas.getContext('2d');
  if (!ctx) return;

  // 1. Deep Obsidian Foundation Canvas
  const bgGrad = ctx.createRadialGradient(width / 2, height / 2, 100, width / 2, height / 2, 900);
  bgGrad.addColorStop(0, '#110c1c');
  bgGrad.addColorStop(0.5, '#09070d');
  bgGrad.addColorStop(1, '#030205');
  ctx.fillStyle = bgGrad;
  ctx.fillRect(0, 0, width, height);

  // Subtle background mesh lines
  ctx.strokeStyle = 'rgba(168, 85, 247, 0.04)';
  ctx.lineWidth = 1;
  for (let y = 0; y < height; y += 40) {
    ctx.beginPath();
    ctx.moveTo(0, y);
    ctx.lineTo(width, y);
    ctx.stroke();
  }

  // 2. Outer Plaque Frame Border
  const framePadding = 45;
  ctx.save();
  ctx.strokeStyle = unlocked
    ? milestone.isGrammyHorn
      ? '#f59e0b'
      : milestone.badgeType === 'DIAMOND' || milestone.badgeType === 'ULTRA_DIAMOND'
      ? '#38bdf8'
      : '#a855f7'
    : '#27272a';
  ctx.lineWidth = 12;
  ctx.strokeRect(
    framePadding,
    framePadding,
    width - framePadding * 2,
    height - framePadding * 2
  );

  // Inner Metallic Bevel
  ctx.strokeStyle = unlocked ? 'rgba(255, 255, 255, 0.15)' : 'rgba(255, 255, 255, 0.05)';
  ctx.lineWidth = 2;
  ctx.strokeRect(
    framePadding + 16,
    framePadding + 16,
    width - (framePadding + 16) * 2,
    height - (framePadding + 16) * 2
  );
  ctx.restore();

  // 3. Header Branding Text
  ctx.textAlign = 'center';
  ctx.fillStyle = '#ffffff';
  ctx.font = '900 52px "Cinzel", "Montserrat", sans-serif';
  ctx.fillText('CASHMERE KID$', width / 2, 170);

  ctx.fillStyle = unlocked ? '#c084fc' : '#71717a';
  ctx.font = '700 22px "JetBrains Mono", monospace';
  ctx.fillText('OFFICIAL DIGITAL MASTER RECORD CERTIFICATION', width / 2, 215);

  // 4. Center Metallic Vinyl Record
  const centerX = width / 2;
  const centerY = 620;
  const recordRadius = 280;

  // Outer Vinyl Rim
  ctx.save();
  ctx.beginPath();
  ctx.arc(centerX, centerY, recordRadius, 0, Math.PI * 2);
  const vinylGrad = ctx.createRadialGradient(
    centerX - 50,
    centerY - 50,
    20,
    centerX,
    centerY,
    recordRadius
  );
  vinylGrad.addColorStop(0, '#27272a');
  vinylGrad.addColorStop(0.5, '#09090b');
  vinylGrad.addColorStop(1, '#18181b');
  ctx.fillStyle = vinylGrad;
  ctx.fill();

  // Vinyl Grooves Ring Texture
  for (let r = 110; r < recordRadius - 10; r += 12) {
    ctx.beginPath();
    ctx.arc(centerX, centerY, r, 0, Math.PI * 2);
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.06)';
    ctx.lineWidth = 1.5;
    ctx.stroke();
  }

  // Metallic Record Sheen Light Reflection
  const sheenGrad = ctx.createLinearGradient(
    centerX - recordRadius,
    centerY - recordRadius,
    centerX + recordRadius,
    centerY + recordRadius
  );
  sheenGrad.addColorStop(0, 'rgba(255, 255, 255, 0.15)');
  sheenGrad.addColorStop(0.4, 'rgba(255, 255, 255, 0.01)');
  sheenGrad.addColorStop(0.6, 'rgba(255, 255, 255, 0.01)');
  sheenGrad.addColorStop(1, 'rgba(255, 255, 255, 0.12)');
  ctx.fillStyle = sheenGrad;
  ctx.beginPath();
  ctx.arc(centerX, centerY, recordRadius, 0, Math.PI * 2);
  ctx.fill();

  // Vinyl Center Label
  const labelRadius = 90;
  ctx.beginPath();
  ctx.arc(centerX, centerY, labelRadius, 0, Math.PI * 2);
  const labelGrad = ctx.createRadialGradient(
    centerX,
    centerY,
    10,
    centerX,
    centerY,
    labelRadius
  );
  if (milestone.isGrammyHorn) {
    labelGrad.addColorStop(0, '#fef08a');
    labelGrad.addColorStop(1, '#b45309');
  } else if (milestone.badgeType === 'DIAMOND' || milestone.badgeType === 'ULTRA_DIAMOND') {
    labelGrad.addColorStop(0, '#e0f2fe');
    labelGrad.addColorStop(1, '#0284c7');
  } else {
    labelGrad.addColorStop(0, '#f3e8ff');
    labelGrad.addColorStop(1, '#6b21a8');
  }
  ctx.fillStyle = labelGrad;
  ctx.fill();

  // Vinyl Center Hole
  ctx.beginPath();
  ctx.arc(centerX, centerY, 14, 0, Math.PI * 2);
  ctx.fillStyle = '#030205';
  ctx.fill();
  ctx.strokeStyle = 'rgba(255, 255, 255, 0.4)';
  ctx.lineWidth = 2;
  ctx.stroke();

  // Center Gramophone Horn Emblem if GRAMMY HORN
  if (milestone.isGrammyHorn) {
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 36px sans-serif';
    ctx.fillText('🎺', centerX, centerY - 25);
  }
  ctx.restore();

  // 5. Bottom Metallic Title Plate
  const plateX = 140;
  const plateY = 1000;
  const plateW = width - plateX * 2;
  const plateH = 460;

  // Plate Base
  ctx.save();
  ctx.fillStyle = '#0f0d1a';
  ctx.fillRect(plateX, plateY, plateW, plateH);

  // Plate Border
  ctx.strokeStyle = unlocked
    ? milestone.isGrammyHorn
      ? '#fbbf24'
      : milestone.badgeType === 'DIAMOND' || milestone.badgeType === 'ULTRA_DIAMOND'
      ? '#38bdf8'
      : '#a855f7'
    : '#3f3f46';
  ctx.lineWidth = 3;
  ctx.strokeRect(plateX, plateY, plateW, plateH);

  // Plate Screws (4 corners)
  const screws = [
    [plateX + 20, plateY + 20],
    [plateX + plateW - 20, plateY + 20],
    [plateX + 20, plateY + plateH - 20],
    [plateX + plateW - 20, plateY + plateH - 20],
  ];
  screws.forEach(([sx, sy]) => {
    ctx.beginPath();
    ctx.arc(sx, sy, 6, 0, Math.PI * 2);
    ctx.fillStyle = '#27272a';
    ctx.fill();
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.3)';
    ctx.lineWidth = 1;
    ctx.stroke();
  });

  // Plate Text Details
  ctx.textAlign = 'center';

  // "PRESENTED TO CASHMERE KID$"
  ctx.fillStyle = '#a1a1aa';
  ctx.font = '700 20px "JetBrains Mono", monospace';
  ctx.fillText('PRESENTED TO PRODUCER', width / 2, plateY + 70);

  ctx.fillStyle = '#ffffff';
  ctx.font = '900 38px "Cinzel", "Montserrat", sans-serif';
  ctx.fillText('CASHMERE KID$', width / 2, plateY + 115);

  // "IN RECOGNITION OF OVER [SUBTITLE]"
  ctx.fillStyle = '#d4d4d8';
  ctx.font = '600 20px "JetBrains Mono", monospace';
  ctx.fillText(`IN RECOGNITION OF OVER ${milestone.subtitle}`, width / 2, plateY + 175);

  // Achievement Title
  ctx.fillStyle = unlocked
    ? milestone.isGrammyHorn
      ? '#fbbf24'
      : milestone.badgeType === 'DIAMOND' || milestone.badgeType === 'ULTRA_DIAMOND'
      ? '#38bdf8'
      : '#e9d5ff'
    : '#71717a';
  ctx.font = '900 44px "Cinzel", sans-serif';
  ctx.fillText(milestone.title.toUpperCase(), width / 2, plateY + 245);

  // Grammy Horn Disclaimer / Clarification Text
  if (milestone.isGrammyHorn) {
    ctx.fillStyle = '#fef08a';
    ctx.font = 'italic 500 16px sans-serif';
    ctx.fillText(
      'CASHMERE KID$ Independent Achievement Award. Not affiliated with The Recording Academy.',
      width / 2,
      plateY + 290
    );
  }

  // Serial Number & Unlock Timestamp
  ctx.fillStyle = '#71717a';
  ctx.font = '500 18px "JetBrains Mono", monospace';
  ctx.fillText(`SERIAL NO: ${milestone.serialNumber}`, width / 2, plateY + 345);

  ctx.fillStyle = unlocked ? '#4ade80' : '#ef4444';
  ctx.font = '800 20px "JetBrains Mono", monospace';
  const statusStr = unlocked
    ? `UNLOCKED: ${unlockDate || '2026-09-26'}`
    : 'STATUS: NOT YET ACHIEVED (LOCKED)';
  ctx.fillText(statusStr, width / 2, plateY + 395);

  ctx.restore();

  // 6. Trigger Browser File Download
  const fileName = `cashmere_kids_plaque_${milestone.id}_${unlocked ? 'unlocked' : 'locked'}.png`;
  const dataUrl = canvas.toDataURL('image/png');
  const a = document.createElement('a');
  a.href = dataUrl;
  a.download = fileName;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
}

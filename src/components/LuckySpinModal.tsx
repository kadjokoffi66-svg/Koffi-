import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { formatFCFA } from '../utils/formatters';
import { 
  X, 
  ArrowLeft, 
  Volume2, 
  VolumeX, 
  Sparkles, 
  Gift, 
  Award, 
  Coins,
  RotateCw
} from 'lucide-react';

interface WheelSector {
  amount: number;
  label: string;
  color: string;
  textColor: string;
}

const SECTORS: WheelSector[] = [
  { amount: 50, label: 'FCFA 50', color: '#38bdf8', textColor: '#0f172a' },
  { amount: 100, label: 'FCFA 100', color: '#ffedd5', textColor: '#9a3412' },
  { amount: 500, label: 'FCFA 500', color: '#38bdf8', textColor: '#0f172a' },
  { amount: 1000, label: 'FCFA 1000', color: '#ffedd5', textColor: '#9a3412' },
  { amount: 5000, label: 'FCFA 5000', color: '#38bdf8', textColor: '#0f172a' },
  { amount: 10000, label: 'FCFA 10000', color: '#ffedd5', textColor: '#9a3412' },
  { amount: 50000, label: 'FCFA 50000', color: '#38bdf8', textColor: '#0f172a' },
  { amount: 100000, label: 'FCFA 100000', color: '#ffedd5', textColor: '#9a3412' },
];

export const LuckySpinModal: React.FC = () => {
  const { 
    isLuckySpinModalOpen, 
    setIsLuckySpinModalOpen, 
    user, 
    spinWheel,
    showToast 
  } = useApp();

  const [isSpinning, setIsSpinning] = useState(false);
  const [rotation, setRotation] = useState(0);
  const [isMuted, setIsMuted] = useState(false);
  const [lastWin, setLastWin] = useState<number | null>(null);

  if (!isLuckySpinModalOpen) return null;

  const spinsLeft = user?.luckySpinsCount ?? 10;

  const handleSpin = async () => {
    if (isSpinning) return;
    if (spinsLeft <= 0) {
      showToast('Aucun tirage disponible. Achetez un produit pour obtenir des chances !', 'warning');
      return;
    }

    setIsSpinning(true);
    setLastWin(null);

    // Random prize sector index
    const prizeIndex = Math.floor(Math.random() * SECTORS.length);
    const selectedSector = SECTORS[prizeIndex];

    // Sector angle calculation: 360 / 8 = 45 deg per sector
    const sectorAngle = 360 / SECTORS.length;
    // Target position so pointer at top points to the winning slice
    const extraSpins = 360 * 5; // 5 full revolutions
    const targetAngle = extraSpins + (360 - (prizeIndex * sectorAngle + sectorAngle / 2));

    setRotation((prev) => prev + targetAngle);

    setTimeout(async () => {
      setIsSpinning(false);
      setLastWin(selectedSector.amount);
      await spinWheel();
    }, 4000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-gradient-to-b from-indigo-900 via-blue-950 to-slate-900 rounded-3xl max-w-sm w-full p-4 text-white shadow-2xl border border-indigo-500/30 relative max-h-[95vh] overflow-y-auto">
        {/* Top Bar with back, title & audio toggle */}
        <div className="flex items-center justify-between mb-2">
          <button
            onClick={() => setIsLuckySpinModalOpen(false)}
            className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors"
          >
            <ArrowLeft className="w-4 h-4 text-white" />
          </button>

          {/* Neon Marquee Title like screenshot */}
          <div className="bg-gradient-to-r from-purple-600 via-pink-600 to-indigo-600 px-4 py-1.5 rounded-full shadow-lg border border-purple-300/40 text-center">
            <span className="text-xs font-black uppercase tracking-wider text-white drop-shadow-md flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-amber-300" />
              Lucky spinning
            </span>
          </div>

          <button
            onClick={() => setIsMuted(!isMuted)}
            className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors"
          >
            {isMuted ? <VolumeX className="w-4 h-4 text-slate-300" /> : <Volume2 className="w-4 h-4 text-white" />}
          </button>
        </div>

        {/* Spins count banner */}
        <div className="text-center my-2">
          <p className="text-[11px] text-blue-200">
            Tirages restants : <span className="text-amber-400 font-black text-sm">{spinsLeft}</span>
          </p>
          <p className="text-[10px] text-slate-400">
            Chaque achat d'un titre vous offre des tirages additionnels.
          </p>
        </div>

        {/* The Wheel Container */}
        <div className="relative flex items-center justify-center my-4">
          {/* Wheel Pointer Pin at Top */}
          <div className="absolute top-0 z-20 -mt-2.5 flex flex-col items-center">
            <div className="w-0 h-0 border-l-[14px] border-l-transparent border-r-[14px] border-r-transparent border-t-[22px] border-t-red-600 drop-shadow-lg" />
          </div>

          {/* Outer Marquee Light Dots Ring */}
          <div className="w-68 h-68 rounded-full p-2 bg-gradient-to-tr from-amber-400 via-yellow-300 to-amber-500 shadow-xl shadow-amber-500/20 flex items-center justify-center relative">
            {/* Outer bulbs */}
            <div className="absolute inset-1 rounded-full border-4 border-dashed border-white/60 pointer-events-none" />

            {/* Rotating Wheel Disc */}
            <div
              className="w-full h-full rounded-full relative overflow-hidden transition-transform duration-[4000ms] ease-out shadow-inner"
              style={{
                transform: `rotate(${rotation}deg)`,
              }}
            >
              {/* Wheel Slices SVG */}
              <svg viewBox="0 0 100 100" className="w-full h-full transform -rotate-90">
                {SECTORS.map((sector, i) => {
                  const angle = 360 / SECTORS.length;
                  const startAngle = i * angle;
                  const endAngle = (i + 1) * angle;

                  const x1 = 50 + 50 * Math.cos((Math.PI * startAngle) / 180);
                  const y1 = 50 + 50 * Math.sin((Math.PI * startAngle) / 180);
                  const x2 = 50 + 50 * Math.cos((Math.PI * endAngle) / 180);
                  const y2 = 50 + 50 * Math.sin((Math.PI * endAngle) / 180);

                  return (
                    <path
                      key={i}
                      d={`M50,50 L${x1},${y1} A50,50 0 0,1 ${x2},${y2} Z`}
                      fill={sector.color}
                      stroke="#ffffff"
                      strokeWidth="0.8"
                    />
                  );
                })}
              </svg>

              {/* Text labels inside sectors */}
              {SECTORS.map((sector, i) => {
                const angle = (360 / SECTORS.length) * i + 360 / SECTORS.length / 2;
                return (
                  <div
                    key={i}
                    className="absolute w-full h-full top-0 left-0 flex items-center justify-center pointer-events-none"
                    style={{
                      transform: `rotate(${angle}deg)`,
                    }}
                  >
                    <span 
                      className="absolute top-4 text-[9px] font-black uppercase tracking-tighter"
                      style={{ color: sector.textColor }}
                    >
                      {sector.label}
                    </span>
                  </div>
                );
              })}
            </div>

            {/* Central Start Button */}
            <button
              onClick={handleSpin}
              disabled={isSpinning || spinsLeft <= 0}
              className={`absolute z-20 w-16 h-16 rounded-full flex flex-col items-center justify-center shadow-xl border-4 border-white transition-transform active:scale-95 ${
                isSpinning
                  ? 'bg-amber-600 opacity-80 cursor-not-allowed'
                  : spinsLeft <= 0
                  ? 'bg-slate-600 opacity-60 cursor-not-allowed'
                  : 'bg-gradient-to-tr from-red-600 to-rose-500 hover:from-red-500 hover:to-rose-400'
              }`}
            >
              <span className="text-white font-black text-xs uppercase tracking-wider">
                {isSpinning ? '...' : 'Start'}
              </span>
            </button>
          </div>
        </div>

        {/* Win Alert Result */}
        {lastWin !== null && (
          <div className="bg-emerald-500/20 border border-emerald-400/40 rounded-2xl p-3 text-center my-2 animate-in zoom-in-95">
            <span className="text-emerald-300 font-extrabold text-xs block">🎉 Félicitations !</span>
            <p className="text-white text-sm font-black mt-0.5">
              +{formatFCFA(lastWin)} crédités sur votre solde !
            </p>
          </div>
        )}

        {/* Bottom Prizes & Rules bar */}
        <div className="bg-white/10 rounded-2xl p-3 text-xs space-y-1.5 border border-white/10 text-slate-200 mt-2">
          <div className="flex items-center justify-between text-[11px] font-bold text-amber-300">
            <span className="flex items-center gap-1">
              <Gift className="w-3.5 h-3.5" />
              Récompenses garanties :
            </span>
            <span>Jusqu'à 100 000 FCFA</span>
          </div>
          <p className="text-[10px] text-slate-300 leading-relaxed">
            Tournez la roue chaque jour pour remporter des gains instantanés versés directement sur votre solde retirable.
          </p>
        </div>
      </div>
    </div>
  );
};

import React, { useState } from 'react';
import { X, Ruler, Sparkles } from 'lucide-react';

interface SizeGuideModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const SizeGuideModal: React.FC<SizeGuideModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  const [unit, setUnit] = useState<'inches' | 'cm'>('inches');
  const [categoryTab, setCategoryTab] = useState<'tshirts' | 'polos' | 'panjabis' | 'hoodies' | 'pants'>('tshirts');

  return (
    <div id="size-guide-backdrop" className="fixed inset-0 z-50 bg-neutral-950/70 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 overflow-y-auto" onClick={onClose}>
      <div
        id="size-guide-card"
        onClick={(e) => e.stopPropagation()}
        className="bg-white w-full max-w-2xl rounded-2xl sm:rounded-3xl shadow-2xl overflow-hidden my-auto max-h-[92vh] flex flex-col relative"
      >
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-neutral-200 flex items-center justify-between bg-neutral-900 text-white">
          <div className="flex items-center gap-2">
            <Ruler className="w-5 h-5 text-emerald-400" />
            <div>
              <h2 className="text-base sm:text-lg font-black font-mono">V-BOX Sizing Guide</h2>
              <p className="text-[11px] text-neutral-300">Standard Asian & Bangladeshi Apparel Measurements</p>
            </div>
          </div>

          <button
            id="close-size-guide-btn"
            type="button"
            onClick={onClose}
            className="p-1.5 text-neutral-400 hover:text-white rounded-full hover:bg-neutral-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Category Tabs & Unit Switcher */}
        <div className="p-4 sm:p-6 border-b border-neutral-100 bg-neutral-50 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-1.5 overflow-x-auto w-full sm:w-auto pb-1 sm:pb-0">
            {(
              [
                { id: 'tshirts', label: 'T-Shirts (Boxy)' },
                { id: 'polos', label: 'Polos' },
                { id: 'panjabis', label: 'Panjabis' },
                { id: 'hoodies', label: 'Hoodies' },
                { id: 'pants', label: 'Bottoms/Pants' },
              ] as const
            ).map((tab) => (
              <button
                key={tab.id}
                onClick={() => setCategoryTab(tab.id)}
                className={`px-3 py-1.5 text-xs font-semibold rounded-lg whitespace-nowrap transition-colors ${
                  categoryTab === tab.id
                    ? 'bg-neutral-900 text-white shadow-xs'
                    : 'bg-white text-neutral-700 hover:bg-neutral-200 border border-neutral-200'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Inches vs CM Toggle */}
          <div className="flex items-center bg-neutral-200 p-1 rounded-lg self-end sm:self-auto">
            <button
              onClick={() => setUnit('inches')}
              className={`px-2.5 py-1 text-xs font-bold rounded-md transition-all ${
                unit === 'inches' ? 'bg-white text-neutral-900 shadow-xs' : 'text-neutral-600'
              }`}
            >
              Inches (in)
            </button>
            <button
              onClick={() => setUnit('cm')}
              className={`px-2.5 py-1 text-xs font-bold rounded-md transition-all ${
                unit === 'cm' ? 'bg-white text-neutral-900 shadow-xs' : 'text-neutral-600'
              }`}
            >
              Centimeters (cm)
            </button>
          </div>
        </div>

        {/* Tables Content */}
        <div className="p-4 sm:p-6 overflow-y-auto space-y-4">
          <div className="overflow-x-auto rounded-xl border border-neutral-200">
            <table className="w-full text-left text-xs sm:text-sm">
              <thead className="bg-neutral-100 text-neutral-900 font-bold border-b border-neutral-200">
                <tr>
                  <th className="py-3 px-4">Size</th>
                  {categoryTab !== 'pants' ? (
                    <>
                      <th className="py-3 px-4">Chest / Bust</th>
                      <th className="py-3 px-4">Length</th>
                      <th className="py-3 px-4">Shoulder</th>
                      <th className="py-3 px-4">Body Weight (Approx)</th>
                    </>
                  ) : (
                    <>
                      <th className="py-3 px-4">Waist (Stretch)</th>
                      <th className="py-3 px-4">Length</th>
                      <th className="py-3 px-4">Thigh</th>
                      <th className="py-3 px-4">Bottom Opening</th>
                    </>
                  )}
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-200 text-neutral-700">
                {categoryTab === 'tshirts' && (
                  <>
                    <tr className="hover:bg-neutral-50">
                      <td className="py-2.5 px-4 font-bold text-neutral-900">S (Small)</td>
                      <td className="py-2.5 px-4">{unit === 'inches' ? '38"' : '96.5 cm'}</td>
                      <td className="py-2.5 px-4">{unit === 'inches' ? '26"' : '66 cm'}</td>
                      <td className="py-2.5 px-4">{unit === 'inches' ? '18"' : '45.7 cm'}</td>
                      <td className="py-2.5 px-4 text-neutral-500">45 - 55 kg</td>
                    </tr>
                    <tr className="hover:bg-neutral-50">
                      <td className="py-2.5 px-4 font-bold text-neutral-900">M (Medium)</td>
                      <td className="py-2.5 px-4">{unit === 'inches' ? '40"' : '101.6 cm'}</td>
                      <td className="py-2.5 px-4">{unit === 'inches' ? '27"' : '68.5 cm'}</td>
                      <td className="py-2.5 px-4">{unit === 'inches' ? '19"' : '48.2 cm'}</td>
                      <td className="py-2.5 px-4 text-neutral-500">55 - 65 kg</td>
                    </tr>
                    <tr className="hover:bg-neutral-50">
                      <td className="py-2.5 px-4 font-bold text-neutral-900">L (Large)</td>
                      <td className="py-2.5 px-4">{unit === 'inches' ? '42"' : '106.6 cm'}</td>
                      <td className="py-2.5 px-4">{unit === 'inches' ? '28"' : '71 cm'}</td>
                      <td className="py-2.5 px-4">{unit === 'inches' ? '20"' : '50.8 cm'}</td>
                      <td className="py-2.5 px-4 text-neutral-500">65 - 75 kg</td>
                    </tr>
                    <tr className="hover:bg-neutral-50">
                      <td className="py-2.5 px-4 font-bold text-neutral-900">XL (Extra Large)</td>
                      <td className="py-2.5 px-4">{unit === 'inches' ? '44"' : '111.7 cm'}</td>
                      <td className="py-2.5 px-4">{unit === 'inches' ? '29"' : '73.6 cm'}</td>
                      <td className="py-2.5 px-4">{unit === 'inches' ? '21"' : '53.3 cm'}</td>
                      <td className="py-2.5 px-4 text-neutral-500">75 - 85 kg</td>
                    </tr>
                    <tr className="hover:bg-neutral-50">
                      <td className="py-2.5 px-4 font-bold text-neutral-900">XXL (Double XL)</td>
                      <td className="py-2.5 px-4">{unit === 'inches' ? '46"' : '116.8 cm'}</td>
                      <td className="py-2.5 px-4">{unit === 'inches' ? '30"' : '76.2 cm'}</td>
                      <td className="py-2.5 px-4">{unit === 'inches' ? '22"' : '55.8 cm'}</td>
                      <td className="py-2.5 px-4 text-neutral-500">85 - 98 kg</td>
                    </tr>
                  </>
                )}

                {categoryTab === 'polos' && (
                  <>
                    <tr className="hover:bg-neutral-50">
                      <td className="py-2.5 px-4 font-bold text-neutral-900">M (Medium)</td>
                      <td className="py-2.5 px-4">{unit === 'inches' ? '39"' : '99 cm'}</td>
                      <td className="py-2.5 px-4">{unit === 'inches' ? '27"' : '68.5 cm'}</td>
                      <td className="py-2.5 px-4">{unit === 'inches' ? '18.5"' : '47 cm'}</td>
                      <td className="py-2.5 px-4 text-neutral-500">55 - 65 kg</td>
                    </tr>
                    <tr className="hover:bg-neutral-50">
                      <td className="py-2.5 px-4 font-bold text-neutral-900">L (Large)</td>
                      <td className="py-2.5 px-4">{unit === 'inches' ? '41"' : '104 cm'}</td>
                      <td className="py-2.5 px-4">{unit === 'inches' ? '28"' : '71 cm'}</td>
                      <td className="py-2.5 px-4">{unit === 'inches' ? '19.5"' : '49.5 cm'}</td>
                      <td className="py-2.5 px-4 text-neutral-500">65 - 75 kg</td>
                    </tr>
                    <tr className="hover:bg-neutral-50">
                      <td className="py-2.5 px-4 font-bold text-neutral-900">XL (Extra Large)</td>
                      <td className="py-2.5 px-4">{unit === 'inches' ? '43"' : '109 cm'}</td>
                      <td className="py-2.5 px-4">{unit === 'inches' ? '29"' : '73.6 cm'}</td>
                      <td className="py-2.5 px-4">{unit === 'inches' ? '20.5"' : '52 cm'}</td>
                      <td className="py-2.5 px-4 text-neutral-500">75 - 85 kg</td>
                    </tr>
                    <tr className="hover:bg-neutral-50">
                      <td className="py-2.5 px-4 font-bold text-neutral-900">XXL</td>
                      <td className="py-2.5 px-4">{unit === 'inches' ? '45"' : '114 cm'}</td>
                      <td className="py-2.5 px-4">{unit === 'inches' ? '30"' : '76 cm'}</td>
                      <td className="py-2.5 px-4">{unit === 'inches' ? '21.5"' : '54.5 cm'}</td>
                      <td className="py-2.5 px-4 text-neutral-500">85 - 95 kg</td>
                    </tr>
                  </>
                )}

                {categoryTab === 'panjabis' && (
                  <>
                    <tr className="hover:bg-neutral-50">
                      <td className="py-2.5 px-4 font-bold text-neutral-900">M (Size 40)</td>
                      <td className="py-2.5 px-4">{unit === 'inches' ? '40"' : '101.6 cm'}</td>
                      <td className="py-2.5 px-4">{unit === 'inches' ? '40"' : '101.6 cm'}</td>
                      <td className="py-2.5 px-4">{unit === 'inches' ? '18"' : '45.7 cm'}</td>
                      <td className="py-2.5 px-4 text-neutral-500">Height: 5'5" - 5'8"</td>
                    </tr>
                    <tr className="hover:bg-neutral-50">
                      <td className="py-2.5 px-4 font-bold text-neutral-900">L (Size 42)</td>
                      <td className="py-2.5 px-4">{unit === 'inches' ? '42"' : '106.6 cm'}</td>
                      <td className="py-2.5 px-4">{unit === 'inches' ? '42"' : '106.6 cm'}</td>
                      <td className="py-2.5 px-4">{unit === 'inches' ? '19"' : '48.2 cm'}</td>
                      <td className="py-2.5 px-4 text-neutral-500">Height: 5'8" - 5'11"</td>
                    </tr>
                    <tr className="hover:bg-neutral-50">
                      <td className="py-2.5 px-4 font-bold text-neutral-900">XL (Size 44)</td>
                      <td className="py-2.5 px-4">{unit === 'inches' ? '44"' : '111.7 cm'}</td>
                      <td className="py-2.5 px-4">{unit === 'inches' ? '44"' : '111.7 cm'}</td>
                      <td className="py-2.5 px-4">{unit === 'inches' ? '20"' : '50.8 cm'}</td>
                      <td className="py-2.5 px-4 text-neutral-500">Height: 5'11"+</td>
                    </tr>
                  </>
                )}

                {categoryTab === 'hoodies' && (
                  <>
                    <tr className="hover:bg-neutral-50">
                      <td className="py-2.5 px-4 font-bold text-neutral-900">M (Medium)</td>
                      <td className="py-2.5 px-4">{unit === 'inches' ? '42"' : '106 cm'}</td>
                      <td className="py-2.5 px-4">{unit === 'inches' ? '27"' : '68.5 cm'}</td>
                      <td className="py-2.5 px-4">{unit === 'inches' ? '21"' : '53.3 cm'}</td>
                      <td className="py-2.5 px-4 text-neutral-500">Relaxed Fit</td>
                    </tr>
                    <tr className="hover:bg-neutral-50">
                      <td className="py-2.5 px-4 font-bold text-neutral-900">L (Large)</td>
                      <td className="py-2.5 px-4">{unit === 'inches' ? '44"' : '111.7 cm'}</td>
                      <td className="py-2.5 px-4">{unit === 'inches' ? '28"' : '71 cm'}</td>
                      <td className="py-2.5 px-4">{unit === 'inches' ? '22"' : '55.8 cm'}</td>
                      <td className="py-2.5 px-4 text-neutral-500">Relaxed Fit</td>
                    </tr>
                    <tr className="hover:bg-neutral-50">
                      <td className="py-2.5 px-4 font-bold text-neutral-900">XL (Extra Large)</td>
                      <td className="py-2.5 px-4">{unit === 'inches' ? '46"' : '116.8 cm'}</td>
                      <td className="py-2.5 px-4">{unit === 'inches' ? '29"' : '73.6 cm'}</td>
                      <td className="py-2.5 px-4">{unit === 'inches' ? '23"' : '58.4 cm'}</td>
                      <td className="py-2.5 px-4 text-neutral-500">Relaxed Fit</td>
                    </tr>
                  </>
                )}

                {categoryTab === 'pants' && (
                  <>
                    <tr className="hover:bg-neutral-50">
                      <td className="py-2.5 px-4 font-bold text-neutral-900">M (Waist 30-32)</td>
                      <td className="py-2.5 px-4">{unit === 'inches' ? '30 - 32"' : '76 - 81 cm'}</td>
                      <td className="py-2.5 px-4">{unit === 'inches' ? '38"' : '96.5 cm'}</td>
                      <td className="py-2.5 px-4">{unit === 'inches' ? '24"' : '61 cm'}</td>
                      <td className="py-2.5 px-4">{unit === 'inches' ? '13"' : '33 cm'}</td>
                    </tr>
                    <tr className="hover:bg-neutral-50">
                      <td className="py-2.5 px-4 font-bold text-neutral-900">L (Waist 32-34)</td>
                      <td className="py-2.5 px-4">{unit === 'inches' ? '32 - 34"' : '81 - 86 cm'}</td>
                      <td className="py-2.5 px-4">{unit === 'inches' ? '39"' : '99 cm'}</td>
                      <td className="py-2.5 px-4">{unit === 'inches' ? '25"' : '63.5 cm'}</td>
                      <td className="py-2.5 px-4">{unit === 'inches' ? '14"' : '35.5 cm'}</td>
                    </tr>
                    <tr className="hover:bg-neutral-50">
                      <td className="py-2.5 px-4 font-bold text-neutral-900">XL (Waist 34-36)</td>
                      <td className="py-2.5 px-4">{unit === 'inches' ? '34 - 36"' : '86 - 91 cm'}</td>
                      <td className="py-2.5 px-4">{unit === 'inches' ? '40"' : '101.6 cm'}</td>
                      <td className="py-2.5 px-4">{unit === 'inches' ? '26"' : '66 cm'}</td>
                      <td className="py-2.5 px-4">{unit === 'inches' ? '15"' : '38 cm'}</td>
                    </tr>
                  </>
                )}
              </tbody>
            </table>
          </div>

          <div className="p-3.5 bg-neutral-100 rounded-xl flex items-center gap-2 text-xs text-neutral-700">
            <Sparkles className="w-4 h-4 text-neutral-900 shrink-0" />
            <p>
              <strong>100% Free Size Exchange Guarantee:</strong> If the size doesn't fit you perfectly, we will swap it within 12-24 hours without any exchange hassle.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

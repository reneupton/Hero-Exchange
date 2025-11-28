'use client';

import { useState } from 'react';
import Image from 'next/image';
import { FaTimes } from 'react-icons/fa';
import { CharacterDefinition } from '../data/characterCatalog';
import goldIcon from '@/public/gold2.png';
import DateInput from './DateInput';
import { useForm, Controller } from 'react-hook-form';
import { createAuction } from '../actions/auctionActions';
import { getMyProgress } from '../actions/gamificationActions';
import { useProfileStore } from '@/hooks/useProfileStore';
import toast from 'react-hot-toast';
import { useRouter } from 'next/navigation';

type Props = {
  isOpen: boolean;
  onClose: () => void;
  ownedHeroes: CharacterDefinition[];
  preselectedHero?: CharacterDefinition | null;
};

type FormValues = {
  reservePrice: number;
  auctionEnd: Date;
};

export default function SellHeroModal({ isOpen, onClose, ownedHeroes, preselectedHero }: Props) {
  const [selectedHero, setSelectedHero] = useState<CharacterDefinition | null>(preselectedHero ?? null);
  const [step, setStep] = useState<'select' | 'details'>(preselectedHero ? 'details' : 'select');
  const setProfile = useProfileStore((state) => state.setProfile);
  const router = useRouter();

  const {
    control,
    handleSubmit,
    reset,
    formState: { isSubmitting, isValid },
  } = useForm<FormValues>({
    mode: 'onTouched',
    defaultValues: {
      reservePrice: 0,
    },
  });

  const handleSelectHero = (hero: CharacterDefinition) => {
    setSelectedHero(hero);
    setStep('details');
  };

  const handleBack = () => {
    setStep('select');
    setSelectedHero(null);
  };

  const handleClose = () => {
    setStep(preselectedHero ? 'details' : 'select');
    setSelectedHero(preselectedHero ?? null);
    reset();
    onClose();
  };

  const onSubmit = async (data: FormValues) => {
    if (!selectedHero) return;

    try {
      const payload = {
        title: selectedHero.name,
        brand: selectedHero.discipline,
        category: 'Hero',
        variant: selectedHero.rarity,
        condition: 'New',
        colorway: selectedHero.discipline,
        specs: selectedHero.lore ?? '',
        imageUrl: selectedHero.cardImage,
        reservePrice: data.reservePrice || 0,
        auctionEnd: data.auctionEnd,
      };

      const res = await createAuction(payload);

      if (res.error) {
        throw res.error;
      }

      try {
        const profile = await getMyProgress();
        if (profile) setProfile(profile);
      } catch {}

      toast.success(`${selectedHero.name} listed for auction!`);
      handleClose();
      router.push(`/auctions/details/${res.id}`);
    } catch (error: any) {
      toast.error(error?.message || 'Failed to create auction');
    }
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4"
      onClick={handleClose}
    >
      <div
        className="glass-panel rounded-3xl border border-[var(--card-border)] max-w-lg w-full relative overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-[var(--card-border)]">
          <h2 className="text-xl font-bold text-[var(--text)]">
            {step === 'select' ? 'Select Hero to Sell' : 'List for Auction'}
          </h2>
          <button
            onClick={handleClose}
            className="text-[var(--muted)] hover:text-[var(--text)] transition-colors"
          >
            <FaTimes size={20} />
          </button>
        </div>

        {/* Content */}
        <div className="p-5">
          {step === 'select' ? (
            <>
              {ownedHeroes.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-[var(--muted)]">You don&apos;t own any heroes to sell.</p>
                  <p className="text-sm text-[var(--muted)] mt-2">Win auctions to add heroes to your collection.</p>
                </div>
              ) : (
                <div className="space-y-2 max-h-[400px] overflow-auto">
                  {ownedHeroes.map((hero) => (
                    <button
                      key={hero.id}
                      onClick={() => handleSelectHero(hero)}
                      className="w-full flex items-center gap-3 rounded-2xl border border-[var(--card-border)] bg-[rgba(26,32,48,0.65)] p-3 hover:border-[var(--accent)] hover:bg-[rgba(139,92,246,0.1)] transition-all text-left"
                    >
                      <div className="relative h-14 w-14 flex-shrink-0">
                        <Image src={hero.cardImage} alt={hero.name} fill sizes="56px" className="object-contain rounded-xl" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="text-sm font-semibold text-[var(--text)] truncate">{hero.name}</div>
                        <div className="text-xs text-[var(--muted)]">{hero.discipline} · {hero.rarity}</div>
                      </div>
                      <div className="flex items-center gap-1 text-[var(--accent-2)]">
                        <Image src={goldIcon} alt="gold" width={16} height={16} className="object-contain" />
                        <span className="text-sm font-semibold">{hero.gold.toLocaleString()}</span>
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </>
          ) : selectedHero ? (
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              {/* Hero Preview */}
              <div className="flex items-center gap-4 rounded-2xl border border-[var(--card-border)] bg-[rgba(26,32,48,0.65)] p-4">
                <div className="relative h-20 w-20 flex-shrink-0">
                  <Image src={selectedHero.cardImage} alt={selectedHero.name} fill sizes="80px" className="object-contain rounded-xl" />
                </div>
                <div className="flex-1">
                  <div className="text-lg font-bold text-[var(--text)]">{selectedHero.name}</div>
                  <div className="text-sm text-[var(--muted)]">{selectedHero.discipline} · {selectedHero.rarity}</div>
                  <div className="flex items-center gap-1 mt-1 text-[var(--accent-2)]">
                    <Image src={goldIcon} alt="gold" width={16} height={16} className="object-contain" />
                    <span className="text-sm font-semibold">{selectedHero.gold.toLocaleString()} base value</span>
                  </div>
                </div>
              </div>

              {/* Reserve Price */}
              <div>
                <label className="block text-sm font-medium text-[var(--text)] mb-2">
                  Reserve Price
                </label>
                <div className="relative">
                  <Controller
                    name="reservePrice"
                    control={control}
                    rules={{
                      min: { value: 0, message: 'Reserve price cannot be negative' },
                    }}
                    render={({ field, fieldState }) => (
                      <>
                        <div className="absolute left-3 top-1/2 -translate-y-1/2">
                          <Image src={goldIcon} alt="gold" width={18} height={18} className="object-contain" />
                        </div>
                        <input
                          {...field}
                          type="number"
                          min="0"
                          placeholder="0 (no reserve)"
                          className="w-full rounded-xl border border-[var(--card-border)] bg-[rgba(26,32,48,0.8)] pl-10 pr-4 py-3 text-[var(--text)] placeholder:text-[var(--muted)] focus:outline-none focus:border-[var(--accent)] transition-colors"
                        />
                        {fieldState.error && (
                          <p className="text-xs text-rose-400 mt-1">{fieldState.error.message}</p>
                        )}
                      </>
                    )}
                  />
                </div>
                <p className="text-xs text-[var(--muted)] mt-1">Enter 0 for no minimum bid requirement</p>
              </div>

              {/* Auction End Date */}
              <div>
                <DateInput
                  label="Auction End Date"
                  name="auctionEnd"
                  control={control}
                  dateFormat="dd MMM yyyy h:mm a"
                  showTimeSelect
                  rules={{ required: 'End date is required' }}
                  minDate={new Date()}
                />
              </div>

              {/* Actions */}
              <div className="flex gap-3 pt-2">
                {!preselectedHero && (
                  <button
                    type="button"
                    onClick={handleBack}
                    className="flex-1 soft-button-ghost py-3"
                  >
                    Back
                  </button>
                )}
                <button
                  type="submit"
                  disabled={isSubmitting || !isValid}
                  className="flex-1 soft-button py-3 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isSubmitting ? 'Listing...' : 'List Hero'}
                </button>
              </div>
            </form>
          ) : null}
        </div>
      </div>
    </div>
  );
}

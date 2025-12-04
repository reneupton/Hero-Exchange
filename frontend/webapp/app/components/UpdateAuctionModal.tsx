'use client';

import { useState } from 'react';
import Image from 'next/image';
import { FaTimes } from 'react-icons/fa';
import goldIcon from '@/public/gold2.png';
import DateInput from './DateInput';
import { useForm, Controller } from 'react-hook-form';
import { updateAuction } from '../actions/auctionActions';
import toast from 'react-hot-toast';
import { Auction } from '@/types';
import { CharacterDefinition } from '../data/characterCatalog';

type Props = {
  isOpen: boolean;
  onClose: () => void;
  auction: Auction;
  character: CharacterDefinition;
  onAuctionUpdated?: () => void;
};

type FormValues = {
  reservePrice: number;
  auctionEnd: Date;
};

export default function UpdateAuctionModal({ isOpen, onClose, auction, character, onAuctionUpdated }: Props) {
  const {
    control,
    handleSubmit,
    reset,
    formState: { isSubmitting, isValid },
  } = useForm<FormValues>({
    mode: 'onTouched',
    defaultValues: {
      reservePrice: auction.reservePrice ?? 0,
      auctionEnd: auction.auctionEnd ? new Date(auction.auctionEnd) : new Date(),
    },
  });

  const handleClose = () => {
    reset();
    onClose();
  };

  const onSubmit = async (data: FormValues) => {
    try {
      const payload = {
        reservePrice: data.reservePrice || 0,
        auctionEnd: data.auctionEnd,
      };

      const res = await updateAuction(payload, auction.id);

      if (res.error) {
        throw res.error;
      }

      toast.success('Auction updated successfully!');
      handleClose();
      if (onAuctionUpdated) {
        onAuctionUpdated();
      }
    } catch (error: any) {
      toast.error(error?.message || 'Failed to update auction');
    }
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 bg-black/70 backdrop-blur-sm z-[60] flex items-center justify-center p-4"
      onClick={handleClose}
    >
      <div
        className="glass-panel rounded-3xl border border-[var(--card-border)] max-w-lg w-full relative overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-[var(--card-border)]">
          <h2 className="text-xl font-bold text-[var(--text)]">Update Auction</h2>
          <button
            onClick={handleClose}
            className="text-[var(--muted)] hover:text-[var(--text)] transition-colors"
          >
            <FaTimes size={20} />
          </button>
        </div>

        {/* Content */}
        <div className="p-5">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            {/* Hero Preview */}
            <div className="flex items-center gap-4 rounded-2xl border border-[var(--card-border)] bg-[rgba(26,32,48,0.65)] p-4">
              <div className="relative h-20 w-20 flex-shrink-0">
                <Image src={character.cardImage} alt={character.name} fill sizes="80px" className="object-contain rounded-xl" />
              </div>
              <div className="flex-1">
                <div className="text-lg font-bold text-[var(--text)]">{character.name}</div>
                <div className="text-sm text-[var(--muted)]">{character.discipline} · {character.rarity}</div>
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
              <button
                type="button"
                onClick={handleClose}
                className="flex-1 soft-button-ghost py-3"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmitting || !isValid}
                className="flex-1 soft-button py-3 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSubmitting ? 'Updating...' : 'Update Auction'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

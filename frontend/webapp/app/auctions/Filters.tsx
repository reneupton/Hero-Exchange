import { useParamStore } from '@/hooks/useParamsStore';
import { Button } from 'flowbite-react';
import React, { useMemo } from 'react';
import { AiOutlineClockCircle, AiOutlineSortAscending } from 'react-icons/ai';
import { BsFillStopCircleFill, BsStopwatchFill } from 'react-icons/bs';
import { GiFinishLine, GiFlame } from 'react-icons/gi';
import { characterCatalog } from '../data/characterCatalog';

const pageSizeButtons = [16, 32, 48];

const orderButtons = [
  { label: 'Ending Soon', icon: AiOutlineClockCircle, value: 'endingSoon' },
  { label: 'Newest First', icon: BsFillStopCircleFill, value: 'new' },
  { label: 'A → Z', icon: AiOutlineSortAscending, value: 'title' },
];

const filterButtons = [
  { label: 'Live Auctions', icon: GiFlame, value: 'live' },
  { label: 'Closing Soon', icon: GiFinishLine, value: 'endingSoon' },
  { label: 'Completed', icon: BsStopwatchFill, value: 'finished' },
];

export default function Filters() {
  const pageSize = useParamStore((state) => state.pageSize);
  const setParams = useParamStore((state) => state.setParams);
  const orderBy = useParamStore((state) => state.orderBy);
  const filterBy = useParamStore((state) => state.filterBy);
  const rarity = useParamStore((state) => state.rarity);
  const discipline = useParamStore((state) => state.discipline);

  const rarityOptions = ['all', 'Common', 'Rare', 'Epic', 'Legendary'];
  const rarityStyles: Record<string, string> = {
    Common: 'border-slate-400/60 text-slate-100',
    Rare: 'border-blue-400/70 text-blue-100',
    Epic: 'border-purple-400/80 text-purple-100',
    Legendary: 'border-amber-400/80 text-amber-100',
  };
  const classOptions = useMemo(
    () => ['all', ...Array.from(new Set(characterCatalog.map((c) => c.discipline)))],
    []
  );

  return (
    <div className="flex flex-wrap justify-center lg:justify-between items-center gap-4 mb-6 px-4 py-3 rounded-2xl bg-[rgba(20,26,42,0.9)] backdrop-blur-md border border-[var(--card-border)] shadow-[0_12px_40px_rgba(0,0,0,0.35)]">
      <div className="flex items-center gap-2">
        <span className="uppercase text-xs tracking-wide text-[var(--muted)] whitespace-nowrap">Filter by</span>
        <Button.Group>
          {filterButtons.map(({ label, icon: Icon, value }) => (
            <Button
              key={value}
              onClick={() => setParams({ filterBy: value })}
              color="light"
              className={`chip bg-[rgba(46,58,80,0.8)] text-[var(--text)] border-[var(--card-border)] ${filterBy === value ? 'chip-active text-white' : ''}`}
            >
              <Icon className="mr-2 h-4 w-4 flex-shrink-0" />
              <span className="hidden sm:inline">{label}</span>
            </Button>
          ))}
        </Button.Group>
      </div>

      <div className="flex items-center gap-2">
        <span className="uppercase text-xs tracking-wide text-[var(--muted)] whitespace-nowrap">Order by</span>
        <Button.Group>
          {orderButtons.map(({ label, icon: Icon, value }) => (
            <Button
              key={value}
              onClick={() => setParams({ orderBy: value })}
              color="light"
              className={`chip bg-[rgba(46,58,80,0.8)] text-[var(--text)] border-[var(--card-border)] ${orderBy === value ? 'chip-active text-white' : ''}`}
            >
              <Icon className="mr-2 h-4 w-4 flex-shrink-0" />
              <span className="hidden sm:inline">{label}</span>
            </Button>
          ))}
        </Button.Group>
      </div>

      <div className="flex items-center gap-2">
        <span className="uppercase text-xs tracking-wide text-[var(--muted)] whitespace-nowrap">Rarity</span>
        <Button.Group>
          {rarityOptions.map((value) => (
            <Button
              key={`rarity-${value}`}
              onClick={() => setParams({ rarity: value })}
              color="light"
              className={`chip bg-[rgba(46,58,80,0.8)] border-[var(--card-border)] ${rarity === value ? 'chip-active text-white' : ''} ${rarityStyles[value] ?? ''}`}
            >
              <span className="text-xs sm:text-sm capitalize">{value}</span>
            </Button>
          ))}
        </Button.Group>
      </div>

      <div className="flex items-center gap-2">
        <span className="uppercase text-xs tracking-wide text-[var(--muted)] whitespace-nowrap">Class</span>
        <select
          value={discipline}
          onChange={(e) => setParams({ discipline: e.target.value })}
          className="bg-[rgba(46,58,80,0.8)] text-[var(--text)] border border-[var(--card-border)] rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--accent)]"
        >
          {classOptions.map((cls) => (
            <option key={cls} value={cls}>
              {cls === 'all' ? 'All' : cls}
            </option>
          ))}
        </select>
      </div>

      <div className="flex items-center gap-2">
        <span className="uppercase text-xs tracking-wide text-[var(--muted)] whitespace-nowrap">Page size</span>
        <Button.Group>
          {pageSizeButtons.map((value) => (
            <Button
              key={`page-${value}`}
              onClick={() => setParams({ pageSize: value })}
              color="light"
              className={`chip bg-[rgba(46,58,80,0.8)] text-[var(--text)] border-[var(--card-border)] ${pageSize === value ? 'chip-active text-white' : ''} focus:ring-0 min-w-[3rem]`}
            >
              {value}
            </Button>
          ))}
        </Button.Group>
      </div>
    </div>
  );
}

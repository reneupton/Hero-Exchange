import { useParamStore } from '@/hooks/useParamsStore';
import { Button } from 'flowbite-react';
import React from 'react';
import { AiOutlineClockCircle, AiOutlineSortAscending } from 'react-icons/ai';
import { BsFillStopCircleFill, BsStopwatchFill } from 'react-icons/bs';
import { GiFinishLine, GiFlame } from 'react-icons/gi';

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
        <span className="uppercase text-xs tracking-wide text-[var(--muted)] whitespace-nowrap">Page size</span>
        <Button.Group>
          {pageSizeButtons.map((value, i) => (
            <Button
              key={i}
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

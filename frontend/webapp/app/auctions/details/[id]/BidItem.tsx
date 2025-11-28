import { formatGold } from '@/app/lib/numberWithComma';
import { Bid } from '@/types'
import { format } from 'date-fns';
import React from 'react'

type Props = {
    bid: Bid
}

export default function BidItem({bid} : Props) {
    function getBidInfo() {
        let bgColor = '';
        let text = '';

        switch(bid.bidStatus) {
            case 'Accepted':
                bgColor = 'bg-emerald-100 text-emerald-800'
                text = 'Bid accepted'
                break;
            case 'AcceptedBelowReserve':
                bgColor = 'bg-amber-100 text-amber-800'
                text = 'Reserve not met'
                break;
            case 'TooLow':
                bgColor = 'bg-rose-100 text-rose-800'
                text = 'Bid was too low'
                break;
            default:
                bgColor = 'bg-rose-100 text-rose-800'
                text = 'Bid placed after auction finished'
                break;
        }
        return {bgColor, text};
    }

  return (
    <div className={`
        border border-white/60 bg-white/85 px-3 py-2 rounded-xl glass-panel
        flex justify-between items-center shadow-sm
        ${getBidInfo().bgColor}
    `}>
        <div className='flex flex-col gap-0.5'>
            <span className='text-sm font-semibold text-slate-800'>{bid.bidder}</span>
            <span className='text-xs text-gray-600'>{format(new Date(bid.bidTime), "dd MMM h:mm a")}</span>
        </div>
        <div className='flex flex-col items-end gap-0.5'>
            <div className='text-base font-semibold'>{formatGold(bid.amount)}</div>
            <div className='text-xs'>{getBidInfo().text}</div>
        </div>
    </div>
  )
}

import { Auction, Bid } from '@/types'
import Link from 'next/link'
import React from 'react'
import Image from 'next/image'
import { formatGold } from '../lib/numberWithComma'

type Props = {
    bid: Bid
    auction: Auction
}

export default function AuctionCreatedToast({bid, auction} : Props) {
  return (
    <Link href={`/auctions/details/${bid.auctionId}`} className='flex flex-col items-center'>
        <div className='flex flex-row items-center gap-3 px-3 py-2 rounded-2xl shadow-lg' style={{background: 'var(--card)', border: '1px solid var(--card-border)'}}>
            <Image
                src={auction.imageUrl}
                alt='image'
                height={80}
                width={80}
                className='rounded-xl w-auto h-auto shadow'
            />

            <span className='text-sm text-slate-200'><span className='font-semibold text-amber-400'>{bid.bidder}</span> bid {formatGold(bid.amount)} on {auction.title}</span>
        </div>
        </Link>
  )
}

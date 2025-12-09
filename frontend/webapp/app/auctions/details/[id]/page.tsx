
import {
  getBidsForAuction,
  getDetailedViewData,
} from "@/app/actions/auctionActions";
import Heading from "@/app/components/Heading";
import React from "react";
import CountdownTimer from "../../CountdownTimer";
import DetailedSpecs from "./DetailedSpecs";
import { getCurrentUser } from "@/app/actions/authActions";
import EditButton from "./EditButton";
import DeleteButton from "../DeleteButton";
import BidList from "./BidList";
import { formatGold } from "@/app/lib/numberWithComma";
import { characterCatalog } from "@/app/data/characterCatalog";
import Image from "next/image";
import goldIcon from "@/public/gold2.png";

export default async function Details({ params }: { params: { id: string } }) {
  const data = await getDetailedViewData(params.id);
  const user = await getCurrentUser();
  const isLive = data.status?.toLowerCase() === "live";

  // Find character by name and rarity (variant) from auction data
  const character = characterCatalog.find(
    (c) => c.name === data.title && c.rarity === data.variant
  ) ?? characterCatalog.find(
    (c) => c.name === data.title
  ) ?? (() => {
    // Fallback to hash-based selection for legacy auctions
    const hash = Array.from(data.id).reduce((acc, ch) => acc + ch.charCodeAt(0), 0);
    return characterCatalog[Math.abs(hash) % characterCatalog.length];
  })();

  return (
    <div className="space-y-6">
      <div className="glass-panel ios-shadow rounded-3xl p-6 flex flex-col gap-4">
        <div className="flex flex-wrap justify-between gap-4 items-center">
          <div className="flex items-center gap-3">
            <Heading title={`${data.title}`} />
            <span className="badge">{data.brand}</span>
            {user?.username === data.seller && (
              <>
                <EditButton id={data.id} />
                <DeleteButton id={data.id} />
              </>
            )}
          </div>

          {isLive ? (
            <div className="flex items-center gap-3 text-sm text-slate-600 bg-white/70 rounded-full px-4 py-2 border border-white/60 shadow">
              <span className="font-medium text-slate-700">Time remaining:</span>
              <CountdownTimer auctionEnd={data.auctionEnd} />
            </div>
          ) : (
            <div className="flex items-center gap-2 text-sm text-[var(--text)] bg-[rgba(245,213,139,0.3)] rounded-full px-4 py-2 border border-[var(--card-border)] shadow">
              <span className="font-semibold">
                {data.status === "Finished" ? "Ended (sold/finished)" : "Ended (reserve not met)"}
              </span>
            </div>
          )}
        </div>
        <div className="flex flex-wrap gap-3 text-sm text-slate-700">
          <span className="badge badge-neutral">Discipline: {character.discipline}</span>
          <span className="badge badge-positive flex items-center gap-2">
            <Image src={goldIcon} alt="gold" width={18} height={18} className="object-contain" />
            {formatGold(data.currentHighBid ?? 0)}
          </span>
          <span className="badge badge-warn flex items-center gap-2">
            <Image src={goldIcon} alt="gold" width={18} height={18} className="object-contain" />
            {data.reservePrice > 0 ? formatGold(data.reservePrice) : 'No reserve'}
          </span>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="w-full bg-[rgba(26,32,48,0.7)] aspect-h-10 aspect-w-16 rounded-2xl overflow-hidden relative ios-shadow border border-[var(--card-border)]">
            <Image src={character.cardImage} alt={character.name} fill sizes="(max-width:1024px) 100vw, 50vw" className="object-contain" />
          </div>
          <BidList user={user} auction={data} />
        </div>
      </div>

      <div className="glass-panel ios-shadow rounded-3xl p-6">
        <div className="flex items-center gap-3 mb-4">
          <span className="badge badge-neutral">{character.rarity}</span>
          <span className="badge badge-neutral-soft">{character.discipline}</span>
          <span className="badge badge-positive flex items-center gap-2">
            <Image src={goldIcon} alt="gold" width={18} height={18} className="object-contain" />
            {formatGold(data.currentHighBid ?? 0)}
          </span>
        </div>
        {/* Average Sale Price */}
        {character.avgSalePrice !== undefined && character.avgSalePrice > 0 ? (
          <div className="rounded-2xl border border-[var(--card-border)] bg-[rgba(26,32,48,0.6)] px-4 py-3 mb-4">
            <div className="text-xs text-[var(--muted)] uppercase tracking-wide">Average Sale Price</div>
            <div className="flex items-center gap-2 mt-1">
              <Image src={goldIcon} alt="gold" width={20} height={20} className="object-contain" />
              <span className="text-xl font-bold text-[var(--accent-2)]">{character.avgSalePrice.toLocaleString()}</span>
              {character.saleCount !== undefined && character.saleCount > 0 && (
                <span className="text-xs text-[var(--muted)] ml-2">({character.saleCount} sales)</span>
              )}
            </div>
          </div>
        ) : (
          <div className="rounded-2xl border border-[var(--card-border)] bg-[rgba(26,32,48,0.6)] px-4 py-3 mb-4">
            <div className="text-xs text-[var(--muted)] uppercase tracking-wide">Average Sale Price</div>
            <div className="text-sm text-[var(--muted)] italic mt-1">No sales data yet</div>
          </div>
        )}
        <DetailedSpecs auction={data} character={character} />
      </div>
    </div>
  );
}

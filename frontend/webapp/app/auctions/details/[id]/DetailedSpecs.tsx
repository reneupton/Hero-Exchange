'use client';

import {useEffect} from "react";
import {Auction} from "@/types";
import { useRouter } from "next/navigation";
import { formatGold } from "@/app/lib/numberWithComma";
import { CharacterDefinition } from "@/app/data/characterCatalog";
import Image from "next/image";
import goldIcon from "@/public/gold2.png";

type Props = {
    auction: Auction;
    character?: CharacterDefinition;
}

type SpecRow = {
    label: string;
    value: React.ReactNode;
    icon?: React.ReactNode;
};

export default function DetailedSpecs({auction, character}: Props) {
    const router = useRouter();
    useEffect(() => {
        if (!auction || !auction.id) {
            router.push('/');
        }
    }, [auction, router]);
    if (!auction || !auction.id) return null;

    const rows: SpecRow[] = [
        { label: 'Seller', value: auction.seller },
        { label: 'Discipline', value: character?.discipline ?? auction.category },
        { label: 'Rarity', value: character?.rarity ?? 'Unknown' },
        {
            label: 'Value',
            value: formatGold(auction.currentHighBid ?? 0),
            icon: <Image src={goldIcon} alt="gold" width={16} height={16} className="object-contain" />
        },
        {
            label: 'Reserve',
            value: auction.reservePrice > 0 ? formatGold(auction.reservePrice) : 'No reserve'
        },
        { label: 'Lore', value: auction.specs },
    ];

    if (character) {
        rows.push({
            label: 'Avg Sale',
            value: character.avgSalePrice !== undefined && character.avgSalePrice > 0
                ? `${character.avgSalePrice.toLocaleString()} gold`
                : <span className="italic text-[var(--muted)]">No sales data</span>
        });
    }

    return (
        <div className="glass-panel rounded-2xl overflow-hidden border border-[var(--card-border)]">
            <div className="divide-y divide-[var(--card-border)]">
                {rows.map((row, idx) => (
                    <div key={idx} className="flex items-center px-4 py-3">
                        <div className="w-28 flex-shrink-0 font-semibold text-[var(--text)] flex items-center gap-2">
                            {row.icon}
                            {row.label}
                        </div>
                        <div className="flex-1 text-[var(--muted)] flex items-center gap-2">
                            {row.icon && <Image src={goldIcon} alt="gold" width={16} height={16} className="object-contain" />}
                            {row.value}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    )
}

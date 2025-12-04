import { Auction } from "@/types";
import { characterCatalog } from "../data/characterCatalog";

const normalizeImagePath = (path?: string) =>
  (path ?? "").toLowerCase().replace(/^https?:\/\/[^/]+/, "");

const getImageKey = (path?: string) =>
  normalizeImagePath(path).replace(/frame_\d+\.(png|jpg|jpeg|webp)$/i, "");

export function resolveAuctionImage(auction: Auction): string {
  const normalized = normalizeImagePath(auction.imageUrl);
  const auctionKey = getImageKey(auction.imageUrl);

  const matchByExact = characterCatalog.find(
    (c) => normalizeImagePath(c.cardImage) === normalized
  );
  if (matchByExact) return matchByExact.cardImage;

  const matchByBase = characterCatalog.find(
    (c) => getImageKey(c.cardImage) === auctionKey
  );
  if (matchByBase) return matchByBase.cardImage;

  // Fallback to a deterministic hero image if the auction image is from legacy data
  const hash = Array.from(auction.id).reduce((acc, ch) => acc + ch.charCodeAt(0), 0);
  return characterCatalog[Math.abs(hash) % characterCatalog.length].cardImage;
}

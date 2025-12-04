const AUCTION_API_URL = process.env.NEXT_PUBLIC_AUCTION_API_URL || 'http://localhost:7001';
const BIDDING_API_URL = process.env.NEXT_PUBLIC_BIDDING_API_URL || 'http://localhost:7003';

export interface AuctionItem {
  id: string;
  seller: string;
  winner?: string | null;
  soldAmount?: number | null;
  currentHighBid?: number | null;
  createdAt: string;
  updatedAt: string;
  auctionEnd: string;
  status: string;
  reservePrice: number;
  item: {
    make: string;
    model: string;
    color: string;
    mileage: number;
    year: number;
    imageUrl: string;
  };
}

export interface BidDto {
  id: string;
  auctionId: string;
  bidder: string;
  bidTime: string;
  amount: number;
  bidStatus: string;
}

export const auctionService = {
  // Auction endpoints
  async getAuctions() {
    const res = await fetch(`${AUCTION_API_URL}/api/auctions`);
    if (!res.ok) throw new Error('Failed to fetch auctions');
    return res.json() as Promise<AuctionItem[]>;
  },

  async getAuction(id: string) {
    const res = await fetch(`${AUCTION_API_URL}/api/auctions/${id}`);
    if (!res.ok) throw new Error('Failed to fetch auction');
    return res.json() as Promise<AuctionItem>;
  },

  // Bidding endpoints
  async placeBid(auctionId: string, amount: number, token: string) {
    const res = await fetch(`${BIDDING_API_URL}/api/bids?auctionId=${auctionId}&amount=${amount}`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });

    if (!res.ok) {
      const error = await res.json();
      throw new Error(error.message || 'Failed to place bid');
    }

    return res.json() as Promise<BidDto>;
  },

  async getBidsForAuction(auctionId: string) {
    const res = await fetch(`${BIDDING_API_URL}/api/bids/${auctionId}`);
    if (!res.ok) throw new Error('Failed to fetch bids');
    return res.json() as Promise<BidDto[]>;
  }
};

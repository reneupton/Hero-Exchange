import { resolveAuctionImage } from '../../app/lib/resolveAuctionImage';
import { characterCatalog } from '../../app/data/characterCatalog';
import { Auction } from '@/types';

describe('resolveAuctionImage', () => {
  const sampleAuction = (overrides: Partial<Auction>): Auction => ({
    reserve: 0,
    seller: 'tester',
    soldAmount: 0,
    reservePrice: 0,
    currentHighBid: 0,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    auctionEnd: new Date().toISOString(),
    status: 'live',
    title: 'Sample',
    brand: '',
    category: '',
    variant: '',
    condition: '',
    colorway: '',
    specs: '',
    imageUrl: '',
    id: 'auction-1',
    ...overrides,
  });

  it('returns the exact matching card image', () => {
    const cardImage = characterCatalog[0].cardImage;
    const img = resolveAuctionImage(sampleAuction({ imageUrl: cardImage }));
    expect(img).toBe(cardImage);
  });

  it('matches by base path when frame number differs', () => {
    const cardImage = characterCatalog[1].cardImage;
    const base = cardImage.replace(/frame_\d+\.png$/, 'frame_9.png');
    const img = resolveAuctionImage(sampleAuction({ imageUrl: base }));
    expect(img).toBe(cardImage);
  });

  it('falls back deterministically when no match is found', () => {
    const id = 'non-matching-auction';
    const img = resolveAuctionImage(
      sampleAuction({ id, imageUrl: 'https://example.com/old-car.png' })
    );
    const expectedIndex = Array.from(id).reduce((acc, ch) => acc + ch.charCodeAt(0), 0) % characterCatalog.length;
    expect(img).toBe(characterCatalog[expectedIndex].cardImage);
  });
});

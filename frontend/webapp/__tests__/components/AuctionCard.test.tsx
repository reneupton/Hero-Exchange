import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import AuctionCard from '@/app/auctions/AuctionCard';
import { Auction } from '@/types';
import { CharacterDefinition } from '@/app/data/characterCatalog';

// Mock the CountdownTimer component
jest.mock('@/app/auctions/CountdownTimer', () => {
  return function MockCountdownTimer({ auctionEnd }: { auctionEnd: string }) {
    return <div data-testid="countdown-timer">Countdown: {auctionEnd}</div>;
  };
});

// Mock AnimatedHeroSprite
jest.mock('@/app/components/AnimatedHeroSprite', () => {
  return function MockAnimatedHeroSprite({ alt }: { alt: string }) {
    return <div data-testid="animated-sprite">{alt}</div>;
  };
});

const mockAuction: Auction = {
  id: 'auction-123',
  title: 'Test Auction',
  brand: 'Hero Exchange',
  category: 'Heroes',
  variant: 'Standard',
  condition: 'New',
  colorway: 'Default',
  specs: 'Test specs',
  imageUrl: '/test-image.png',
  seller: 'testSeller',
  reserve: 100,
  reservePrice: 100,
  currentHighBid: 150,
  soldAmount: 0,
  createdAt: '2025-11-01T00:00:00Z',
  updatedAt: '2025-11-01T00:00:00Z',
  auctionEnd: '2025-12-01T00:00:00Z',
  status: 'Live',
};

const mockCharacter: CharacterDefinition = {
  id: 'hero-1',
  name: 'Veyla the Shadow Lich',
  discipline: 'Necromancer',
  rarity: 'Legendary',
  gold: 5200,
  cardImage: '/pets/necromancer/card/frame_0.png',
  stats: {
    strength: 42,
    intellect: 95,
    vitality: 68,
    agility: 54,
  },
  lore: 'A powerful necromancer',
};

describe('AuctionCard', () => {
  const mockOnSelect = jest.fn();

  beforeEach(() => {
    mockOnSelect.mockClear();
  });

  describe('rendering', () => {
    it('should render the character name', () => {
      render(
        <AuctionCard
          auction={mockAuction}
          character={mockCharacter}
          onSelect={mockOnSelect}
        />
      );

      expect(screen.getByText('Veyla the Shadow Lich')).toBeInTheDocument();
    });

    it('should render the character discipline', () => {
      render(
        <AuctionCard
          auction={mockAuction}
          character={mockCharacter}
          onSelect={mockOnSelect}
        />
      );

      expect(screen.getByText('Necromancer')).toBeInTheDocument();
    });

    it('should render the rarity badge', () => {
      render(
        <AuctionCard
          auction={mockAuction}
          character={mockCharacter}
          onSelect={mockOnSelect}
        />
      );

      expect(screen.getByText('Legendary')).toBeInTheDocument();
    });

    it('should render the gold value with formatting', () => {
      render(
        <AuctionCard
          auction={mockAuction}
          character={mockCharacter}
          onSelect={mockOnSelect}
        />
      );

      expect(screen.getByText('5,200')).toBeInTheDocument();
    });

    it('should render character stats', () => {
      render(
        <AuctionCard
          auction={mockAuction}
          character={mockCharacter}
          onSelect={mockOnSelect}
        />
      );

      expect(screen.getByText(/STR 42/)).toBeInTheDocument();
      expect(screen.getByText(/INT 95/)).toBeInTheDocument();
      expect(screen.getByText(/VIT 68/)).toBeInTheDocument();
      expect(screen.getByText(/AGI 54/)).toBeInTheDocument();
    });

    it('should render the countdown timer', () => {
      render(
        <AuctionCard
          auction={mockAuction}
          character={mockCharacter}
          onSelect={mockOnSelect}
        />
      );

      expect(screen.getByTestId('countdown-timer')).toBeInTheDocument();
    });

    it('should render "Owned" badge when owned prop is true', () => {
      render(
        <AuctionCard
          auction={mockAuction}
          character={mockCharacter}
          owned={true}
          onSelect={mockOnSelect}
        />
      );

      expect(screen.getByText('Owned')).toBeInTheDocument();
    });

    it('should not render "Owned" badge when owned prop is false', () => {
      render(
        <AuctionCard
          auction={mockAuction}
          character={mockCharacter}
          owned={false}
          onSelect={mockOnSelect}
        />
      );

      expect(screen.queryByText('Owned')).not.toBeInTheDocument();
    });
  });

  describe('interactions', () => {
    it('should call onSelect when clicked', () => {
      render(
        <AuctionCard
          auction={mockAuction}
          character={mockCharacter}
          onSelect={mockOnSelect}
        />
      );

      const button = screen.getByRole('button');
      fireEvent.click(button);

      expect(mockOnSelect).toHaveBeenCalledTimes(1);
    });

    it('should handle multiple clicks', () => {
      render(
        <AuctionCard
          auction={mockAuction}
          character={mockCharacter}
          onSelect={mockOnSelect}
        />
      );

      const button = screen.getByRole('button');
      fireEvent.click(button);
      fireEvent.click(button);
      fireEvent.click(button);

      expect(mockOnSelect).toHaveBeenCalledTimes(3);
    });
  });

  describe('rarity styling', () => {
    const rarities: CharacterDefinition['rarity'][] = ['Common', 'Rare', 'Epic', 'Legendary'];

    rarities.forEach((rarity) => {
      it(`should render ${rarity} rarity badge`, () => {
        const character = { ...mockCharacter, rarity };
        render(
          <AuctionCard
            auction={mockAuction}
            character={character}
            onSelect={mockOnSelect}
          />
        );

        expect(screen.getByText(rarity)).toBeInTheDocument();
      });
    });
  });

  describe('different disciplines', () => {
    const disciplines: CharacterDefinition['discipline'][] = [
      'Warrior',
      'Ranger',
      'Necromancer',
      'Oracle',
      'Guardian',
      'Berserker',
      'Reaper',
      'Valkyrie',
    ];

    disciplines.forEach((discipline) => {
      it(`should render ${discipline} discipline`, () => {
        const character = { ...mockCharacter, discipline };
        render(
          <AuctionCard
            auction={mockAuction}
            character={character}
            onSelect={mockOnSelect}
          />
        );

        expect(screen.getByText(discipline)).toBeInTheDocument();
      });
    });
  });
});

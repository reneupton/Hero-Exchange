import React from 'react';
import { render, screen, act } from '@testing-library/react';
import DailySummonModal from '../../app/components/DailySummonModal';
import { OwnedHero } from '@/types';

jest.mock('../../app/components/AnimatedHeroSprite', () => () => <div data-testid="sprite" />);

const baseHero: OwnedHero = {
  heroId: 'elyra',
  variantId: 'elyra-rare',
  name: 'Elyra Nocturne',
  discipline: 'Oracle',
  rarity: 'Rare',
  strength: 10,
  intellect: 20,
  vitality: 30,
  agility: 40,
};

describe('DailySummonModal', () => {
  beforeEach(() => {
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.runOnlyPendingTimers();
    jest.useRealTimers();
  });

  it('does not render when closed', () => {
    render(
      <DailySummonModal
        isOpen={false}
        onClose={jest.fn()}
        hero={{ ...baseHero }}
        goldAwarded={120}
        rarity="Rare"
      />
    );

    expect(screen.queryByText(baseHero.name)).not.toBeInTheDocument();
  });

  it('renders catalog card art when the hero image is on a blocked domain', () => {
    const forbiddenHero = { ...baseHero, cardImage: 'https://forbidden.example.com/image.png' };

    render(
      <DailySummonModal
        isOpen
        onClose={jest.fn()}
        hero={forbiddenHero}
        goldAwarded={280}
        rarity="Rare"
      />
    );

    act(() => {
      jest.runAllTimers();
    });

    const heroImg = screen.getByAltText(forbiddenHero.name) as HTMLImageElement;
    expect(heroImg).toBeInTheDocument();
    expect(heroImg.src).toContain('/pets/craftpix-net-919731-free-chibi-dark-oracle-character-sprites/dark_oracle_1/card/frame_0.png');
  });

  it('falls back to default art when the hero is unknown and has no image', () => {
    const unknownHero: OwnedHero = {
      heroId: 'mystery',
      variantId: 'mystery-common',
      name: 'Mystery Hero',
      discipline: 'Warrior',
      rarity: 'Common',
      strength: 5,
      intellect: 5,
      vitality: 5,
      agility: 5,
    };

    render(
      <DailySummonModal
        isOpen
        onClose={jest.fn()}
        hero={unknownHero}
        goldAwarded={50}
        rarity="Common"
      />
    );

    act(() => {
      jest.runAllTimers();
    });

    const heroImg = screen.getByAltText(unknownHero.name) as HTMLImageElement;
    expect(heroImg).toBeInTheDocument();
    expect(heroImg.src).toContain('/pets/craftpix-net-919731-free-chibi-dark-oracle-character-sprites/dark_oracle_1/card/frame_0.png');
  });
});

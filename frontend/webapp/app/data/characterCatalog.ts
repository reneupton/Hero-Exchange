export type Rarity = 'Common' | 'Rare' | 'Epic' | 'Legendary';
export type Discipline = 'Warrior' | 'Ranger' | 'Necromancer' | 'Oracle' | 'Guardian' | 'Berserker' | 'Reaper' | 'Valkyrie';

export type CharacterDefinition = {
  id: string;
  name: string;
  discipline: Discipline;
  rarity: Rarity;
  lore?: string;
  avgSalePrice?: number;
  saleCount?: number;
  gold: number;
  cardImage: string;
};

type HeroArchetype = {
  id: string;
  name: string;
  discipline: Discipline;
  baseGold: number;
  cardImage: string;
  lore: string;
};

const rarityScale: Record<Rarity, number> = {
  Common: 0.7,
  Rare: 1,
  Epic: 1.25,
  Legendary: 1.5,
};

// Simulated average sale prices: slightly above gold value with variance
const avgSalePriceMultiplier: Record<Rarity, number> = {
  Common: 1.08,
  Rare: 1.12,
  Epic: 1.18,
  Legendary: 1.25,
};

// Simulated sale counts: rarer heroes sell less often
const baseSaleCounts: Record<Rarity, number> = {
  Common: 42,
  Rare: 28,
  Epic: 15,
  Legendary: 7,
};

const rarityOrder: Rarity[] = ['Common', 'Rare', 'Epic', 'Legendary'];

const heroArchetypes: HeroArchetype[] = [
  {
    id: 'veyla',
    name: 'Veyla the Shadow Lich',
    discipline: 'Necromancer',
    baseGold: 5200,
    cardImage: '/pets/craftpix-net-935193-free-chibi-necromancer-of-the-shadow-character-sprites/necromancer_of_the_shadow_1/card/frame_0.png',
    lore: 'Master of shadowflame and soul drain from the Umbral crypts.',
  },
  {
    id: 'elyra',
    name: 'Elyra Nocturne',
    discipline: 'Oracle',
    baseGold: 4200,
    cardImage: '/pets/craftpix-net-919731-free-chibi-dark-oracle-character-sprites/dark_oracle_1/card/frame_0.png',
    lore: 'Seer of eclipses, her whispers bend fate.',
  },
  {
    id: 'morr',
    name: 'Morr Wispblade',
    discipline: 'Reaper',
    baseGold: 3800,
    cardImage: '/pets/craftpix-904589-free-reaper-man-chibi-2d-game-sprites/reaper_man_1/card/frame_1.png',
    lore: 'Edge of dusk; the silent executioner of wraith clans.',
  },
  {
    id: 'sigrun',
    name: 'Sigrun Dawnbreak',
    discipline: 'Valkyrie',
    baseGold: 5600,
    cardImage: '/pets/craftpix-net-469596-free-chibi-valkyrie-character-sprites/valkyrie_1/card/frame_3.png',
    lore: 'Sunsteel skyrider guarding fallen champions.',
  },
  {
    id: 'caelys',
    name: 'Caelys Ember-Crusader',
    discipline: 'Warrior',
    baseGold: 4000,
    cardImage: '/pets/craftpix-net-166787-free-chibi-skeleton-crusader-character-sprites/skeleton_crusader_1/card/frame_0.png',
    lore: 'Frontline bastion wielding ember-forged faith.',
  },
  {
    id: 'torhild',
    name: 'Torhild Embercore',
    discipline: 'Guardian',
    baseGold: 4500,
    cardImage: '/pets/craftpix-891123-free-golems-chibi-2d-game-sprites/golem_1/card/frame_1.png',
    lore: 'Living bulwark of stone and flame.',
  },
  {
    id: 'frostech',
    name: 'Frostech Ward',
    discipline: 'Guardian',
    baseGold: 3600,
    cardImage: '/pets/craftpix-891123-free-golems-chibi-2d-game-sprites/golem_2/card/frame_2.png',
    lore: 'Icebound sentinel anchoring the line.',
  },
  {
    id: 'grum',
    name: "D'reece Ironhorn",
    discipline: 'Berserker',
    baseGold: 4700,
    cardImage: '/pets/craftpix-net-534656-free-minotaur-chibi-character-sprites/minotaur_1/card/frame_1.png',
    lore: 'Stampeding minotaur whose charge breaks warlines.',
  },
  {
    id: 'astrael',
    name: 'Astrael Fallen',
    discipline: 'Reaper',
    baseGold: 5400,
    cardImage: '/pets/craftpix-991117-free-fallen-angel-chibi-2d-game-sprites/fallen_angels_1/card/frame_0.png',
    lore: 'Winged revenant wielding twilight scythes.',
  },
  {
    id: 'dresh',
    name: 'Dresh Wildarrow',
    discipline: 'Ranger',
    baseGold: 3000,
    cardImage: '/pets/craftpix-064112-free-orc-ogre-and-goblin-chibi-2d-game-sprites/orc/card/frame_0.png',
    lore: 'Quickdraw hunter of the wild clans.',
  },
];

export const characterCatalog: CharacterDefinition[] = heroArchetypes.flatMap((hero) =>
  rarityOrder.map((rarity) => {
    const m = rarityScale[rarity];
    const goldValue = Math.round(hero.baseGold * m);
    return {
      id: `${hero.id}-${rarity.toLowerCase()}`,
      name: hero.name,
      discipline: hero.discipline,
      rarity,
      lore: hero.lore,
      gold: goldValue,
      cardImage: hero.cardImage,
      avgSalePrice: Math.round(goldValue * avgSalePriceMultiplier[rarity]),
      saleCount: baseSaleCounts[rarity],
    };
  })
);

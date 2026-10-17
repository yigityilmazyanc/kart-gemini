export type Suit = "S" | "H" | "D" | "C";
export const SUITS: readonly Suit[] = ["S", "H", "D", "C"];

export const SUIT_NAMES: Record<Suit, string> = {
  S: "Maça",
  H: "Kupa",
  D: "Karo",
  C: "Sinek",
};

export const SUIT_SYMBOLS: Record<Suit, string> = {
  S: "♠",
  H: "♥",
  D: "♦",
  C: "♣",
};

export type Rank = 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11 | 12 | 13 | 14;
export const RANKS: readonly Rank[] = [2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14];

export type Enhancement = "none" | "bonus" | "mult" | "steel" | "gold";

export const ENHANCEMENT_NAMES: Record<Enhancement, string> = {
  none: "Standart",
  bonus: "Kristal (+30 Fiş)",
  mult: "Ateş (+4 Çarpan)",
  steel: "Çelik (×1.5 Çarpan)",
  gold: "Altın (+3 Altın)",
};

export interface Card {
  id: string;
  code: string;
  suit: Suit;
  rank: Rank;
  enhancement: Enhancement;
}

export function rankLabel(rank: Rank): string {
  if (rank === 14) return "A";
  if (rank === 13) return "K";
  if (rank === 12) return "Q";
  if (rank === 11) return "J";
  return String(rank);
}

export function cardChips(rank: Rank): number {
  if (rank === 14) return 11;
  if (rank >= 10) return 10;
  return rank;
}

export function makeDeck(): Card[] {
  const deck: Card[] = [];
  for (const suit of SUITS) {
    for (const rank of RANKS) {
      const code = `${rankLabel(rank)}${suit}`;
      deck.push({ id: code, code, suit, rank, enhancement: "none" });
    }
  }
  return deck;
}

export function sortCards(cards: readonly Card[], mode: "rank" | "suit"): Card[] {
  const suitOrder: Record<Suit, number> = { S: 0, H: 1, D: 2, C: 3 };
  return cards.slice().sort((a, b) => {
    if (mode === "rank") {
      if (b.rank !== a.rank) return b.rank - a.rank;
      return suitOrder[a.suit] - suitOrder[b.suit];
    }
    if (suitOrder[a.suit] !== suitOrder[b.suit]) return suitOrder[a.suit] - suitOrder[b.suit];
    return b.rank - a.rank;
  });
}

// ---------- Poker Hand Evaluation ----------

export type HandType =
  | "royal_flush"
  | "straight_flush"
  | "four_of_a_kind"
  | "full_house"
  | "flush"
  | "straight"
  | "three_of_a_kind"
  | "two_pair"
  | "pair"
  | "high_card";

export interface HandDef {
  type: HandType;
  name: string;
  baseChips: number;
  baseMult: number;
  levelChips: number;
  levelMult: number;
  order: number;
}

export const HAND_DEFS: Record<HandType, HandDef> = {
  royal_flush: { type: "royal_flush", name: "Asil Floş", baseChips: 100, baseMult: 8, levelChips: 40, levelMult: 4, order: 1 },
  straight_flush: { type: "straight_flush", name: "Sıralı Floş", baseChips: 100, baseMult: 8, levelChips: 40, levelMult: 4, order: 2 },
  four_of_a_kind: { type: "four_of_a_kind", name: "Kare", baseChips: 60, baseMult: 7, levelChips: 30, levelMult: 3, order: 3 },
  full_house: { type: "full_house", name: "Ful", baseChips: 40, baseMult: 4, levelChips: 25, levelMult: 2, order: 4 },
  flush: { type: "flush", name: "Floş", baseChips: 35, baseMult: 4, levelChips: 15, levelMult: 2, order: 5 },
  straight: { type: "straight", name: "Kent", baseChips: 30, baseMult: 4, levelChips: 30, levelMult: 3, order: 6 },
  three_of_a_kind: { type: "three_of_a_kind", name: "Üçlü", baseChips: 30, baseMult: 3, levelChips: 20, levelMult: 2, order: 7 },
  two_pair: { type: "two_pair", name: "İki Çift", baseChips: 20, baseMult: 2, levelChips: 20, levelMult: 1, order: 8 },
  pair: { type: "pair", name: "Çift", baseChips: 10, baseMult: 2, levelChips: 15, levelMult: 1, order: 9 },
  high_card: { type: "high_card", name: "Yüksek Kart", baseChips: 5, baseMult: 1, levelChips: 10, levelMult: 1, order: 10 },
};

export const HAND_TYPES: readonly HandType[] = [
  "royal_flush",
  "straight_flush",
  "four_of_a_kind",
  "full_house",
  "flush",
  "straight",
  "three_of_a_kind",
  "two_pair",
  "pair",
  "high_card",
];

export interface EvaluatedHand {
  type: HandType;
  name: string;
  scoringCards: Card[];
}

export function evaluateHand(cards: readonly Card[]): EvaluatedHand {
  if (cards.length === 0) {
    return { type: "high_card", name: HAND_DEFS.high_card.name, scoringCards: [] };
  }

  const sorted = sortCards(cards, "rank");
  const byRank = new Map<Rank, Card[]>();
  for (const c of sorted) {
    const list = byRank.get(c.rank) ?? [];
    list.push(c);
    byRank.set(c.rank, list);
  }

  const groups = [...byRank.entries()].sort((a, b) => {
    if (b[1].length !== a[1].length) return b[1].length - a[1].length;
    return b[0] - a[0];
  });

  const firstSuit = sorted[0]?.suit;
  const isFlush = sorted.length === 5 && sorted.every((c) => c.suit === firstSuit);

  let isStraight = false;
  if (sorted.length === 5 && groups.length === 5) {
    const ranks = sorted.map((c) => c.rank);
    const high = ranks[0]!;
    const low = ranks[4]!;
    if (high - low === 4) {
      isStraight = true;
    } else if (ranks[0] === 14 && ranks[1] === 5 && ranks[2] === 4 && ranks[3] === 3 && ranks[4] === 2) {
      isStraight = true;
    }
  }

  if (isFlush && isStraight) {
    const hasAce = sorted.some((c) => c.rank === 14);
    const hasTen = sorted.some((c) => c.rank === 10);
    const type: HandType = hasAce && hasTen ? "royal_flush" : "straight_flush";
    return { type, name: HAND_DEFS[type].name, scoringCards: sorted };
  }

  const g0 = groups[0];
  const g1 = groups[1];

  if (g0 && g0[1].length === 4) {
    return { type: "four_of_a_kind", name: HAND_DEFS.four_of_a_kind.name, scoringCards: g0[1] };
  }

  if (g0 && g0[1].length === 3 && g1 && g1[1].length === 2) {
    return { type: "full_house", name: HAND_DEFS.full_house.name, scoringCards: sorted };
  }

  if (isFlush) {
    return { type: "flush", name: HAND_DEFS.flush.name, scoringCards: sorted };
  }

  if (isStraight) {
    return { type: "straight", name: HAND_DEFS.straight.name, scoringCards: sorted };
  }

  if (g0 && g0[1].length === 3) {
    return { type: "three_of_a_kind", name: HAND_DEFS.three_of_a_kind.name, scoringCards: g0[1] };
  }

  if (g0 && g0[1].length === 2 && g1 && g1[1].length === 2) {
    return { type: "two_pair", name: HAND_DEFS.two_pair.name, scoringCards: [...g0[1], ...g1[1]] };
  }

  if (g0 && g0[1].length === 2) {
    return { type: "pair", name: HAND_DEFS.pair.name, scoringCards: g0[1] };
  }

  return { type: "high_card", name: HAND_DEFS.high_card.name, scoringCards: [sorted[0]!] };
}

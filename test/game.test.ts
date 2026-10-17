import { describe, expect, it } from "vitest";
import { type Card, type Enhancement, type Rank, type Suit, cardChips, evaluateHand, makeDeck, sortCards } from "../src/logic/cards";
import { BOSS_RULES, TALISMANS } from "../src/logic/catalog";
import { MAX_TALISMANS, SimyaGame } from "../src/logic/game";

function mkCard(code: string, enhancement: Enhancement = "none"): Card {
  const suit = code.slice(-1) as Suit;
  const rStr = code.slice(0, -1);
  const rankMap: Record<string, Rank> = { A: 14, K: 13, Q: 12, J: 11 };
  const rank = (rankMap[rStr] ?? Number(rStr)) as Rank;
  return { id: code, code, suit, rank, enhancement };
}

describe("Deck & Card Helpers", () => {
  it("builds a standard 52-card deck with expected chip values", () => {
    const deck = makeDeck();
    expect(deck).toHaveLength(52);
    expect(new Set(deck.map((c) => c.id)).size).toBe(52);
    expect(cardChips(2)).toBe(2);
    expect(cardChips(10)).toBe(10);
    expect(cardChips(13)).toBe(10);
    expect(cardChips(14)).toBe(11);
  });

  it("sorts cards by rank descending or by suit", () => {
    const cards = [mkCard("3H"), mkCard("AS"), mkCard("10S"), mkCard("KH")];
    expect(sortCards(cards, "rank").map((c) => c.code)).toEqual(["AS", "KH", "10S", "3H"]);
    expect(sortCards(cards, "suit").map((c) => c.code)).toEqual(["AS", "10S", "KH", "3H"]);
  });

  it("assigns a distinct icon to every talisman", () => {
    const icons = TALISMANS.map((t) => t.icon);
    expect(new Set(icons).size).toBe(TALISMANS.length);
  });
});

describe("Poker Hand Evaluation", () => {
  it("identifies High Card, Pair, Two Pair, and Three of a Kind with only active scoring cards", () => {
    const high = evaluateHand([mkCard("AS"), mkCard("9H"), mkCard("4D"), mkCard("2C")]);
    expect(high.type).toBe("high_card");
    expect(high.scoringCards.map((c) => c.code)).toEqual(["AS"]);

    const pair = evaluateHand([mkCard("KH"), mkCard("KD"), mkCard("7S"), mkCard("2C")]);
    expect(pair.type).toBe("pair");
    expect(pair.scoringCards.map((c) => c.code)).toEqual(["KH", "KD"]);

    const twoPair = evaluateHand([mkCard("JH"), mkCard("JD"), mkCard("4S"), mkCard("4C"), mkCard("9H")]);
    expect(twoPair.type).toBe("two_pair");
    expect(twoPair.scoringCards).toHaveLength(4);

    const trips = evaluateHand([mkCard("8S"), mkCard("8H"), mkCard("8D"), mkCard("KC"), mkCard("2H")]);
    expect(trips.type).toBe("three_of_a_kind");
    expect(trips.scoringCards).toHaveLength(3);
  });

  it("identifies Straight (normal and A-2-3-4-5 wheel), Flush, Full House, Four of a Kind, Straight Flush, Royal Flush", () => {
    expect(evaluateHand([mkCard("9S"), mkCard("8H"), mkCard("7D"), mkCard("6C"), mkCard("5S")]).type).toBe("straight");
    expect(evaluateHand([mkCard("AS"), mkCard("2H"), mkCard("3D"), mkCard("4C"), mkCard("5S")]).type).toBe("straight");
    expect(evaluateHand([mkCard("AH"), mkCard("JH"), mkCard("8H"), mkCard("4H"), mkCard("2H")]).type).toBe("flush");
    expect(evaluateHand([mkCard("QS"), mkCard("QH"), mkCard("QD"), mkCard("5C"), mkCard("5S")]).type).toBe("full_house");

    const quads = evaluateHand([mkCard("9S"), mkCard("9H"), mkCard("9D"), mkCard("9C"), mkCard("AS")]);
    expect(quads.type).toBe("four_of_a_kind");
    expect(quads.scoringCards).toHaveLength(4);

    expect(evaluateHand([mkCard("9H"), mkCard("8H"), mkCard("7H"), mkCard("6H"), mkCard("5H")]).type).toBe("straight_flush");
    expect(evaluateHand([mkCard("AS"), mkCard("KS"), mkCard("QS"), mkCard("JS"), mkCard("10S")]).type).toBe("royal_flush");
  });
});

describe("SimyaGame Determinism & Core Loop", () => {
  it("produces identical initial hands and play sequences for the same seed", () => {
    const g1 = new SimyaGame(42);
    const g2 = new SimyaGame(42);
    expect(g1.hand.map((c) => c.code)).toEqual(g2.hand.map((c) => c.code));

    g1.selectBest();
    g2.selectBest();
    expect(g1.selectedCards().map((c) => c.code)).toEqual(g2.selectedCards().map((c) => c.code));

    const r1 = g1.playHand();
    const r2 = g2.playHand();
    expect(r1).toEqual(r2);
    expect(g1.score).toBe(g2.score);
  });

  it("supports discarding selected cards and drawing replacements", () => {
    const g = new SimyaGame(7);
    const initialCodes = g.hand.map((c) => c.code);
    expect(g.toggleSelect(0)).toBe(true);
    expect(g.toggleSelect(1)).toBe(true);
    expect(g.discardSelected()).toBe(true);
    expect(g.discardsLeft).toBe(2);
    expect(g.hand).toHaveLength(8);
    expect(g.hand.map((c) => c.code)).not.toEqual(initialCodes);
  });

  it("ends the round as 'over' when deck and hand are exhausted via discardSelected or playHand", () => {
    const gDiscard = new SimyaGame(5, { discards: 20 });
    while (gDiscard.phase === "playing" && gDiscard.hand.length > 0) {
      const pick = gDiscard.hand.slice(0, Math.min(5, gDiscard.hand.length)).map((c) => c.id);
      expect(gDiscard.selectCards(pick)).toBe(true);
      expect(gDiscard.discardSelected()).toBe(true);
    }
    expect(gDiscard.hand).toHaveLength(0);
    expect(gDiscard.drawPile).toHaveLength(0);
    expect(gDiscard.phase).toBe("over");

    const gPlay = new SimyaGame(5, { hands: 20, target: 999999 });
    while (gPlay.phase === "playing" && gPlay.hand.length > 0) {
      const pick = gPlay.hand.slice(0, Math.min(5, gPlay.hand.length)).map((c) => c.id);
      gPlay.selectCards(pick);
      gPlay.playHand();
    }
    expect(gPlay.hand).toHaveLength(0);
    expect(gPlay.drawPile).toHaveLength(0);
    expect(gPlay.phase).toBe("over");
  });

  it("calculates score independently of card sort order and talisman purchase order", () => {
    const g = new SimyaGame(1, { talismans: ["butunleyici_mercek"] });
    g.hand = [mkCard("AC", "mult"), mkCard("2D", "steel")];
    g.selectCards(["AC", "2D"]);

    g.sortHand("rank");
    const rankRep = g.scoreSelection()!;
    g.sortHand("suit");
    const suitRep = g.scoreSelection()!;

    expect(rankRep.chips).toBe(38);
    expect(rankRep.mult).toBe(7.5);
    expect(rankRep.score).toBe(285);
    expect(suitRep.score).toBe(285);
    expect(suitRep.chips).toBe(rankRep.chips);
    expect(suitRep.mult).toBe(rankRep.mult);

    const pairCards = [mkCard("8S"), mkCard("8D")];
    const gOrderA = new SimyaGame(1, { hands: 1, discards: 2, talismans: ["son_nefes_saati", "cift_ayna"] });
    const gOrderB = new SimyaGame(1, { hands: 1, discards: 2, talismans: ["cift_ayna", "son_nefes_saati"] });
    const repA = gOrderA.scoreSelection(pairCards)!;
    const repB = gOrderB.scoreSelection(pairCards)!;
    expect(repA.chips).toBe(76);
    expect(repA.mult).toBe(20);
    expect(repA.score).toBe(1520);
    expect(repB.score).toBe(repA.score);
  });

  it("applies talisman synergies, card enhancements (including steel and gold), and boss rules accurately", () => {
    const g = new SimyaGame(10, {
      gold: 10,
      talismans: ["kizil_yakut", "cift_ayna", "filozof_tasi"],
    });
    const testCards = [mkCard("AH", "bonus"), mkCard("AD", "mult")];
    const rep = g.scoreSelection(testCards)!;
    expect(rep.handType).toBe("pair");
    expect(rep.chips).toBe(62);
    expect(rep.mult).toBe(27);
    expect(rep.score).toBe(1674);

    const gEnh = new SimyaGame(10, { gold: 5, target: 9999 });
    gEnh.hand = [mkCard("KH", "steel"), mkCard("KD", "gold"), mkCard("4C")];
    gEnh.selectCards(["KH", "KD"]);
    const enhRep = gEnh.playHand()!;
    expect(enhRep.chips).toBe(30);
    expect(enhRep.mult).toBe(3);
    expect(enhRep.score).toBe(90);
    expect(enhRep.goldEarned).toBe(3);
    expect(gEnh.gold).toBe(8);

    const gBoss = new SimyaGame(10, {
      talismans: ["kizil_yakut", "cift_ayna"],
      bossRule: "debuff_H",
    });
    const bossRep = gBoss.scoreSelection(testCards)!;
    expect(bossRep.debuffedIds).toEqual(["AH"]);
    expect(bossRep.chips).toBe(21);
    expect(bossRep.mult).toBe(14);
  });

  it("evaluates butunleyici_mercek, son_nefes_saati, and altin_terazi talismans", () => {
    const gLens = new SimyaGame(12, { talismans: ["butunleyici_mercek", "kizil_yakut"] });
    const cards = [mkCard("AS"), mkCard("9H", "bonus"), mkCard("2C")];
    const lensRep = gLens.scoreSelection(cards)!;
    expect(lensRep.handType).toBe("high_card");
    expect(lensRep.scoringIds).toEqual(["AS", "9H", "2C"]);
    expect(lensRep.chips).toBe(87);
    expect(lensRep.mult).toBe(5);

    const gClock = new SimyaGame(12, { hands: 3, discards: 2, talismans: ["son_nefes_saati"] });
    const clockRep1 = gClock.scoreSelection([mkCard("AS")])!;
    expect(clockRep1.chips).toBe(5 + 11 + 50);
    expect(clockRep1.mult).toBe(1);

    const gScale = new SimyaGame(12, { gold: 10, target: 20, talismans: ["altin_terazi"] });
    const scaleRep = gScale.scoreSelection([mkCard("AS")])!;
    expect(scaleRep.chips).toBe(5 + 11 + 30);
    gScale.selectBest();
    gScale.playHand();
    expect(gScale.phase).toBe("shop");
    expect(gScale.lastReward?.talismanGold).toBe(3);
  });

  it("calculates round rewards and interest cap accurately", () => {
    const g = new SimyaGame(21, { target: 10, gold: 30, hands: 4 });
    g.selectBest();
    g.playHand();
    expect(g.phase).toBe("shop");
    expect(g.lastReward).toEqual({
      baseReward: 4,
      handsBonus: 3,
      interest: 5,
      talismanGold: 0,
      total: 12,
    });
    expect(g.gold).toBe(42);
  });

  it("rotates boss rules on rounds 3, 6, and 9 while keeping non-boss rounds clear", () => {
    const g = new SimyaGame(14, { target: 10, gold: 100 });
    const seenBosses: string[] = [];
    for (let r = 1; r <= 9; r++) {
      expect(g.round).toBe(r);
      if (r % 3 === 0) {
        expect(g.bossRule).not.toBeNull();
        expect(BOSS_RULES.some((b) => b.id === g.bossRule)).toBe(true);
        seenBosses.push(g.bossRule!);
      } else {
        expect(g.bossRule).toBeNull();
      }
      if (r < 9) {
        g.target = 10;
        g.selectBest();
        g.playHand();
        expect(g.phase).toBe("shop");
        g.nextRound();
      }
    }
    expect(seenBosses).toHaveLength(3);
    expect(new Set(seenBosses).size).toBe(3);
  });

  it("persists voucher effects (extra_hand, extra_discard, extra_hand_size, and deck enhancements) across rounds", () => {
    const g = new SimyaGame(25, { target: 10, gold: 200 });
    g.selectBest();
    g.playHand();
    expect(g.phase).toBe("shop");

    g.shop = [
      { id: "voucher:extra_hand", kind: "voucher", name: "Zaman Mührü", desc: "", cost: 5, icon: "heart", bought: false, voucherId: "extra_hand" },
      { id: "voucher:extra_discard", kind: "voucher", name: "Rüzgâr Mührü", desc: "", cost: 5, icon: "star", bought: false, voucherId: "extra_discard" },
      { id: "voucher:extra_hand_size", kind: "voucher", name: "Geniş Masa", desc: "", cost: 5, icon: "crown", bought: false, voucherId: "extra_hand_size" },
      { id: "voucher:enhance_steel", kind: "voucher", name: "Çelik İksiri", desc: "", cost: 5, icon: "icon-potion", bought: false, voucherId: "enhance_steel" },
      { id: "voucher:enhance_gold", kind: "voucher", name: "Altın İksiri", desc: "", cost: 5, icon: "icon-coin", bought: false, voucherId: "enhance_gold" },
    ];
    for (let i = 0; i < g.shop.length; i++) {
      expect(g.buyItem(i)).toBe(true);
    }

    expect(g.maxHands).toBe(5);
    expect(g.maxDiscards).toBe(4);
    expect(g.handSize).toBe(9);
    expect(g.fullDeck.filter((c) => c.enhancement === "steel")).toHaveLength(2);
    expect(g.fullDeck.filter((c) => c.enhancement === "gold")).toHaveLength(3);

    expect(g.nextRound()).toBe(true);
    expect(g.handsLeft).toBe(5);
    expect(g.discardsLeft).toBe(4);
    expect(g.hand).toHaveLength(9);
    const totalEnhancedInRound2 = [...g.hand, ...g.drawPile].filter((c) => c.enhancement !== "none");
    expect(totalEnhancedInRound2).toHaveLength(5);
  });

  it("rejects invalid shop purchases (insufficient gold, full talisman shelf, or already bought item)", () => {
    const g = new SimyaGame(30, {
      target: 10,
      gold: 0,
      talismans: ["kizil_yakut", "gece_obsidyeni", "gunes_kehribari", "zumrut_yaprak", "cift_ayna"],
    });
    expect(g.talismans).toHaveLength(MAX_TALISMANS);
    g.selectBest();
    g.playHand();
    expect(g.phase).toBe("shop");

    g.gold = 100;
    const talismanIdx = g.shop.findIndex((s) => s.kind === "talisman");
    expect(talismanIdx).toBeGreaterThanOrEqual(0);
    expect(g.buyItem(talismanIdx)).toBe(false);
    expect(g.talismans).toHaveLength(MAX_TALISMANS);

    const upgIdx = g.shop.findIndex((s) => s.kind === "upgrade");
    expect(g.buyItem(upgIdx)).toBe(true);
    expect(g.buyItem(upgIdx)).toBe(false);

    g.gold = 0;
    const voucherIdx = g.shop.findIndex((s) => s.kind === "voucher");
    expect(g.buyItem(voucherIdx)).toBe(false);
    expect(g.rerollShop()).toBe(false);
  });

  it("enforces max_4_cards boss rule", () => {
    const g = new SimyaGame(15, { bossRule: "max_4_cards" });
    expect(g.maxSelectable()).toBe(4);
    expect(g.selectCards([0, 1, 2, 3, 4])).toBe(true);
    expect(g.selectedCards()).toHaveLength(4);
  });

  it("transitions to shop on beating a round, allows buying/selling/rerolling, and advances to next round", () => {
    const g = new SimyaGame(21, { target: 20, gold: 30 });
    g.selectBest();
    const rep = g.playHand();
    expect(rep).not.toBeNull();
    expect(g.phase).toBe("shop");
    expect(g.shop.length).toBeGreaterThanOrEqual(3);

    const beforeGold = g.gold;
    expect(g.buyItem(0)).toBe(true);
    expect(g.gold).toBeLessThan(beforeGold);
    expect(g.talismans.length).toBe(1);

    const upgIdx = g.shop.findIndex((s) => s.kind === "upgrade");
    if (upgIdx >= 0) {
      const ht = g.shop[upgIdx]!.handType!;
      expect(g.buyItem(upgIdx)).toBe(true);
      expect(g.handLevels[ht]).toBe(2);
    }

    expect(g.rerollShop()).toBe(true);
    expect(g.sellTalisman(0)).toBe(true);
    expect(g.talismans).toHaveLength(0);

    expect(g.nextRound()).toBe(true);
    expect(g.phase).toBe("playing");
    expect(g.round).toBe(2);
  });

  it("ends the run with 'won' when final round is cleared and 'over' when hands run out", () => {
    const winGame = new SimyaGame(9, { target: 15, maxRounds: 1 });
    winGame.selectBest();
    winGame.playHand();
    expect(winGame.phase).toBe("won");

    const loseGame = new SimyaGame(9, { target: 99999, hands: 1 });
    loseGame.toggleSelect(0);
    loseGame.playHand();
    expect(loseGame.phase).toBe("over");
  });

  it("meets balance targets across 300 seeds for the unskilled bot (Round 1 >= 80%, full run <= 15%)", () => {
    const totalSeeds = 300;
    let round1Cleared = 0;
    let fullRunWon = 0;

    for (let seed = 1; seed <= totalSeeds; seed++) {
      const g = new SimyaGame(seed);
      let countedR1 = false;
      while (g.phase === "playing" || g.phase === "shop") {
        if (g.phase === "playing") {
          g.selectBest();
          g.playHand();
        } else {
          if (!countedR1 && g.round === 1) {
            round1Cleared += 1;
            countedR1 = true;
          }
          for (let i = 0; i < g.shop.length; i++) {
            g.buyItem(i);
          }
          g.nextRound();
        }
      }
      if (g.phase === "won") {
        fullRunWon += 1;
      }
    }

    const round1Rate = round1Cleared / totalSeeds;
    const winRate = fullRunWon / totalSeeds;
    expect(round1Rate).toBeGreaterThanOrEqual(0.8);
    expect(winRate).toBeGreaterThan(0);
    expect(winRate).toBeLessThanOrEqual(0.15);
  });
});

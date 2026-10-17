import { Rng } from "../kit/index";
import {
  type Card,
  type Enhancement,
  HAND_DEFS,
  HAND_TYPES,
  type HandType,
  cardChips,
  evaluateHand,
  makeDeck,
  sortCards,
} from "./cards";
import {
  BOSS_RULES,
  type BossRuleId,
  type ShopItem,
  TALISMAN_MAP,
  type TalismanId,
  generateShopItems,
  isCardDebuffed,
  roundTitle,
  targetScoreForRound,
} from "./catalog";

export type Phase = "playing" | "shop" | "won" | "over";

export const MAX_TALISMANS = 5;
export const DEFAULT_HANDS = 4;
export const DEFAULT_DISCARDS = 3;
export const DEFAULT_HAND_SIZE = 8;
export const DEFAULT_GOLD = 6;
export const DEFAULT_MAX_ROUNDS = 9;

export interface GameOptions {
  hands?: number;
  discards?: number;
  handSize?: number;
  gold?: number;
  target?: number;
  maxRounds?: number;
  talismans?: TalismanId[];
  bossRule?: BossRuleId;
}

export interface HandScoreReport {
  handType: HandType;
  handName: string;
  level: number;
  baseChips: number;
  baseMult: number;
  chips: number;
  mult: number;
  score: number;
  goldEarned: number;
  playedCodes: string[];
  scoringIds: string[];
  debuffedIds: string[];
  triggeredTalismans: TalismanId[];
}

export interface RoundRewardReport {
  baseReward: number;
  handsBonus: number;
  interest: number;
  talismanGold: number;
  total: number;
}

export class SimyaGame {
  readonly seed: number;
  private rng: Rng;

  phase: Phase = "playing";
  round = 1;
  maxRounds: number;
  score = 0;
  target: number;
  totalScore = 0;

  maxHands: number;
  maxDiscards: number;
  handSize: number;
  handsLeft: number;
  discardsLeft: number;
  gold: number;
  rerollCost = 2;
  vouchersBought = 0;

  bossRule: BossRuleId | null = null;
  private pinnedTarget?: number;
  private pinnedBoss?: BossRuleId;

  fullDeck: Card[];
  drawPile: Card[] = [];
  hand: Card[] = [];
  selectedIds = new Set<string>();
  sortMode: "rank" | "suit" = "rank";

  talismans: TalismanId[] = [];
  handLevels: Record<HandType, number>;
  shop: ShopItem[] = [];
  lastHand: HandScoreReport | null = null;
  lastReward: RoundRewardReport | null = null;

  constructor(seed: number, opts: GameOptions = {}) {
    this.seed = seed >>> 0;
    this.rng = new Rng(this.seed);
    this.maxHands = opts.hands ?? DEFAULT_HANDS;
    this.maxDiscards = opts.discards ?? DEFAULT_DISCARDS;
    this.handSize = opts.handSize ?? DEFAULT_HAND_SIZE;
    this.handsLeft = this.maxHands;
    this.discardsLeft = this.maxDiscards;
    this.gold = opts.gold ?? DEFAULT_GOLD;
    this.maxRounds = opts.maxRounds ?? DEFAULT_MAX_ROUNDS;
    this.pinnedTarget = opts.target;
    this.pinnedBoss = opts.bossRule;

    if (opts.talismans) {
      for (const t of opts.talismans) {
        if (t in TALISMAN_MAP && this.talismans.length < MAX_TALISMANS && !this.talismans.includes(t)) {
          this.talismans.push(t);
        }
      }
    }

    this.handLevels = Object.fromEntries(HAND_TYPES.map((t) => [t, 1])) as Record<HandType, number>;
    this.fullDeck = makeDeck();
    this.target = this.pinnedTarget ?? targetScoreForRound(1);
    this.startRound(1);
  }

  get act(): number {
    return Math.ceil(this.round / 3);
  }

  get title(): string {
    return roundTitle(this.round);
  }

  maxSelectable(): number {
    return this.bossRule === "max_4_cards" ? 4 : 5;
  }

  handStats(type: HandType): { level: number; chips: number; mult: number; name: string } {
    const def = HAND_DEFS[type];
    const level = this.handLevels[type] ?? 1;
    return {
      level,
      chips: def.baseChips + (level - 1) * def.levelChips,
      mult: def.baseMult + (level - 1) * def.levelMult,
      name: def.name,
    };
  }

  private startRound(roundNum: number): void {
    this.round = roundNum;
    this.phase = "playing";
    this.score = 0;
    this.handsLeft = this.maxHands;
    this.discardsLeft = this.maxDiscards;
    this.selectedIds.clear();
    this.lastHand = null;
    this.shop = [];

    if (roundNum === 1 && this.pinnedTarget !== undefined) {
      this.target = this.pinnedTarget;
    } else {
      this.target = targetScoreForRound(roundNum);
    }

    if (this.pinnedBoss) {
      this.bossRule = this.pinnedBoss;
    } else if (roundNum % 3 === 0) {
      const idx = (Math.floor(roundNum / 3) - 1 + (this.seed % BOSS_RULES.length)) % BOSS_RULES.length;
      this.bossRule = BOSS_RULES[idx]!.id;
    } else {
      this.bossRule = null;
    }

    this.drawPile = this.rng.shuffle(this.fullDeck.map((c) => ({ ...c })));
    this.hand = [];
    this.drawToHandSize();
  }

  private drawToHandSize(): void {
    while (this.hand.length < this.handSize && this.drawPile.length > 0) {
      const next = this.drawPile.pop();
      if (next) this.hand.push(next);
    }
    this.hand = sortCards(this.hand, this.sortMode);
  }

  // ---------- Card Selection ----------

  resolveHandCard(indexOrCode: number | string): Card | undefined {
    if (typeof indexOrCode === "number") {
      if (!Number.isInteger(indexOrCode) || indexOrCode < 0 || indexOrCode >= this.hand.length) return undefined;
      return this.hand[indexOrCode];
    }
    const norm = String(indexOrCode).trim().toUpperCase();
    return this.hand.find((c) => c.id.toUpperCase() === norm || c.code.toUpperCase() === norm);
  }

  toggleSelect(indexOrCode: number | string): boolean {
    if (this.phase !== "playing") return false;
    const card = this.resolveHandCard(indexOrCode);
    if (!card) return false;
    if (this.selectedIds.has(card.id)) {
      this.selectedIds.delete(card.id);
      return true;
    }
    if (this.selectedIds.size >= this.maxSelectable()) return false;
    this.selectedIds.add(card.id);
    return true;
  }

  selectCards(items: readonly (number | string)[]): boolean {
    if (this.phase !== "playing" || !Array.isArray(items)) return false;
    this.selectedIds.clear();
    const limit = this.maxSelectable();
    for (const item of items) {
      if (this.selectedIds.size >= limit) break;
      if (typeof item === "number") {
        const c = this.hand[item];
        if (c && !this.selectedIds.has(c.id)) this.selectedIds.add(c.id);
      } else {
        const norm = String(item).trim().toUpperCase();
        const c = this.hand.find((card) => !this.selectedIds.has(card.id) && (card.id.toUpperCase() === norm || card.code.toUpperCase() === norm));
        if (c) this.selectedIds.add(c.id);
      }
    }
    return this.selectedIds.size > 0;
  }

  clearSelection(): boolean {
    if (this.phase !== "playing") return false;
    this.selectedIds.clear();
    return true;
  }

  selectedCards(): Card[] {
    return this.hand.filter((c) => this.selectedIds.has(c.id));
  }

  /** Evaluates all valid subsets of 1..maxSelectable() cards in hand and selects the highest-scoring hand. */
  selectBest(): boolean {
    if (this.phase !== "playing" || this.hand.length === 0) return false;
    const maxK = Math.min(this.maxSelectable(), this.hand.length);
    let bestCards: Card[] = [this.hand[0]!];
    let bestScore = -1;
    let bestOrder = 99;

    const current: Card[] = [];
    const search = (startIdx: number) => {
      if (current.length >= 1) {
        const rep = this.scoreSelection(current);
        if (rep) {
          const order = HAND_DEFS[rep.handType].order;
          if (
            rep.score > bestScore ||
            (rep.score === bestScore && order < bestOrder) ||
            (rep.score === bestScore && order === bestOrder && current.length < bestCards.length)
          ) {
            bestScore = rep.score;
            bestOrder = order;
            bestCards = current.slice();
          }
        }
      }
      if (current.length === maxK) return;
      for (let i = startIdx; i < this.hand.length; i++) {
        current.push(this.hand[i]!);
        search(i + 1);
        current.pop();
      }
    };

    search(0);
    this.selectedIds.clear();
    for (const c of bestCards) this.selectedIds.add(c.id);
    return this.selectedIds.size > 0;
  }

  sortHand(mode?: "rank" | "suit"): boolean {
    if (this.phase !== "playing") return false;
    if (mode === "rank" || mode === "suit") {
      this.sortMode = mode;
    } else {
      this.sortMode = this.sortMode === "rank" ? "suit" : "rank";
    }
    this.hand = sortCards(this.hand, this.sortMode);
    return true;
  }

  // ---------- Scoring Engine ----------
  // Order-independent two-phase calculation:
  // 1) All additive chip and mult bonuses (base hand + scored cards + additive talismans)
  // 2) All multiplicative mult factors (steel cards ×1.5 each, son_nefes_saati ×2 on final hand, filozof_tasi ×1.5)

  scoreSelection(cardsInput?: readonly Card[]): HandScoreReport | null {
    const played = cardsInput ? cardsInput.slice() : this.selectedCards();
    if (played.length === 0 || played.length > this.maxSelectable()) return null;

    const evalResult = evaluateHand(played);
    const stats = this.handStats(evalResult.type);
    let chips = stats.chips;
    let mult = stats.mult;
    let goldEarned = 0;
    let steelCount = 0;

    const hasAllScoreLens = this.talismans.includes("butunleyici_mercek");
    const activeScoring = hasAllScoreLens ? played : evalResult.scoringCards;
    const scoringIds = activeScoring.map((c) => c.id);
    const debuffedIds: string[] = [];
    const triggeredSet = new Set<TalismanId>();

    if (hasAllScoreLens) triggeredSet.add("butunleyici_mercek");

    // Phase 1A: Card-level additive chips & mult (and count active steel cards)
    for (const card of activeScoring) {
      if (isCardDebuffed(card, this.bossRule)) {
        debuffedIds.push(card.id);
        continue;
      }

      chips += cardChips(card.rank);
      if (hasAllScoreLens) chips += 10;

      if (card.enhancement === "bonus") chips += 30;
      else if (card.enhancement === "mult") mult += 4;
      else if (card.enhancement === "steel") steelCount += 1;
      else if (card.enhancement === "gold") goldEarned += 3;

      for (const tid of this.talismans) {
        if (tid === "kizil_yakut" && card.suit === "H") {
          mult += 4;
          triggeredSet.add(tid);
        } else if (tid === "gece_obsidyeni" && card.suit === "S") {
          mult += 4;
          triggeredSet.add(tid);
        } else if (tid === "gunes_kehribari" && card.suit === "D") {
          mult += 4;
          triggeredSet.add(tid);
        } else if (tid === "zumrut_yaprak" && card.suit === "C") {
          mult += 4;
          triggeredSet.add(tid);
        } else if (tid === "saray_taci" && card.rank >= 11 && card.rank <= 13) {
          chips += 30;
          mult += 2;
          triggeredSet.add(tid);
        } else if (tid === "as_muhru" && card.rank === 14) {
          chips += 25;
          mult += 4;
          triggeredSet.add(tid);
        } else if (tid === "cift_sayilar" && card.rank <= 10 && card.rank % 2 === 0) {
          mult += 6;
          triggeredSet.add(tid);
        } else if (tid === "tek_sayilar" && (card.rank === 14 || (card.rank <= 9 && card.rank % 2 === 1))) {
          chips += 35;
          triggeredSet.add(tid);
        }
      }
    }

    const hasPair =
      evalResult.type === "pair" ||
      evalResult.type === "two_pair" ||
      evalResult.type === "full_house" ||
      evalResult.type === "four_of_a_kind";
    const hasTrips =
      evalResult.type === "three_of_a_kind" ||
      evalResult.type === "full_house" ||
      evalResult.type === "four_of_a_kind";

    // Phase 1B: Hand-level additive chips & mult
    for (const tid of this.talismans) {
      if (tid === "cift_ayna" && hasPair) {
        mult += 8;
        triggeredSet.add(tid);
      } else if (tid === "uclu_prizma" && hasTrips) {
        mult += 12;
        triggeredSet.add(tid);
      } else if (tid === "simyaci_feneri") {
        chips += 25;
        mult += 4;
        triggeredSet.add(tid);
      } else if (tid === "kisa_kilic" && played.length <= 4) {
        mult += 10;
        triggeredSet.add(tid);
      } else if (tid === "altin_terazi" && this.gold > 0) {
        chips += this.gold * 3;
        triggeredSet.add(tid);
      } else if (tid === "son_nefes_saati" && this.discardsLeft > 0) {
        chips += this.discardsLeft * 25;
        triggeredSet.add(tid);
      }
    }

    // Phase 2: Multiplicative mult effects (independent of card/talisman order)
    for (let i = 0; i < steelCount; i++) {
      mult = Math.round(mult * 1.5 * 100) / 100;
    }

    if (this.talismans.includes("son_nefes_saati") && this.handsLeft === 1) {
      mult = Math.round(mult * 2 * 100) / 100;
      triggeredSet.add("son_nefes_saati");
    }

    if (this.talismans.includes("filozof_tasi")) {
      mult = Math.round(mult * 1.5 * 100) / 100;
      triggeredSet.add("filozof_tasi");
    }

    mult = Math.max(1, Math.round(mult * 10) / 10);
    const total = Math.round(chips * mult);

    return {
      handType: evalResult.type,
      handName: stats.name,
      level: stats.level,
      baseChips: stats.chips,
      baseMult: stats.mult,
      chips,
      mult,
      score: total,
      goldEarned,
      playedCodes: played.map((c) => c.code),
      scoringIds,
      debuffedIds,
      triggeredTalismans: this.talismans.filter((t) => triggeredSet.has(t)),
    };
  }

  // ---------- Play & Discard Actions ----------

  playHand(): HandScoreReport | null {
    if (this.phase !== "playing" || this.handsLeft <= 0) return null;
    const report = this.scoreSelection();
    if (!report) return null;

    this.handsLeft -= 1;
    this.score += report.score;
    this.totalScore += report.score;
    this.gold += report.goldEarned;
    this.lastHand = report;

    this.hand = this.hand.filter((c) => !this.selectedIds.has(c.id));
    this.selectedIds.clear();

    if (this.score >= this.target) {
      if (this.round >= this.maxRounds) {
        this.phase = "won";
      } else {
        this.enterShop();
      }
    } else if (this.handsLeft <= 0 || (this.hand.length === 0 && this.drawPile.length === 0)) {
      this.phase = "over";
    } else {
      this.drawToHandSize();
    }

    return report;
  }

  discardSelected(): boolean {
    if (this.phase !== "playing" || this.discardsLeft <= 0) return false;
    const count = this.selectedIds.size;
    if (count === 0 || count > 5) return false;

    this.discardsLeft -= 1;
    this.hand = this.hand.filter((c) => !this.selectedIds.has(c.id));
    this.selectedIds.clear();
    this.drawToHandSize();
    if (this.hand.length === 0 && this.drawPile.length === 0) {
      this.phase = "over";
    }
    return true;
  }

  // ---------- Shop & Progression ----------

  private enterShop(): void {
    const step = ((this.round - 1) % 3) + 1;
    const baseReward = step === 1 ? 4 : step === 2 ? 5 : 7;
    const handsBonus = this.handsLeft;
    const interest = Math.min(5, Math.floor(this.gold / 5));
    const talismanGold = this.talismans.includes("altin_terazi") ? 3 : 0;
    const total = baseReward + handsBonus + interest + talismanGold;

    this.gold += total;
    this.lastReward = { baseReward, handsBonus, interest, talismanGold, total };
    this.rerollCost = 2;
    this.phase = "shop";
    this.shop = generateShopItems(this.rng, this.talismans, this.handLevels, this.vouchersBought);
  }

  buyItem(indexOrId: number | string): boolean {
    if (this.phase !== "shop") return false;
    const item =
      typeof indexOrId === "number"
        ? this.shop[indexOrId]
        : this.shop.find((s) => !s.bought && (s.id === indexOrId || s.talismanId === indexOrId || s.handType === indexOrId || s.voucherId === indexOrId));

    if (!item || item.bought || this.gold < item.cost) return false;

    if (item.kind === "talisman" && item.talismanId) {
      if (this.talismans.length >= MAX_TALISMANS || this.talismans.includes(item.talismanId)) return false;
      this.talismans.push(item.talismanId);
    } else if (item.kind === "upgrade" && item.handType) {
      this.handLevels[item.handType] = (this.handLevels[item.handType] ?? 1) + 1;
    } else if (item.kind === "voucher" && item.voucherId) {
      this.applyVoucher(item.voucherId);
      this.vouchersBought += 1;
    } else {
      return false;
    }

    this.gold -= item.cost;
    item.bought = true;
    return true;
  }

  private applyVoucher(voucherId: string): void {
    if (voucherId === "extra_hand") {
      this.maxHands += 1;
    } else if (voucherId === "extra_discard") {
      this.maxDiscards += 1;
    } else if (voucherId === "extra_hand_size") {
      this.handSize += 1;
    } else {
      const enhMap: Record<string, { enh: Enhancement; count: number }> = {
        enhance_bonus: { enh: "bonus", count: 3 },
        enhance_mult: { enh: "mult", count: 3 },
        enhance_steel: { enh: "steel", count: 2 },
        enhance_gold: { enh: "gold", count: 3 },
      };
      const spec = enhMap[voucherId];
      if (!spec) return;
      const candidates = this.fullDeck.filter((c) => c.enhancement === "none");
      const pool = candidates.length >= spec.count ? candidates : this.fullDeck;
      const picked = this.rng.shuffle(pool).slice(0, spec.count);
      for (const c of picked) {
        c.enhancement = spec.enh;
      }
    }
  }

  sellTalisman(indexOrId: number | string): boolean {
    if (this.phase !== "playing" && this.phase !== "shop") return false;
    const idx =
      typeof indexOrId === "number"
        ? indexOrId
        : this.talismans.indexOf(indexOrId as TalismanId);
    if (idx < 0 || idx >= this.talismans.length) return false;
    const tid = this.talismans[idx]!;
    const def = TALISMAN_MAP[tid];
    this.talismans.splice(idx, 1);
    this.gold += Math.max(1, Math.floor(def.cost / 2));
    return true;
  }

  rerollShop(): boolean {
    if (this.phase !== "shop" || this.gold < this.rerollCost) return false;
    this.gold -= this.rerollCost;
    this.rerollCost += 1;
    this.shop = generateShopItems(this.rng, this.talismans, this.handLevels, this.vouchersBought);
    return true;
  }

  nextRound(): boolean {
    if (this.phase !== "shop") return false;
    this.startRound(this.round + 1);
    return true;
  }
}

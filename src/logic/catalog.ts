import { Rng } from "../kit/index";
import { type Card, HAND_DEFS, type HandType } from "./cards";

// ---------- Talismans (Tılsımlar) ----------

export type TalismanId =
  | "kizil_yakut"
  | "gece_obsidyeni"
  | "gunes_kehribari"
  | "zumrut_yaprak"
  | "cift_ayna"
  | "uclu_prizma"
  | "simyaci_feneri"
  | "saray_taci"
  | "as_muhru"
  | "kisa_kilic"
  | "cift_sayilar"
  | "tek_sayilar"
  | "altin_terazi"
  | "son_nefes_saati"
  | "butunleyici_mercek"
  | "filozof_tasi";

export interface TalismanDef {
  id: TalismanId;
  name: string;
  desc: string;
  cost: number;
  icon: string;
}

export const TALISMANS: readonly TalismanDef[] = [
  { id: "kizil_yakut", name: "Kızıl Yakut", desc: "Puanlanan her Kupa (♥) kartı +4 Çarpan verir.", cost: 4, icon: "suit-H" },
  { id: "gece_obsidyeni", name: "Gece Obsidyeni", desc: "Puanlanan her Maça (♠) kartı +4 Çarpan verir.", cost: 4, icon: "suit-S" },
  { id: "gunes_kehribari", name: "Güneş Kehribarı", desc: "Puanlanan her Karo (♦) kartı +4 Çarpan verir.", cost: 4, icon: "suit-D" },
  { id: "zumrut_yaprak", name: "Zümrüt Yaprak", desc: "Puanlanan her Sinek (♣) kartı +4 Çarpan verir.", cost: 4, icon: "suit-C" },
  { id: "cift_ayna", name: "İkiz Ayna", desc: "El bir Çift içeriyorsa +8 Çarpan verir.", cost: 5, icon: "icon-mirror" },
  { id: "uclu_prizma", name: "Üçlü Prizma", desc: "Üçlü, Ful veya Kare ellerinde +12 Çarpan verir.", cost: 5, icon: "icon-prism" },
  { id: "simyaci_feneri", name: "Simyacı Feneri", desc: "Her elde +25 Fiş ve +4 Çarpan verir.", cost: 4, icon: "icon-lantern" },
  { id: "saray_taci", name: "Saray Tacı", desc: "Puanlanan her J, Q, K kartı +30 Fiş ve +2 Çarpan verir.", cost: 5, icon: "crown" },
  { id: "as_muhru", name: "As Mührü", desc: "Puanlanan her As (A) +25 Fiş ve +4 Çarpan verir.", cost: 5, icon: "star" },
  { id: "kisa_kilic", name: "Kısa Kılıç", desc: "En fazla 4 kartla oynanan ellerde +10 Çarpan verir.", cost: 5, icon: "icon-sword" },
  { id: "cift_sayilar", name: "Çift Sarkacı", desc: "Puanlanan her çift sayılı kart (2..10) +6 Çarpan verir.", cost: 5, icon: "icon-pendulum" },
  { id: "tek_sayilar", name: "Tek Pusulası", desc: "Puanlanan her tek sayılı kart (A,3,5,7,9) +35 Fiş verir.", cost: 4, icon: "icon-compass" },
  { id: "altin_terazi", name: "Altın Terazi", desc: "Her 1 Altın için +3 Fiş; tur sonunda +3 Altın verir.", cost: 5, icon: "icon-scale" },
  { id: "son_nefes_saati", name: "Son Kumsaati", desc: "Her Değiştirme hakkı +25 Fiş; son elde ×2 Çarpan.", cost: 6, icon: "icon-hourglass" },
  { id: "butunleyici_mercek", name: "Bütün Mercek", desc: "Oynanan tüm kartlar puanlanır ve +10 Fiş verir.", cost: 6, icon: "icon-lens" },
  { id: "filozof_tasi", name: "Filozof Taşı", desc: "Toplam Çarpanı ×1.5 ile çarpar.", cost: 7, icon: "orb" },
];

export const TALISMAN_MAP: Record<TalismanId, TalismanDef> = Object.fromEntries(
  TALISMANS.map((t) => [t.id, t]),
) as Record<TalismanId, TalismanDef>;

// ---------- Boss Rules ----------

export type BossRuleId = "debuff_H" | "debuff_S" | "debuff_D" | "debuff_C" | "debuff_face" | "max_4_cards";

export interface BossRuleDef {
  id: BossRuleId;
  name: string;
  desc: string;
}

export const BOSS_RULES: readonly BossRuleDef[] = [
  { id: "debuff_H", name: "Kızıl Sis", desc: "Kupa (♥) kartları etkisizdir (fiş ve kart bonusu vermez)." },
  { id: "debuff_S", name: "Gölge Perdesi", desc: "Maça (♠) kartları etkisizdir (fiş ve kart bonusu vermez)." },
  { id: "debuff_D", name: "Kehribar Laneti", desc: "Karo (♦) kartları etkisizdir (fiş ve kart bonusu vermez)." },
  { id: "debuff_C", name: "Zümrüt Diken", desc: "Sinek (♣) kartları etkisizdir (fiş ve kart bonusu vermez)." },
  { id: "debuff_face", name: "Taht Yasağı", desc: "Saraylı kartlar (J, Q, K) etkisizdir." },
  { id: "max_4_cards", name: "Dar Çember", desc: "Bir elde en fazla 4 kart oynanabilir." },
];

export const BOSS_RULE_MAP: Record<BossRuleId, BossRuleDef> = Object.fromEntries(
  BOSS_RULES.map((b) => [b.id, b]),
) as Record<BossRuleId, BossRuleDef>;

export function isCardDebuffed(card: Card, bossRule: BossRuleId | null): boolean {
  if (!bossRule) return false;
  if (bossRule === "debuff_H") return card.suit === "H";
  if (bossRule === "debuff_S") return card.suit === "S";
  if (bossRule === "debuff_D") return card.suit === "D";
  if (bossRule === "debuff_C") return card.suit === "C";
  if (bossRule === "debuff_face") return card.rank >= 11 && card.rank <= 13;
  return false;
}

// ---------- Round Targets & Shop Generation ----------

const ROUND_TARGETS = [210, 420, 780, 1400, 2400, 4000, 6500, 10000, 15000];

export function targetScoreForRound(round: number): number {
  const idx = Math.max(0, round - 1);
  if (idx < ROUND_TARGETS.length) return ROUND_TARGETS[idx]!;
  const last = ROUND_TARGETS[ROUND_TARGETS.length - 1]!;
  return Math.round(last * Math.pow(1.5, idx - (ROUND_TARGETS.length - 1)));
}

export function roundTitle(round: number): string {
  const step = ((round - 1) % 3) + 1;
  if (step === 1) return "Çırak Sınavı";
  if (step === 2) return "Usta Sınavı";
  return "Başsimyager Sınavı";
}

export type VoucherId = "extra_hand" | "extra_discard" | "extra_hand_size" | "enhance_bonus" | "enhance_mult" | "enhance_steel" | "enhance_gold";

export interface ShopItem {
  id: string;
  kind: "talisman" | "upgrade" | "voucher";
  name: string;
  desc: string;
  cost: number;
  icon: string;
  bought: boolean;
  talismanId?: TalismanId;
  handType?: HandType;
  voucherId?: VoucherId;
}

const VOUCHER_POOL: readonly { id: VoucherId; name: string; desc: string; cost: number; icon: string }[] = [
  { id: "enhance_bonus", name: "Kristal İksiri", desc: "Desteden 3 karta kalıcı +30 Fiş efsunu işler.", cost: 5, icon: "icon-potion" },
  { id: "enhance_mult", name: "Ateş İksiri", desc: "Desteden 3 karta kalıcı +4 Çarpan efsunu işler.", cost: 5, icon: "icon-potion" },
  { id: "enhance_steel", name: "Çelik İksiri", desc: "Desteden 2 karta kalıcı ×1.5 Çarpan efsunu işler.", cost: 6, icon: "icon-potion" },
  { id: "enhance_gold", name: "Altın İksiri", desc: "Desteden 3 karta kalıcı +3 Altın efsunu işler.", cost: 5, icon: "icon-coin" },
  { id: "extra_hand", name: "Zaman Mührü", desc: "Her turda kalıcı +1 El oynama hakkı verir.", cost: 8, icon: "heart" },
  { id: "extra_discard", name: "Rüzgâr Mührü", desc: "Her turda kalıcı +1 Değiştirme hakkı verir.", cost: 6, icon: "star" },
  { id: "extra_hand_size", name: "Geniş Masa", desc: "Eldeki kart kapasitesini kalıcı +1 artırır.", cost: 8, icon: "crown" },
];

export function generateShopItems(
  rng: Rng,
  ownedTalismans: readonly TalismanId[],
  handLevels?: Partial<Record<HandType, number>>,
  vouchersBought = 0,
): ShopItem[] {
  const availableTalismans = TALISMANS.filter((t) => !ownedTalismans.includes(t.id));
  const shuffledTalismans = rng.shuffle(availableTalismans);
  const items: ShopItem[] = [];

  for (let i = 0; i < Math.min(2, shuffledTalismans.length); i++) {
    const t = shuffledTalismans[i]!;
    items.push({
      id: `talisman:${t.id}`,
      kind: "talisman",
      name: t.name,
      desc: t.desc,
      cost: t.cost,
      icon: t.icon,
      bought: false,
      talismanId: t.id,
    });
  }

  const upgradableHands: HandType[] = ["pair", "two_pair", "three_of_a_kind", "straight", "flush", "full_house", "four_of_a_kind"];
  const pickedHand = rng.pick(upgradableHands);
  const hDef = HAND_DEFS[pickedHand];
  const curLevel = handLevels?.[pickedHand] ?? 1;
  const upgradeCost = 4 + (curLevel - 1) * 2;
  items.push({
    id: `upgrade:${pickedHand}`,
    kind: "upgrade",
    name: `${hDef.name} Yazması`,
    desc: `${hDef.name} elini +1 seviye yükseltir (+${hDef.levelChips} Fiş, +${hDef.levelMult} Çarpan).`,
    cost: upgradeCost,
    icon: "icon-scroll",
    bought: false,
    handType: pickedHand,
  });

  const voucher = rng.pick(VOUCHER_POOL);
  const voucherCost = voucher.cost + vouchersBought * 2;
  items.push({
    id: `voucher:${voucher.id}`,
    kind: "voucher",
    name: voucher.name,
    desc: voucher.desc,
    cost: voucherCost,
    icon: voucher.icon,
    bought: false,
    voucherId: voucher.id,
  });

  return items;
}

import { Product, Category } from './types';

export const IMG = {
  hero: "https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=1200&auto=format&fit=crop&q=80",
  about: "https://images.unsplash.com/photo-1489987707025-afc232f7ea0f?w=800&auto=format&fit=crop&q=80",
  cat0: "https://images.unsplash.com/photo-1622290291468-a28f7a7dc6a8?w=600&auto=format&fit=crop&q=80",
  cat1: "/assets/aistudio/grok_1793623114901_dffcb2c1.jpg",
  cat2: "https://images.unsplash.com/photo-1624378439575-d8705ad7ae80?w=600&auto=format&fit=crop&q=80",
  cat3: "https://images.unsplash.com/photo-1610030469983-98e550d6193c?w=600&auto=format&fit=crop&q=80",
  cat4: "https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?w=600&auto=format&fit=crop&q=80",
  cat5: "https://images.unsplash.com/photo-1584100936595-c0654b55a2e2?w=600&auto=format&fit=crop&q=80",
  cat6: "https://images.unsplash.com/photo-1558769132-cb1aea458c5e?w=600&auto=format&fit=crop&q=80",
  p1: "https://images.unsplash.com/photo-1519238263530-99bdd11df2ea?w=600&auto=format&fit=crop&q=80",
  p2: "https://images.unsplash.com/photo-1503944583220-79d8926ad5e2?w=600&auto=format&fit=crop&q=80",
  p3: "https://images.unsplash.com/photo-1622290291468-a28f7a7dc6a8?w=600&auto=format&fit=crop&q=80",
  p4: "https://images.unsplash.com/photo-1518831959646-742c3a14ebf7?w=600&auto=format&fit=crop&q=80",
  p5: "/assets/aistudio/grok_1793623114901_dffcb2c1.jpg",
  p6: "/assets/aistudio/grok_1793623226542_df5f7074.jpg",
  p7: "/assets/aistudio/grok_1793623300372_e8acd584.jpg",
  p8: "/assets/aistudio/grok_1793623385685_de6d0440.jpg",
  p9: "https://images.unsplash.com/photo-1624378439575-d8705ad7ae80?w=600&auto=format&fit=crop&q=80",
  p10: "https://images.unsplash.com/photo-1473966968600-fa801b869a1a?w=600&auto=format&fit=crop&q=80",
  p11: "https://images.unsplash.com/photo-1541099649105-f69ad21f3246?w=600&auto=format&fit=crop&q=80",
  p12: "https://images.unsplash.com/photo-1610030469983-98e550d6193c?w=600&auto=format&fit=crop&q=80",
  p13: "https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?w=600&auto=format&fit=crop&q=80",
  p14: "https://images.unsplash.com/photo-1617627143750-d86bc21e42bb?w=600&auto=format&fit=crop&q=80",
  p15: "https://images.unsplash.com/photo-1563178406-4cdc2923acbc?w=600&auto=format&fit=crop&q=80",
  p16: "https://images.unsplash.com/photo-1601924994987-69e26d50dc26?w=600&auto=format&fit=crop&q=80",
  p17: "https://images.unsplash.com/photo-1520903920243-00d872a2d1c9?w=600&auto=format&fit=crop&q=80",
  p18: "https://images.unsplash.com/photo-1584917865442-de89df76afd3?w=600&auto=format&fit=crop&q=80",
  p19: "https://images.unsplash.com/photo-1584100936595-c0654b55a2e2?w=600&auto=format&fit=crop&q=80",
  p20: "https://images.unsplash.com/photo-1606760227091-3dd870d97f1d?w=600&auto=format&fit=crop&q=80",
  p21: "https://images.unsplash.com/photo-1528459801416-a9e53bbf4e17?w=600&auto=format&fit=crop&q=80",
  p22: "https://images.unsplash.com/photo-1558769132-cb1aea458c5e?w=600&auto=format&fit=crop&q=80",
  p23: "https://images.unsplash.com/photo-1579546929518-9e396f3cc809?w=600&auto=format&fit=crop&q=80",
  p24: "https://images.unsplash.com/photo-1584100936595-c0654b55a2e2?w=600&auto=format&fit=crop&q=80",
};

export const C: Category[] = [
  { id: 'kids', n: 'শিশুদের পোশাক', sub: '(০–১০ বছর)', img: 'cat0' },
  { id: 'shirt', n: 'পুরুষদের শার্ট', img: 'cat1' },
  { id: 'pant', n: 'প্যান্ট', img: 'cat2' },
  { id: 'three', n: 'থ্রি-পিস', img: 'cat3' },
  { id: 'orna', n: 'ওড়না', img: 'cat4' },
  { id: 'gaj', n: 'গজ কাপড়', img: 'cat5' },
  { id: 'than', n: 'থান কাপড়', img: 'cat6' },
];

export const GRP: Record<string, { n: string; c: string[] }> = {
  men: { n: 'পুরুষদের পোশাক', c: ['shirt', 'pant'] },
  women: { n: 'নারীদের পোশাক', c: ['three', 'orna'] },
  all: { n: 'সব পণ্য', c: C.map(c => c.id) },
};

export const SZ: Record<string, string[]> = {
  kids: ['০–১ বছর', '২–৩ বছর', '৪–৫ বছর', '৬–৮ বছর', '৯–১০ বছর'],
  shirt: ['M', 'L', 'XL', 'XXL'],
  pant: ['৩০', '৩২', '৩৪', '৩৬'],
  three: ['ফ্রি সাইজ'],
  orna: ['ফ্রি সাইজ'],
};

const raw: [string, string, number, string][] = [
  ['kids', 'শিশুদের টি-শার্ট সেট (০–১০ বছর)', 260, 'p1'],
  ['kids', 'ছেলেদের হাফ প্যান্ট সেট', 220, 'p2'],
  ['kids', 'মেয়েদের ফ্রক', 340, 'p3'],
  ['kids', 'বাচ্চাদের পার্টি ড্রেস', 480, 'p4'],
  ['shirt', 'পুরুষদের শার্ট', 460, 'p5'],
  ['shirt', 'ফুল হাতা ক্যাজুয়াল শার্ট', 520, 'p6'],
  ['shirt', 'ডেনিম লুক শার্ট', 560, 'p7'],
  ['shirt', 'অফিস ফরমাল শার্ট', 480, 'p8'],
  ['pant', 'পুরুষদের ক্যাজুয়াল প্যান্ট', 650, 'p9'],
  ['pant', 'গ্যাবার্ডিন প্যান্ট', 720, 'p10'],
  ['pant', 'ট্রাউজার প্যান্ট', 600, 'p11'],
  ['three', 'নারীদের থ্রি-পিস', 860, 'p12'],
  ['three', 'প্রিন্টেড থ্রি-পিস', 950, 'p13'],
  ['three', 'কটন থ্রি-পিস', 780, 'p14'],
  ['three', 'পার্টি থ্রি-পিস', 1250, 'p15'],
  ['orna', 'নারীদের ওড়না', 250, 'p16'],
  ['orna', 'জর্জেট ওড়না', 320, 'p17'],
  ['orna', 'কটন ওড়না', 180, 'p18'],
  ['gaj', 'গজ কাপড়', 120, 'p19'],
  ['gaj', 'প্রিন্টেড গজ কাপড়', 140, 'p20'],
  ['gaj', 'কটন গজ কাপড়', 110, 'p21'],
  ['than', 'থান কাপড়', 100, 'p22'],
  ['than', 'সাদা থান কাপড়', 95, 'p23'],
  ['than', 'লং ক্লথ থান', 130, 'p24'],
];

export const P: Product[] = raw.map((r, i) => ({
  id: i + 1,
  c: r[0],
  n: r[1],
  pr: r[2],
  img: r[3],
  sizes: SZ[r[0]] || null,
  u: r[0] === 'gaj' ? 'গজ' : r[0] === 'than' ? 'থান' : '',
}));

export const FEAT = [1, 5, 12, 19, 22];

export const catName = (id: string) => (C.find(c => c.id === id) || GRP[id] || { n: 'পণ্য' }).n;

export const WA = '8801615607928';
export const TEL = '01355226338';
export const ADDR = 'মাস্টার (ছায়েদ) প্লাজা, পশ্চিম কর্নার, বিশ্বরোড সংলগ্ন, বালারহাট, সখিপুর, শরীয়তপুর।';

export const bn = (n: number | string) => String(n).replace(/\d/g, d => '০১২৩৪৫৬৭৮৯'[+d]);
export const tk = (n: number) => '৳ ' + bn(n);

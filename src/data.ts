import { Product, Category } from './types';

export const IMG = {
  hero: "https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=1200&auto=format&fit=crop&q=80",
  about: "https://images.unsplash.com/photo-1489987707025-afc232f7ea0f?w=800&auto=format&fit=crop&q=80",
  logo: "https://images.unsplash.com/photo-1512436991641-6745cdb1723f?w=200&auto=format&fit=crop&q=80",
  flogo: "https://images.unsplash.com/photo-1512436991641-6745cdb1723f?w=200&auto=format&fit=crop&q=80",
  cat0: "https://images.unsplash.com/photo-1519238263530-99bdd11df2ea?w=600&auto=format&fit=crop&q=80",
  cat1: "https://images.unsplash.com/photo-1602810318383-e386cc2a3ccf?w=600&auto=format&fit=crop&q=80",
  cat2: "https://images.unsplash.com/photo-1624378439575-d8705ad7ae80?w=600&auto=format&fit=crop&q=80",
  cat3: "https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?w=600&auto=format&fit=crop&q=80",
  cat4: "https://images.unsplash.com/photo-1606760227091-3dd870d97f1d?w=600&auto=format&fit=crop&q=80",
  cat5: "https://images.unsplash.com/photo-1584100936595-c0654b55a2e2?w=600&auto=format&fit=crop&q=80",
  cat6: "https://images.unsplash.com/photo-1558769132-cb1aea458c5e?w=600&auto=format&fit=crop&q=80",
  p0: "https://images.unsplash.com/photo-1519238263530-99bdd11df2ea?w=600&auto=format&fit=crop&q=80",
  p1: "https://images.unsplash.com/photo-1602810318383-e386cc2a3ccf?w=600&auto=format&fit=crop&q=80",
  p2: "https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?w=600&auto=format&fit=crop&q=80",
  p3: "https://images.unsplash.com/photo-1584100936595-c0654b55a2e2?w=600&auto=format&fit=crop&q=80",
  p4: "https://images.unsplash.com/photo-1558769132-cb1aea458c5e?w=600&auto=format&fit=crop&q=80",
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
  ['kids', 'শিশুদের টি-শার্ট সেট (০–১০ বছর)', 260, 'p0'],
  ['kids', 'ছেলেদের হাফ প্যান্ট সেট', 220, 'p0'],
  ['kids', 'মেয়েদের ফ্রক', 340, 'p2'],
  ['kids', 'বাচ্চাদের পার্টি ড্রেস', 480, 'p2'],
  ['shirt', 'পুরুষদের শার্ট', 460, 'p1'],
  ['shirt', 'ফুল হাতা ক্যাজুয়াল শার্ট', 520, 'p1'],
  ['shirt', 'ডেনিম লুক শার্ট', 560, 'p1'],
  ['shirt', 'অফিস ফরমাল শার্ট', 480, 'p1'],
  ['pant', 'পুরুষদের ক্যাজুয়াল প্যান্ট', 650, 'cat2'],
  ['pant', 'গ্যাবার্ডিন প্যান্ট', 720, 'cat2'],
  ['pant', 'ট্রাউজার প্যান্ট', 600, 'cat2'],
  ['three', 'নারীদের থ্রি-পিস', 860, 'p2'],
  ['three', 'প্রিন্টেড থ্রি-পিস', 950, 'p2'],
  ['three', 'কটন থ্রি-পিস', 780, 'p2'],
  ['three', 'পার্টি থ্রি-পিস', 1250, 'p2'],
  ['orna', 'নারীদের ওড়না', 250, 'cat4'],
  ['orna', 'জর্জেট ওড়না', 320, 'cat4'],
  ['orna', 'কটন ওড়না', 180, 'cat4'],
  ['gaj', 'গজ কাপড়', 120, 'p3'],
  ['gaj', 'প্রিন্টেড গজ কাপড়', 140, 'p3'],
  ['gaj', 'কটন গজ কাপড়', 110, 'p3'],
  ['than', 'থান কাপড়', 100, 'p4'],
  ['than', 'সাদা থান কাপড়', 95, 'p4'],
  ['than', 'লং ক্লথ থান', 130, 'p4'],
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

export const NAV = [
  ['হোম', '#/'],
  ['শিশুদের পোশাক', '#/cat/kids'],
  ['পুরুষদের পোশাক', '#/cat/men'],
  ['নারীদের পোশাক', '#/cat/women'],
  ['থ্রি-পিস', '#/cat/three'],
  ['ওড়না', '#/cat/orna'],
  ['গজ কাপড়', '#/cat/gaj'],
  ['থান কাপড়', '#/cat/than'],
  ['সব পণ্য', '#/cat/all'],
];

export const WA = '8801615607928';
export const TEL = '01355226338';
export const ADDR = 'মাস্টার (ছায়েদ) প্লাজা, পশ্চিম কর্নার, বিশ্বরোড সংলগ্ন, বালারহাট, সখিপুর, শরীয়তপুর।';

export const bn = (n: number | string) => String(n).replace(/\d/g, d => '০১২৩৪৫৬৭৮৯'[+d]);
export const tk = (n: number) => '৳ ' + bn(n);
export const ship = (s: number) => (s >= 1000 || !s ? 0 : 60);

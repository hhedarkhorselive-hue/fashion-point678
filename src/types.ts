export interface Product {
  id: number;
  c: string;
  n: string;
  pr: number;
  img: string;
  sizes?: string[] | null;
  u?: string;
}

export interface Category {
  id: string;
  n: string;
  sub?: string;
  img: string;
}

export interface CartItem {
  id: number;
  qty: number;
  size: string;
}

export interface Order {
  id: string;
  items: CartItem[];
  total: number;
  ship: number;
  name: string;
  phone: string;
  addr: string;
  dist: string;
  pay: string;
  status: string;
  date: string;
}

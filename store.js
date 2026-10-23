// المخزن المركزي: كل الشاشات تقرأ وتكتب هنا. عند اعتماد قاعدة بيانات يُستبدل هذا الملف فقط.
import { useSyncExternalStore } from 'react';

export function today() {
  const d = new Date();
  const p = (n) => String(n).padStart(2, '0');
  return `${d.getFullYear()}/${p(d.getMonth() + 1)}/${p(d.getDate())}`;
}
function nowStamp() {
  const d = new Date();
  const p = (n) => String(n).padStart(2, '0');
  return `${today()} ${p(d.getHours())}:${p(d.getMinutes())}`;
}

// تحويل الأرقام العربية-الهندية إلى أرقام عادية ثم إلى عدد
export function num(s) {
  const t = String(s || '')
    .replace(/[٠-٩]/g, (d) => '٠١٢٣٤٥٦٧٨٩'.indexOf(d))
    .replace(/[^0-9]/g, '');
  return t ? Number(t) : NaN;
}
export const fmt = (n) => Number(n).toLocaleString('en-US');

const KEY = 'consumer-eye-v1';
const EMPTY = {
  items: [],
  shops: [],
  offers: [],
  history: [],
  wholesale: [],
  reports: [],
  me: { retailShopId: null, supplierName: null },
};

function load() {
  try {
    const ls = globalThis.localStorage;
    if (ls) {
      const raw = ls.getItem(KEY);
      if (raw) return { ...EMPTY, ...JSON.parse(raw) };
    }
  } catch (e) {}
  return { ...EMPTY };
}

let state = load();
const listeners = new Set();

function emit() {
  state = { ...state };
  try {
    const ls = globalThis.localStorage;
    if (ls) ls.setItem(KEY, JSON.stringify(state));
  } catch (e) {}
  listeners.forEach((l) => l());
}

export function useStore() {
  return useSyncExternalStore(
    (cb) => {
      listeners.add(cb);
      return () => listeners.delete(cb);
    },
    () => state
  );
}

/* ---------- قراءة ---------- */
export function offersFor(st, itemId) {
  return st.offers
    .filter((o) => o.itemId === itemId)
    .map((o) => ({ ...o, shop: st.shops.find((s) => s.id === o.shopId) }))
    .filter((o) => o.shop)
    .sort((a, b) => a.price - b.price);
}

export function minMax(st, itemId) {
  const list = offersFor(st, itemId);
  if (!list.length) return null;
  return {
    min: list[0].price,
    max: list[list.length - 1].price,
    updatedAt: list.map((o) => o.updatedAt).sort().pop(),
    count: list.length,
  };
}

export function currentPrice(st, itemId, shopId) {
  return st.offers.find((o) => o.itemId === itemId && o.shopId === shopId) || null;
}

// سلسلة أدنى/أعلى سعر لمادة عبر الزمن: week | month | year
export function series(st, itemId, range) {
  const cfg = { week: { n: 7, step: 864e5 }, month: { n: 6, step: 5 * 864e5 }, year: { n: 12, step: 30 * 864e5 } }[range];
  const now = Date.now();
  const rows = st.history.filter((h) => h.itemId === itemId);
  const out = [];
  for (let i = 0; i < cfg.n; i++) {
    const te = now - (cfg.n - 1 - i) * cfg.step;
    const latest = {};
    rows.forEach((h) => {
      if (h.ts <= te && (!latest[h.shopId] || latest[h.shopId].ts <= h.ts)) latest[h.shopId] = h;
    });
    const ps = Object.values(latest).map((h) => h.price);
    out.push(ps.length ? { min: Math.min(...ps), max: Math.max(...ps) } : null);
  }
  return out;
}

/* ---------- كتابة ---------- */
export function addShop({ name, area }) {
  const id = 's' + Date.now();
  state.shops = [...state.shops, { id, name, distance: area || '' }];
  emit();
  return id;
}

export function registerRetail({ name, area }) {
  const id = addShop({ name, area });
  state.me = { ...state.me, retailShopId: id };
  emit();
  return id;
}

export function registerSupplier(name) {
  state.me = { ...state.me, supplierName: name };
  emit();
}

export function addItem({ name, unit, category, barcode }) {
  const id = 'i' + Date.now() + Math.floor(Math.random() * 1000);
  state.items = [...state.items, { id, name, unit: unit || '', category: category || '', barcode: barcode || '' }];
  emit();
  return id;
}

export function setPrice(itemId, shopId, price) {
  const p = Number(price);
  const row = { itemId, shopId, price: p, updatedAt: today() };
  const i = state.offers.findIndex((o) => o.itemId === itemId && o.shopId === shopId);
  const offers = state.offers.slice();
  if (i >= 0) offers[i] = row;
  else offers.push(row);
  state.offers = offers;
  state.history = [...state.history, { itemId, shopId, price: p, ts: Date.now() }];
  emit();
}

export function addWholesale({ name, unit, category, brand, barcode, price, expiry }) {
  let item = state.items.find((it) => it.name.trim() === name.trim());
  const itemId = item ? item.id : addItem({ name: name.trim(), unit, category, barcode });
  state.wholesale = [
    {
      id: 'w' + Date.now(),
      itemId,
      name: name.trim(),
      unit: unit || '',
      category: category || '',
      brand: brand || '',
      barcode: barcode || '',
      price: Number(price),
      expiry: expiry || '',
      supplier: state.me.supplierName || '',
      updatedAt: today(),
    },
    ...state.wholesale,
  ];
  emit();
}

export function addReport({ category, shopName, description }) {
  const tracking = 'LT-' + String(Math.floor(100000 + Math.random() * 900000));
  state.reports = [
    { id: tracking, category, shopName: shopName || 'غير محدد', description, date: today(), step: 0, log: [] },
    ...state.reports,
  ];
  emit();
  return tracking;
}

export function advanceReport(id) {
  const labels = ['بدء التدقيق', 'تنظيم ضبط رقمي'];
  state.reports = state.reports.map((r) =>
    r.id === id && r.step < 2
      ? { ...r, step: r.step + 1, log: [...(r.log || []), `${labels[r.step]} — ${nowStamp()}`] }
      : r
  );
  emit();
}

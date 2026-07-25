'use client';

import { useCart } from '@/lib/cart';

export default function CartBadge() {
  const [lines] = useCart();
  const count = lines.reduce((s, l) => s + l.qty, 0);
  return (
    <a href="/cart" aria-label="Cart" className="border-line text-sumi relative rounded-[2px] border px-2.5 py-1.5">
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round">
        <circle cx="9" cy="21" r="1.4" />
        <circle cx="19" cy="21" r="1.4" />
        <path d="M2.5 3h2l2.6 12.6a2 2 0 0 0 2 1.4h9.3a2 2 0 0 0 2-1.6L22 7H6" />
      </svg>
      {count ? (
        <span className="bg-shu text-field mono absolute -top-2 -right-2 min-w-[17px] rounded-full px-1 text-center text-[10px] leading-[17px]">
          {count}
        </span>
      ) : null}
    </a>
  );
}

import { SaleItem, Product, SaleDiscount } from '../types';

export function calculateCart(orderItems: Product[]) {
  const map = new Map<string, { id: string; name: string; unit: number; qty: number; line: number }>();
  
  for (const p of orderItems) {
    const unit = Number(p.sell_price ?? 0);
    if (!map.has(p.id)) {
      map.set(p.id, { id: p.id, name: p.name, unit, qty: 0, line: 0 });
    }
    const row = map.get(p.id)!;
    row.qty += 1;
    row.line = row.qty * unit;
  }
  
  return Array.from(map.values());
}

export function calculateNewItemsTotal(cart: ReturnType<typeof calculateCart>) {
  return cart.reduce((s, x) => s + x.line, 0);
}

export function calculateExistingTotal(existingItems: SaleItem[]) {
  let total = 0;
  
  for (const item of existingItems) {
    let itemTotal = item.line_total;
    
    if (item.discount_amount && item.discount_type) {
      if (item.discount_type === 'percentage') {
        itemTotal = itemTotal - (itemTotal * item.discount_amount / 100);
      } else {
        itemTotal = itemTotal - item.discount_amount;
      }
    }
    
    total += itemTotal;
  }
  
  return total;
}

export function calculateGrandTotal(
  existingTotal: number,
  newItemsTotal: number,
  saleDiscount: SaleDiscount | null
) {
  let total = existingTotal + newItemsTotal;
  
  if (saleDiscount) {
    if (saleDiscount.type === 'percentage') {
      total = total - (total * saleDiscount.amount / 100);
    } else {
      total = total - saleDiscount.amount;
    }
  }
  
  return Math.max(0, total);
}

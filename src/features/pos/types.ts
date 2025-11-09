export type Category = { id: string; name: string };

export type Product = { 
  id: string; 
  name: string; 
  sell_price: number | null; 
  category_id: string | null;
};

export type Table = { 
  id: string; 
  number: number; 
  name: string | null; 
  area_id: string | null;
  status: string | null;
  current_sale_id: string | null;
  merged_with_table_id?: string | null;
  is_merged?: boolean;
};

export type SaleItem = {
  id: string;
  product_id: string;
  qty: number;
  unit_price: number;
  line_total: number;
  discount_amount?: number;
  discount_type?: string;
  products: { name: string } | null;
};

export type User = {
  id: string;
  name: string;
  role: string;
  pin?: string;
};

export type SaleDiscount = {
  amount: number;
  type: string;
};

export type Screen = 'user-select' | 'table-select' | 'order';

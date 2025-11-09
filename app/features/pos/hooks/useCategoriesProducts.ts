import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { Category, Product } from '../types';

export function useCategoriesProducts() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [activeCat, setActiveCat] = useState<string | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(false);

  const loadCategories = async () => {
    const { data, error } = await supabase
      .from('product_categories')
      .select('id, name')
      .order('sort_order', { ascending: true });

    if (!error && data) {
      setCategories(data as Category[]);
      if (data.length > 0) setActiveCat(data[0].id);
    }
  };

  const loadProducts = async (categoryId: string | null) => {
    if (!categoryId) {
      setProducts([]);
      return;
    }
    
    setLoading(true);
    const { data, error } = await supabase
      .from('products')
      .select('id, name, sell_price, category_id')
      .eq('category_id', categoryId)
      .order('name', { ascending: true });

    if (!error && data) {
      setProducts(data as Product[]);
    }
    setLoading(false);
  };

  useEffect(() => {
    if (activeCat) {
      loadProducts(activeCat);
    }
  }, [activeCat]);

  return {
    categories,
    activeCat,
    products,
    loading,
    loadCategories,
    setActiveCat,
  };
}

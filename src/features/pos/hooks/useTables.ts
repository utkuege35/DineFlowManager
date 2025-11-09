import { useState } from 'react';
import { supabase } from '@/lib/supabase';
import { Table } from '../types';

export function useTables() {
  const [tables, setTables] = useState<Table[]>([]);
  const [loading, setLoading] = useState(false);

  const loadTables = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('restaurant_tables')
      .select('id, number, name, area_id, status, current_sale_id, merged_with_table_id, is_merged')
      .order('number', { ascending: true });

    if (!error && data) {
      setTables(data as Table[]);
    }
    setLoading(false);
  };

  const isTableOccupied = (table: Table) => {
    return table.status === 'occupied' || !!table.current_sale_id;
  };

  return { tables, loading, loadTables, isTableOccupied };
}

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { User } from '../types';

export function useUsers() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);

  const loadUsers = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('users')
      .select('id, name, role, pin')
      .eq('is_active', true)
      .order('name', { ascending: true });

    if (!error && data) {
      setUsers(data as User[]);
    }
    setLoading(false);
  };

  useEffect(() => {
    loadUsers();
  }, []);

  return { users, loading, reload: loadUsers };
}

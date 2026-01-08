import React, { useEffect, useState } from 'react';
import { Navigate, Outlet, useNavigate } from 'react-router-dom';
import { supabase, getCurrentSession, onAuthStateChange } from '../services/supabaseClient';

const AdminProtectedRoute: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    let sub: { data: any } | undefined;

    async function verify() {
      setLoading(true);
      try {
        const session = await getCurrentSession();
        const user = session?.user ?? null;
        if (!user) {
          setIsAdmin(false);
          setLoading(false);
          return;
        }

        const { data, error } = await supabase
          .from('profiles')
          .select('role')
          .eq('id', user.id)
          .single();

        if (error || !data) {
          setIsAdmin(false);
        } else {
          setIsAdmin(data.role === 'admin');
        }
      } catch (e) {
        setIsAdmin(false);
      } finally {
        setLoading(false);
      }
    }

    verify();

    sub = onAuthStateChange(() => {
      verify();
    });

    return () => {
      if (sub && typeof sub.data?.unsubscribe === 'function') sub.data.unsubscribe();
    };
  }, [navigate]);

  if (loading) return <div>Loading...</div>;

  if (!isAdmin) return <Navigate to="/auth" replace />;

  return <Outlet />;
};

export default AdminProtectedRoute;
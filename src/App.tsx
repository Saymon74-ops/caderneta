import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { supabase } from './lib/supabase';
import Layout from './components/Layout';
import { Toaster } from 'react-hot-toast';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import Login from './pages/Login';
import Register from './pages/Register';
import Subscription from './pages/Subscription';
import Dashboard from './pages/Dashboard';

import Landing from './pages/Landing';
import ForgotPassword from './pages/ForgotPassword';
import ResetPassword from './pages/ResetPassword';
import Clientes from './pages/Clientes';
import NovaVenda from './pages/NovaVenda';
import Fiados from './pages/Fiados';
import Menu from './pages/Menu';

import Produtos from './pages/Produtos';
import Vendedores from './pages/Vendedores';
import Relatorios from './pages/Relatorios';
import Configuracoes from './pages/Configuracoes';
import Notificacoes from './pages/Notificacoes';
import Despesas from './pages/Despesas';
import Afiliados from './pages/Afiliados';
import Admin from './pages/Admin';

const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { user, profile, loading: authLoading } = useAuth();
  const [dbPlan, setDbPlan] = useState<string | null>(null);
  const [checkingPlan, setCheckingPlan] = useState(true);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
       if (!session?.user) { setCheckingPlan(false); return; }
       supabase.from('profiles').select('plano').eq('id', session.user.id).single().then(({ data }) => {
          if (data) setDbPlan(data.plano);
          setCheckingPlan(false);
       });
    });
  }, []);

  if (authLoading || checkingPlan) {
    return (
      <div className="app-container flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }
  if (!user) return <Navigate to="/login" replace />;
  const realPlan = dbPlan || profile?.plano;
  if (realPlan !== 'pro') return <Navigate to="/subscription" replace />;
  return <>{children}</>;
};

const SubscriptionRoute = ({ children }: { children: React.ReactNode }) => {
  const { user, loading } = useAuth();
  if (loading) return null;
  if (!user) return <Navigate to="/login" replace />;
  // allow pro users to see their active subscription page
  return <>{children}</>;
};

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Toaster position="top-center" toastOptions={{ className: 'font-sans text-sm' }} />
        <Routes>
          <Route path="/" element={<Landing />} />
          <Route path="/login" element={<div className="app-container flex flex-col"><Login /></div>} />
          <Route path="/register" element={<div className="app-container flex flex-col"><Register /></div>} />
          <Route path="/forgot-password" element={<div className="app-container flex flex-col"><ForgotPassword /></div>} />
          <Route path="/reset-password" element={<div className="app-container flex flex-col"><ResetPassword /></div>} />
          <Route path="/admin" element={<Admin />} />

          <Route path="/subscription" element={
            <SubscriptionRoute>
              <div className="app-container flex flex-col"><Subscription /></div>
            </SubscriptionRoute>
          } />

          <Route element={<ProtectedRoute><Layout /></ProtectedRoute>}>
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/clientes" element={<Clientes />} />
            <Route path="/venda" element={<NovaVenda />} />
            <Route path="/fiados" element={<Fiados />} />
            <Route path="/menu" element={<Menu />} />
            <Route path="/produtos" element={<Produtos />} />
            <Route path="/vendedores" element={<Vendedores />} />
            <Route path="/relatorios" element={<Relatorios />} />
            <Route path="/configuracoes" element={<Configuracoes />} />
            <Route path="/notificacoes" element={<Notificacoes />} />
            <Route path="/despesas" element={<Despesas />} />
            <Route path="/afiliados" element={<Afiliados />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;

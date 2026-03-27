import { Outlet, NavLink, useLocation } from 'react-router-dom';
import { Home, Users, Plus, FileText, Menu as MenuIcon } from 'lucide-react';

export default function Layout() {
  const location = useLocation();
  // Esconder a navbar na tela de venda (onde tem ações fixas próprias embaixo, opcional, mas a UI pede que vender seja um plus saltando)
  
  return (
    <div className="min-h-screen bg-[#f2f6f3] text-gray-900 pb-20">
      <Outlet />
      
      <nav className="fixed bottom-0 left-0 right-0 max-w-[430px] mx-auto bg-white border-t border-gray-100 flex justify-between px-2 pt-2 pb-6 shadow-[0_-4px_20px_rgba(0,0,0,0.05)] z-50 rounded-t-3xl">
        <NavLink to="/dashboard" className={({isActive}) => `flex flex-col items-center p-2 rounded-xl min-w-[64px] ${isActive ? 'text-[#1a9e5c]' : 'text-gray-400'}`}>
          <Home size={24} className={location.pathname === '/dashboard' ? 'fill-[#1a9e5c]' : ''} />
          <span className="text-[10px] font-bold mt-1">Início</span>
        </NavLink>
        
        <NavLink to="/clientes" className={({isActive}) => `flex flex-col items-center p-2 rounded-xl min-w-[64px] ${isActive ? 'text-[#1a9e5c]' : 'text-gray-400'}`}>
          <Users size={24} className={location.pathname === '/clientes' ? 'fill-[#1a9e5c]/20' : ''} />
          <span className="text-[10px] font-bold mt-1">Clientes</span>
        </NavLink>

        <div className="relative -top-8 flex justify-center">
          <NavLink to="/venda" className="bg-[#1a9e5c] w-16 h-16 rounded-full flex items-center justify-center text-white shadow-lg shadow-[#1a9e5c]/40 border-4 border-[#f2f6f3] active:scale-95 transition-transform">
            <Plus size={32} />
          </NavLink>
        </div>

        <NavLink to="/fiados" className={({isActive}) => `flex flex-col items-center p-2 rounded-xl min-w-[64px] ${isActive ? 'text-[#1a9e5c]' : 'text-gray-400'}`}>
          <FileText size={24} className={location.pathname === '/fiados' ? 'fill-[#1a9e5c]/20' : ''} />
          <span className="text-[10px] font-bold mt-1">Fiados</span>
        </NavLink>

        <NavLink to="/menu" className={({isActive}) => `flex flex-col items-center p-2 rounded-xl min-w-[64px] ${isActive ? 'text-[#1a9e5c]' : 'text-gray-400'}`}>
          <MenuIcon size={24} />
          <span className="text-[10px] font-bold mt-1">Menu</span>
        </NavLink>
      </nav>
    </div>
  );
}


import React from 'react';
import type { View, User } from '../types';
import { 
  DashboardIcon, ProductsIcon, CategoriesIcon, SalesIcon, StoreIcon, 
  ChannelsIcon, AdminIcon, CreditCardIcon, XIcon, LogoutIcon, AnalyticsIcon, BudgetIcon, TagIcon 
} from './icons/Icons';

interface SidebarProps {
  currentView: View;
  setView: (view: View) => void;
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
  onLogout: () => void;
  user: User;
}

const NavItem: React.FC<{
  view: View;
  label: string;
  currentView: View;
  setView: (view: View) => void;
  onClick: () => void;
  children: React.ReactNode;
}> = ({ view, label, currentView, setView, onClick, children }) => {
  const isActive = currentView === view;
  return (
    <li>
      <button
        onClick={() => { setView(view); onClick(); }}
        className={`flex items-center w-full space-x-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
          isActive
            ? 'bg-primary text-white shadow-lg'
            : 'text-text-secondary hover:bg-slate-100 dark:text-dark-text-secondary dark:hover:bg-slate-700'
        }`}
      >
        {children}
        <span>{label}</span>
      </button>
    </li>
  );
};

const Sidebar: React.FC<SidebarProps> = ({ currentView, setView, isOpen, setIsOpen, onLogout, user }) => {
    
  const handleNavItemClick = () => {
    if (window.innerWidth < 768) { // md breakpoint
      setIsOpen(false);
    }
  };

  const sidebarContent = (
    <div className="flex flex-col h-full">
        <div className="flex items-center justify-between h-20 px-4 border-b border-border dark:border-dark-border">
            <div className="flex items-center gap-3">
                <div className="flex-shrink-0 text-primary bg-primary/10 p-2 rounded-lg">
                    <StoreIcon className="h-7 w-7" />
                </div>
                <h1 className="text-xl font-bold text-text-primary dark:text-dark-text-primary">Vendly</h1>
            </div>
            <button
                onClick={() => setIsOpen(false)}
                className="md:hidden p-2 rounded-full text-text-secondary hover:bg-slate-200 dark:text-dark-text-secondary dark:hover:bg-slate-700"
                aria-label="Fechar menu"
            >
                <XIcon className="h-6 w-6" />
            </button>
        </div>
        <nav className="flex-1 flex flex-col justify-between px-4 py-6">
            <ul className="space-y-2">
                <NavItem view="dashboard" label="Painel" currentView={currentView} setView={setView} onClick={handleNavItemClick}><DashboardIcon className="h-5 w-5"/></NavItem>
                <NavItem view="analytics" label="Analytics" currentView={currentView} setView={setView} onClick={handleNavItemClick}><AnalyticsIcon className="h-5 w-5"/></NavItem>
                <NavItem view="sales" label="Vendas" currentView={currentView} setView={setView} onClick={handleNavItemClick}><SalesIcon className="h-5 w-5"/></NavItem>
                <NavItem view="budget" label="Orçamentos" currentView={currentView} setView={setView} onClick={handleNavItemClick}><BudgetIcon className="h-5 w-5"/></NavItem>
                <NavItem view="promotions" label="Promoções" currentView={currentView} setView={setView} onClick={handleNavItemClick}><TagIcon className="h-5 w-5"/></NavItem>
                <NavItem view="products" label="Produtos" currentView={currentView} setView={setView} onClick={handleNavItemClick}><ProductsIcon className="h-5 w-5"/></NavItem>
                <NavItem view="categories" label="Categorias" currentView={currentView} setView={setView} onClick={handleNavItemClick}><CategoriesIcon className="h-5 w-5"/></NavItem>
                <NavItem view="channels" label="Canais de Venda" currentView={currentView} setView={setView} onClick={handleNavItemClick}><ChannelsIcon className="h-5 w-5"/></NavItem>
                <NavItem view="paymentMethods" label="Formas de Pgto." currentView={currentView} setView={setView} onClick={handleNavItemClick}><CreditCardIcon className="h-5 w-5"/></NavItem>
            </ul>
            <div>
                <ul className="space-y-2 pt-4 mt-4 border-t border-border dark:border-dark-border">
                    <NavItem view="admin" label="Administração" currentView={currentView} setView={setView} onClick={handleNavItemClick}><AdminIcon className="h-5 w-5"/></NavItem>
                </ul>
                <div 
                  className="flex items-center gap-3 p-2 mt-4 rounded-lg cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
                  onClick={() => { setView('profile'); handleNavItemClick(); }}
                  role="button"
                  tabIndex={0}
                  aria-label="Acessar perfil do usuário"
                >
                  <img className="h-9 w-9 rounded-full object-cover" src={user.avatarUrl || `https://ui-avatars.com/api/?name=${encodeURIComponent(user.name)}&background=c7d2fe&color=3730a3`} alt="Avatar do usuário" />
                  <div className="flex-1 overflow-hidden">
                      <p className="font-semibold text-sm text-text-primary dark:text-dark-text-primary truncate">{user.name}</p>
                      <p className="text-xs text-text-secondary dark:text-dark-text-secondary truncate">{user.email}</p>
                  </div>
                </div>
                <button
                    onClick={onLogout}
                    className="flex items-center w-full space-x-3 px-3 py-2.5 rounded-lg text-sm font-medium text-text-secondary hover:bg-slate-100 dark:text-dark-text-secondary dark:hover:bg-slate-700 transition-colors mt-2"
                >
                    <LogoutIcon className="h-5 w-5" />
                    <span>Sair</span>
                </button>
            </div>
        </nav>
    </div>
  );

  return (
    <>
      {/* Overlay for mobile */}
      <div 
        className={`fixed inset-0 bg-black/60 z-40 md:hidden transition-opacity ${isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
        onClick={() => setIsOpen(false)}
        aria-hidden="true"
      ></div>

      {/* Sidebar */}
      <aside className={`fixed top-0 left-0 w-64 h-full bg-card border-r border-border dark:bg-dark-card dark:border-dark-border z-50 transform transition-transform md:translate-x-0 ${isOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        {sidebarContent}
      </aside>
    </>
  );
};

export default Sidebar;

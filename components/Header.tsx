
import React, { useState, useEffect, useRef } from 'react';
import type { View, Notification } from '../types';
import { useTheme } from '../contexts/ThemeContext';
import { SunIcon, MoonIcon, BellIcon, WarningIcon, XCircleIcon, MenuIcon, CogIcon } from './icons/Icons';

interface HeaderProps {
  toggleSidebar: () => void;
  currentView: View;
  notifications: Notification[];
  markAllAsRead: () => void;
}

const viewTitles: { [key in View]: string } = {
    dashboard: 'Painel',
    analytics: 'Análise Detalhada',
    sales: 'Vendas',
    budget: 'Orçamentos',
    promotions: 'Promoções',
    products: 'Produtos',
    categories: 'Categorias',
    channels: 'Canais de Venda',
    paymentMethods: 'Formas de Pagamento',
    admin: 'Administração',
    profile: 'Meu Perfil',
};

const Header: React.FC<HeaderProps> = ({ toggleSidebar, currentView, notifications, markAllAsRead }) => {
  const { theme, toggleTheme } = useTheme();
  const [isNotificationPanelOpen, setIsNotificationPanelOpen] = useState(false);
  const [isSettingsPanelOpen, setIsSettingsPanelOpen] = useState(false);
  
  const notificationRef = useRef<HTMLDivElement>(null);
  const settingsRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
        if (notificationRef.current && !notificationRef.current.contains(event.target as Node)) {
            setIsNotificationPanelOpen(false);
        }
        if (settingsRef.current && !settingsRef.current.contains(event.target as Node)) {
            setIsSettingsPanelOpen(false);
        }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleMarkAsRead = () => {
    markAllAsRead();
    setIsNotificationPanelOpen(false);
  }

  return (
    <header className="bg-background/80 dark:bg-dark-background/80 backdrop-blur-lg border-b border-border dark:border-dark-border sticky top-0 z-30">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          <div className="flex items-center">
            <button
                onClick={toggleSidebar}
                className="md:hidden p-2 rounded-full text-text-secondary hover:bg-slate-200/60 dark:text-dark-text-secondary dark:hover:bg-dark-card/60 transition-colors mr-2"
                aria-label="Abrir menu"
            >
                <MenuIcon className="h-6 w-6" />
            </button>
            <h1 className="text-2xl font-bold text-text-primary dark:text-dark-text-primary">{viewTitles[currentView]}</h1>
          </div>
          <div className="flex items-center gap-2">
            {/* Notification Dropdown */}
            <div className="relative" ref={notificationRef}>
              <button
                  onClick={() => {
                      setIsNotificationPanelOpen(prev => !prev);
                      setIsSettingsPanelOpen(false);
                  }}
                  className="relative p-2 rounded-full text-text-secondary hover:bg-slate-200/60 dark:text-dark-text-secondary dark:hover:bg-dark-card/60 transition-colors"
                  aria-label="Ver notificações"
              >
                  <BellIcon className="h-6 w-6" />
                  {notifications.length > 0 && (
                    <span className="absolute top-1.5 right-1.5 block h-2.5 w-2.5 rounded-full bg-red-500 border-2 border-background dark:border-dark-background">
                      <span className="absolute -inset-1 animate-ping rounded-full bg-red-500 opacity-75"></span>
                    </span>
                  )}
              </button>
              {isNotificationPanelOpen && (
                <div className="absolute right-0 mt-2 w-80 bg-card dark:bg-dark-card rounded-xl shadow-2xl border border-border dark:border-dark-border z-50 overflow-hidden animate-in fade-in zoom-in duration-200">
                  <div className="p-3 border-b border-border dark:border-dark-border">
                    <h4 className="font-semibold text-text-primary dark:text-dark-text-primary">Notificações</h4>
                  </div>
                  <div className="max-h-80 overflow-y-auto">
                    {notifications.length > 0 ? (
                      <ul>
                        {notifications.map(notification => (
                          <li key={notification.id} className="flex items-start gap-3 p-3 border-b border-border dark:border-dark-border/50 hover:bg-slate-50 dark:hover:bg-dark-card/50">
                            {notification.type === 'low_stock' ? (
                              <WarningIcon className="h-6 w-6 text-amber-500 mt-1 flex-shrink-0" />
                            ) : (
                              <XCircleIcon className="h-6 w-6 text-red-500 mt-1 flex-shrink-0" />
                            )}
                            <div>
                              <p className="font-semibold text-sm text-text-primary dark:text-dark-text-primary">{notification.productName}</p>
                              <p className="text-xs text-text-secondary dark:text-dark-text-secondary">{notification.message}</p>
                            </div>
                          </li>
                        ))}
                      </ul>
                    ) : (
                      <p className="p-6 text-center text-sm text-text-secondary dark:text-dark-text-secondary">Nenhuma notificação nova.</p>
                    )}
                  </div>
                  {notifications.length > 0 && (
                    <div className="p-2 bg-slate-50 dark:bg-dark-card/50 border-t border-border dark:border-dark-border">
                      <button onClick={handleMarkAsRead} className="w-full text-center text-sm font-medium text-primary hover:underline">
                        Marcar todas como lidas
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Settings Dropdown (Gear Icon) */}
            <div className="relative" ref={settingsRef}>
                <button
                    onClick={() => {
                        setIsSettingsPanelOpen(prev => !prev);
                        setIsNotificationPanelOpen(false);
                    }}
                    className={`p-2 rounded-full text-text-secondary hover:bg-slate-200/60 dark:text-dark-text-secondary dark:hover:bg-dark-card/60 transition-all duration-200 ${isSettingsPanelOpen ? 'rotate-90 text-primary' : ''}`}
                    aria-label="Configurações"
                >
                    <CogIcon className="h-6 w-6" />
                </button>
                {isSettingsPanelOpen && (
                    <div className="absolute right-0 mt-2 w-56 bg-card dark:bg-dark-card rounded-xl shadow-2xl border border-border dark:border-dark-border z-50 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200">
                        <div className="p-2">
                            <p className="px-3 py-2 text-xs font-bold text-text-secondary dark:text-dark-text-secondary uppercase tracking-wider">Aparência</p>
                            <button
                                onClick={() => {
                                    toggleTheme();
                                    setIsSettingsPanelOpen(false);
                                }}
                                className="w-full flex items-center gap-3 px-3 py-2.5 text-sm font-medium text-text-primary dark:text-dark-text-primary hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors rounded-lg"
                            >
                                {theme === 'light' ? (
                                    <>
                                        <MoonIcon className="h-5 w-5 text-slate-500" />
                                        <span>Modo Escuro</span>
                                    </>
                                ) : (
                                    <>
                                        <SunIcon className="h-5 w-5 text-amber-500" />
                                        <span>Modo Claro</span>
                                    </>
                                )}
                            </button>
                        </div>
                        <div className="bg-slate-50 dark:bg-dark-card/50 border-t border-border dark:border-dark-border p-2">
                            <p className="px-3 py-1 text-[10px] text-text-secondary dark:text-dark-text-secondary text-center italic">Versão 1.2.0</p>
                        </div>
                    </div>
                )}
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;

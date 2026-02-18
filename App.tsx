import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { Category, Product, Sale, View, Notification, Channel, Log, PaymentMethod, User, Budget, Promotion } from './types';
import {
  authApi, productsApi, categoriesApi, salesApi, budgetsApi,
  channelsApi, paymentMethodsApi, promotionsApi, logsApi, usersApi
} from './services/api';
import Header from './components/Header';
import Dashboard from './components/Dashboard';
import Products from './components/Products';
import Categories from './components/Categories';
import Sales from './components/Sales';
import Channels from './components/Channels';
import PaymentMethods from './components/PaymentMethods';
import Admin from './components/Admin';
import Sidebar from './components/Sidebar';
import Login from './components/Login';
import Profile from './components/Profile';
import Analytics from './components/Analytics';
import BudgetComponent from './components/Budget';
import Promotions from './components/Promotions';

function App() {
  const [view, setView] = useState<View>('dashboard');
  const [isSidebarOpen, setSidebarOpen] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(() => !!localStorage.getItem('vendly_token'));
  const [isLoading, setIsLoading] = useState(true);

  // Estado do usuário
  const [currentUser, setCurrentUser] = useState<User>({
    id: '', name: '', email: '',
  });

  // Estado das entidades — carregadas da API (não do localStorage)
  const [categories, setCategories] = useState<Category[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [sales, setSales] = useState<Sale[]>([]);
  const [drafts, setDrafts] = useState<Sale[]>([]);
  const [budgets, setBudgets] = useState<Budget[]>([]);
  const [channels, setChannels] = useState<Channel[]>([]);
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([]);
  const [promotions, setPromotions] = useState<Promotion[]>([]);
  const [logs, setLogs] = useState<Log[]>([]);
  const [readNotifications, setReadNotifications] = useState<string[]>(() => {
    try { return JSON.parse(localStorage.getItem('readNotifications') || '[]'); } catch { return []; }
  });

  // Carrega todos os dados da API (como abrir vários TQuery no Delphi)
  const loadAllData = useCallback(async () => {
    try {
      setIsLoading(true);
      const [
        productsData, categoriesData, salesData, draftsData,
        budgetsData, channelsData, paymentMethodsData, promotionsData, logsData
      ] = await Promise.all([
        productsApi.list(),
        categoriesApi.list(),
        salesApi.list(),
        salesApi.listDrafts(),
        budgetsApi.list(),
        channelsApi.list(),
        paymentMethodsApi.list(),
        promotionsApi.list(),
        logsApi.list(),
      ]);

      setProducts(productsData.map((p: any) => ({
        id: p.id, name: p.name, description: p.description,
        price: p.price, cost: p.cost, categoryId: p.categoryId,
        stock: p.stock, weight: p.weight, dimensions: p.dimensions,
        unitOfMeasure: p.unitOfMeasure, sku: p.sku, barcode: p.barcode,
      })));

      setCategories(categoriesData);

      const mapSale = (s: any) => ({
        id: s.id,
        items: s.items.map((i: any) => ({
          productId: i.productId, quantity: i.quantity, unitPrice: i.unitPrice,
        })),
        total: s.total,
        channelId: s.channelId || undefined,
        paymentMethodId: s.paymentMethodId || undefined,
        observations: s.observations || undefined,
        createdAt: s.createdAt,
        updatedAt: s.updatedAt,
      });

      setSales(salesData.map(mapSale));
      setDrafts(draftsData.map(mapSale));

      setBudgets(budgetsData.map((b: any) => ({
        id: b.id,
        items: b.items.map((i: any) => ({
          productId: i.productId, quantity: i.quantity, unitPrice: i.unitPrice,
        })),
        total: b.total,
        clientName: b.clientName || undefined,
        clientContact: b.clientContact || undefined,
        validUntil: b.validUntil || undefined,
        observations: b.observations || undefined,
        createdAt: b.createdAt,
        updatedAt: b.updatedAt,
      })));

      setChannels(channelsData);
      setPaymentMethods(paymentMethodsData);
      setPromotions(promotionsData);
      setLogs(logsData);
    } catch (error) {
      console.error('Erro ao carregar dados:', error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Ao autenticar, verifica token e carrega dados
  useEffect(() => {
    if (isAuthenticated) {
      authApi.me().then((user) => {
        setCurrentUser({
          id: user.id, name: user.name,
          email: user.email, avatarUrl: user.avatarUrl,
        });
        loadAllData();
      }).catch(() => {
        localStorage.removeItem('vendly_token');
        setIsAuthenticated(false);
        setIsLoading(false);
      });
    } else {
      setIsLoading(false);
    }
  }, [isAuthenticated, loadAllData]);

  // Notificações lidas ficam no localStorage (preferência local)
  useEffect(() => {
    localStorage.setItem('readNotifications', JSON.stringify(readNotifications));
  }, [readNotifications]);

  // Notificações de estoque baixo
  const allNotifications = useMemo((): Notification[] => {
    return products
      .filter(p => p.stock < 10)
      .map(p => {
        if (p.stock === 0) {
          return {
            id: `${p.id}-out_of_stock`,
            productName: p.name,
            type: 'out_of_stock' as const,
            message: 'Esgotado',
          };
        } else {
          return {
            id: `${p.id}-low_stock`,
            productName: p.name,
            type: 'low_stock' as const,
            message: `Apenas ${p.stock} em estoque`,
          };
        }
      });
  }, [products]);

  const unreadNotifications = useMemo(() => {
    return allNotifications.filter(n => !readNotifications.includes(n.id));
  }, [allNotifications, readNotifications]);

  const markAllNotificationsAsRead = () => {
    const notificationIds = allNotifications.map(n => n.id);
    setReadNotifications(notificationIds);
  };

  // --- Categories ---
  const addCategory = async (name: string) => {
    try {
      const newCategory = await categoriesApi.create(name);
      setCategories(prev => [...prev, newCategory]);
    } catch (error) { console.error('Erro ao criar categoria:', error); }
  };

  const deleteCategory = async (id: string) => {
    try {
      await categoriesApi.delete(id);
      setCategories(prev => prev.filter(c => c.id !== id));
    } catch (error) { console.error('Erro ao excluir categoria:', error); }
  };

  // --- Channels ---
  const addChannel = async (name: string, icon: string) => {
    try {
      const newChannel = await channelsApi.create(name, icon);
      setChannels(prev => [...prev, newChannel]);
    } catch (error) { console.error('Erro ao criar canal:', error); }
  };

  const updateChannel = async (updatedChannel: Channel) => {
    try {
      const result = await channelsApi.update(updatedChannel.id, {
        name: updatedChannel.name, icon: updatedChannel.icon,
      });
      setChannels(prev => prev.map(c => c.id === result.id ? result : c));
    } catch (error) { console.error('Erro ao atualizar canal:', error); }
  };

  const deleteChannel = async (id: string) => {
    try {
      await channelsApi.delete(id);
      setChannels(prev => prev.filter(c => c.id !== id));
      setSales(prev => prev.map(s => s.channelId === id ? { ...s, channelId: undefined } : s));
    } catch (error) { console.error('Erro ao excluir canal:', error); }
  };

  // --- Payment Methods ---
  const addPaymentMethod = async (name: string, icon: string) => {
    try {
      const newMethod = await paymentMethodsApi.create(name, icon);
      setPaymentMethods(prev => [...prev, newMethod]);
    } catch (error) { console.error('Erro ao criar forma de pagamento:', error); }
  };

  const updatePaymentMethod = async (updatedMethod: PaymentMethod) => {
    try {
      const result = await paymentMethodsApi.update(updatedMethod.id, {
        name: updatedMethod.name, icon: updatedMethod.icon,
      });
      setPaymentMethods(prev => prev.map(p => p.id === result.id ? result : p));
    } catch (error) { console.error('Erro ao atualizar forma de pagamento:', error); }
  };

  const deletePaymentMethod = async (id: string) => {
    try {
      await paymentMethodsApi.delete(id);
      setPaymentMethods(prev => prev.filter(p => p.id !== id));
      setSales(prev => prev.map(s => s.paymentMethodId === id ? { ...s, paymentMethodId: undefined } : s));
    } catch (error) { console.error('Erro ao excluir forma de pagamento:', error); }
  };

  // --- Products ---
  const addProduct = async (product: Omit<Product, 'id'>) => {
    try {
      const newProduct = await productsApi.create(product);
      setProducts(prev => [...prev, {
        id: newProduct.id, name: newProduct.name, description: newProduct.description,
        price: newProduct.price, cost: newProduct.cost, categoryId: newProduct.categoryId,
        stock: newProduct.stock, weight: newProduct.weight, dimensions: newProduct.dimensions,
        unitOfMeasure: newProduct.unitOfMeasure, sku: newProduct.sku, barcode: newProduct.barcode,
      }]);
    } catch (error) { console.error('Erro ao criar produto:', error); }
  };

  const updateProduct = async (updatedProduct: Product) => {
    try {
      const result = await productsApi.update(updatedProduct.id, updatedProduct);
      setProducts(prev => prev.map(p => p.id === result.id ? {
        id: result.id, name: result.name, description: result.description,
        price: result.price, cost: result.cost, categoryId: result.categoryId,
        stock: result.stock, weight: result.weight, dimensions: result.dimensions,
        unitOfMeasure: result.unitOfMeasure, sku: result.sku, barcode: result.barcode,
      } : p));
    } catch (error) { console.error('Erro ao atualizar produto:', error); }
  };

  const deleteProduct = async (id: string) => {
    try {
      await productsApi.delete(id);
      setProducts(prev => prev.filter(p => p.id !== id));
    } catch (error) { console.error('Erro ao excluir produto:', error); }
  };

  // --- Sales (recarrega tudo pois afeta estoque e canais) ---
  const addSale = async (sale: Omit<Sale, 'id' | 'updatedAt'>) => {
    try {
      await salesApi.create({
        items: sale.items,
        total: sale.total,
        channelId: sale.channelId || null,
        paymentMethodId: sale.paymentMethodId || null,
        observations: sale.observations,
        isDraft: false,
        createdAt: sale.createdAt,
      });
      await loadAllData();
    } catch (error) { console.error('Erro ao criar venda:', error); }
  };

  const updateSale = async (updatedSale: Sale) => {
    try {
      await salesApi.update(updatedSale.id, {
        items: updatedSale.items,
        total: updatedSale.total,
        channelId: updatedSale.channelId || null,
        paymentMethodId: updatedSale.paymentMethodId || null,
        observations: updatedSale.observations,
        isDraft: false,
        createdAt: updatedSale.createdAt,
      });
      await loadAllData();
    } catch (error) { console.error('Erro ao atualizar venda:', error); }
  };

  const deleteSale = async (id: string) => {
    try {
      await salesApi.delete(id);
      await loadAllData();
    } catch (error) { console.error('Erro ao excluir venda:', error); }
  };

  // --- Drafts (rascunhos são vendas com isDraft=true) ---
  const addDraft = async (draft: Omit<Sale, 'id' | 'updatedAt'>) => {
    try {
      const newDraft = await salesApi.create({
        items: draft.items,
        total: draft.total,
        channelId: draft.channelId || null,
        paymentMethodId: draft.paymentMethodId || null,
        observations: draft.observations,
        isDraft: true,
        createdAt: draft.createdAt,
      });
      setDrafts(prev => [...prev, {
        id: newDraft.id,
        items: newDraft.items.map((i: any) => ({
          productId: i.productId, quantity: i.quantity, unitPrice: i.unitPrice,
        })),
        total: newDraft.total,
        channelId: newDraft.channelId || undefined,
        paymentMethodId: newDraft.paymentMethodId || undefined,
        observations: newDraft.observations || undefined,
        createdAt: newDraft.createdAt,
        updatedAt: newDraft.updatedAt,
      }]);
    } catch (error) { console.error('Erro ao salvar rascunho:', error); }
  };

  const updateDraft = async (updatedDraft: Sale) => {
    try {
      const result = await salesApi.update(updatedDraft.id, {
        items: updatedDraft.items,
        total: updatedDraft.total,
        channelId: updatedDraft.channelId || null,
        paymentMethodId: updatedDraft.paymentMethodId || null,
        observations: updatedDraft.observations,
        isDraft: true,
        createdAt: updatedDraft.createdAt,
      });
      setDrafts(prev => prev.map(d => d.id === result.id ? {
        id: result.id,
        items: result.items.map((i: any) => ({
          productId: i.productId, quantity: i.quantity, unitPrice: i.unitPrice,
        })),
        total: result.total,
        channelId: result.channelId || undefined,
        paymentMethodId: result.paymentMethodId || undefined,
        observations: result.observations || undefined,
        createdAt: result.createdAt,
        updatedAt: result.updatedAt,
      } : d));
    } catch (error) { console.error('Erro ao atualizar rascunho:', error); }
  };

  const deleteDraft = async (id: string) => {
    try {
      await salesApi.delete(id);
      setDrafts(prev => prev.filter(d => d.id !== id));
    } catch (error) { console.error('Erro ao excluir rascunho:', error); }
  };

  // --- Budgets ---
  const addBudget = async (budget: Omit<Budget, 'id' | 'createdAt' | 'updatedAt'>) => {
    try {
      const newBudget = await budgetsApi.create(budget);
      setBudgets(prev => [...prev, {
        id: newBudget.id,
        items: newBudget.items.map((i: any) => ({
          productId: i.productId, quantity: i.quantity, unitPrice: i.unitPrice,
        })),
        total: newBudget.total,
        clientName: newBudget.clientName || undefined,
        clientContact: newBudget.clientContact || undefined,
        validUntil: newBudget.validUntil || undefined,
        observations: newBudget.observations || undefined,
        createdAt: newBudget.createdAt,
        updatedAt: newBudget.updatedAt,
      }]);
    } catch (error) { console.error('Erro ao criar orçamento:', error); }
  };

  const updateBudget = async (updatedBudget: Budget) => {
    try {
      const result = await budgetsApi.update(updatedBudget.id, updatedBudget);
      setBudgets(prev => prev.map(b => b.id === result.id ? {
        id: result.id,
        items: result.items.map((i: any) => ({
          productId: i.productId, quantity: i.quantity, unitPrice: i.unitPrice,
        })),
        total: result.total,
        clientName: result.clientName || undefined,
        clientContact: result.clientContact || undefined,
        validUntil: result.validUntil || undefined,
        observations: result.observations || undefined,
        createdAt: result.createdAt,
        updatedAt: result.updatedAt,
      } : b));
    } catch (error) { console.error('Erro ao atualizar orçamento:', error); }
  };

  const deleteBudget = async (id: string) => {
    try {
      await budgetsApi.delete(id);
      setBudgets(prev => prev.filter(b => b.id !== id));
    } catch (error) { console.error('Erro ao excluir orçamento:', error); }
  };

  // --- Promotions ---
  const addPromotion = async (promotion: Omit<Promotion, 'id'>) => {
    try {
      const newPromotion = await promotionsApi.create(promotion);
      setPromotions(prev => [...prev, newPromotion]);
    } catch (error) { console.error('Erro ao criar promoção:', error); }
  };

  const updatePromotion = async (updatedPromotion: Promotion) => {
    try {
      const result = await promotionsApi.update(updatedPromotion.id, updatedPromotion);
      setPromotions(prev => prev.map(p => p.id === result.id ? result : p));
    } catch (error) { console.error('Erro ao atualizar promoção:', error); }
  };

  const deletePromotion = async (id: string) => {
    try {
      await promotionsApi.delete(id);
      setPromotions(prev => prev.filter(p => p.id !== id));
    } catch (error) { console.error('Erro ao excluir promoção:', error); }
  };

  // --- User ---
  const updateUser = async (updatedUser: User) => {
    try {
      const result = await usersApi.updateProfile(updatedUser);
      setCurrentUser({
        id: result.id, name: result.name,
        email: result.email, avatarUrl: result.avatarUrl,
      });
    } catch (error) { console.error('Erro ao atualizar perfil:', error); }
  };

  // --- Logs ---
  const clearLogs = async () => {
    try {
      await logsApi.clear();
      const updatedLogs = await logsApi.list();
      setLogs(updatedLogs);
    } catch (error) { console.error('Erro ao limpar logs:', error); }
  };

  const renderView = () => {
    switch (view) {
      case 'dashboard':
        return <Dashboard sales={sales} products={products} categories={categories} />;
      case 'analytics':
        return <Analytics sales={sales} products={products} categories={categories} channels={channels} />;
      case 'products':
        return <Products products={products} categories={categories} addProduct={addProduct} updateProduct={updateProduct} deleteProduct={deleteProduct} />;
      case 'categories':
        return <Categories categories={categories} addCategory={addCategory} deleteCategory={deleteCategory} />;
      case 'channels':
        return <Channels channels={channels} addChannel={addChannel} updateChannel={updateChannel} deleteChannel={deleteChannel} />;
      case 'paymentMethods':
        return <PaymentMethods paymentMethods={paymentMethods} addPaymentMethod={addPaymentMethod} updatePaymentMethod={updatePaymentMethod} deletePaymentMethod={deletePaymentMethod} />;
      case 'sales':
        return <Sales
          products={products}
          sales={sales}
          channels={channels}
          paymentMethods={paymentMethods}
          promotions={promotions}
          addSale={addSale}
          updateSale={updateSale}
          deleteSale={deleteSale}
          drafts={drafts}
          addDraft={addDraft}
          updateDraft={updateDraft}
          deleteDraft={deleteDraft}
        />;
      case 'budget':
        return <BudgetComponent
          products={products}
          budgets={budgets}
          addBudget={addBudget}
          updateBudget={updateBudget}
          deleteBudget={deleteBudget}
        />;
      case 'promotions':
        return <Promotions
          promotions={promotions}
          products={products}
          addPromotion={addPromotion}
          updatePromotion={updatePromotion}
          deletePromotion={deletePromotion}
        />;
      case 'admin':
        return <Admin logs={logs} clearLogs={clearLogs} />;
      case 'profile':
        return <Profile user={currentUser} onUpdateUser={updateUser} />;
      default:
        return <Dashboard sales={sales} products={products} categories={categories} />;
    }
  };

  // Login via API com JWT
  const handleLogin = async (emailOrUser: string, password: string): Promise<boolean> => {
    try {
      const email = emailOrUser.includes('@') ? emailOrUser : `${emailOrUser}@vendly.com`;
      const result = await authApi.login(email, password);
      localStorage.setItem('vendly_token', result.token);
      setCurrentUser({
        id: result.user.id, name: result.user.name,
        email: result.user.email, avatarUrl: result.user.avatarUrl,
      });
      setIsAuthenticated(true);
      return true;
    } catch {
      return false;
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('vendly_token');
    setIsAuthenticated(false);
    setCurrentUser({ id: '', name: '', email: '' });
    setProducts([]);
    setSales([]);
    setDrafts([]);
    setBudgets([]);
    setCategories([]);
    setChannels([]);
    setPaymentMethods([]);
    setPromotions([]);
    setLogs([]);
  };

  if (!isAuthenticated) {
    return <Login onLogin={handleLogin} />;
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background dark:bg-dark-background">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-text-secondary dark:text-dark-text-secondary">Carregando dados...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex text-text-primary dark:text-dark-text-primary">
      <Sidebar
        currentView={view}
        setView={setView}
        isOpen={isSidebarOpen}
        setIsOpen={setSidebarOpen}
        onLogout={handleLogout}
        user={currentUser}
      />
      <div className="flex-1 flex flex-col md:pl-64">
        <Header
          toggleSidebar={() => setSidebarOpen(prev => !prev)}
          currentView={view}
          notifications={unreadNotifications}
          markAllAsRead={markAllNotificationsAsRead}
        />
        <main className="flex-grow">
          <div className="container mx-auto p-4 md:p-8">
            {renderView()}
          </div>
        </main>
      </div>
    </div>
  );
}

export default App;

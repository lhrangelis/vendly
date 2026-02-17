


import React, { useState, useMemo } from 'react';
import { useLocalStorage } from './hooks/useLocalStorage';
import { Category, Product, Sale, View, Notification, Channel, Log, PaymentMethod, User, Budget, Promotion } from './types';
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

// Initial mock data for a better first-time experience
const initialCategories: Category[] = [
  { id: '1', name: 'Eletrônicos' },
  { id: '2', name: 'Livros' },
  { id: '3', name: 'Roupas' },
];

const initialProducts: Product[] = [
  { id: '1', name: 'Smartphone Pro', description: 'Última geração com câmera tripla.', price: 3999.90, cost: 2500, categoryId: '1', stock: 15, weight: 0.18, dimensions: '15x7x0.8 cm', unitOfMeasure: 'un', sku: 'SP-PRO-BLK', barcode: '1234567890123' },
  { id: '2', name: 'React Avançado', description: 'Aprenda hooks e padrões.', price: 79.90, cost: 30, categoryId: '2', stock: 50 },
  { id: '3', name: 'Camiseta de Algodão', description: 'Confortável e estilosa.', price: 59.90, cost: 1.00, categoryId: '3', stock: 1 },
];

const initialSales: Sale[] = [
    { id: '1', items: [{ productId: '1', quantity: 1, unitPrice: 3999.90 }], total: 3999.90, createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(), updatedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(), channelId: '1', paymentMethodId: '1' },
    { id: '2', items: [{ productId: '2', quantity: 2, unitPrice: 79.90 }, { productId: '3', quantity: 1, unitPrice: 59.90 }], total: 219.70, createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(), updatedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(), channelId: '2', paymentMethodId: '2' },
    { id: '3', items: [{ productId: '3', quantity: 3, unitPrice: 59.90 }], total: 179.70, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
];

const initialChannels: Channel[] = [
    { id: '1', name: 'Loja Online', icon: 'globe', totalSales: 3999.90, totalProfit: 1499.90 },
    { id: '2', name: 'WhatsApp', icon: 'whatsapp', totalSales: 219.70, totalProfit: 99.7 },
];

const initialPaymentMethods: PaymentMethod[] = [
    { id: '1', name: 'Cartão de Crédito', icon: 'credit-card' },
    { id: '2', name: 'Pix', icon: 'pix' },
];

function App() {
  const [view, setView] = useState<View>('dashboard');
  const [isSidebarOpen, setSidebarOpen] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useLocalStorage('isAuthenticated', false);
  
  const [currentUser, setCurrentUser] = useLocalStorage<User>('currentUser', {
    id: 'admin-user',
    name: 'Admin',
    email: 'admin@gestorloja.com',
    avatarUrl: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80',
  });
  const [categories, setCategories] = useLocalStorage<Category[]>('categories', initialCategories);
  const [products, setProducts] = useLocalStorage<Product[]>('products', initialProducts);
  const [sales, setSales] = useLocalStorage<Sale[]>('sales', initialSales);
  const [drafts, setDrafts] = useLocalStorage<Sale[]>('drafts', []);
  const [budgets, setBudgets] = useLocalStorage<Budget[]>('budgets', []);
  const [channels, setChannels] = useLocalStorage<Channel[]>('channels', initialChannels);
  const [paymentMethods, setPaymentMethods] = useLocalStorage<PaymentMethod[]>('paymentMethods', initialPaymentMethods);
  const [promotions, setPromotions] = useLocalStorage<Promotion[]>('promotions', []);
  const [readNotifications, setReadNotifications] = useLocalStorage<string[]>('readNotifications', []);
  const [logs, setLogs] = useLocalStorage<Log[]>('logs', []);

  const addLog = (action: string, type: Log['type']) => {
    const newLog: Log = {
        id: Date.now().toString(),
        timestamp: new Date().toISOString(),
        action,
        type,
    };
    setLogs(prev => [newLog, ...prev]);
  };

  const clearLogs = () => {
    setLogs([]);
    addLog('Histórico de atividades limpo.', 'delete');
  };

  const allNotifications = useMemo((): Notification[] => {
    return products
      .filter(p => p.stock < 10)
      .map(p => {
        if (p.stock === 0) {
          return {
            id: `${p.id}-out_of_stock`,
            productName: p.name,
            type: 'out_of_stock',
            message: 'Esgotado',
          };
        } else {
          return {
            id: `${p.id}-low_stock`,
            productName: p.name,
            type: 'low_stock',
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
    addLog('Notificações marcadas como lidas.', 'info');
  };

  const addCategory = (name: string) => {
    const newCategory: Category = { id: Date.now().toString(), name };
    setCategories(prev => [...prev, newCategory]);
    addLog(`Categoria "${name}" criada.`, 'create');
  };

  const deleteCategory = (id: string) => {
    const category = categories.find(c => c.id === id);
    if(category) {
        setCategories(prev => prev.filter(c => c.id !== id));
        addLog(`Categoria "${category.name}" excluída.`, 'delete');
    }
  };
  
  const addChannel = (name: string, icon: string) => {
    const newChannel: Channel = { id: Date.now().toString(), name, icon, totalSales: 0, totalProfit: 0 };
    setChannels(prev => [...prev, newChannel]);
    addLog(`Canal de venda "${name}" criado.`, 'create');
  };
  
  const updateChannel = (updatedChannel: Channel) => {
    setChannels(prev => prev.map(c => c.id === updatedChannel.id ? updatedChannel : c));
    addLog(`Canal de venda "${updatedChannel.name}" atualizado.`, 'update');
  };

  const deleteChannel = (id: string) => {
    const channel = channels.find(c => c.id === id);
    if (channel) {
        setChannels(prev => prev.filter(c => c.id !== id));
        setSales(prev => prev.map(s => s.channelId === id ? { ...s, channelId: undefined } : s));
        addLog(`Canal de venda "${channel.name}" excluído.`, 'delete');
    }
  };

  const addPaymentMethod = (name: string, icon: string) => {
    const newMethod: PaymentMethod = { id: Date.now().toString(), name, icon };
    setPaymentMethods(prev => [...prev, newMethod]);
    addLog(`Forma de pagamento "${name}" criada.`, 'create');
  };
  
  const updatePaymentMethod = (updatedMethod: PaymentMethod) => {
    setPaymentMethods(prev => prev.map(p => p.id === updatedMethod.id ? updatedMethod : p));
    addLog(`Forma de pagamento "${updatedMethod.name}" atualizada.`, 'update');
  };

  const deletePaymentMethod = (id: string) => {
    const method = paymentMethods.find(p => p.id === id);
    if (method) {
        setPaymentMethods(prev => prev.filter(p => p.id !== id));
        setSales(prev => prev.map(s => s.paymentMethodId === id ? { ...s, paymentMethodId: undefined } : s));
        addLog(`Forma de pagamento "${method.name}" excluída.`, 'delete');
    }
  };

  const addProduct = (product: Omit<Product, 'id'>) => {
    const newProduct: Product = { ...product, id: Date.now().toString() };
    setProducts(prev => [...prev, newProduct]);
    addLog(`Produto "${product.name}" adicionado.`, 'create');
  };
  
  const updateProduct = (updatedProduct: Product) => {
    setProducts(prev => prev.map(p => (p.id === updatedProduct.id ? updatedProduct : p)));
    addLog(`Produto "${updatedProduct.name}" atualizado.`, 'update');
  };

  const deleteProduct = (id: string) => {
    const product = products.find(p => p.id === id);
    if (product) {
        setProducts(prev => prev.filter(p => p.id !== id));
        addLog(`Produto "${product.name}" excluído.`, 'delete');
    }
  };

  const calculateSaleProfit = (sale: Pick<Sale, 'items'>): number => {
      return sale.items.reduce((profit, item) => {
          const product = products.find(p => p.id === item.productId);
          const itemCost = product ? product.cost * item.quantity : 0;
          return profit + (item.unitPrice * item.quantity - itemCost);
      }, 0);
  };

  const addSale = (sale: Omit<Sale, 'id' | 'createdAt' | 'updatedAt'>) => {
    const now = new Date().toISOString();
    const newSale: Sale = { ...sale, id: Date.now().toString(), createdAt: now, updatedAt: now };
    setSales(prev => [...prev, newSale]);
    addLog(`Venda de ${newSale.total.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })} finalizada.`, 'create');

    setProducts(prev => prev.map(p => {
        const itemSold = sale.items.find(item => item.productId === p.id);
        if (itemSold) {
            return { ...p, stock: p.stock - itemSold.quantity };
        }
        return p;
    }));
    
    if (newSale.channelId) {
        const profit = calculateSaleProfit(newSale);
        setChannels(prev => prev.map(c => 
            c.id === newSale.channelId 
            ? { ...c, totalSales: c.totalSales + newSale.total, totalProfit: c.totalProfit + profit } 
            : c
        ));
    }
  };

  const updateSale = (updatedSale: Sale) => {
    const originalSale = sales.find(s => s.id === updatedSale.id);
    if (!originalSale) return;

    addLog(`Venda #${updatedSale.id.slice(-5)} atualizada.`, 'update');

    setProducts(prevProducts => {
        const productsCopy = JSON.parse(JSON.stringify(prevProducts));
        const originalItemsMap = new Map(originalSale.items.map(i => [i.productId, i.quantity]));
        const updatedItemsMap = new Map(updatedSale.items.map(i => [i.productId, i.quantity]));
        const allProductIds = new Set([...originalItemsMap.keys(), ...updatedItemsMap.keys()]);

        allProductIds.forEach(productId => {
            const productIndex = productsCopy.findIndex((p: Product) => p.id === productId);
            if (productIndex > -1) {
                const originalQty = originalItemsMap.get(productId) || 0;
                const updatedQty = updatedItemsMap.get(productId) || 0;
                const diff = originalQty - updatedQty;
                productsCopy[productIndex].stock += diff;
            }
        });
        return productsCopy;
    });

    const originalProfit = calculateSaleProfit(originalSale);
    const updatedProfit = calculateSaleProfit(updatedSale);
    
    setChannels(prev => {
        const newChannels = [...prev];
        if (originalSale.channelId) {
            const oldChannelIndex = newChannels.findIndex(c => c.id === originalSale.channelId);
            if (oldChannelIndex > -1) {
                newChannels[oldChannelIndex] = {
                    ...newChannels[oldChannelIndex],
                    totalSales: newChannels[oldChannelIndex].totalSales - originalSale.total,
                    totalProfit: newChannels[oldChannelIndex].totalProfit - originalProfit,
                };
            }
        }
        if (updatedSale.channelId) {
            const newChannelIndex = newChannels.findIndex(c => c.id === updatedSale.channelId);
            if (newChannelIndex > -1) {
                 newChannels[newChannelIndex] = {
                    ...newChannels[newChannelIndex],
                    totalSales: newChannels[newChannelIndex].totalSales + updatedSale.total,
                    totalProfit: newChannels[newChannelIndex].totalProfit + updatedProfit,
                };
            }
        }
        return newChannels;
    });

    setSales(prev => prev.map(s => (s.id === updatedSale.id ? { ...updatedSale, updatedAt: new Date().toISOString() } : s)));
  };

  const deleteSale = (id: string) => {
    const saleToDelete = sales.find(s => s.id === id);
    if (saleToDelete) {
        setProducts(prev => prev.map(p => {
            const itemSold = saleToDelete.items.find(item => item.productId === p.id);
            if (itemSold) {
                return { ...p, stock: p.stock + itemSold.quantity };
            }
            return p;
        }));
        
        if (saleToDelete.channelId) {
            const profit = calculateSaleProfit(saleToDelete);
            setChannels(prev => prev.map(c => 
                c.id === saleToDelete.channelId 
                ? { ...c, totalSales: c.totalSales - saleToDelete.total, totalProfit: c.totalProfit - profit } 
                : c
            ));
        }
        addLog(`Venda #${id.slice(-5)} excluída.`, 'delete');
    }
    setSales(prev => prev.filter(s => s.id !== id));
  };

  const addDraft = (draft: Omit<Sale, 'id' | 'createdAt' | 'updatedAt'>) => {
    const now = new Date().toISOString();
    const newDraft: Sale = { ...draft, id: Date.now().toString(), createdAt: now, updatedAt: now };
    setDrafts(prev => [...prev, newDraft]);
    addLog(`Rascunho de venda salvo.`, 'create');
  };

  const updateDraft = (updatedDraft: Sale) => {
    setDrafts(prev => prev.map(d => (d.id === updatedDraft.id ? { ...updatedDraft, updatedAt: new Date().toISOString() } : d)));
    addLog(`Rascunho #${updatedDraft.id.slice(-5)} atualizado.`, 'update');
  };

  const deleteDraft = (id: string) => {
    setDrafts(prev => prev.filter(d => d.id !== id));
    addLog(`Rascunho #${id.slice(-5)} excluído.`, 'delete');
  };
  
  const addBudget = (budget: Omit<Budget, 'id' | 'createdAt' | 'updatedAt'>) => {
    const now = new Date().toISOString();
    const newBudget: Budget = { ...budget, id: Date.now().toString(), createdAt: now, updatedAt: now };
    setBudgets(prev => [...prev, newBudget]);
    addLog(`Orçamento para "${budget.clientName || 'Cliente'}" criado.`, 'create');
  };

  const updateBudget = (updatedBudget: Budget) => {
    setBudgets(prev => prev.map(b => (b.id === updatedBudget.id ? { ...updatedBudget, updatedAt: new Date().toISOString() } : b)));
    addLog(`Orçamento #${updatedBudget.id.slice(-5)} atualizado.`, 'update');
  };

  const deleteBudget = (id: string) => {
    const budget = budgets.find(b => b.id === id);
    if(budget) addLog(`Orçamento #${id.slice(-5)} para "${budget.clientName || 'Cliente'}" excluído.`, 'delete');
    setBudgets(prev => prev.filter(b => b.id !== id));
  };
  
  const addPromotion = (promotion: Omit<Promotion, 'id'>) => {
    const newPromotion: Promotion = { ...promotion, id: Date.now().toString() };
    setPromotions(prev => [...prev, newPromotion]);
    addLog(`Promoção "${promotion.name}" criada.`, 'create');
  };

  const updatePromotion = (updatedPromotion: Promotion) => {
    setPromotions(prev => prev.map(p => (p.id === updatedPromotion.id ? updatedPromotion : p)));
    addLog(`Promoção "${updatedPromotion.name}" atualizada.`, 'update');
  };

  const deletePromotion = (id: string) => {
    const promotion = promotions.find(p => p.id === id);
    if (promotion) {
        setPromotions(prev => prev.filter(p => p.id !== id));
        addLog(`Promoção "${promotion.name}" excluída.`, 'delete');
    }
  };

  const updateUser = (updatedUser: User) => {
    setCurrentUser(updatedUser);
    addLog(`Perfil de "${updatedUser.name}" atualizado.`, 'update');
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

  const handleLogin = (user: string, pass: string): boolean => {
    if (user === 'admin' && pass === 'admin') {
      setIsAuthenticated(true);
      addLog('Usuário fez login.', 'info');
      return true;
    }
    return false;
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
  };

  if (!isAuthenticated) {
    return <Login onLogin={handleLogin} />;
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

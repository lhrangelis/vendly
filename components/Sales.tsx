
import React, { useState, useEffect, useMemo } from 'react';
import type { Product, Sale, SaleItem, Channel, PaymentMethod, Promotion } from '../types';
import { PlusIcon, TrashIcon, CheckIcon, ArrowUpTrayIcon, EditIcon, MinusIcon, ChevronDownIcon, XCircleIcon, TagIcon } from './icons/Icons';

interface SalesProps {
  products: Product[];
  sales: Sale[];
  drafts: Sale[];
  channels: Channel[];
  paymentMethods: PaymentMethod[];
  promotions: Promotion[];
  addSale: (sale: Omit<Sale, 'id' | 'updatedAt'>) => void;
  updateSale: (sale: Sale) => void;
  deleteSale: (id: string) => void;
  addDraft: (draft: Omit<Sale, 'id' | 'updatedAt'>) => void;
  updateDraft: (draft: Sale) => void;
  deleteDraft: (id: string) => void;
}

const formatDate = (isoString: string) => new Date(isoString).toLocaleString('pt-BR', {
  day: '2-digit',
  month: '2-digit',
  year: 'numeric',
  hour: '2-digit',
  minute: '2-digit',
});

const getLocalISOString = (date: Date = new Date()) => {
  const offset = date.getTimezoneOffset() * 60000; // offset in milliseconds
  const localISOTime = (new Date(date.getTime() - offset)).toISOString().slice(0, 16);
  return localISOTime;
};

const FilterButton: React.FC<{ label: string; isActive: boolean; onClick: (e: React.MouseEvent) => void; }> = ({ label, isActive, onClick }) => (
  <button
    onClick={onClick}
    className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors ${isActive
      ? 'bg-primary text-white shadow'
      : 'bg-slate-200 dark:bg-slate-600/50 text-text-secondary dark:text-dark-text-secondary hover:bg-slate-300 dark:hover:bg-slate-600'
      }`}
  >
    {label}
  </button>
);

const Sales: React.FC<SalesProps> = ({ products, sales, drafts, channels, paymentMethods, promotions, addSale, updateSale, deleteSale, addDraft, updateDraft, deleteDraft }) => {
  const [cart, setCart] = useState<SaleItem[]>([]);
  const [selectedProduct, setSelectedProduct] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [chargedPrice, setChargedPrice] = useState('');
  const [selectedChannelId, setSelectedChannelId] = useState('');
  const [selectedPaymentMethodId, setSelectedPaymentMethodId] = useState('');
  const [selectedPromotionId, setSelectedPromotionId] = useState('');
  const [observations, setObservations] = useState('');
  const [saleDate, setSaleDate] = useState(getLocalISOString());
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);
  const [currentDraftId, setCurrentDraftId] = useState<string | null>(null);
  const [editingSaleId, setEditingSaleId] = useState<string | null>(null);
  const [expandedLists, setExpandedLists] = useState({ drafts: true, history: true });
  const [expandedItems, setExpandedItems] = useState<Set<string>>(new Set());
  const [addFormError, setAddFormError] = useState(false);
  const [dateFilter, setDateFilter] = useState<'all' | '7d' | '30d' | '365d'>('all');

  useEffect(() => {
    if (toast) {
      const timer = setTimeout(() => setToast(null), 3000);
      return () => clearTimeout(timer);
    }
  }, [toast]);

  const activePromotions = useMemo(() => {
    const now = new Date();
    now.setHours(0, 0, 0, 0);
    return promotions.filter(p => {
      const start = new Date(p.startDate + 'T00:00:00');
      const end = new Date(p.endDate + 'T00:00:00');
      return now >= start && now <= end;
    });
  }, [promotions]);

  const calculateDiscountedPrice = (product: Product, promotion: Promotion) => {
    if (!promotion.productIds.includes(product.id)) return product.price;
    if (promotion.discountType === 'percentage') {
      return product.price * (1 - promotion.discountValue / 100);
    }
    return Math.max(0, product.price - promotion.discountValue);
  };

  useEffect(() => {
    const product = products.find(p => p.id === selectedProduct);
    if (!product) {
      setChargedPrice('');
      return;
    }

    let finalPrice = product.price;
    if (selectedPromotionId) {
      const promo = activePromotions.find(p => p.id === selectedPromotionId);
      if (promo) {
        finalPrice = calculateDiscountedPrice(product, promo);
      }
    }
    setChargedPrice(String(finalPrice));
  }, [selectedProduct, selectedPromotionId, products, activePromotions]);

  const handlePromotionChange = (promoId: string) => {
    setSelectedPromotionId(promoId);
    if (!promoId) return;

    const promo = activePromotions.find(p => p.id === promoId);
    if (!promo) return;

    // Recalculate cart items based on selected promotion
    const updatedCart = cart.map(item => {
      const product = products.find(p => p.id === item.productId);
      if (product && promo.productIds.includes(product.id)) {
        return { ...item, unitPrice: calculateDiscountedPrice(product, promo) };
      }
      return item;
    });
    setCart(updatedCart);
  };

  const getProductName = (productId: string) => products.find(p => p.id === productId)?.name || 'Produto desconhecido';

  const handleAddToCart = () => {
    const product = products.find(p => p.id === selectedProduct);
    if (!product || quantity <= 0 || parseFloat(chargedPrice) < 0) return;

    const itemInCart = cart.find(item => item.productId === product.id);
    const currentQuantityInCart = itemInCart ? itemInCart.quantity : 0;

    if (product.stock < currentQuantityInCart + quantity) {
      setToast({ message: `Estoque insuficiente! Apenas ${product.stock} disponíveis.`, type: 'error' });
      setAddFormError(true);
      setTimeout(() => setAddFormError(false), 2500);
      return;
    }

    const existingItemIndex = cart.findIndex(item => item.productId === selectedProduct);
    if (existingItemIndex > -1) {
      const updatedCart = [...cart];
      updatedCart[existingItemIndex].quantity += quantity;
      updatedCart[existingItemIndex].unitPrice = parseFloat(chargedPrice); // Use last selected price
      setCart(updatedCart);
    } else {
      setCart([...cart, { productId: product.id, quantity, unitPrice: parseFloat(chargedPrice) }]);
    }

    setSelectedProduct('');
    setQuantity(1);
    setChargedPrice('');
  };

  const updateCartItem = (productId: string, newQuantity: number, newPrice: number) => {
    const product = products.find(p => p.id === productId);
    if (!product) return;

    if (newPrice < 0) {
      setToast({ message: 'O preço não pode ser negativo.', type: 'error' });
      return;
    }

    const originalSale = editingSaleId ? sales.find(s => s.id === editingSaleId) : null;
    const originalQuantity = originalSale?.items.find(i => i.productId === productId)?.quantity || 0;
    const availableStock = product.stock + originalQuantity;

    if (newQuantity > availableStock) {
      setToast({ message: `Estoque máximo (${availableStock}) atingido para ${product.name}.`, type: 'error' });
      return;
    }

    if (newQuantity < 1) {
      newQuantity = 1;
    }

    setCart(cart.map(item =>
      item.productId === productId ? { ...item, quantity: newQuantity, unitPrice: newPrice } : item
    ));
  };

  const removeFromCart = (productId: string) => setCart(cart.filter(item => item.productId !== productId));

  const { cartTotal, totalCost, profit } = useMemo(() => {
    const total = cart.reduce((acc, item) => acc + (item.unitPrice * item.quantity), 0);
    const cost = cart.reduce((acc, item) => {
      const product = products.find(p => p.id === item.productId);
      const itemCost = product ? product.cost * item.quantity : 0;
      return acc + itemCost;
    }, 0);
    const profitAmount = total - cost;
    return { cartTotal: total, totalCost: cost, profit: profitAmount };
  }, [cart, products]);


  const clearCartAndState = () => {
    setCart([]);
    setCurrentDraftId(null);
    setEditingSaleId(null);
    setSelectedChannelId('');
    setSelectedPaymentMethodId('');
    setSelectedPromotionId('');
    setObservations('');
    setSaleDate(getLocalISOString());
  };

  const handleSaveSale = () => {
    if (cart.length === 0) return;
    const saleData = {
      items: cart,
      total: cartTotal,
      channelId: selectedChannelId || undefined,
      paymentMethodId: selectedPaymentMethodId || undefined,
      observations: observations.trim() || undefined,
      createdAt: new Date(saleDate).toISOString(),
    };
    if (editingSaleId) {
      const originalSale = sales.find(s => s.id === editingSaleId);
      if (originalSale) {
        updateSale({ ...originalSale, ...saleData });
        setToast({ message: 'Venda atualizada com sucesso!', type: 'success' });
      }
    } else {
      addSale(saleData);
      if (currentDraftId) deleteDraft(currentDraftId);
      setToast({ message: 'Venda finalizada com sucesso!', type: 'success' });
    }
    clearCartAndState();
  };

  const handleSaveDraft = () => {
    if (cart.length === 0 || editingSaleId) return;
    const draftData = {
      items: cart,
      total: cartTotal,
      channelId: selectedChannelId || undefined,
      paymentMethodId: selectedPaymentMethodId || undefined,
      observations: observations.trim() || undefined,
      createdAt: new Date(saleDate).toISOString(),
    };
    if (currentDraftId) {
      const originalDraft = drafts.find(d => d.id === currentDraftId);
      if (originalDraft) {
        updateDraft({ ...originalDraft, ...draftData });
        setToast({ message: 'Rascunho atualizado!', type: 'success' });
      }
    } else {
      addDraft(draftData);
      setToast({ message: 'Venda salva como rascunho!', type: 'success' });
    }
    clearCartAndState();
  };

  const handleLoadDraft = (draft: Sale) => {
    if (cart.length > 0 && !window.confirm('Isso substituirá o carrinho atual. Deseja continuar?')) return;
    setCart(draft.items);
    setCurrentDraftId(draft.id);
    setSelectedChannelId(draft.channelId || '');
    setSelectedPaymentMethodId(draft.paymentMethodId || '');
    setObservations(draft.observations || '');
    setSaleDate(getLocalISOString(new Date(draft.createdAt)));
    setEditingSaleId(null);
  };

  const handleEditSale = (saleToEdit: Sale) => {
    if (cart.length > 0 && editingSaleId !== saleToEdit.id && !window.confirm('Isso substituirá o carrinho atual. Deseja continuar?')) return;
    setCart(saleToEdit.items);
    setEditingSaleId(saleToEdit.id);
    setSelectedChannelId(saleToEdit.channelId || '');
    setSelectedPaymentMethodId(saleToEdit.paymentMethodId || '');
    setObservations(saleToEdit.observations || '');
    setSaleDate(getLocalISOString(new Date(saleToEdit.createdAt)));
    setCurrentDraftId(null);
  };

  const handleCancelEdit = () => {
    clearCartAndState();
  };

  const toggleListItem = (id: string) => {
    setExpandedItems(prev => {
      const newSet = new Set(prev);
      if (newSet.has(id)) newSet.delete(id);
      else newSet.add(id);
      return newSet;
    });
  };

  const filteredSales = useMemo(() => {
    if (dateFilter === 'all') return sales;

    const now = new Date();
    const daysToSubtract = { '7d': 7, '30d': 30, '365d': 365 }[dateFilter];
    const cutoffDate = new Date();
    cutoffDate.setDate(now.getDate() - daysToSubtract);

    return sales.filter(sale => new Date(sale.createdAt) >= cutoffDate);
  }, [sales, dateFilter]);

  const inputClasses = "w-full bg-white border border-slate-300 rounded-lg shadow-sm p-3 focus:ring-primary focus:border-primary dark:bg-slate-700 dark:border-slate-600 dark:text-slate-200 dark:placeholder-slate-400";

  const AccordionSection: React.FC<{
    title: string;
    items: Sale[];
    onItemClick: (item: Sale) => void;
    onItemDelete: (id: string) => void;
    itemType: 'draft' | 'sale';
    extraHeaderContent?: React.ReactNode;
  }> = ({ title, items, onItemClick, onItemDelete, itemType, extraHeaderContent }) => (
    <div className="bg-card dark:bg-slate-800 rounded-2xl shadow-lg overflow-hidden">
      <div className="w-full p-4 flex justify-between items-center bg-slate-50 dark:bg-slate-700/50">
        <h3 className="text-lg font-semibold text-text-primary dark:text-slate-200">{title}</h3>
        <div className="flex items-center gap-2">
          {extraHeaderContent}
          <button
            onClick={() => setExpandedLists(prev => ({ ...prev, [itemType === 'draft' ? 'drafts' : 'history']: !prev[itemType === 'draft' ? 'drafts' : 'history'] }))}
            className="p-1 rounded-full hover:bg-slate-200 dark:hover:bg-slate-600"
          >
            <ChevronDownIcon className={`h-6 w-6 transition-transform text-text-secondary dark:text-slate-400 ${expandedLists[itemType === 'draft' ? 'drafts' : 'history'] ? '' : '-rotate-90'}`} />
          </button>
        </div>
      </div>
      {expandedLists[itemType === 'draft' ? 'drafts' : 'history'] && (
        <ul className="divide-y divide-slate-200 dark:divide-slate-700 max-h-[400px] overflow-y-auto">
          {items.length === 0 ? <li className="text-center p-4 text-text-secondary dark:text-slate-400">Nenhum item.</li> : [...items].reverse().map(item => (
            <li key={item.id} className="p-4">
              <div className="flex justify-between items-center cursor-pointer" onClick={() => toggleListItem(item.id)}>
                <div>
                  <p className="font-medium text-text-primary dark:text-slate-200">{formatDate(itemType === 'sale' ? item.createdAt : item.updatedAt)}</p>
                  <p className={`font-bold ${itemType === 'draft' ? 'text-blue-500' : 'text-secondary'}`}>{item.total.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</p>
                </div>
                <div className="flex items-center gap-2">
                  <button onClick={(e) => { e.stopPropagation(); onItemClick(item); }} className={`p-2 rounded-full transition-colors ${itemType === 'draft' ? 'hover:bg-blue-100 text-blue-600 dark:hover:bg-blue-900/50' : 'hover:bg-indigo-100 text-primary dark:hover:bg-indigo-900/50'}`} title={itemType === 'draft' ? 'Carregar Rascunho' : 'Editar Venda'}>
                    {itemType === 'draft' ? <ArrowUpTrayIcon className="h-5 w-5" /> : <EditIcon className="h-5 w-5" />}
                  </button>
                  <button onClick={(e) => { e.stopPropagation(); onItemDelete(item.id); }} className="p-2 rounded-full hover:bg-red-100 text-red-600 dark:hover:bg-red-900/50 transition-colors" title={itemType === 'draft' ? 'Excluir Rascunho' : 'Excluir Venda'}>
                    <TrashIcon className="h-5 w-5" />
                  </button>
                </div>
              </div>
              {expandedItems.has(item.id) && (
                <div className="mt-3 pl-4 space-y-2 text-sm text-text-secondary dark:text-slate-400">
                  <ul className="list-disc list-inside">
                    {item.items.map(i => <li key={i.productId}>{i.quantity}x {getProductName(i.productId)}</li>)}
                  </ul>
                  {item.channelId && <p className="font-medium">Canal: {channels.find(c => c.id === item.channelId)?.name}</p>}
                  {item.paymentMethodId && <p className="font-medium">Pagamento: {paymentMethods.find(p => p.id === item.paymentMethodId)?.name}</p>}
                  {item.observations && <p className="font-medium mt-2 pt-2 border-t border-slate-200 dark:border-slate-700">Observações: <span className="font-normal whitespace-pre-wrap">{item.observations}</span></p>}
                  <div className="text-xs pt-2 border-t border-slate-200 dark:border-slate-700">
                    <p>Criado em: {formatDate(item.createdAt)}</p>
                    {item.createdAt !== item.updatedAt && <p>Modificado em: {formatDate(item.updatedAt)}</p>}
                  </div>
                </div>
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  );

  const salesHistoryFilter = (
    <div className="flex items-center gap-1">
      <FilterButton label="Tudo" isActive={dateFilter === 'all'} onClick={(e) => { e.stopPropagation(); setDateFilter('all'); }} />
      <FilterButton label="7d" isActive={dateFilter === '7d'} onClick={(e) => { e.stopPropagation(); setDateFilter('7d'); }} />
      <FilterButton label="30d" isActive={dateFilter === '30d'} onClick={(e) => { e.stopPropagation(); setDateFilter('30d'); }} />
      <FilterButton label="1a" isActive={dateFilter === '365d'} onClick={(e) => { e.stopPropagation(); setDateFilter('365d'); }} />
    </div>
  );

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-4xl font-bold tracking-tight text-text-primary dark:text-slate-200">Vendas</h2>
        <p className="text-text-secondary dark:text-slate-400 mt-1">Registre vendas, gerencie rascunhos e veja seu histórico.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
        <div className="lg:col-span-3">
          <div className={`bg-card dark:bg-slate-800 rounded-2xl shadow-lg transition-all duration-300 ${editingSaleId ? 'ring-2 ring-primary' : 'ring-1 ring-transparent'}`}>
            <div className="p-6 border-b border-slate-200 dark:border-slate-700">
              <h3 className="text-xl font-semibold text-text-primary dark:text-slate-200">{editingSaleId ? `Editando Venda #${editingSaleId.slice(-5)}` : 'Nova Venda'}</h3>
            </div>

            <div className="p-6 bg-slate-50 dark:bg-slate-800/50 space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="md:col-span-1">
                  <label htmlFor="sale-date" className="block text-sm font-medium text-text-secondary dark:text-slate-400 mb-1">Data da Venda</label>
                  <input
                    id="sale-date"
                    type="datetime-local"
                    value={saleDate}
                    onChange={(e) => setSaleDate(e.target.value)}
                    className={`${inputClasses} text-base`}
                  />
                </div>
                <div className="md:col-span-1">
                  <label htmlFor="channel-select" className="block text-sm font-medium text-text-secondary dark:text-slate-400 mb-1">Canal de Venda</label>
                  <select id="channel-select" value={selectedChannelId} onChange={(e) => setSelectedChannelId(e.target.value)} className={`${inputClasses} text-base`}>
                    <option value="">Nenhum</option>
                    {channels.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                  </select>
                </div>
                <div className="md:col-span-1">
                  <label htmlFor="payment-method-select" className="block text-sm font-medium text-text-secondary dark:text-slate-400 mb-1">Forma de Pagamento</label>
                  <select id="payment-method-select" value={selectedPaymentMethodId} onChange={(e) => setSelectedPaymentMethodId(e.target.value)} className={`${inputClasses} text-base`}>
                    <option value="">Não especificado</option>
                    {paymentMethods.map(m => <option key={m.id} value={m.id}>{m.name}</option>)}
                  </select>
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="md:col-span-2">
                  <label htmlFor="product-select" className="block text-sm font-medium text-text-secondary dark:text-slate-400 mb-1">Produto</label>
                  <select
                    id="product-select"
                    value={selectedProduct}
                    onChange={(e) => {
                      setSelectedProduct(e.target.value);
                      if (addFormError) setAddFormError(false);
                    }}
                    className={`${inputClasses} text-base`}
                  >
                    <option value="">Selecione um produto...</option>
                    {products.map(p => <option key={p.id} value={p.id} disabled={p.stock <= 0}>{p.name} {p.stock > 0 ? `(${p.stock} em estoque)` : '(Esgotado)'}</option>)}
                  </select>
                </div>
                <div>
                  <label htmlFor="promotion-select" className="block text-sm font-medium text-text-secondary dark:text-slate-400 mb-1">Promoção Aplicada</label>
                  <select id="promotion-select" value={selectedPromotionId} onChange={(e) => handlePromotionChange(e.target.value)} className={`${inputClasses} text-base font-semibold ${selectedPromotionId ? 'text-secondary border-secondary ring-1 ring-secondary' : ''}`}>
                    <option value="">Nenhuma promoção ativa</option>
                    {activePromotions.map(p => <option key={p.id} value={p.id} className="text-emerald-600 font-bold">{p.name}</option>)}
                  </select>
                </div>
              </div>
              <div>
                <label htmlFor="sale-observations" className="block text-sm font-medium text-text-secondary dark:text-slate-400 mb-1">Observações</label>
                <textarea
                  id="sale-observations"
                  value={observations}
                  onChange={(e) => setObservations(e.target.value)}
                  rows={3}
                  placeholder="Ex: Cliente pediu para presente, entrega agendada..."
                  className={`${inputClasses} text-base`}
                />
              </div>
              <div className="grid grid-cols-5 gap-4 pt-2">
                <div className="col-span-2">
                  <label htmlFor="product-price" className="block text-sm font-medium text-text-secondary dark:text-slate-400 mb-1">Valor</label>
                  <div className="relative">
                    <input id="product-price" type="number" value={chargedPrice} onChange={(e) => setChargedPrice(e.target.value)} step="0.01" min="0" className={`${inputClasses} ${selectedPromotionId && activePromotions.find(p => p.id === selectedPromotionId)?.productIds.includes(selectedProduct) ? 'border-secondary text-secondary font-bold' : ''}`} disabled={!selectedProduct} />
                    {selectedPromotionId && selectedProduct && activePromotions.find(p => p.id === selectedPromotionId)?.productIds.includes(selectedProduct) && (
                      <TagIcon className="h-5 w-5 text-secondary absolute right-3 top-1/2 -translate-y-1/2" />
                    )}
                  </div>
                </div>
                <div className="col-span-1">
                  <label htmlFor="product-quantity" className="block text-sm font-medium text-text-secondary dark:text-slate-400 mb-1">Quantidade</label>
                  <input
                    id="product-quantity"
                    type="number"
                    value={quantity}
                    onChange={(e) => {
                      setQuantity(Number(e.target.value));
                      if (addFormError) setAddFormError(false);
                    }}
                    min="1"
                    className={`${inputClasses} transition-all duration-300 ${addFormError ? 'ring-2 ring-red-500' : ''}`}
                  />
                </div>
                <div className="col-span-2 self-end">
                  <button onClick={handleAddToCart} className="w-full h-[46px] flex justify-center items-center gap-2 bg-secondary text-white font-bold py-3 px-4 rounded-lg hover:bg-emerald-600 transition-colors disabled:bg-slate-400 dark:disabled:bg-slate-600" disabled={!selectedProduct}>
                    <PlusIcon className="h-6 w-6" /> Adicionar
                  </button>
                </div>
              </div>
            </div>

            <div className="p-6 space-y-4">
              {cart.length === 0 ? <p className="text-center py-8 text-text-secondary dark:text-slate-400">O carrinho está vazio.</p> : cart.map(item => {
                const product = products.find(p => p.id === item.productId);
                const isPromoItem = selectedPromotionId && product && activePromotions.find(p => p.id === selectedPromotionId)?.productIds.includes(product.id);
                return (
                  <div key={item.productId} className={`bg-white dark:bg-slate-700/50 shadow rounded-xl p-4 border-l-4 ${isPromoItem ? 'border-secondary' : 'border-transparent'}`}>
                    <div className="flex justify-between items-start">
                      <div className="flex flex-col gap-1">
                        <p className="font-bold text-lg text-text-primary dark:text-slate-200">{getProductName(item.productId)}</p>
                        {isPromoItem && (
                          <span className="inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider text-secondary">
                            <TagIcon className="h-3 w-3" /> Promoção Aplicada
                          </span>
                        )}
                      </div>
                      <p className="font-bold text-xl text-text-primary dark:text-slate-200">
                        {(item.unitPrice * item.quantity).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                      </p>
                    </div>
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mt-4 pt-4 border-t border-slate-200 dark:border-slate-700">
                      <div className="flex items-center gap-4 sm:gap-6 flex-wrap">
                        <div className="flex items-center gap-2">
                          <label className="text-sm font-medium text-text-secondary dark:text-slate-400">Qtd:</label>
                          <button onClick={() => updateCartItem(item.productId, item.quantity - 1, item.unitPrice)} className="p-2 rounded-full bg-slate-200 hover:bg-slate-300 dark:bg-slate-600 dark:hover:bg-slate-500"><MinusIcon className="h-4 w-4" /></button>
                          <input type="number" value={item.quantity} onChange={e => updateCartItem(item.productId, parseInt(e.target.value, 10), item.unitPrice)} className="w-16 text-center bg-slate-100 dark:bg-slate-600 rounded-md p-1.5 focus:ring-2 focus:ring-primary outline-none dark:text-slate-200" />
                          <button onClick={() => updateCartItem(item.productId, item.quantity + 1, item.unitPrice)} className="p-2 rounded-full bg-slate-200 hover:bg-slate-300 dark:bg-slate-600 dark:hover:bg-slate-500"><PlusIcon className="h-4 w-4" /></button>
                        </div>
                        <div className="flex items-center gap-2">
                          <label className="text-sm font-medium text-text-secondary dark:text-slate-400">Preço Unit.:</label>
                          <div className="relative">
                            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-text-secondary dark:text-slate-400">R$</span>
                            <input type="number" value={item.unitPrice} onChange={e => updateCartItem(item.productId, item.quantity, parseFloat(e.target.value))} step="0.01" min="0" className={`w-28 bg-slate-100 dark:bg-slate-600 rounded-md p-1.5 pl-9 text-right focus:ring-2 focus:ring-primary outline-none dark:text-slate-200 ${isPromoItem ? 'text-secondary font-bold ring-1 ring-secondary' : ''}`} />
                          </div>
                        </div>
                      </div>
                      <button onClick={() => removeFromCart(item.productId)} className="p-2 rounded-full hover:bg-red-100 text-red-600 dark:hover:bg-red-900/50 self-end sm:self-center" title="Remover item">
                        <TrashIcon className="h-5 w-5" />
                      </button>
                    </div>
                  </div>
                )
              })}
            </div>

            {cart.length > 0 && (
              <div className="p-6 bg-slate-50 dark:bg-slate-800/50 border-t dark:border-slate-700 rounded-b-2xl space-y-4">
                <div className="space-y-2">
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-text-secondary dark:text-slate-400">Custo total:</span>
                    <span className="font-medium text-red-500">
                      {totalCost.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                    </span>
                  </div>
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-text-secondary dark:text-slate-400">Lucro:</span>
                    <span className="font-medium text-secondary">
                      {profit.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                    </span>
                  </div>
                  <div className="flex justify-between items-center pt-2 mt-2 border-t border-slate-200 dark:border-slate-700">
                    <span className="text-xl font-bold text-text-primary dark:text-slate-200">Total:</span>
                    <span className="text-3xl font-bold text-text-primary dark:text-white">
                      {cartTotal.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                    </span>
                  </div>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                  {editingSaleId ? (
                    <button onClick={handleCancelEdit} className="w-full bg-slate-500 text-white font-bold py-3 px-4 rounded-lg hover:bg-slate-600 transition-colors">Cancelar Edição</button>
                  ) : (
                    <button onClick={handleSaveDraft} className="w-full bg-blue-500 text-white font-bold py-3 px-4 rounded-lg hover:bg-blue-600 transition-colors">{currentDraftId ? 'Atualizar Rascunho' : 'Salvar Rascunho'}</button>
                  )}
                  <button onClick={handleSaveSale} className="w-full bg-primary text-white font-bold py-3 px-4 rounded-lg hover:bg-primary-hover transition-colors">{editingSaleId ? 'Atualizar Venda' : 'Finalizar Venda'}</button>
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="lg:col-span-2 space-y-8">
          <AccordionSection title="Rascunhos" items={drafts} onItemClick={handleLoadDraft} onItemDelete={deleteDraft} itemType="draft" />
          <AccordionSection title="Histórico de Vendas" items={filteredSales} onItemClick={handleEditSale} onItemDelete={deleteSale} itemType="sale" extraHeaderContent={salesHistoryFilter} />
        </div>
      </div>

      {toast && (
        <div
          aria-live="polite"
          aria-atomic="true"
          className={`fixed bottom-5 right-5 text-white py-3 px-5 rounded-lg shadow-xl flex items-center transition-all duration-300 ease-in-out ${toast.type === 'success' ? 'bg-secondary' : 'bg-red-600'
            } ${toast ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'}`}
        >
          {toast.type === 'success' ? (
            <CheckIcon className="h-6 w-6 mr-3" />
          ) : (
            <XCircleIcon className="h-6 w-6 mr-3" />
          )}
          {toast.message}
        </div>
      )}
    </div>
  );
};

export default Sales;


import React, { useState, useEffect, useMemo } from 'react';
import type { Product, Budget, SaleItem } from '../types';
import { PlusIcon, TrashIcon, CheckIcon, EditIcon, MinusIcon, ChevronDownIcon, XCircleIcon, BudgetIcon as PageIcon } from './icons/Icons';

interface BudgetProps {
  products: Product[];
  budgets: Budget[];
  addBudget: (budget: Omit<Budget, 'id' | 'createdAt' | 'updatedAt'>) => void;
  updateBudget: (budget: Budget) => void;
  deleteBudget: (id: string) => void;
}

const formatDate = (isoString: string) => new Date(isoString).toLocaleString('pt-BR', {
  day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit',
});

const BudgetComponent: React.FC<BudgetProps> = ({ products, budgets, addBudget, updateBudget, deleteBudget }) => {
  const [cart, setCart] = useState<SaleItem[]>([]);
  const [selectedProduct, setSelectedProduct] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [chargedPrice, setChargedPrice] = useState('');
  const [clientName, setClientName] = useState('');
  const [clientContact, setClientContact] = useState('');
  const [validUntil, setValidUntil] = useState('');
  const [observations, setObservations] = useState('');
  
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);
  const [editingBudgetId, setEditingBudgetId] = useState<string | null>(null);
  const [expandedItems, setExpandedItems] = useState<Set<string>>(new Set());

  useEffect(() => {
    if (toast) {
      const timer = setTimeout(() => setToast(null), 3000);
      return () => clearTimeout(timer);
    }
  }, [toast]);

  useEffect(() => {
    const product = products.find(p => p.id === selectedProduct);
    setChargedPrice(product ? String(product.price) : '');
  }, [selectedProduct, products]);

  const getProductName = (productId: string) => products.find(p => p.id === productId)?.name || 'Produto desconhecido';
  
  const handleAddToCart = () => {
    const product = products.find(p => p.id === selectedProduct);
    if (!product || quantity <= 0 || parseFloat(chargedPrice) < 0) return;

    const existingItemIndex = cart.findIndex(item => item.productId === selectedProduct);
    if (existingItemIndex > -1) {
      const updatedCart = [...cart];
      updatedCart[existingItemIndex].quantity += quantity;
      setCart(updatedCart);
    } else {
      setCart([...cart, { productId: product.id, quantity, unitPrice: parseFloat(chargedPrice) }]);
    }
    
    setSelectedProduct('');
    setQuantity(1);
    setChargedPrice('');
  };
  
  const updateCartItem = (productId: string, newQuantity: number, newPrice: number) => {
    if (newPrice < 0) {
      setToast({ message: 'O preço não pode ser negativo.', type: 'error' });
      return;
    }
    setCart(cart.map(item => 
      item.productId === productId ? { ...item, quantity: Math.max(1, newQuantity), unitPrice: newPrice } : item
    ));
  };
  
  const removeFromCart = (productId: string) => setCart(cart.filter(item => item.productId !== productId));

  const cartTotal = useMemo(() => {
    return cart.reduce((acc, item) => acc + (item.unitPrice * item.quantity), 0);
  }, [cart]);

  const clearForm = () => {
    setCart([]);
    setClientName('');
    setClientContact('');
    setValidUntil('');
    setObservations('');
    setEditingBudgetId(null);
  };

  const handleSaveBudget = () => {
    if (cart.length === 0) {
        setToast({ message: 'Adicione pelo menos um item ao orçamento.', type: 'error' });
        return;
    }
    const budgetData = { 
        items: cart, 
        total: cartTotal,
        clientName: clientName.trim() || undefined,
        clientContact: clientContact.trim() || undefined,
        validUntil: validUntil || undefined,
        observations: observations.trim() || undefined,
    };
    if (editingBudgetId) {
        const originalBudget = budgets.find(b => b.id === editingBudgetId);
        if (originalBudget) {
            updateBudget({ ...originalBudget, ...budgetData });
            setToast({ message: 'Orçamento atualizado com sucesso!', type: 'success' });
        }
    } else {
        addBudget(budgetData);
        setToast({ message: 'Orçamento salvo com sucesso!', type: 'success' });
    }
    clearForm();
  };
  
  const handleEditBudget = (budgetToEdit: Budget) => {
      if (cart.length > 0 && editingBudgetId !== budgetToEdit.id && !window.confirm('Isso substituirá o orçamento atual. Deseja continuar?')) return;
      setCart(budgetToEdit.items);
      setEditingBudgetId(budgetToEdit.id);
      setClientName(budgetToEdit.clientName || '');
      setClientContact(budgetToEdit.clientContact || '');
      setValidUntil(budgetToEdit.validUntil ? new Date(budgetToEdit.validUntil).toISOString().split('T')[0] : '');
      setObservations(budgetToEdit.observations || '');
      window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const toggleListItem = (id: string) => {
      setExpandedItems(prev => {
          const newSet = new Set(prev);
          if (newSet.has(id)) newSet.delete(id);
          else newSet.add(id);
          return newSet;
      });
  };
  
  const inputClasses = "w-full bg-white border border-slate-300 rounded-lg shadow-sm p-3 focus:ring-primary focus:border-primary dark:bg-slate-700 dark:border-slate-600 dark:text-slate-200 dark:placeholder-slate-400";

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-4xl font-bold tracking-tight text-text-primary dark:text-slate-200">Orçamentos</h2>
        <p className="text-text-secondary dark:text-slate-400 mt-1">Crie e gerencie propostas para seus clientes.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
        <div className="lg:col-span-3">
          <div className={`bg-card dark:bg-slate-800 rounded-2xl shadow-lg transition-all duration-300 ${editingBudgetId ? 'ring-2 ring-primary' : 'ring-1 ring-transparent'}`}>
            <div className="p-6 border-b border-slate-200 dark:border-slate-700">
              <h3 className="text-xl font-semibold text-text-primary dark:text-slate-200">{editingBudgetId ? `Editando Orçamento #${editingBudgetId.slice(-5)}` : 'Novo Orçamento'}</h3>
            </div>
            
            <div className="p-6 bg-slate-50 dark:bg-slate-800/50 space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                      <label htmlFor="clientName" className="block text-sm font-medium text-text-secondary dark:text-slate-400 mb-1">Nome do Cliente</label>
                      <input id="clientName" type="text" value={clientName} onChange={e => setClientName(e.target.value)} placeholder="João da Silva" className={inputClasses} />
                  </div>
                  <div>
                      <label htmlFor="clientContact" className="block text-sm font-medium text-text-secondary dark:text-slate-400 mb-1">Contato (E-mail/Telefone)</label>
                      <input id="clientContact" type="text" value={clientContact} onChange={e => setClientContact(e.target.value)} placeholder="joao@email.com" className={inputClasses} />
                  </div>
              </div>
              <div>
                  <label htmlFor="validUntil" className="block text-sm font-medium text-text-secondary dark:text-slate-400 mb-1">Válido Até</label>
                  <input id="validUntil" type="date" value={validUntil} onChange={e => setValidUntil(e.target.value)} className={`${inputClasses} text-base`} />
              </div>
              <div className="pt-4 mt-4 border-t border-slate-200 dark:border-slate-700">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                   <div className="md:col-span-2">
                     <label htmlFor="product-select" className="block text-sm font-medium text-text-secondary dark:text-slate-400 mb-1">Adicionar Produto</label>
                     <select id="product-select" value={selectedProduct} onChange={e => setSelectedProduct(e.target.value)} className={`${inputClasses} text-base`}>
                         <option value="">Selecione um produto...</option>
                         {products.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                     </select>
                   </div>
               </div>
               <div className="grid grid-cols-5 gap-4 pt-4">
                   <div className="col-span-2">
                     <label htmlFor="product-price" className="block text-sm font-medium text-text-secondary dark:text-slate-400 mb-1">Valor</label>
                     <input id="product-price" type="number" value={chargedPrice} onChange={(e) => setChargedPrice(e.target.value)} step="0.01" min="0" className={inputClasses} disabled={!selectedProduct} />
                   </div>
                   <div className="col-span-1">
                     <label htmlFor="product-quantity" className="block text-sm font-medium text-text-secondary dark:text-slate-400 mb-1">Qtd</label>
                     <input id="product-quantity" type="number" value={quantity} onChange={e => setQuantity(Number(e.target.value))} min="1" className={inputClasses} />
                   </div>
                   <div className="col-span-2 self-end">
                     <button onClick={handleAddToCart} className="w-full h-[46px] flex justify-center items-center gap-2 bg-secondary text-white font-bold py-3 px-4 rounded-lg hover:bg-emerald-600 transition-colors disabled:bg-slate-400 dark:disabled:bg-slate-600" disabled={!selectedProduct}>
                         <PlusIcon className="h-6 w-6" /> Adicionar
                     </button>
                   </div>
               </div>
              </div>
            </div>

            <div className="p-6 space-y-4">
              {cart.length === 0 ? <p className="text-center py-8 text-text-secondary dark:text-slate-400">Nenhum item adicionado.</p> : cart.map(item => (
                <div key={item.productId} className="bg-white dark:bg-slate-700/50 shadow rounded-xl p-4">
                  <div className="flex justify-between items-start">
                    <p className="font-bold text-lg text-text-primary dark:text-slate-200">{getProductName(item.productId)}</p>
                    <p className="font-bold text-xl text-text-primary dark:text-slate-200">
                      {(item.unitPrice * item.quantity).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                    </p>
                  </div>
                  <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mt-4 pt-4 border-t border-slate-200 dark:border-slate-700">
                    <div className="flex items-center gap-4 sm:gap-6 flex-wrap">
                      <div className="flex items-center gap-2">
                        <label className="text-sm font-medium text-text-secondary dark:text-slate-400">Qtd:</label>
                        <button onClick={() => updateCartItem(item.productId, item.quantity - 1, item.unitPrice)} className="p-2 rounded-full bg-slate-200 hover:bg-slate-300 dark:bg-slate-600 dark:hover:bg-slate-500"><MinusIcon className="h-4 w-4"/></button>
                        <input type="number" value={item.quantity} onChange={e => updateCartItem(item.productId, parseInt(e.target.value, 10), item.unitPrice)} className="w-16 text-center bg-slate-100 dark:bg-slate-600 rounded-md p-1.5 focus:ring-2 focus:ring-primary outline-none dark:text-slate-200" />
                        <button onClick={() => updateCartItem(item.productId, item.quantity + 1, item.unitPrice)} className="p-2 rounded-full bg-slate-200 hover:bg-slate-300 dark:bg-slate-600 dark:hover:bg-slate-500"><PlusIcon className="h-4 w-4"/></button>
                      </div>
                      <div className="flex items-center gap-2">
                        <label className="text-sm font-medium text-text-secondary dark:text-slate-400">Preço Unit.:</label>
                        <div className="relative">
                          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-text-secondary dark:text-slate-400">R$</span>
                          <input type="number" value={item.unitPrice} onChange={e => updateCartItem(item.productId, item.quantity, parseFloat(e.target.value))} step="0.01" min="0" className="w-28 bg-slate-100 dark:bg-slate-600 rounded-md p-1.5 pl-9 text-right focus:ring-2 focus:ring-primary outline-none dark:text-slate-200" />
                        </div>
                      </div>
                    </div>
                    <button onClick={() => removeFromCart(item.productId)} className="p-2 rounded-full hover:bg-red-100 text-red-600 dark:hover:bg-red-900/50 self-end sm:self-center" title="Remover item">
                      <TrashIcon className="h-5 w-5"/>
                    </button>
                  </div>
                </div>
              ))}
            </div>
            
            <div className="p-6 bg-slate-50 dark:bg-slate-800/50 border-t dark:border-slate-700 rounded-b-2xl space-y-4">
                <div className="flex justify-between items-center pt-2 mt-2">
                    <span className="text-xl font-bold text-text-primary dark:text-slate-200">Total:</span>
                    <span className="text-3xl font-bold text-text-primary dark:text-white">
                        {cartTotal.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                    </span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                    {editingBudgetId && (
                         <button onClick={clearForm} className="w-full bg-slate-500 text-white font-bold py-3 px-4 rounded-lg hover:bg-slate-600 transition-colors">Cancelar Edição</button>
                    )}
                    <button onClick={handleSaveBudget} className="w-full bg-primary text-white font-bold py-3 px-4 rounded-lg hover:bg-primary-hover transition-colors sm:col-start-2">{editingBudgetId ? 'Atualizar Orçamento' : 'Salvar Orçamento'}</button>
                </div>
            </div>

          </div>
        </div>

        <div className="lg:col-span-2">
            <div className="bg-card dark:bg-slate-800 rounded-2xl shadow-lg overflow-hidden">
              <div className="p-4 bg-slate-50 dark:bg-slate-700/50 border-b border-slate-200 dark:border-slate-700">
                <h3 className="text-lg font-semibold text-text-primary dark:text-slate-200">Histórico de Orçamentos</h3>
              </div>
              <ul className="divide-y divide-slate-200 dark:divide-slate-700 max-h-[600px] overflow-y-auto">
                  {budgets.length === 0 ? <li className="text-center p-8 text-text-secondary dark:text-slate-400"><PageIcon className="h-10 w-10 mx-auto text-slate-400 mb-2"/>Nenhum orçamento salvo.</li> : [...budgets].reverse().map(budget => (
                      <li key={budget.id} className="p-4">
                          <div className="flex justify-between items-center cursor-pointer" onClick={() => toggleListItem(budget.id)}>
                            <div>
                              <p className="font-medium text-text-primary dark:text-slate-200">{budget.clientName || 'Cliente não informado'}</p>
                              <p className="font-bold text-secondary">{budget.total.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</p>
                              <p className="text-xs text-text-secondary dark:text-slate-400">{formatDate(budget.updatedAt)}</p>
                            </div>
                            <div className="flex items-center gap-2">
                               <button onClick={(e) => { e.stopPropagation(); handleEditBudget(budget); }} className="p-2 rounded-full hover:bg-indigo-100 text-primary dark:hover:bg-indigo-900/50" title='Editar Orçamento'><EditIcon className="h-5 w-5"/></button>
                               <button onClick={(e) => { e.stopPropagation(); deleteBudget(budget.id); }} className="p-2 rounded-full hover:bg-red-100 text-red-600 dark:hover:bg-red-900/50" title='Excluir Orçamento'><TrashIcon className="h-5 w-5"/></button>
                            </div>
                          </div>
                          {expandedItems.has(budget.id) && (
                            <div className="mt-3 pl-4 space-y-2 text-sm text-text-secondary dark:text-slate-400">
                              <ul className="list-disc list-inside">
                                  {budget.items.map(i => <li key={i.productId}>{i.quantity}x {getProductName(i.productId)}</li>)}
                              </ul>
                              {budget.clientContact && <p className="font-medium">Contato: {budget.clientContact}</p>}
                              {budget.validUntil && <p className="font-medium">Válido até: {new Date(budget.validUntil + 'T00:00:00-03:00').toLocaleDateString('pt-BR')}</p>}
                              {budget.observations && <p className="font-medium mt-2 pt-2 border-t border-slate-200 dark:border-slate-700">Observações: <span className="font-normal whitespace-pre-wrap">{budget.observations}</span></p>}
                            </div>
                          )}
                      </li>
                  ))}
              </ul>
            </div>
        </div>
      </div>
      
      {toast && (
        <div
          aria-live="polite"
          aria-atomic="true"
          className={`fixed bottom-5 right-5 text-white py-3 px-5 rounded-lg shadow-xl flex items-center transition-all duration-300 ease-in-out ${
              toast.type === 'success' ? 'bg-secondary' : 'bg-red-600'
          } ${toast ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'}`}
        >
          {toast.type === 'success' ? <CheckIcon className="h-6 w-6 mr-3" /> : <XCircleIcon className="h-6 w-6 mr-3" />}
          {toast.message}
        </div>
      )}
    </div>
  );
};

export default BudgetComponent;

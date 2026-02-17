
import React, { useState, useEffect, useMemo } from 'react';
import type { Promotion, Product } from '../types';
import { PlusIcon, TrashIcon, EditIcon, TagIcon, ChevronDownIcon } from './icons/Icons';

interface PromotionsProps {
  promotions: Promotion[];
  products: Product[];
  addPromotion: (promotion: Omit<Promotion, 'id'>) => void;
  updatePromotion: (promotion: Promotion) => void;
  deletePromotion: (id: string) => void;
}

const emptyPromotionState = {
  name: '',
  description: '',
  startDate: '',
  endDate: '',
  productIds: [] as string[],
  discountType: 'percentage' as 'percentage' | 'fixed',
  discountValue: '',
};

const PromotionStatusBadge: React.FC<{ startDate: string; endDate: string }> = ({ startDate, endDate }) => {
    const now = new Date();
    now.setHours(0, 0, 0, 0);
    const start = new Date(startDate + 'T00:00:00');
    const end = new Date(endDate + 'T00:00:00');

    if (now < start) {
        return <span className="px-2 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-800 dark:bg-blue-900/50 dark:text-blue-300">Agendada</span>;
    }
    if (now > end) {
        return <span className="px-2 py-1 text-xs font-semibold rounded-full bg-slate-200 text-slate-800 dark:bg-slate-700 dark:text-slate-300">Expirada</span>;
    }
    return <span className="px-2 py-1 text-xs font-semibold rounded-full bg-emerald-100 text-emerald-800 dark:bg-emerald-900/50 dark:text-emerald-300">Ativa</span>;
};

const Promotions: React.FC<PromotionsProps> = ({ promotions, products, addPromotion, updatePromotion, deletePromotion }) => {
  const [form, setForm] = useState(emptyPromotionState);
  const [editingPromotion, setEditingPromotion] = useState<Promotion | null>(null);
  const [expandedItems, setExpandedItems] = useState<Set<string>>(new Set());
  const [productToAdd, setProductToAdd] = useState('');

  useEffect(() => {
    if (editingPromotion) {
      setForm({
        name: editingPromotion.name,
        description: editingPromotion.description || '',
        startDate: editingPromotion.startDate,
        endDate: editingPromotion.endDate,
        productIds: editingPromotion.productIds,
        discountType: editingPromotion.discountType,
        discountValue: String(editingPromotion.discountValue),
      });
      document.getElementById('promotion-form')?.scrollIntoView({ behavior: 'smooth' });
    } else {
      setForm(emptyPromotionState);
    }
  }, [editingPromotion]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
  };
  
  const handleAddProduct = () => {
    if (productToAdd && !form.productIds.includes(productToAdd)) {
        setForm(prev => ({ ...prev, productIds: [...prev.productIds, productToAdd] }));
        setProductToAdd('');
    }
  };

  const handleRemoveProduct = (productId: string) => {
    setForm(prev => ({ ...prev, productIds: prev.productIds.filter(id => id !== productId) }));
  };


  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const { name, startDate, endDate, productIds, discountType, discountValue } = form;
    if (name && startDate && endDate && productIds.length > 0 && discountValue) {
      const promotionData = {
        name: name.trim(),
        description: form.description.trim() || undefined,
        startDate,
        endDate,
        productIds,
        discountType,
        discountValue: parseFloat(discountValue),
      };

      if (editingPromotion) {
        updatePromotion({ ...editingPromotion, ...promotionData });
      } else {
        addPromotion(promotionData);
      }
      setEditingPromotion(null);
    }
  };

  const handleCancelEdit = () => setEditingPromotion(null);

  const toggleListItem = (id: string) => {
      setExpandedItems(prev => {
          const newSet = new Set(prev);
          if (newSet.has(id)) newSet.delete(id);
          else newSet.add(id);
          return newSet;
      });
  };

  const getProductName = (id: string) => products.find(p => p.id === id)?.name || 'Produto não encontrado';

  const inputClasses = "w-full border border-slate-300 rounded-lg p-3 focus:ring-primary focus:border-primary dark:bg-slate-700 dark:border-slate-600 dark:text-slate-200 dark:placeholder-slate-400";
  const labelClasses = "block text-sm font-medium text-text-secondary dark:text-slate-400 mb-1";
  
  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-4xl font-bold tracking-tight text-text-primary dark:text-slate-200">Promoções</h2>
        <p className="text-text-secondary dark:text-slate-400 mt-1">Crie e gerencie grupos de promoções para seus produtos.</p>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
        <div className="lg:col-span-2">
          <div id="promotion-form" className="bg-card dark:bg-slate-800 p-6 rounded-2xl shadow-lg lg:sticky top-24">
            <h3 className="text-xl font-semibold text-text-primary dark:text-slate-200 mb-6">{editingPromotion ? 'Editar Promoção' : 'Nova Promoção'}</h3>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label htmlFor="promo-name" className={labelClasses}>Nome do Grupo</label>
                <input id="promo-name" type="text" name="name" value={form.name} onChange={handleInputChange} className={inputClasses} placeholder="Ex: Queima de Estoque" required />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label htmlFor="promo-startDate" className={labelClasses}>Data de Início</label>
                  <input id="promo-startDate" type="date" name="startDate" value={form.startDate} onChange={handleInputChange} className={inputClasses} required />
                </div>
                <div>
                  <label htmlFor="promo-endDate" className={labelClasses}>Data de Fim</label>
                  <input id="promo-endDate" type="date" name="endDate" value={form.endDate} onChange={handleInputChange} className={inputClasses} min={form.startDate} required />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4">
                  <div className="col-span-2">
                      <label htmlFor="promo-discountValue" className={labelClasses}>Valor do Desconto</label>
                      <input id="promo-discountValue" type="number" name="discountValue" value={form.discountValue} onChange={handleInputChange} className={inputClasses} step="0.01" min="0" required placeholder="Ex: 10 ou 50,00" />
                  </div>
                  <div>
                      <label htmlFor="promo-discountType" className={labelClasses}>Tipo</label>
                      <select id="promo-discountType" name="discountType" value={form.discountType} onChange={handleInputChange} className={`${inputClasses} bg-white dark:bg-slate-700`}>
                          <option value="percentage">%</option>
                          <option value="fixed">R$</option>
                      </select>
                  </div>
              </div>

              <div>
                <label htmlFor="promo-products-select" className={labelClasses}>Adicionar Produto</label>
                <div className="flex gap-2">
                    <select
                        id="promo-products-select"
                        value={productToAdd}
                        onChange={(e) => setProductToAdd(e.target.value)}
                        className={`${inputClasses} bg-white dark:bg-slate-700`}
                    >
                        <option value="">Selecione um produto</option>
                        {products.map(p => (
                            <option key={p.id} value={p.id} disabled={form.productIds.includes(p.id)}>
                                {p.name}
                            </option>
                        ))}
                    </select>
                    <button
                        type="button"
                        onClick={handleAddProduct}
                        disabled={!productToAdd}
                        className="flex-shrink-0 bg-secondary text-white font-bold py-2 px-4 rounded-lg hover:bg-emerald-600 transition-colors disabled:bg-slate-400 dark:disabled:bg-slate-600"
                    >
                        Adicionar
                    </button>
                </div>
              </div>

              <div className="mt-2">
                  <label className={labelClasses}>Produtos na Promoção ({form.productIds.length})</label>
                  <div className="max-h-40 overflow-y-auto border border-slate-300 dark:border-slate-600 rounded-lg p-2 space-y-2 bg-slate-50 dark:bg-slate-900/50">
                      {form.productIds.length === 0 ? (
                          <p className="text-sm text-center text-slate-500 dark:text-slate-400 py-4">Nenhum produto adicionado.</p>
                      ) : (
                          form.productIds.map(id => (
                              <div key={id} className="flex justify-between items-center bg-card dark:bg-slate-700 p-2 rounded-md shadow-sm">
                                  <span className="text-sm text-text-primary dark:text-slate-200">{getProductName(id)}</span>
                                  <button
                                      type="button"
                                      onClick={() => handleRemoveProduct(id)}
                                      className="p-1 text-red-500 hover:text-red-700 hover:bg-red-100 dark:hover:bg-red-900/50 rounded-full"
                                      aria-label={`Remover ${getProductName(id)}`}
                                  >
                                      <TrashIcon className="h-4 w-4" />
                                  </button>
                              </div>
                          ))
                      )}
                  </div>
              </div>


              <div className="flex items-center gap-4 pt-4">
                <button type="submit" className="flex-grow flex justify-center items-center gap-2 bg-primary text-white font-bold py-3 px-4 rounded-lg hover:bg-primary-hover transition-colors">
                  {editingPromotion ? 'Salvar Alterações' : 'Criar Promoção' }
                </button>
                {editingPromotion && (
                  <button type="button" onClick={handleCancelEdit} className="bg-slate-200 text-text-secondary font-bold py-3 px-4 rounded-lg hover:bg-slate-300 dark:bg-slate-700 dark:hover:bg-slate-600 dark:text-slate-300 transition-colors">
                    Cancelar
                  </button>
                )}
              </div>
            </form>
          </div>
        </div>
        
        <div className="lg:col-span-3">
          <div className="bg-card dark:bg-slate-800 rounded-2xl shadow-lg overflow-hidden">
              <ul className="divide-y divide-slate-200 dark:divide-slate-700">
                  {promotions.length === 0 ? (
                      <li className="text-center p-16 text-text-secondary dark:text-slate-400">
                          <TagIcon className="h-16 w-16 mx-auto text-slate-400" />
                          <p className="mt-4">Nenhuma promoção criada.</p>
                      </li>
                  ) : (
                      [...promotions].reverse().map(promo => (
                          <li key={promo.id} className="p-4">
                            <div className="flex justify-between items-center">
                                <div className="flex-1">
                                    <p className="font-bold text-lg text-text-primary dark:text-slate-200">{promo.name}</p>
                                    <p className="text-sm text-text-secondary dark:text-slate-400">
                                        {new Date(promo.startDate + 'T00:00:00').toLocaleDateString('pt-BR')} - {new Date(promo.endDate + 'T00:00:00').toLocaleDateString('pt-BR')}
                                    </p>
                                    <p className="font-semibold text-secondary mt-1">
                                        Desconto de {promo.discountType === 'fixed' ? promo.discountValue.toLocaleString('pt-BR', {style: 'currency', currency: 'BRL'}) : `${promo.discountValue}%`}
                                    </p>
                                </div>
                                <div className="flex flex-col items-end gap-2">
                                    <PromotionStatusBadge startDate={promo.startDate} endDate={promo.endDate} />
                                    <div className="flex items-center">
                                        <button onClick={() => toggleListItem(promo.id)} className="p-2 rounded-full hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-500 dark:text-slate-400" title="Ver produtos">
                                            <ChevronDownIcon className={`h-5 w-5 transition-transform ${expandedItems.has(promo.id) ? 'rotate-180' : ''}`} />
                                        </button>
                                        <button onClick={() => setEditingPromotion(promo)} className="p-2 rounded-full text-blue-600 hover:bg-blue-100 dark:hover:bg-blue-900/50" title="Editar"><EditIcon className="h-5 w-5"/></button>
                                        <button onClick={() => deletePromotion(promo.id)} className="p-2 rounded-full text-red-600 hover:bg-red-100 dark:hover:bg-red-900/50" title="Excluir"><TrashIcon className="h-5 w-5"/></button>
                                    </div>
                                </div>
                            </div>
                            {expandedItems.has(promo.id) && (
                                <div className="mt-4 pt-4 border-t border-slate-200 dark:border-slate-700">
                                    <h4 className="font-semibold text-sm mb-2 text-text-primary dark:text-slate-300">Produtos na promoção:</h4>
                                    <ul className="list-disc list-inside space-y-1 text-text-secondary dark:text-slate-400">
                                        {promo.productIds.map(id => <li key={id}>{getProductName(id)}</li>)}
                                    </ul>
                                </div>
                            )}
                          </li>
                      ))
                  )}
              </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Promotions;

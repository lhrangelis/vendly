
import React, { useState, useEffect, useMemo } from 'react';
import type { Product, Category } from '../types';
import { PlusIcon, TrashIcon, EditIcon, BoxIcon } from './icons/Icons';

interface ProductsProps {
  products: Product[];
  categories: Category[];
  addProduct: (product: Omit<Product, 'id'>) => void;
  updateProduct: (product: Product) => void;
  deleteProduct: (id: string) => void;
}

const emptyProductState = { name: '', description: '', price: '', cost: '', categoryId: '', stock: '', weight: '', dimensions: '', unitOfMeasure: '', sku: '', barcode: '' };

const TooltipWrapper: React.FC<{ children: React.ReactNode, text: string }> = ({ children, text }) => (
    <div className="relative group">
        {children}
        <span className="absolute -top-9 left-1/2 -translate-x-1/2 w-max bg-slate-800 text-white text-xs font-semibold rounded-md py-1 px-2.5 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-10 shadow-lg">
            {text}
        </span>
    </div>
);

const Products: React.FC<ProductsProps> = ({ products, categories, addProduct, updateProduct, deleteProduct }) => {
  const [productForm, setProductForm] = useState(emptyProductState);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [stockModalProduct, setStockModalProduct] = useState<Product | null>(null);
  const [stockToAdd, setStockToAdd] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategoryFilter, setSelectedCategoryFilter] = useState('');
  
  useEffect(() => {
    if (editingProduct) {
      setProductForm({
        name: editingProduct.name,
        description: editingProduct.description,
        price: String(editingProduct.price),
        cost: String(editingProduct.cost),
        categoryId: editingProduct.categoryId,
        stock: String(editingProduct.stock),
        weight: editingProduct.weight ? String(editingProduct.weight) : '',
        dimensions: editingProduct.dimensions || '',
        unitOfMeasure: editingProduct.unitOfMeasure || '',
        sku: editingProduct.sku || '',
        barcode: editingProduct.barcode || '',
      });
      document.getElementById('product-form')?.scrollIntoView({ behavior: 'smooth' });
    } else {
      setProductForm(emptyProductState);
    }
  }, [editingProduct]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setProductForm({ ...productForm, [name]: value });
  };

  const handleCancelEdit = () => setEditingProduct(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const { name, price, cost, categoryId, stock, weight, dimensions, unitOfMeasure, sku, barcode } = productForm;
    if (name && price && cost && categoryId && stock) {
      const productData = {
        name,
        description: productForm.description,
        price: parseFloat(price),
        cost: parseFloat(cost),
        categoryId,
        stock: parseInt(stock, 10),
        weight: weight ? parseFloat(weight) : undefined,
        dimensions: dimensions || undefined,
        unitOfMeasure: unitOfMeasure || undefined,
        sku: sku || undefined,
        barcode: barcode || undefined,
      };

      if (editingProduct) {
        updateProduct({ ...editingProduct, ...productData });
      } else {
        addProduct(productData);
      }
      handleCancelEdit();
    }
  };

  const handleStockUpdate = () => {
    if (stockModalProduct && stockToAdd > 0) {
      updateProduct({
        ...stockModalProduct,
        stock: stockModalProduct.stock + stockToAdd,
      });
      setStockModalProduct(null);
      setStockToAdd(1);
    }
  };

  const getCategoryName = (categoryId: string) => categories.find(c => c.id === categoryId)?.name || 'Sem categoria';

  const filteredProducts = useMemo(() => {
    return products.filter(product => {
      const searchMatch = product.name.toLowerCase().includes(searchTerm.toLowerCase());
      const categoryMatch = selectedCategoryFilter ? product.categoryId === selectedCategoryFilter : true;
      return searchMatch && categoryMatch;
    });
  }, [products, searchTerm, selectedCategoryFilter]);
  
  const inputClasses = "w-full border border-slate-300 rounded-lg p-3 focus:ring-primary focus:border-primary dark:bg-slate-700 dark:border-slate-600 dark:text-slate-200 dark:placeholder-slate-400";
  const labelClasses = "block text-sm font-medium text-text-secondary dark:text-slate-400 mb-1";

  return (
    <>
      <div className="space-y-8">
        <div>
            <h2 className="text-4xl font-bold tracking-tight text-text-primary dark:text-slate-200">Produtos</h2>
            <p className="text-text-secondary dark:text-slate-400 mt-1">Adicione, edite e gerencie o estoque dos seus produtos.</p>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
          <div className="lg:col-span-2">
            <div id="product-form" className="bg-card dark:bg-slate-800 p-6 rounded-2xl shadow-lg lg:sticky top-24">
              <h3 className="text-xl font-semibold text-text-primary dark:text-slate-200 mb-6">{editingProduct ? 'Editar Produto' : 'Novo Produto'}</h3>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label htmlFor="product-name" className={labelClasses}>Nome</label>
                  <input id="product-name" type="text" name="name" value={productForm.name} onChange={handleInputChange} className={inputClasses} required />
                </div>
                <div>
                  <label htmlFor="product-description" className={labelClasses}>Descrição</label>
                  <textarea id="product-description" name="description" value={productForm.description} onChange={handleInputChange} rows={3} className={inputClasses}></textarea>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="product-price" className={labelClasses}>Preço (R$)</label>
                    <input id="product-price" type="number" name="price" step="0.01" value={productForm.price} onChange={handleInputChange} className={inputClasses} required />
                  </div>
                  <div>
                    <label htmlFor="product-cost" className={labelClasses}>Custo (R$)</label>
                    <input id="product-cost" type="number" name="cost" step="0.01" value={productForm.cost} onChange={handleInputChange} className={inputClasses} required />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="product-stock" className={labelClasses}>Estoque</label>
                    <input id="product-stock" type="number" name="stock" value={productForm.stock} onChange={handleInputChange} className={inputClasses} required />
                  </div>
                  <div>
                    <label htmlFor="product-category" className={labelClasses}>Categoria</label>
                    <select id="product-category" name="categoryId" value={productForm.categoryId} onChange={handleInputChange} className={`${inputClasses} bg-white dark:bg-slate-700`} required>
                      <option value="">Selecione a categoria</option>
                      {categories.map(cat => <option key={cat.id} value={cat.id}>{cat.name}</option>)}
                    </select>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                    <TooltipWrapper text="Opcional">
                        <label htmlFor="product-sku" className={labelClasses}>SKU</label>
                        <input id="product-sku" type="text" name="sku" value={productForm.sku} onChange={handleInputChange} className={inputClasses} placeholder="ex: TS-COT-BL-M" />
                    </TooltipWrapper>
                    <TooltipWrapper text="Opcional">
                        <label htmlFor="product-barcode" className={labelClasses}>Código de Barras</label>
                        <input id="product-barcode" type="text" name="barcode" value={productForm.barcode} onChange={handleInputChange} className={inputClasses} placeholder="ex: 7891234567890" />
                    </TooltipWrapper>
                </div>
                <div className="grid grid-cols-2 gap-4">
                    <TooltipWrapper text="Opcional">
                        <label htmlFor="product-weight" className={labelClasses}>Peso</label>
                        <input id="product-weight" type="number" name="weight" step="0.001" value={productForm.weight} onChange={handleInputChange} className={inputClasses} placeholder="ex: 0.5" />
                    </TooltipWrapper>
                    <TooltipWrapper text="Opcional">
                        <label htmlFor="product-unitOfMeasure" className={labelClasses}>Unidade de Medida</label>
                        <input id="product-unitOfMeasure" type="text" name="unitOfMeasure" value={productForm.unitOfMeasure} onChange={handleInputChange} className={inputClasses} placeholder="ex: kg, un, m²" />
                    </TooltipWrapper>
                </div>
                <TooltipWrapper text="Opcional">
                    <label htmlFor="product-dimensions" className={labelClasses}>Dimensões (CxLxA)</label>
                    <input id="product-dimensions" type="text" name="dimensions" value={productForm.dimensions} onChange={handleInputChange} className={inputClasses} placeholder="ex: 20x15x10 cm" />
                </TooltipWrapper>
                <div className="flex items-center gap-4 pt-4">
                  <button type="submit" className="flex-grow flex justify-center items-center gap-2 bg-primary text-white font-bold py-3 px-4 rounded-lg hover:bg-primary-hover transition-colors">
                    {editingProduct ? 'Salvar Alterações' : 'Adicionar Produto' }
                  </button>
                  {editingProduct && (
                    <button type="button" onClick={handleCancelEdit} className="bg-slate-200 text-text-secondary font-bold py-3 px-4 rounded-lg hover:bg-slate-300 dark:bg-slate-700 dark:hover:bg-slate-600 dark:text-slate-300 transition-colors">
                      Cancelar
                    </button>
                  )}
                </div>
              </form>
            </div>
          </div>
          
          <div className="lg:col-span-3 space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <input 
                    type="text" 
                    placeholder="Buscar por nome..." 
                    value={searchTerm} 
                    onChange={e => setSearchTerm(e.target.value)} 
                    className={inputClasses}
                />
                <select 
                    value={selectedCategoryFilter}
                    onChange={e => setSelectedCategoryFilter(e.target.value)}
                    className={`${inputClasses} bg-white dark:bg-slate-700`}
                    aria-label="Filtrar por categoria"
                >
                    <option value="">Todas as categorias</option>
                    {categories.map(cat => <option key={cat.id} value={cat.id}>{cat.name}</option>)}
                </select>
            </div>

            {filteredProducts.length === 0 ? (
              <div className="text-center py-16">
                <BoxIcon className="h-16 w-16 mx-auto text-slate-400" />
                <p className="mt-4 text-text-secondary dark:text-slate-400">Nenhum produto encontrado.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {filteredProducts.map(product => {
                  const stockStatus = product.stock === 0 ? 'esgotado' : product.stock < 10 ? 'baixo' : 'ok';
                  const statusColors = {
                    ok: 'bg-emerald-100 text-secondary',
                    baixo: 'bg-amber-100 text-amber-600',
                    esgotado: 'bg-red-100 text-red-600',
                  };
                  const hasDetails = product.sku || product.barcode || product.weight || product.dimensions;
                  return (
                    <div key={product.id} className="bg-card dark:bg-slate-800 rounded-xl shadow-lg flex flex-col justify-between transition-shadow hover:shadow-2xl">
                        <div className="p-5">
                            <div className="flex justify-between items-start">
                                <div>
                                    <p className="font-bold text-lg text-text-primary dark:text-slate-200 line-clamp-1">{product.name}</p>
                                    <p className="text-sm text-text-secondary dark:text-slate-400">{getCategoryName(product.categoryId)}</p>
                                </div>
                                <span className={`flex-shrink-0 px-3 py-1 text-xs font-bold rounded-full ${statusColors[stockStatus]}`}>
                                    {product.stock > 0 ? `${product.stock} em estoque` : 'Esgotado'}
                                </span>
                            </div>

                            {product.description && (
                                <p className="text-sm text-text-secondary dark:text-slate-400 mt-2 line-clamp-2 h-[40px]">
                                    {product.description}
                                </p>
                            )}
                            
                            {hasDetails && (
                            <div className="mt-4 pt-4 border-t border-slate-200 dark:border-slate-700">
                                <dl className="grid grid-cols-2 gap-x-4 gap-y-2 text-sm">
                                {product.sku && (
                                    <div>
                                    <dt className="font-medium text-slate-500 dark:text-slate-400">SKU</dt>
                                    <dd className="text-text-primary dark:text-slate-300 truncate">{product.sku}</dd>
                                    </div>
                                )}
                                {product.barcode && (
                                    <div>
                                    <dt className="font-medium text-slate-500 dark:text-slate-400">Cód. Barras</dt>
                                    <dd className="text-text-primary dark:text-slate-300 truncate">{product.barcode}</dd>
                                    </div>
                                )}
                                {product.weight && (
                                    <div>
                                    <dt className="font-medium text-slate-500 dark:text-slate-400">Peso</dt>
                                    <dd className="text-text-primary dark:text-slate-300 truncate">{product.weight}{product.unitOfMeasure}</dd>
                                    </div>
                                )}
                                {product.dimensions && (
                                    <div>
                                    <dt className="font-medium text-slate-500 dark:text-slate-400">Dimensões</dt>
                                    <dd className="text-text-primary dark:text-slate-300 truncate">{product.dimensions}</dd>
                                    </div>
                                )}
                                </dl>
                            </div>
                            )}
                        </div>

                        <div className="bg-slate-50 dark:bg-slate-800/50 p-5 border-t border-slate-200 dark:border-slate-700 rounded-b-xl">
                            <div className="flex justify-between items-end">
                                <div className="flex items-end gap-4">
                                    <div>
                                        <p className="text-xs text-text-secondary dark:text-slate-400">Custo</p>
                                        <p className="font-semibold text-lg text-red-600">{product.cost.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</p>
                                    </div>
                                    <div>
                                        <p className="text-xs text-text-secondary dark:text-slate-400">Preço</p>
                                        <p className="font-bold text-lg text-secondary">{product.price.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-1">
                                    <button onClick={() => setStockModalProduct(product)} className="text-secondary hover:text-emerald-700 p-2 rounded-full hover:bg-emerald-100 dark:hover:bg-emerald-900/50" title="Adicionar ao estoque"><PlusIcon className="h-5 w-5"/></button>
                                    <button onClick={() => setEditingProduct(product)} className="text-blue-600 hover:text-blue-900 p-2 rounded-full hover:bg-blue-100 dark:hover:bg-blue-900/50" title="Editar produto"><EditIcon className="h-5 w-5"/></button>
                                    <button onClick={() => deleteProduct(product.id)} className="text-red-600 hover:text-red-900 p-2 rounded-full hover:bg-red-100 dark:hover:bg-red-900/50" title="Excluir produto"><TrashIcon className="h-5 w-5"/></button>
                                </div>
                            </div>
                        </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>

      {stockModalProduct && (
        <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 p-4">
          <div className="bg-card dark:bg-slate-800 rounded-2xl shadow-xl p-6 w-full max-w-sm">
            <h3 className="text-xl font-semibold text-text-primary dark:text-slate-200 mb-2">Adicionar Estoque</h3>
            <p className="text-sm text-text-secondary dark:text-slate-400 mb-6">Produto: <span className="font-bold text-text-primary dark:text-slate-200">{stockModalProduct.name}</span></p>
            <label htmlFor="stockToAdd" className="block text-sm font-medium text-text-secondary dark:text-slate-400">Quantidade a adicionar</label>
            <input type="number" id="stockToAdd" value={stockToAdd} onChange={(e) => setStockToAdd(Math.max(1, parseInt(e.target.value, 10) || 1))} min="1" className={`${inputClasses} mt-1`} autoFocus />
            <div className="mt-6 flex justify-end gap-4">
              <button onClick={() => setStockModalProduct(null)} className="bg-slate-200 text-text-secondary font-bold py-2 px-4 rounded-lg hover:bg-slate-300 dark:bg-slate-700 dark:hover:bg-slate-600 dark:text-slate-300">Cancelar</button>
              <button onClick={handleStockUpdate} className="bg-primary text-white font-bold py-2 px-4 rounded-lg hover:bg-primary-hover">Confirmar</button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default Products;

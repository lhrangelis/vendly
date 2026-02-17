
import React, { useState } from 'react';
import type { Category } from '../types';
import { PlusIcon, TrashIcon, CategoriesIcon } from './icons/Icons';

interface CategoriesProps {
  categories: Category[];
  addCategory: (name: string) => void;
  deleteCategory: (id: string) => void;
}

const Categories: React.FC<CategoriesProps> = ({ categories, addCategory, deleteCategory }) => {
  const [newCategory, setNewCategory] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (newCategory.trim()) {
      addCategory(newCategory.trim());
      setNewCategory('');
    }
  };

  return (
    <div className="space-y-8">
        <div>
            <h2 className="text-4xl font-bold tracking-tight text-text-primary dark:text-slate-200">Categorias</h2>
            <p className="text-text-secondary dark:text-slate-400 mt-1">Organize seus produtos em categorias para facilitar a gestão.</p>
        </div>
      
        <div className="max-w-2xl mx-auto space-y-8">
            <div className="bg-card dark:bg-slate-800 p-6 rounded-2xl shadow-lg">
                <h3 className="text-xl font-semibold text-text-primary dark:text-slate-200 mb-4">Nova Categoria</h3>
                <form onSubmit={handleSubmit} className="flex gap-4">
                <input
                    type="text"
                    value={newCategory}
                    onChange={(e) => setNewCategory(e.target.value)}
                    placeholder="Ex: Eletrônicos, Livros, Roupas..."
                    className="flex-grow border border-slate-300 rounded-lg p-3 focus:ring-primary focus:border-primary dark:bg-slate-700 dark:border-slate-600 dark:text-slate-200 dark:placeholder-slate-400"
                    required
                />
                <button type="submit" className="flex items-center gap-2 bg-primary text-white font-bold py-3 px-5 rounded-lg hover:bg-primary-hover transition-colors">
                    <PlusIcon className="h-5 w-5" /> Adicionar
                </button>
                </form>
            </div>

            <div className="bg-card dark:bg-slate-800 rounded-2xl shadow-lg overflow-hidden">
                <ul className="divide-y divide-slate-200 dark:divide-slate-700">
                {categories.length === 0 ? (
                    <li className="text-center p-16 text-text-secondary dark:text-slate-400">
                        <CategoriesIcon className="h-16 w-16 mx-auto text-slate-400" />
                        <p className="mt-4">Nenhuma categoria cadastrada.</p>
                    </li>
                ) : (
                    categories.map(category => (
                    <li key={category.id} className="p-4 flex justify-between items-center transition-colors hover:bg-slate-50 dark:hover:bg-slate-700">
                        <span className="text-text-primary dark:text-slate-200 font-medium">{category.name}</span>
                        <button onClick={() => deleteCategory(category.id)} className="text-red-600 hover:text-red-900 p-2 rounded-full hover:bg-red-100 dark:hover:bg-red-900/50" title={`Excluir "${category.name}"`}>
                           <TrashIcon className="h-5 w-5" />
                        </button>
                    </li>
                    ))
                )}
                </ul>
            </div>
        </div>
    </div>
  );
};

export default Categories;

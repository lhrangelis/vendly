
import React, { useState, useEffect } from 'react';
import type { PaymentMethod } from '../types';
import { 
    PlusIcon, TrashIcon, CreditCardIcon, BanknotesIcon, 
    QrCodeIcon, BuildingBankIcon, BarcodeIcon, EditIcon
} from './icons/Icons';

interface PaymentMethodsProps {
  paymentMethods: PaymentMethod[];
  addPaymentMethod: (name: string, icon: string) => void;
  updatePaymentMethod: (method: PaymentMethod) => void;
  deletePaymentMethod: (id: string) => void;
}

const availableIcons = [
    { name: 'credit-card', component: CreditCardIcon, label: 'Cartão' },
    { name: 'pix', component: QrCodeIcon, label: 'Pix' },
    { name: 'cash', component: BanknotesIcon, label: 'Dinheiro' },
    { name: 'bank', component: BuildingBankIcon, label: 'Banco' },
    { name: 'barcode', component: BarcodeIcon, label: 'Boleto' },
];

const IconDisplay: React.FC<{ iconName?: string; className?: string }> = ({ iconName, className = "h-8 w-8" }) => {
    const icon = availableIcons.find(i => i.name === iconName);
    if (!icon) return <CreditCardIcon className={className} />; // Default
    const IconComponent = icon.component;
    return <IconComponent className={className} />;
};

const PaymentMethods: React.FC<PaymentMethodsProps> = ({ paymentMethods, addPaymentMethod, updatePaymentMethod, deletePaymentMethod }) => {
  const [name, setName] = useState('');
  const [selectedIcon, setSelectedIcon] = useState(availableIcons[0].name);
  const [editingMethod, setEditingMethod] = useState<PaymentMethod | null>(null);

  useEffect(() => {
    if (editingMethod) {
      setName(editingMethod.name);
      setSelectedIcon(editingMethod.icon || availableIcons[0].name);
      document.getElementById('method-form')?.scrollIntoView({ behavior: 'smooth' });
    } else {
      setName('');
      setSelectedIcon(availableIcons[0].name);
    }
  }, [editingMethod]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (name.trim()) {
      if (editingMethod) {
        updatePaymentMethod({ ...editingMethod, name: name.trim(), icon: selectedIcon });
      } else {
        addPaymentMethod(name.trim(), selectedIcon);
      }
      setEditingMethod(null);
    }
  };

  const handleCancelEdit = () => {
    setEditingMethod(null);
  };

  return (
    <div className="space-y-8">
        <div>
            <h2 className="text-4xl font-bold tracking-tight text-text-primary dark:text-slate-200">Formas de Pagamento</h2>
            <p className="text-text-secondary dark:text-slate-400 mt-1">Gerencie as formas de pagamento aceitas em sua loja.</p>
        </div>
      
        <div className="max-w-4xl mx-auto space-y-8">
            <div id="method-form" className="bg-card dark:bg-slate-800 p-6 rounded-2xl shadow-lg">
                <h3 className="text-xl font-semibold text-text-primary dark:text-slate-200 mb-4">
                    {editingMethod ? `Editando "${editingMethod.name}"` : 'Nova Forma de Pagamento'}
                </h3>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label htmlFor="method-name" className="block text-sm font-medium text-text-secondary dark:text-slate-400 mb-1">
                            Nome da Forma de Pagamento
                        </label>
                        <input
                            id="method-name"
                            type="text"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            placeholder="Ex: Cartão de Crédito, Pix, Dinheiro..."
                            className="w-full border border-slate-300 rounded-lg p-3 focus:ring-primary focus:border-primary dark:bg-slate-700 dark:border-slate-600 dark:text-slate-200 dark:placeholder-slate-400"
                            required
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-text-secondary dark:text-slate-400 mb-2">
                            Ícone Representativo
                        </label>
                        <div className="flex flex-wrap gap-3">
                            {availableIcons.map(icon => (
                                <button
                                    key={icon.name}
                                    type="button"
                                    onClick={() => setSelectedIcon(icon.name)}
                                    className={`p-3 rounded-lg flex flex-col items-center gap-1 transition-all duration-200 ${selectedIcon === icon.name ? 'bg-primary text-white ring-2 ring-offset-2 ring-primary dark:ring-offset-slate-800' : 'bg-slate-100 text-slate-600 hover:bg-slate-200 dark:bg-slate-700 dark:text-slate-300 dark:hover:bg-slate-600'}`}
                                >
                                    <icon.component className="h-6 w-6" />
                                    <span className="text-[10px] font-bold uppercase">{icon.label}</span>
                                </button>
                            ))}
                        </div>
                    </div>
                    <div className="flex justify-end gap-4 pt-2">
                        {editingMethod && (
                            <button type="button" onClick={handleCancelEdit} className="bg-slate-200 text-text-secondary font-bold py-2 px-4 rounded-lg hover:bg-slate-300 dark:bg-slate-700 dark:hover:bg-slate-600 dark:text-slate-300">
                                Cancelar
                            </button>
                        )}
                        <button type="submit" className="flex items-center gap-2 bg-primary text-white font-bold py-2 px-5 rounded-lg hover:bg-primary-hover transition-colors">
                            <PlusIcon className="h-5 w-5" /> {editingMethod ? 'Salvar Alterações' : 'Adicionar'}
                        </button>
                    </div>
                </form>
            </div>

            <div className="bg-card dark:bg-slate-800 rounded-2xl shadow-lg overflow-hidden">
                <ul className="divide-y divide-slate-200 dark:divide-slate-700">
                {paymentMethods.length === 0 ? (
                    <li className="text-center p-16 text-text-secondary dark:text-slate-400">
                        <CreditCardIcon className="h-16 w-16 mx-auto text-slate-400" />
                        <p className="mt-4">Nenhuma forma de pagamento cadastrada.</p>
                    </li>
                ) : (
                    paymentMethods.map(method => (
                    <li key={method.id} className="p-4 flex justify-between items-center transition-colors hover:bg-slate-50 dark:hover:bg-slate-700/50">
                        <div className="flex items-center gap-4">
                            <div className="flex-shrink-0 text-secondary bg-secondary/10 p-3 rounded-lg">
                                <IconDisplay iconName={method.icon} className="h-6 w-6" />
                            </div>
                            <span className="text-text-primary dark:text-slate-200 font-bold text-lg">{method.name}</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <button onClick={() => setEditingMethod(method)} className="text-blue-600 hover:text-blue-900 p-2 rounded-full hover:bg-blue-100 dark:hover:bg-blue-900/50" title={`Editar "${method.name}"`}>
                                <EditIcon className="h-5 w-5"/>
                            </button>
                            <button onClick={() => deletePaymentMethod(method.id)} className="text-red-600 hover:text-red-900 p-2 rounded-full hover:bg-red-100 dark:hover:bg-red-900/50" title={`Excluir "${method.name}"`}>
                               <TrashIcon className="h-5 w-5" />
                            </button>
                        </div>
                    </li>
                    ))
                )}
                </ul>
            </div>
        </div>
    </div>
  );
};

export default PaymentMethods;

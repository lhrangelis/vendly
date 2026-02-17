
import React, { useState, useEffect } from 'react';
import type { Channel } from '../types';
import { 
    PlusIcon, TrashIcon, SalesIcon, ProfitIcon, EditIcon, 
    StoreIcon, GlobeIcon, WhatsappIcon, InstagramIcon, PhoneIcon
} from './icons/Icons';

interface ChannelsProps {
  channels: Channel[];
  addChannel: (name: string, icon: string) => void;
  updateChannel: (channel: Channel) => void;
  deleteChannel: (id: string) => void;
}

const availableIcons = [
    { name: 'store', component: StoreIcon },
    { name: 'globe', component: GlobeIcon },
    { name: 'whatsapp', component: WhatsappIcon },
    { name: 'instagram', component: InstagramIcon },
    { name: 'phone', component: PhoneIcon },
];

const IconDisplay: React.FC<{ iconName?: string; className?: string }> = ({ iconName, className = "h-8 w-8" }) => {
    const icon = availableIcons.find(i => i.name === iconName);
    if (!icon) return <StoreIcon className={className} />; // Default icon
    const IconComponent = icon.component;
    return <IconComponent className={className} />;
};

const Channels: React.FC<ChannelsProps> = ({ channels, addChannel, updateChannel, deleteChannel }) => {
  const [name, setName] = useState('');
  const [selectedIcon, setSelectedIcon] = useState(availableIcons[0].name);
  const [editingChannel, setEditingChannel] = useState<Channel | null>(null);

  useEffect(() => {
    if (editingChannel) {
      setName(editingChannel.name);
      setSelectedIcon(editingChannel.icon || availableIcons[0].name);
      document.getElementById('channel-form')?.scrollIntoView({ behavior: 'smooth' });
    } else {
      setName('');
      setSelectedIcon(availableIcons[0].name);
    }
  }, [editingChannel]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (name.trim()) {
      if (editingChannel) {
        updateChannel({ ...editingChannel, name: name.trim(), icon: selectedIcon });
      } else {
        addChannel(name.trim(), selectedIcon);
      }
      setEditingChannel(null);
    }
  };
  
  const handleCancelEdit = () => {
    setEditingChannel(null);
  };

  return (
    <div className="space-y-8">
        <div>
            <h2 className="text-4xl font-bold tracking-tight text-text-primary dark:text-slate-200">Canais de Venda</h2>
            <p className="text-text-secondary dark:text-slate-400 mt-1">Gerencie os canais por onde suas vendas são realizadas.</p>
        </div>
      
        <div className="max-w-4xl mx-auto space-y-8">
            <div id="channel-form" className="bg-card dark:bg-slate-800 p-6 rounded-2xl shadow-lg">
                <h3 className="text-xl font-semibold text-text-primary dark:text-slate-200 mb-4">
                    {editingChannel ? `Editando "${editingChannel.name}"` : 'Novo Canal de Venda'}
                </h3>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label htmlFor="channel-name" className="block text-sm font-medium text-text-secondary dark:text-slate-400 mb-1">
                            Nome do Canal
                        </label>
                        <input
                            id="channel-name"
                            type="text"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            placeholder="Ex: Loja Online, Instagram, WhatsApp..."
                            className="w-full border border-slate-300 rounded-lg p-3 focus:ring-primary focus:border-primary dark:bg-slate-700 dark:border-slate-600 dark:text-slate-200 dark:placeholder-slate-400"
                            required
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-text-secondary dark:text-slate-400 mb-2">
                            Ícone
                        </label>
                        <div className="flex flex-wrap gap-3">
                            {availableIcons.map(icon => (
                                <button
                                    key={icon.name}
                                    type="button"
                                    onClick={() => setSelectedIcon(icon.name)}
                                    className={`p-3 rounded-lg transition-all duration-200 ${selectedIcon === icon.name ? 'bg-primary text-white ring-2 ring-offset-2 ring-primary dark:ring-offset-slate-800' : 'bg-slate-100 text-slate-600 hover:bg-slate-200 dark:bg-slate-700 dark:text-slate-300 dark:hover:bg-slate-600'}`}
                                    title={icon.name.charAt(0).toUpperCase() + icon.name.slice(1)}
                                >
                                    <IconDisplay iconName={icon.name} className="h-6 w-6" />
                                </button>
                            ))}
                        </div>
                    </div>
                    <div className="flex justify-end gap-4 pt-2">
                        {editingChannel && (
                            <button type="button" onClick={handleCancelEdit} className="bg-slate-200 text-text-secondary font-bold py-2 px-4 rounded-lg hover:bg-slate-300 dark:bg-slate-700 dark:hover:bg-slate-600 dark:text-slate-300">
                                Cancelar
                            </button>
                        )}
                        <button type="submit" className="flex items-center gap-2 bg-primary text-white font-bold py-2 px-5 rounded-lg hover:bg-primary-hover transition-colors">
                            <PlusIcon className="h-5 w-5" /> {editingChannel ? 'Salvar Alterações' : 'Adicionar'}
                        </button>
                    </div>
                </form>
            </div>

            <div className="bg-card dark:bg-slate-800 rounded-2xl shadow-lg overflow-hidden">
                <ul className="divide-y divide-slate-200 dark:divide-slate-700">
                {channels.length === 0 ? (
                    <li className="text-center p-16 text-text-secondary dark:text-slate-400">
                        <IconDisplay iconName="store" className="h-16 w-16 mx-auto text-slate-400" />
                        <p className="mt-4">Nenhum canal de venda cadastrado.</p>
                    </li>
                ) : (
                    channels.map(channel => (
                    <li key={channel.id} className="p-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 transition-colors hover:bg-slate-50 dark:hover:bg-slate-700/50">
                        <div className="flex items-center gap-4">
                            <div className="flex-shrink-0 text-primary bg-primary/10 p-3 rounded-lg">
                                <IconDisplay iconName={channel.icon} className="h-6 w-6" />
                            </div>
                            <span className="text-text-primary dark:text-slate-200 font-bold text-lg">{channel.name}</span>
                        </div>
                        <div className="flex items-center gap-4 w-full sm:w-auto">
                            <div className="flex items-center gap-2 text-sm flex-1">
                                <SalesIcon className="h-5 w-5 text-primary"/>
                                <div>
                                    <p className="text-xs text-text-secondary dark:text-slate-400">Total Vendido</p>
                                    <p className="font-semibold text-text-primary dark:text-slate-200">{channel.totalSales.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</p>
                                </div>
                            </div>
                             <div className="flex items-center gap-2 text-sm flex-1">
                                <ProfitIcon className="h-5 w-5 text-secondary"/>
                                <div>
                                    <p className="text-xs text-text-secondary dark:text-slate-400">Lucro</p>
                                    <p className="font-semibold text-text-primary dark:text-slate-200">{channel.totalProfit.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</p>
                                </div>
                            </div>
                            <div className="flex items-center">
                                <button onClick={() => setEditingChannel(channel)} className="text-blue-600 hover:text-blue-900 p-2 rounded-full hover:bg-blue-100 dark:hover:bg-blue-900/50" title={`Editar "${channel.name}"`}>
                                    <EditIcon className="h-5 w-5"/>
                                </button>
                                <button onClick={() => deleteChannel(channel.id)} className="text-red-600 hover:text-red-900 p-2 rounded-full hover:bg-red-100 dark:hover:bg-red-900/50" title={`Excluir "${channel.name}"`}>
                                   <TrashIcon className="h-5 w-5" />
                                </button>
                            </div>
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

export default Channels;

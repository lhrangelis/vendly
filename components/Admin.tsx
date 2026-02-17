
import React, { useState } from 'react';
import type { Log } from '../types';
import { TrashIcon, PlusIcon, EditIcon, InfoIcon, AdminIcon, WarningIcon, EyeIcon } from './icons/Icons';

interface AdminProps {
  logs: Log[];
  clearLogs: () => void;
}

const LogIcon: React.FC<{ type: Log['type'] }> = ({ type }) => {
  switch (type) {
    case 'create':
      return <PlusIcon className="h-5 w-5 text-secondary" />;
    case 'update':
      return <EditIcon className="h-5 w-5 text-blue-500" />;
    case 'delete':
      return <TrashIcon className="h-5 w-5 text-red-500" />;
    case 'info':
    default:
      return <InfoIcon className="h-5 w-5 text-slate-500" />;
  }
};

const LogTypeBadge: React.FC<{ type: Log['type'] }> = ({ type }) => {
  const baseClasses = "px-2 py-0.5 text-xs font-semibold rounded-full";
  switch (type) {
    case 'create':
      return <span className={`${baseClasses} bg-emerald-100 text-secondary`}>CRIAR</span>;
    case 'update':
      return <span className={`${baseClasses} bg-blue-100 text-blue-600`}>ATUALIZAR</span>;
    case 'delete':
      return <span className={`${baseClasses} bg-red-100 text-red-600`}>EXCLUIR</span>;
    case 'info':
    default:
      return <span className={`${baseClasses} bg-slate-100 text-slate-600`}>INFO</span>;
  }
}

const Admin: React.FC<AdminProps> = ({ logs, clearLogs }) => {
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [selectedLog, setSelectedLog] = useState<Log | null>(null);

  const handleClearLogs = () => {
    setShowConfirmModal(true);
  };

  const confirmAndClear = () => {
    clearLogs();
    setShowConfirmModal(false);
  };

  const formatDate = (isoString: string) => new Date(isoString).toLocaleString('pt-BR', {
    dateStyle: 'short',
    timeStyle: 'medium',
  });

  return (
    <>
      <div className="space-y-8">
        <div>
          <h2 className="text-4xl font-bold tracking-tight text-text-primary dark:text-slate-200">Painel do Administrador</h2>
          <p className="text-text-secondary dark:text-slate-400 mt-1">Histórico de todas as atividades realizadas no sistema.</p>
        </div>
        
        <div className="max-w-4xl mx-auto space-y-6">
          <div className="flex justify-end">
              <button 
                  onClick={handleClearLogs}
                  disabled={logs.length === 0}
                  className="flex items-center gap-2 bg-red-600 text-white font-bold py-2 px-4 rounded-lg hover:bg-red-700 transition-colors disabled:bg-slate-400 dark:disabled:bg-slate-600"
              >
                  <TrashIcon className="h-5 w-5" />
                  Limpar Histórico
              </button>
          </div>

          <div className="bg-card dark:bg-slate-800 rounded-2xl shadow-lg overflow-hidden">
              <ul className="divide-y divide-slate-200 dark:divide-slate-700">
                  {logs.length === 0 ? (
                      <li className="text-center p-16 text-text-secondary dark:text-slate-400">
                          <AdminIcon className="h-16 w-16 mx-auto text-slate-400" />
                          <p className="mt-4">Nenhuma atividade registrada ainda.</p>
                      </li>
                  ) : (
                      logs.map(log => (
                          <li key={log.id} className="p-4 flex items-start gap-4">
                              <div className="flex-shrink-0 mt-1 p-2 bg-slate-100 dark:bg-slate-700 rounded-full">
                                  <LogIcon type={log.type} />
                              </div>
                              <div className="flex-grow">
                                  <p className="text-text-primary dark:text-slate-200">{log.action}</p>
                                  <p className="text-xs text-text-secondary dark:text-slate-400">{formatDate(log.timestamp)}</p>
                              </div>
                               <div className="flex-shrink-0 flex items-center gap-2">
                                  <button onClick={() => setSelectedLog(log)} className="p-2 rounded-full text-slate-500 hover:bg-slate-200 dark:text-slate-400 dark:hover:bg-slate-700" title="Ver detalhes">
                                    <EyeIcon className="h-5 w-5" />
                                  </button>
                                  <div className="mt-0.5">
                                    <LogTypeBadge type={log.type} />
                                  </div>
                               </div>
                          </li>
                      ))
                  )}
              </ul>
          </div>
        </div>
      </div>

      {showConfirmModal && (
        <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 p-4" aria-modal="true" role="dialog">
          <div className="bg-card dark:bg-slate-800 rounded-2xl shadow-xl p-6 w-full max-w-md text-center">
            <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-100 dark:bg-red-900/50">
                <WarningIcon className="h-7 w-7 text-red-600" aria-hidden="true" />
            </div>
            <h3 className="text-xl font-semibold text-text-primary dark:text-slate-200 mt-4">Limpar Histórico?</h3>
            <p className="text-sm text-text-secondary dark:text-slate-400 mt-2">
              Tem certeza de que deseja limpar todo o histórico de atividades? Esta ação não pode ser desfeita.
            </p>
            <div className="mt-6 flex justify-center gap-4">
              <button 
                onClick={() => setShowConfirmModal(false)} 
                className="bg-slate-200 text-text-secondary font-bold py-2 px-6 rounded-lg hover:bg-slate-300 dark:bg-slate-700 dark:hover:bg-slate-600 dark:text-slate-300 transition-colors"
              >
                Cancelar
              </button>
              <button 
                onClick={confirmAndClear} 
                className="bg-red-600 text-white font-bold py-2 px-6 rounded-lg hover:bg-red-700 transition-colors"
              >
                Limpar
              </button>
            </div>
          </div>
        </div>
      )}

      {selectedLog && (
        <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 p-4" aria-modal="true" role="dialog">
          <div className="bg-card dark:bg-slate-800 rounded-2xl shadow-xl p-6 w-full max-w-lg">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-semibold text-text-primary dark:text-slate-200">Detalhes do Log</h3>
              <LogTypeBadge type={selectedLog.type} />
            </div>
            <div className="space-y-4 text-left">
              <div>
                <p className="text-sm font-medium text-text-secondary dark:text-slate-400">Ação</p>
                <p className="text-text-primary dark:text-slate-200 bg-slate-100 dark:bg-slate-700 p-3 rounded-lg mt-1">{selectedLog.action}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-text-secondary dark:text-slate-400">Data e Hora</p>
                <p className="text-text-primary dark:text-slate-200 mt-1">{formatDate(selectedLog.timestamp)}</p>
              </div>
            </div>
            <div className="mt-6 flex justify-end">
              <button 
                onClick={() => setSelectedLog(null)} 
                className="bg-primary text-white font-bold py-2 px-6 rounded-lg hover:bg-primary-hover transition-colors"
              >
                Fechar
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default Admin;

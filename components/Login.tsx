
import React, { useState } from 'react';
import { StoreIcon, GoogleIcon } from './icons/Icons';

interface LoginProps {
    onLogin: (user: string, pass: string) => boolean | Promise<boolean>;
}

const Login: React.FC<LoginProps> = ({ onLogin }) => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setIsLoading(true);
        try {
            const success = await onLogin(username, password);
            if (!success) {
                setError('Usuário ou senha inválidos.');
            }
        } catch {
            setError('Erro ao conectar com o servidor.');
        } finally {
            setIsLoading(false);
        }
    };

    const inputClasses = "w-full border border-slate-300 rounded-lg p-3 focus:ring-primary focus:border-primary dark:bg-slate-700 dark:border-slate-600 dark:text-slate-200 dark:placeholder-slate-400";
    const labelClasses = "block text-sm font-medium text-text-secondary dark:text-slate-400 mb-1";

    return (
        <div className="min-h-screen flex items-center justify-center bg-background dark:bg-dark-background px-4">
            <div className="w-full max-w-md">
                <div className="text-center mb-8">
                    <StoreIcon className="h-12 w-12 mx-auto text-primary" />
                    <h1 className="text-3xl font-bold text-text-primary dark:text-dark-text-primary mt-4">Vendly</h1>
                    <p className="text-text-secondary dark:text-dark-text-secondary mt-1">Faça login para continuar</p>
                </div>
                <div className="bg-card dark:bg-dark-card p-8 rounded-2xl shadow-2xl border border-border dark:border-dark-border">
                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div>
                            <label htmlFor="username" className={labelClasses}>Usuário</label>
                            <input
                                id="username"
                                type="text"
                                value={username}
                                onChange={(e) => setUsername(e.target.value)}
                                className={inputClasses}
                                autoFocus
                                required
                            />
                        </div>
                        <div>
                            <label htmlFor="password" className={labelClasses}>Senha</label>
                            <input
                                id="password"
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className={inputClasses}
                                required
                            />
                        </div>
                        {error && (
                            <p className="text-sm text-red-500 text-center">{error}</p>
                        )}
                        <div>
                            <button type="submit" className="w-full flex justify-center items-center gap-2 bg-primary text-white font-bold py-3 px-4 rounded-lg hover:bg-primary-hover transition-colors">
                                Entrar
                            </button>
                        </div>
                    </form>

                    <div className="relative my-6">
                        <div className="absolute inset-0 flex items-center" aria-hidden="true">
                            <div className="w-full border-t border-slate-300 dark:border-slate-700" />
                        </div>
                        <div className="relative flex justify-center text-sm">
                            <span className="bg-card dark:bg-dark-card px-2 text-text-secondary dark:text-dark-text-secondary">ou</span>
                        </div>
                    </div>

                    <div>
                        <button
                            type="button"
                            onClick={() => { /* Placeholder for Google Login */ }}
                            className="w-full flex justify-center items-center gap-3 bg-white dark:bg-dark-card text-text-primary dark:text-dark-text-primary font-medium py-2.5 px-4 rounded-lg border border-slate-300 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800/80 transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary dark:focus:ring-offset-dark-card"
                        >
                            <GoogleIcon className="h-6 w-6" />
                            <span>Entrar com Google</span>
                        </button>
                    </div>

                </div>
                <div className="mt-6 text-center">
                    <p className="text-sm text-text-secondary dark:text-dark-text-secondary">
                        Não tem uma conta?{' '}
                        <a href="#" onClick={(e) => e.preventDefault()} className="font-medium text-primary hover:underline">
                            Cadastre-se
                        </a>
                    </p>
                </div>
            </div>
        </div>
    );
};

export default Login;

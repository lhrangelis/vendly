
import React, { useState } from 'react';
import type { User } from '../types';
import { UserCircleIcon, CameraIcon } from './icons/Icons';

interface ProfileProps {
    user: User;
    onUpdateUser: (user: User) => void;
}

const Profile: React.FC<ProfileProps> = ({ user, onUpdateUser }) => {
    const [formData, setFormData] = useState({
        name: user.name,
        email: user.email,
        currentPassword: '',
        newPassword: '',
        confirmPassword: '',
    });
    const [avatarPreview, setAvatarPreview] = useState<string | null>(user.avatarUrl || null);

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0];
            const reader = new FileReader();
            reader.onloadend = () => {
                setAvatarPreview(reader.result as string);
            };
            reader.readAsDataURL(file);
        }
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        // Here you would typically handle form validation and API calls
        // For this mock, we'll just update the user object
        // Password change logic would go here
        onUpdateUser({
            ...user,
            name: formData.name,
            email: formData.email,
            avatarUrl: avatarPreview || undefined,
        });
        // You would also show a success message
    };
    
    const inputClasses = "w-full border border-slate-300 rounded-lg p-3 focus:ring-primary focus:border-primary dark:bg-slate-700 dark:border-slate-600 dark:text-slate-200 dark:placeholder-slate-400";
    const labelClasses = "block text-sm font-medium text-text-secondary dark:text-slate-400 mb-1";

    return (
        <div className="space-y-8">
            <div>
                <h2 className="text-4xl font-bold tracking-tight text-text-primary dark:text-slate-200">Meu Perfil</h2>
                <p className="text-text-secondary dark:text-slate-400 mt-1">Atualize suas informações pessoais e de segurança.</p>
            </div>

            <div className="bg-card dark:bg-dark-card p-8 rounded-2xl shadow-lg max-w-4xl mx-auto">
                <form onSubmit={handleSubmit} className="space-y-8">
                    {/* Profile Info Section */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-center border-b border-border dark:border-dark-border pb-8">
                        <div className="md:col-span-1">
                            <h3 className="text-lg font-semibold">Informações Pessoais</h3>
                            <p className="text-sm text-text-secondary dark:text-slate-400">Edite seu nome, e-mail e foto de perfil.</p>
                        </div>
                        <div className="md:col-span-2 space-y-4">
                            <div className="flex items-center gap-4">
                                <div className="relative">
                                    {avatarPreview ? (
                                        <img src={avatarPreview} alt="Avatar Preview" className="h-20 w-20 rounded-full object-cover" />
                                    ) : (
                                        <UserCircleIcon className="h-20 w-20 text-slate-300 dark:text-slate-600" />
                                    )}
                                    <label htmlFor="avatar-upload" className="absolute -bottom-1 -right-1 flex items-center justify-center h-8 w-8 bg-primary rounded-full text-white cursor-pointer hover:bg-primary-hover transition-colors">
                                        <CameraIcon className="h-5 w-5" />
                                        <input id="avatar-upload" type="file" className="sr-only" onChange={handleAvatarChange} accept="image/*" />
                                    </label>
                                </div>
                                <div>
                                    <p className="font-bold text-lg">{formData.name}</p>
                                    <p className="text-text-secondary dark:text-slate-400">{formData.email}</p>
                                </div>
                            </div>
                            <div>
                                <label htmlFor="name" className={labelClasses}>Nome de Usuário</label>
                                <input id="name" name="name" type="text" value={formData.name} onChange={handleInputChange} className={inputClasses} required />
                            </div>
                            <div>
                                <label htmlFor="email" className={labelClasses}>Endereço de E-mail</label>
                                <input id="email" name="email" type="email" value={formData.email} onChange={handleInputChange} className={inputClasses} required />
                            </div>
                        </div>
                    </div>

                    {/* Password Section */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        <div className="md:col-span-1">
                            <h3 className="text-lg font-semibold">Alterar Senha</h3>
                            <p className="text-sm text-text-secondary dark:text-slate-400">Para sua segurança, informe sua senha atual para alterá-la.</p>
                        </div>
                        <div className="md:col-span-2 space-y-4">
                            <div>
                                <label htmlFor="currentPassword" className={labelClasses}>Senha Atual</label>
                                <input id="currentPassword" name="currentPassword" type="password" value={formData.currentPassword} onChange={handleInputChange} className={inputClasses} />
                            </div>
                            <div>
                                <label htmlFor="newPassword" className={labelClasses}>Nova Senha</label>
                                <input id="newPassword" name="newPassword" type="password" value={formData.newPassword} onChange={handleInputChange} className={inputClasses} />
                            </div>
                             <div>
                                <label htmlFor="confirmPassword" className={labelClasses}>Confirmar Nova Senha</label>
                                <input id="confirmPassword" name="confirmPassword" type="password" value={formData.confirmPassword} onChange={handleInputChange} className={inputClasses} />
                            </div>
                        </div>
                    </div>
                    
                    {/* Form Actions */}
                    <div className="flex justify-end pt-8 border-t border-border dark:border-dark-border">
                         <button type="submit" className="bg-primary text-white font-bold py-3 px-6 rounded-lg hover:bg-primary-hover transition-colors">
                            Salvar Alterações
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default Profile;

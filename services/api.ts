// Serviço de API — Camada de comunicação Frontend → Backend
// É como os DataModules do Delphi que encapsulam o acesso ao banco.
// Aqui, em vez de abrir uma conexão ao banco, fazemos chamadas HTTP.

const API_BASE = 'http://localhost:3001/api';

// Função auxiliar: pega o token JWT salvo no localStorage
function getToken(): string | null {
    return localStorage.getItem('vendly_token');
}

// Função auxiliar: cria os headers padrão (com token se existir)
function authHeaders(): HeadersInit {
    const headers: HeadersInit = { 'Content-Type': 'application/json' };
    const token = getToken();
    if (token) {
        headers['Authorization'] = `Bearer ${token}`;
    }
    return headers;
}

// Função auxiliar: faz a requisição e trata erros
async function request<T>(url: string, options?: RequestInit): Promise<T> {
    const response = await fetch(`${API_BASE}${url}`, {
        ...options,
        headers: { ...authHeaders(), ...options?.headers },
    });

    if (!response.ok) {
        const error = await response.json().catch(() => ({ error: 'Erro desconhecido' }));
        throw new Error(error.error || `Erro ${response.status}`);
    }

    // DELETE pode retornar corpo vazio
    const text = await response.text();
    return text ? JSON.parse(text) : ({} as T);
}

// ============================================
// AUTH — Login e registro
// ============================================
export const authApi = {
    login: (email: string, password: string) =>
        request<{ token: string; user: any }>('/auth/login', {
            method: 'POST',
            body: JSON.stringify({ email, password }),
        }),

    register: (name: string, email: string, password: string) =>
        request<{ token: string; user: any }>('/auth/register', {
            method: 'POST',
            body: JSON.stringify({ name, email, password }),
        }),

    me: () => request<any>('/auth/me'),
};

// ============================================
// PRODUCTS — CRUD de produtos
// ============================================
export const productsApi = {
    list: () => request<any[]>('/products'),

    create: (data: any) =>
        request<any>('/products', {
            method: 'POST',
            body: JSON.stringify(data),
        }),

    update: (id: string, data: any) =>
        request<any>(`/products/${id}`, {
            method: 'PUT',
            body: JSON.stringify(data),
        }),

    delete: (id: string) =>
        request<any>(`/products/${id}`, { method: 'DELETE' }),
};

// ============================================
// CATEGORIES — CRUD de categorias
// ============================================
export const categoriesApi = {
    list: () => request<any[]>('/categories'),

    create: (name: string) =>
        request<any>('/categories', {
            method: 'POST',
            body: JSON.stringify({ name }),
        }),

    delete: (id: string) =>
        request<any>(`/categories/${id}`, { method: 'DELETE' }),
};

// ============================================
// SALES — CRUD de vendas
// ============================================
export const salesApi = {
    list: () => request<any[]>('/sales'),

    listDrafts: () => request<any[]>('/sales?draft=true'),

    create: (data: any) =>
        request<any>('/sales', {
            method: 'POST',
            body: JSON.stringify(data),
        }),

    update: (id: string, data: any) =>
        request<any>(`/sales/${id}`, {
            method: 'PUT',
            body: JSON.stringify(data),
        }),

    delete: (id: string) =>
        request<any>(`/sales/${id}`, { method: 'DELETE' }),
};

// ============================================
// BUDGETS — CRUD de orçamentos
// ============================================
export const budgetsApi = {
    list: () => request<any[]>('/budgets'),

    create: (data: any) =>
        request<any>('/budgets', {
            method: 'POST',
            body: JSON.stringify(data),
        }),

    update: (id: string, data: any) =>
        request<any>(`/budgets/${id}`, {
            method: 'PUT',
            body: JSON.stringify(data),
        }),

    delete: (id: string) =>
        request<any>(`/budgets/${id}`, { method: 'DELETE' }),
};

// ============================================
// CHANNELS — CRUD de canais de venda
// ============================================
export const channelsApi = {
    list: () => request<any[]>('/channels'),

    create: (name: string, icon: string) =>
        request<any>('/channels', {
            method: 'POST',
            body: JSON.stringify({ name, icon }),
        }),

    update: (id: string, data: any) =>
        request<any>(`/channels/${id}`, {
            method: 'PUT',
            body: JSON.stringify(data),
        }),

    delete: (id: string) =>
        request<any>(`/channels/${id}`, { method: 'DELETE' }),
};

// ============================================
// PAYMENT METHODS — CRUD de formas de pagamento
// ============================================
export const paymentMethodsApi = {
    list: () => request<any[]>('/payment-methods'),

    create: (name: string, icon: string) =>
        request<any>('/payment-methods', {
            method: 'POST',
            body: JSON.stringify({ name, icon }),
        }),

    update: (id: string, data: any) =>
        request<any>(`/payment-methods/${id}`, {
            method: 'PUT',
            body: JSON.stringify(data),
        }),

    delete: (id: string) =>
        request<any>(`/payment-methods/${id}`, { method: 'DELETE' }),
};

// ============================================
// PROMOTIONS — CRUD de promoções
// ============================================
export const promotionsApi = {
    list: () => request<any[]>('/promotions'),

    create: (data: any) =>
        request<any>('/promotions', {
            method: 'POST',
            body: JSON.stringify(data),
        }),

    update: (id: string, data: any) =>
        request<any>(`/promotions/${id}`, {
            method: 'PUT',
            body: JSON.stringify(data),
        }),

    delete: (id: string) =>
        request<any>(`/promotions/${id}`, { method: 'DELETE' }),
};

// ============================================
// LOGS — Logs de atividade
// ============================================
export const logsApi = {
    list: () => request<any[]>('/logs'),
    clear: () => request<any>('/logs', { method: 'DELETE' }),
};

// ============================================
// USERS — Perfil do usuário
// ============================================
export const usersApi = {
    updateProfile: (data: any) =>
        request<any>('/users/profile', {
            method: 'PUT',
            body: JSON.stringify(data),
        }),
};

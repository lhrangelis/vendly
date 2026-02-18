// Ponto de entrada do servidor Express
// É como o .dpr do Delphi — inicializa tudo e "abre a porta" para conexões

import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';

import { authRouter } from './routes/auth.js';
import { productsRouter } from './routes/products.js';
import { categoriesRouter } from './routes/categories.js';
import { salesRouter } from './routes/sales.js';
import { budgetsRouter } from './routes/budgets.js';
import { channelsRouter } from './routes/channels.js';
import { paymentMethodsRouter } from './routes/paymentMethods.js';
import { promotionsRouter } from './routes/promotions.js';
import { logsRouter } from './routes/logs.js';
import { usersRouter } from './routes/users.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

// Middlewares globais
// cors() — Permite que o frontend (porta 3000) chame o backend (porta 3001)
// express.json() — Converte o body das requisições de texto JSON para objeto
app.use(cors());
app.use(express.json());

// Registra todas as rotas (como registrar DataModules no Delphi)
app.use('/api/auth', authRouter);
app.use('/api/products', productsRouter);
app.use('/api/categories', categoriesRouter);
app.use('/api/sales', salesRouter);
app.use('/api/budgets', budgetsRouter);
app.use('/api/channels', channelsRouter);
app.use('/api/payment-methods', paymentMethodsRouter);
app.use('/api/promotions', promotionsRouter);
app.use('/api/logs', logsRouter);
app.use('/api/users', usersRouter);

// Rota de "health check" — para verificar se o servidor está vivo
app.get('/api/health', (_req, res) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Inicia o servidor
app.listen(PORT, () => {
    console.log(`🚀 Vendly API rodando em http://localhost:${PORT}`);
    console.log(`📋 Health check: http://localhost:${PORT}/api/health`);
});

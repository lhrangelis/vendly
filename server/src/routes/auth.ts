// Rota de Autenticação — Login e Registro
// É como o formulário de login do Delphi, mas retorna um "token" (JWT)

import { Router } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { prisma } from '../prisma.js';
import { authMiddleware } from '../middleware/auth.js';

export const authRouter = Router();

// POST /api/auth/login — Faz login e retorna token JWT
authRouter.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;

        // Busca o usuário pelo email
        const user = await prisma.user.findUnique({ where: { email } });
        if (!user) {
            res.status(401).json({ error: 'Credenciais inválidas.' });
            return;
        }

        // Compara a senha informada com o hash salvo
        const passwordValid = await bcrypt.compare(password, user.passwordHash);
        if (!passwordValid) {
            res.status(401).json({ error: 'Credenciais inválidas.' });
            return;
        }

        // Gera o token JWT (válido por 7 dias)
        const token = jwt.sign(
            { userId: user.id },
            process.env.JWT_SECRET || 'fallback-secret',
            { expiresIn: '7d' }
        );

        // Retorna o token + dados do usuário (sem a senha!)
        const { passwordHash, ...userWithoutPassword } = user;
        res.json({ token, user: userWithoutPassword });
    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({ error: 'Erro interno do servidor.' });
    }
});

// POST /api/auth/register — Cria novo usuário
authRouter.post('/register', async (req, res) => {
    try {
        const { name, email, password } = req.body;

        // Verifica se já existe
        const existing = await prisma.user.findUnique({ where: { email } });
        if (existing) {
            res.status(400).json({ error: 'Email já cadastrado.' });
            return;
        }

        // Criptografa a senha (nunca salvar senha em texto puro!)
        const passwordHash = await bcrypt.hash(password, 10);

        const user = await prisma.user.create({
            data: { name, email, passwordHash },
        });

        const token = jwt.sign(
            { userId: user.id },
            process.env.JWT_SECRET || 'fallback-secret',
            { expiresIn: '7d' }
        );

        const { passwordHash: _, ...userWithoutPassword } = user;
        res.status(201).json({ token, user: userWithoutPassword });
    } catch (error) {
        console.error('Register error:', error);
        res.status(500).json({ error: 'Erro interno do servidor.' });
    }
});

// GET /api/auth/me — Retorna o usuário logado (precisa de token)
authRouter.get('/me', authMiddleware, async (req, res) => {
    try {
        const user = await prisma.user.findUnique({
            where: { id: req.userId },
        });

        if (!user) {
            res.status(404).json({ error: 'Usuário não encontrado.' });
            return;
        }

        const { passwordHash, ...userWithoutPassword } = user;
        res.json(userWithoutPassword);
    } catch (error) {
        console.error('Me error:', error);
        res.status(500).json({ error: 'Erro interno do servidor.' });
    }
});

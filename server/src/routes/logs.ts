// Logs de atividade

import { Router } from 'express';
import { prisma } from '../prisma.js';
import { authMiddleware } from '../middleware/auth.js';

export const logsRouter = Router();
logsRouter.use(authMiddleware);

// Lista todos os logs
logsRouter.get('/', async (_req, res) => {
    try {
        const logs = await prisma.log.findMany({
            orderBy: { timestamp: 'desc' },
        });

        // Formata para compatibilidade com o frontend
        const formatted = logs.map((log) => ({
            id: log.id,
            action: log.action,
            type: log.type,
            timestamp: log.timestamp.toISOString(),
        }));

        res.json(formatted);
    } catch (error) {
        console.error('List logs error:', error);
        res.status(500).json({ error: 'Erro ao listar logs.' });
    }
});

// Limpa todos os logs
logsRouter.delete('/', async (_req, res) => {
    try {
        await prisma.log.deleteMany();
        await prisma.log.create({
            data: { action: 'Histórico de atividades limpo.', type: 'delete' },
        });
        res.json({ message: 'Logs limpos.' });
    } catch (error) {
        console.error('Clear logs error:', error);
        res.status(500).json({ error: 'Erro ao limpar logs.' });
    }
});

// CRUD de Canais de Venda

import { Router } from 'express';
import { prisma } from '../prisma.js';
import { authMiddleware } from '../middleware/auth.js';

export const channelsRouter = Router();
channelsRouter.use(authMiddleware);

channelsRouter.get('/', async (_req, res) => {
    try {
        const channels = await prisma.channel.findMany({ orderBy: { name: 'asc' } });
        res.json(channels);
    } catch (error) {
        console.error('List channels error:', error);
        res.status(500).json({ error: 'Erro ao listar canais.' });
    }
});

channelsRouter.post('/', async (req, res) => {
    try {
        const { name, icon } = req.body;
        const channel = await prisma.channel.create({
            data: { name, icon, totalSales: 0, totalProfit: 0 },
        });

        await prisma.log.create({
            data: { action: `Canal de venda "${name}" criado.`, type: 'create' },
        });

        res.status(201).json(channel);
    } catch (error) {
        console.error('Create channel error:', error);
        res.status(500).json({ error: 'Erro ao criar canal.' });
    }
});

channelsRouter.put('/:id', async (req, res) => {
    try {
        const { name, icon } = req.body;
        const channel = await prisma.channel.update({
            where: { id: req.params.id },
            data: { name, icon },
        });

        await prisma.log.create({
            data: { action: `Canal de venda "${channel.name}" atualizado.`, type: 'update' },
        });

        res.json(channel);
    } catch (error) {
        console.error('Update channel error:', error);
        res.status(500).json({ error: 'Erro ao atualizar canal.' });
    }
});

channelsRouter.delete('/:id', async (req, res) => {
    try {
        const channel = await prisma.channel.delete({
            where: { id: req.params.id },
        });

        await prisma.log.create({
            data: { action: `Canal de venda "${channel.name}" excluído.`, type: 'delete' },
        });

        res.json({ message: 'Canal excluído.' });
    } catch (error) {
        console.error('Delete channel error:', error);
        res.status(500).json({ error: 'Erro ao excluir canal.' });
    }
});

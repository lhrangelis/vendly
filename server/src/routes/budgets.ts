// CRUD de Orçamentos

import { Router } from 'express';
import { prisma } from '../prisma.js';
import { authMiddleware } from '../middleware/auth.js';

export const budgetsRouter = Router();
budgetsRouter.use(authMiddleware);

// Lista todos os orçamentos
budgetsRouter.get('/', async (_req, res) => {
    try {
        const budgets = await prisma.budget.findMany({
            include: {
                items: { include: { product: true } },
            },
            orderBy: { createdAt: 'desc' },
        });
        res.json(budgets);
    } catch (error) {
        console.error('List budgets error:', error);
        res.status(500).json({ error: 'Erro ao listar orçamentos.' });
    }
});

// Cria um orçamento
budgetsRouter.post('/', async (req, res) => {
    try {
        const { items, total, clientName, clientContact, validUntil, observations } = req.body;

        const budget = await prisma.budget.create({
            data: {
                total,
                clientName,
                clientContact,
                validUntil,
                observations,
                items: {
                    create: items.map((item: { productId: string; quantity: number; unitPrice: number }) => ({
                        productId: item.productId,
                        quantity: item.quantity,
                        unitPrice: item.unitPrice,
                    })),
                },
            },
            include: {
                items: { include: { product: true } },
            },
        });

        await prisma.log.create({
            data: { action: `Orçamento para "${clientName || 'Cliente'}" criado.`, type: 'create' },
        });

        res.status(201).json(budget);
    } catch (error) {
        console.error('Create budget error:', error);
        res.status(500).json({ error: 'Erro ao criar orçamento.' });
    }
});

// Atualiza um orçamento
budgetsRouter.put('/:id', async (req, res) => {
    try {
        const { items, total, clientName, clientContact, validUntil, observations } = req.body;
        const budgetId = req.params.id;

        // Remove itens antigos e recria
        await prisma.budgetItem.deleteMany({ where: { budgetId } });

        const budget = await prisma.budget.update({
            where: { id: budgetId },
            data: {
                total,
                clientName,
                clientContact,
                validUntil,
                observations,
                items: {
                    create: items.map((item: { productId: string; quantity: number; unitPrice: number }) => ({
                        productId: item.productId,
                        quantity: item.quantity,
                        unitPrice: item.unitPrice,
                    })),
                },
            },
            include: {
                items: { include: { product: true } },
            },
        });

        await prisma.log.create({
            data: { action: `Orçamento #${budgetId.slice(-5)} atualizado.`, type: 'update' },
        });

        res.json(budget);
    } catch (error) {
        console.error('Update budget error:', error);
        res.status(500).json({ error: 'Erro ao atualizar orçamento.' });
    }
});

// Exclui um orçamento
budgetsRouter.delete('/:id', async (req, res) => {
    try {
        const budget = await prisma.budget.delete({
            where: { id: req.params.id },
        });

        await prisma.log.create({
            data: { action: `Orçamento #${req.params.id.slice(-5)} para "${budget.clientName || 'Cliente'}" excluído.`, type: 'delete' },
        });

        res.json({ message: 'Orçamento excluído.' });
    } catch (error) {
        console.error('Delete budget error:', error);
        res.status(500).json({ error: 'Erro ao excluir orçamento.' });
    }
});

// CRUD de Formas de Pagamento

import { Router } from 'express';
import { prisma } from '../prisma.js';
import { authMiddleware } from '../middleware/auth.js';

export const paymentMethodsRouter = Router();
paymentMethodsRouter.use(authMiddleware);

paymentMethodsRouter.get('/', async (_req, res) => {
    try {
        const methods = await prisma.paymentMethod.findMany({ orderBy: { name: 'asc' } });
        res.json(methods);
    } catch (error) {
        console.error('List payment methods error:', error);
        res.status(500).json({ error: 'Erro ao listar formas de pagamento.' });
    }
});

paymentMethodsRouter.post('/', async (req, res) => {
    try {
        const { name, icon } = req.body;
        const method = await prisma.paymentMethod.create({ data: { name, icon } });

        await prisma.log.create({
            data: { action: `Forma de pagamento "${name}" criada.`, type: 'create' },
        });

        res.status(201).json(method);
    } catch (error) {
        console.error('Create payment method error:', error);
        res.status(500).json({ error: 'Erro ao criar forma de pagamento.' });
    }
});

paymentMethodsRouter.put('/:id', async (req, res) => {
    try {
        const { name, icon } = req.body;
        const method = await prisma.paymentMethod.update({
            where: { id: req.params.id },
            data: { name, icon },
        });

        await prisma.log.create({
            data: { action: `Forma de pagamento "${method.name}" atualizada.`, type: 'update' },
        });

        res.json(method);
    } catch (error) {
        console.error('Update payment method error:', error);
        res.status(500).json({ error: 'Erro ao atualizar forma de pagamento.' });
    }
});

paymentMethodsRouter.delete('/:id', async (req, res) => {
    try {
        const method = await prisma.paymentMethod.delete({
            where: { id: req.params.id },
        });

        await prisma.log.create({
            data: { action: `Forma de pagamento "${method.name}" excluída.`, type: 'delete' },
        });

        res.json({ message: 'Forma de pagamento excluída.' });
    } catch (error) {
        console.error('Delete payment method error:', error);
        res.status(500).json({ error: 'Erro ao excluir forma de pagamento.' });
    }
});

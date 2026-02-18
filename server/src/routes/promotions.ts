// CRUD de Promoções

import { Router } from 'express';
import { prisma } from '../prisma.js';
import { authMiddleware } from '../middleware/auth.js';

export const promotionsRouter = Router();
promotionsRouter.use(authMiddleware);

// Lista todas as promoções (com produtos vinculados)
promotionsRouter.get('/', async (_req, res) => {
    try {
        const promotions = await prisma.promotion.findMany({
            include: {
                products: { include: { product: true } },
            },
            orderBy: { startDate: 'desc' },
        });

        // Formata para o frontend (usa productIds como array de strings)
        const formatted = promotions.map((p) => ({
            id: p.id,
            name: p.name,
            description: p.description,
            startDate: p.startDate,
            endDate: p.endDate,
            discountType: p.discountType,
            discountValue: p.discountValue,
            productIds: p.products.map((pp) => pp.productId),
        }));

        res.json(formatted);
    } catch (error) {
        console.error('List promotions error:', error);
        res.status(500).json({ error: 'Erro ao listar promoções.' });
    }
});

// Cria uma promoção
promotionsRouter.post('/', async (req, res) => {
    try {
        const { name, description, startDate, endDate, discountType, discountValue, productIds } = req.body;

        const promotion = await prisma.promotion.create({
            data: {
                name,
                description,
                startDate,
                endDate,
                discountType,
                discountValue,
                products: {
                    create: (productIds || []).map((pid: string) => ({ productId: pid })),
                },
            },
            include: { products: true },
        });

        await prisma.log.create({
            data: { action: `Promoção "${name}" criada.`, type: 'create' },
        });

        res.status(201).json({
            ...promotion,
            productIds: promotion.products.map((pp) => pp.productId),
        });
    } catch (error) {
        console.error('Create promotion error:', error);
        res.status(500).json({ error: 'Erro ao criar promoção.' });
    }
});

// Atualiza uma promoção
promotionsRouter.put('/:id', async (req, res) => {
    try {
        const { name, description, startDate, endDate, discountType, discountValue, productIds } = req.body;
        const promotionId = req.params.id;

        // Remove vínculos antigos e recria
        await prisma.promotionProduct.deleteMany({ where: { promotionId } });

        const promotion = await prisma.promotion.update({
            where: { id: promotionId },
            data: {
                name,
                description,
                startDate,
                endDate,
                discountType,
                discountValue,
                products: {
                    create: (productIds || []).map((pid: string) => ({ productId: pid })),
                },
            },
            include: { products: true },
        });

        await prisma.log.create({
            data: { action: `Promoção "${promotion.name}" atualizada.`, type: 'update' },
        });

        res.json({
            ...promotion,
            productIds: promotion.products.map((pp) => pp.productId),
        });
    } catch (error) {
        console.error('Update promotion error:', error);
        res.status(500).json({ error: 'Erro ao atualizar promoção.' });
    }
});

// Exclui uma promoção
promotionsRouter.delete('/:id', async (req, res) => {
    try {
        const promotion = await prisma.promotion.delete({
            where: { id: req.params.id },
        });

        await prisma.log.create({
            data: { action: `Promoção "${promotion.name}" excluída.`, type: 'delete' },
        });

        res.json({ message: 'Promoção excluída.' });
    } catch (error) {
        console.error('Delete promotion error:', error);
        res.status(500).json({ error: 'Erro ao excluir promoção.' });
    }
});

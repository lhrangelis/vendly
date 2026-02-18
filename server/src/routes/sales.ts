// CRUD de Vendas — A rota mais complexa
// Inclui lógica de estoque e atualização de canais via transações

import { Router } from 'express';
import { prisma } from '../prisma.js';
import { authMiddleware } from '../middleware/auth.js';

export const salesRouter = Router();
salesRouter.use(authMiddleware);

// Lista todas as vendas (finalizadas OU rascunhos)
salesRouter.get('/', async (req, res) => {
    try {
        const isDraft = req.query.draft === 'true';
        const sales = await prisma.sale.findMany({
            where: { isDraft },
            include: {
                items: { include: { product: true } },
                channel: true,
                paymentMethod: true,
            },
            orderBy: { createdAt: 'desc' },
        });
        res.json(sales);
    } catch (error) {
        console.error('List sales error:', error);
        res.status(500).json({ error: 'Erro ao listar vendas.' });
    }
});

// Cria uma nova venda (com transação para garantir consistência)
salesRouter.post('/', async (req, res) => {
    try {
        const { items, total, channelId, paymentMethodId, observations, isDraft, createdAt } = req.body;


        const result = await prisma.$transaction(async (tx) => {
            // 1. Cria a venda com seus itens
            const sale = await tx.sale.create({
                data: {
                    total,
                    channelId: channelId || null,
                    paymentMethodId: paymentMethodId || null,
                    observations,
                    isDraft: isDraft || false,
                    ...(createdAt ? { createdAt: new Date(createdAt) } : {}),
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
                    channel: true,
                    paymentMethod: true,
                },
            });

            // Se NÃO é rascunho, atualiza estoque e canal
            if (!isDraft) {
                // 2. Decrementa estoque de cada produto vendido
                for (const item of items) {
                    await tx.product.update({
                        where: { id: item.productId },
                        data: { stock: { decrement: item.quantity } },
                    });
                }

                // 3. Atualiza totais do canal de venda
                if (channelId) {
                    // Calcula o lucro
                    let profit = 0;
                    for (const item of items) {
                        const product = await tx.product.findUnique({ where: { id: item.productId } });
                        if (product) {
                            profit += (item.unitPrice - product.cost) * item.quantity;
                        }
                    }

                    await tx.channel.update({
                        where: { id: channelId },
                        data: {
                            totalSales: { increment: total },
                            totalProfit: { increment: profit },
                        },
                    });
                }

                await tx.log.create({
                    data: {
                        action: `Venda de R$ ${total.toFixed(2)} finalizada.`,
                        type: 'create',
                    },
                });
            } else {
                await tx.log.create({
                    data: { action: 'Rascunho de venda salvo.', type: 'create' },
                });
            }

            return sale;
        });

        res.status(201).json(result);
    } catch (error) {
        console.error('Create sale error:', error);
        res.status(500).json({ error: 'Erro ao criar venda.' });
    }
});

// Atualiza uma venda existente
salesRouter.put('/:id', async (req, res) => {
    try {
        const { items, total, channelId, paymentMethodId, observations, isDraft, createdAt } = req.body;
        const saleId = req.params.id;


        const result = await prisma.$transaction(async (tx) => {
            // Busca a venda original para reverter estoque/canal
            const originalSale = await tx.sale.findUnique({
                where: { id: saleId },
                include: { items: true },
            });

            if (!originalSale) throw new Error('Venda não encontrada');

            // Se a venda original NÃO era rascunho, reverte o estoque
            if (!originalSale.isDraft) {
                for (const item of originalSale.items) {
                    await tx.product.update({
                        where: { id: item.productId },
                        data: { stock: { increment: item.quantity } },
                    });
                }

                // Reverte canal
                if (originalSale.channelId) {
                    let originalProfit = 0;
                    for (const item of originalSale.items) {
                        const product = await tx.product.findUnique({ where: { id: item.productId } });
                        if (product) {
                            originalProfit += (item.unitPrice - product.cost) * item.quantity;
                        }
                    }
                    await tx.channel.update({
                        where: { id: originalSale.channelId },
                        data: {
                            totalSales: { decrement: originalSale.total },
                            totalProfit: { decrement: originalProfit },
                        },
                    });
                }
            }

            // Remove itens antigos
            await tx.saleItem.deleteMany({ where: { saleId } });

            // Atualiza a venda
            const updatedSale = await tx.sale.update({
                where: { id: saleId },
                data: {
                    total,
                    channelId: channelId || null,
                    paymentMethodId: paymentMethodId || null,
                    observations,
                    isDraft: isDraft || false,
                    ...(createdAt ? { createdAt: new Date(createdAt) } : {}),
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
                    channel: true,
                    paymentMethod: true,
                },
            });

            // Se a nova versão NÃO é rascunho, aplica novo estoque e canal
            if (!isDraft) {
                for (const item of items) {
                    await tx.product.update({
                        where: { id: item.productId },
                        data: { stock: { decrement: item.quantity } },
                    });
                }

                if (channelId) {
                    let newProfit = 0;
                    for (const item of items) {
                        const product = await tx.product.findUnique({ where: { id: item.productId } });
                        if (product) {
                            newProfit += (item.unitPrice - product.cost) * item.quantity;
                        }
                    }
                    await tx.channel.update({
                        where: { id: channelId },
                        data: {
                            totalSales: { increment: total },
                            totalProfit: { increment: newProfit },
                        },
                    });
                }
            }

            await tx.log.create({
                data: { action: `Venda #${saleId.slice(-5)} atualizada.`, type: 'update' },
            });

            return updatedSale;
        });

        res.json(result);
    } catch (error) {
        console.error('Update sale error:', error);
        res.status(500).json({ error: 'Erro ao atualizar venda.' });
    }
});

// Exclui uma venda (reverte estoque e canal)
salesRouter.delete('/:id', async (req, res) => {
    try {
        const saleId = req.params.id;

        await prisma.$transaction(async (tx) => {
            const sale = await tx.sale.findUnique({
                where: { id: saleId },
                include: { items: true },
            });

            if (!sale) throw new Error('Venda não encontrada');

            // Reverte estoque se não era rascunho
            if (!sale.isDraft) {
                for (const item of sale.items) {
                    await tx.product.update({
                        where: { id: item.productId },
                        data: { stock: { increment: item.quantity } },
                    });
                }

                // Reverte canal
                if (sale.channelId) {
                    let profit = 0;
                    for (const item of sale.items) {
                        const product = await tx.product.findUnique({ where: { id: item.productId } });
                        if (product) {
                            profit += (item.unitPrice - product.cost) * item.quantity;
                        }
                    }
                    await tx.channel.update({
                        where: { id: sale.channelId },
                        data: {
                            totalSales: { decrement: sale.total },
                            totalProfit: { decrement: profit },
                        },
                    });
                }
            }

            await tx.sale.delete({ where: { id: saleId } });

            const logAction = sale.isDraft
                ? `Rascunho #${saleId.slice(-5)} excluído.`
                : `Venda #${saleId.slice(-5)} excluída.`;
            await tx.log.create({ data: { action: logAction, type: 'delete' } });
        });

        res.json({ message: 'Venda excluída.' });
    } catch (error) {
        console.error('Delete sale error:', error);
        res.status(500).json({ error: 'Erro ao excluir venda.' });
    }
});

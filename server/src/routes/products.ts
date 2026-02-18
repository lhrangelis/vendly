// CRUD de Produtos
// GET /api/products       — Lista todos
// GET /api/products/:id   — Busca um
// POST /api/products      — Cria novo
// PUT /api/products/:id   — Atualiza
// DELETE /api/products/:id — Exclui

import { Router } from 'express';
import { prisma } from '../prisma.js';
import { authMiddleware } from '../middleware/auth.js';

export const productsRouter = Router();

// Protege todas as rotas de produtos
productsRouter.use(authMiddleware);

// Lista todos os produtos (com o nome da categoria incluso)
productsRouter.get('/', async (_req, res) => {
    try {
        const products = await prisma.product.findMany({
            include: { category: true },
            orderBy: { name: 'asc' },
        });
        res.json(products);
    } catch (error) {
        console.error('List products error:', error);
        res.status(500).json({ error: 'Erro ao listar produtos.' });
    }
});

// Busca um produto por ID
productsRouter.get('/:id', async (req, res) => {
    try {
        const product = await prisma.product.findUnique({
            where: { id: req.params.id },
            include: { category: true },
        });
        if (!product) {
            res.status(404).json({ error: 'Produto não encontrado.' });
            return;
        }
        res.json(product);
    } catch (error) {
        console.error('Get product error:', error);
        res.status(500).json({ error: 'Erro ao buscar produto.' });
    }
});

// Cria um novo produto
productsRouter.post('/', async (req, res) => {
    try {
        const { name, description, price, cost, categoryId, stock, weight, dimensions, unitOfMeasure, sku, barcode } = req.body;

        const product = await prisma.product.create({
            data: { name, description, price, cost, categoryId, stock, weight, dimensions, unitOfMeasure, sku, barcode },
            include: { category: true },
        });

        await prisma.log.create({
            data: { action: `Produto "${name}" adicionado.`, type: 'create' },
        });

        res.status(201).json(product);
    } catch (error) {
        console.error('Create product error:', error);
        res.status(500).json({ error: 'Erro ao criar produto.' });
    }
});

// Atualiza um produto
productsRouter.put('/:id', async (req, res) => {
    try {
        const { name, description, price, cost, categoryId, stock, weight, dimensions, unitOfMeasure, sku, barcode } = req.body;

        const product = await prisma.product.update({
            where: { id: req.params.id },
            data: { name, description, price, cost, categoryId, stock, weight, dimensions, unitOfMeasure, sku, barcode },
            include: { category: true },
        });

        await prisma.log.create({
            data: { action: `Produto "${product.name}" atualizado.`, type: 'update' },
        });

        res.json(product);
    } catch (error) {
        console.error('Update product error:', error);
        res.status(500).json({ error: 'Erro ao atualizar produto.' });
    }
});

// Exclui um produto
productsRouter.delete('/:id', async (req, res) => {
    try {
        const product = await prisma.product.delete({
            where: { id: req.params.id },
        });

        await prisma.log.create({
            data: { action: `Produto "${product.name}" excluído.`, type: 'delete' },
        });

        res.json({ message: 'Produto excluído.' });
    } catch (error) {
        console.error('Delete product error:', error);
        res.status(500).json({ error: 'Erro ao excluir produto.' });
    }
});

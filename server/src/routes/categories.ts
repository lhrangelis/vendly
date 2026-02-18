// CRUD de Categorias

import { Router } from 'express';
import { prisma } from '../prisma.js';
import { authMiddleware } from '../middleware/auth.js';

export const categoriesRouter = Router();
categoriesRouter.use(authMiddleware);

// Lista todas as categorias
categoriesRouter.get('/', async (_req, res) => {
    try {
        const categories = await prisma.category.findMany({
            orderBy: { name: 'asc' },
        });
        res.json(categories);
    } catch (error) {
        console.error('List categories error:', error);
        res.status(500).json({ error: 'Erro ao listar categorias.' });
    }
});

// Cria nova categoria
categoriesRouter.post('/', async (req, res) => {
    try {
        const { name } = req.body;
        const category = await prisma.category.create({ data: { name } });

        await prisma.log.create({
            data: { action: `Categoria "${name}" criada.`, type: 'create' },
        });

        res.status(201).json(category);
    } catch (error) {
        console.error('Create category error:', error);
        res.status(500).json({ error: 'Erro ao criar categoria.' });
    }
});

// Exclui uma categoria
categoriesRouter.delete('/:id', async (req, res) => {
    try {
        const category = await prisma.category.delete({
            where: { id: req.params.id },
        });

        await prisma.log.create({
            data: { action: `Categoria "${category.name}" excluída.`, type: 'delete' },
        });

        res.json({ message: 'Categoria excluída.' });
    } catch (error) {
        console.error('Delete category error:', error);
        res.status(500).json({ error: 'Erro ao excluir categoria.' });
    }
});

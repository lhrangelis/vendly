// Perfil do Usuário

import { Router } from 'express';
import { prisma } from '../prisma.js';
import { authMiddleware } from '../middleware/auth.js';

export const usersRouter = Router();
usersRouter.use(authMiddleware);

// Atualiza o perfil do usuário logado
usersRouter.put('/profile', async (req, res) => {
    try {
        const { name, email, avatarUrl } = req.body;

        const user = await prisma.user.update({
            where: { id: req.userId },
            data: { name, email, avatarUrl },
        });

        await prisma.log.create({
            data: { action: `Perfil de "${user.name}" atualizado.`, type: 'update' },
        });

        const { passwordHash, ...userWithoutPassword } = user;
        res.json(userWithoutPassword);
    } catch (error) {
        console.error('Update profile error:', error);
        res.status(500).json({ error: 'Erro ao atualizar perfil.' });
    }
});

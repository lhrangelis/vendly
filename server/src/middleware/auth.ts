// Middleware de autenticação — verifica o token JWT
// É como um "guard" que protege rotas: se não tiver token válido, bloqueia

import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

// Extende o tipo Request do Express para incluir userId
declare global {
    namespace Express {
        interface Request {
            userId?: string;
        }
    }
}

export function authMiddleware(req: Request, res: Response, next: NextFunction): void {
    // Pega o token do header "Authorization: Bearer <token>"
    const authHeader = req.headers.authorization;

    if (!authHeader) {
        res.status(401).json({ error: 'Token não fornecido.' });
        return;
    }

    const parts = authHeader.split(' ');
    if (parts.length !== 2 || parts[0] !== 'Bearer') {
        res.status(401).json({ error: 'Token mal formatado.' });
        return;
    }

    const token = parts[1];

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET || 'fallback-secret') as { userId: string };
        req.userId = decoded.userId;
        next();
    } catch {
        res.status(401).json({ error: 'Token inválido ou expirado.' });
        return;
    }
}

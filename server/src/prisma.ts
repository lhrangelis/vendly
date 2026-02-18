// Instância compartilhada do Prisma Client
// Como ter um único DataModule global no Delphi

import { PrismaClient } from '@prisma/client';

export const prisma = new PrismaClient();

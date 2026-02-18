// Seed — Popula o banco com dados iniciais
// É como rodar um script SQL de INSERT INTO no Delphi

import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
    console.log('🌱 Seeding database...');

    // 1. Criar usuário admin com senha criptografada
    const passwordHash = await bcrypt.hash('admin', 10);
    const user = await prisma.user.upsert({
        where: { email: 'admin@vendly.com' },
        update: {},
        create: {
            name: 'Admin',
            email: 'admin@vendly.com',
            passwordHash,
            avatarUrl: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80',
        },
    });
    console.log('✅ User created:', user.email);

    // 2. Categorias
    const cat1 = await prisma.category.create({ data: { name: 'Eletrônicos' } });
    const cat2 = await prisma.category.create({ data: { name: 'Livros' } });
    const cat3 = await prisma.category.create({ data: { name: 'Roupas' } });
    console.log('✅ Categories created');

    // 3. Produtos
    const prod1 = await prisma.product.create({
        data: {
            name: 'Smartphone Pro',
            description: 'Última geração com câmera tripla.',
            price: 3999.90,
            cost: 2500,
            categoryId: cat1.id,
            stock: 15,
            weight: 0.18,
            dimensions: '15x7x0.8 cm',
            unitOfMeasure: 'un',
            sku: 'SP-PRO-BLK',
            barcode: '1234567890123',
        },
    });
    const prod2 = await prisma.product.create({
        data: {
            name: 'React Avançado',
            description: 'Aprenda hooks e padrões.',
            price: 79.90,
            cost: 30,
            categoryId: cat2.id,
            stock: 50,
        },
    });
    const prod3 = await prisma.product.create({
        data: {
            name: 'Camiseta de Algodão',
            description: 'Confortável e estilosa.',
            price: 59.90,
            cost: 1.00,
            categoryId: cat3.id,
            stock: 1,
        },
    });
    console.log('✅ Products created');

    // 4. Canais de venda
    const ch1 = await prisma.channel.create({
        data: { name: 'Loja Online', icon: 'globe', totalSales: 3999.90, totalProfit: 1499.90 },
    });
    const ch2 = await prisma.channel.create({
        data: { name: 'WhatsApp', icon: 'whatsapp', totalSales: 219.70, totalProfit: 99.70 },
    });
    console.log('✅ Channels created');

    // 5. Formas de pagamento
    const pm1 = await prisma.paymentMethod.create({
        data: { name: 'Cartão de Crédito', icon: 'credit-card' },
    });
    const pm2 = await prisma.paymentMethod.create({
        data: { name: 'Pix', icon: 'pix' },
    });
    console.log('✅ Payment methods created');

    // 6. Vendas com itens
    await prisma.sale.create({
        data: {
            total: 3999.90,
            channelId: ch1.id,
            paymentMethodId: pm1.id,
            items: {
                create: [
                    { productId: prod1.id, quantity: 1, unitPrice: 3999.90 },
                ],
            },
        },
    });
    await prisma.sale.create({
        data: {
            total: 219.70,
            channelId: ch2.id,
            paymentMethodId: pm2.id,
            items: {
                create: [
                    { productId: prod2.id, quantity: 2, unitPrice: 79.90 },
                    { productId: prod3.id, quantity: 1, unitPrice: 59.90 },
                ],
            },
        },
    });
    await prisma.sale.create({
        data: {
            total: 179.70,
            items: {
                create: [
                    { productId: prod3.id, quantity: 3, unitPrice: 59.90 },
                ],
            },
        },
    });
    console.log('✅ Sales created');

    // 7. Log inicial
    await prisma.log.create({
        data: { action: 'Sistema inicializado com dados de exemplo.', type: 'info' },
    });
    console.log('✅ Log created');

    console.log('🎉 Seed completed!');
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });

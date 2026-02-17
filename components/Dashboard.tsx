
import React, { useMemo } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import type { Sale, Product, Category } from '../types';
import { useTheme } from '../contexts/ThemeContext';
import { SalesIcon, ProfitIcon, ItemsSoldIcon, TagIcon } from './icons/Icons';

interface DashboardProps {
  sales: Sale[];
  products: Product[];
  categories: Category[];
}

const CustomStatCard: React.FC<{ title: string; value: string; icon: React.ReactNode; colorClass: string; }> = ({ title, value, icon, colorClass }) => (
    <div className="bg-card dark:bg-dark-card p-6 rounded-2xl shadow-lg border border-border dark:border-dark-border transition-transform duration-300 hover:-translate-y-1 hover:shadow-2xl">
        <div className="flex justify-between items-start">
            <div className="flex flex-col">
                <p className="text-sm font-medium text-text-secondary dark:text-dark-text-secondary">{title}</p>
                <p className="text-3xl font-bold text-text-primary dark:text-dark-text-primary mt-1">{value}</p>
            </div>
            <div className={`p-3 rounded-lg ${colorClass}`}>
                {icon}
            </div>
        </div>
    </div>
);

const CustomBarChartTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
        return (
            <div className="bg-card dark:bg-dark-card/80 backdrop-blur-sm p-3 rounded-lg shadow-xl border border-border dark:border-dark-border">
                <p className="font-bold text-sm text-text-primary dark:text-dark-text-primary">{label}</p>
                <p className="text-primary mt-1">{`Vendas: ${new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(payload[0].value)}`}</p>
            </div>
        );
    }
    return null;
};

const Dashboard: React.FC<DashboardProps> = ({ sales, products, categories }) => {
    const { theme } = useTheme();
    
    const { totalRevenue, netProfit, totalSalesCount, totalItemsSold } = useMemo(() => {
        const revenue = sales.reduce((acc, sale) => acc + sale.total, 0);
        const itemsSold = sales.reduce((acc, sale) => acc + sale.items.reduce((itemAcc, item) => itemAcc + item.quantity, 0), 0);
        const costOfGoods = sales.reduce((acc, sale) => {
            const saleCost = sale.items.reduce((itemAcc, item) => {
                const product = products.find(p => p.id === item.productId);
                return itemAcc + (product ? product.cost * item.quantity : 0);
            }, 0);
            return acc + saleCost;
        }, 0);
        return {
            totalRevenue: revenue,
            netProfit: revenue - costOfGoods,
            totalSalesCount: sales.length,
            totalItemsSold: itemsSold,
        };
    }, [sales, products]);

    const salesByDayChartData = useMemo(() => {
        const salesByDay = sales.reduce((acc, sale) => {
            const date = new Date(sale.createdAt).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' });
            if (!acc[date]) acc[date] = 0;
            acc[date] += sale.total;
            return acc;
        }, {} as Record<string, number>);

        return Object.keys(salesByDay).map(date => ({
            name: date,
            Vendas: salesByDay[date],
        })).slice(-7); // Last 7 days
    }, [sales]);

    const salesByCategoryPieData = useMemo(() => {
        const salesByCategory = sales.reduce((acc, sale) => {
            sale.items.forEach(item => {
                const product = products.find(p => p.id === item.productId);
                if (product) {
                    const category = categories.find(c => c.id === product.categoryId);
                    const categoryName = category ? category.name : 'Sem Categoria';
                    if (!acc[categoryName]) acc[categoryName] = 0;
                    acc[categoryName] += item.quantity * item.unitPrice;
                }
            });
            return acc;
        }, {} as Record<string, number>);

        return Object.keys(salesByCategory).map(name => ({
            name,
            value: salesByCategory[name],
        }));
    }, [sales, products, categories]);

    const topSellingProducts = useMemo(() => {
        const productCount = new Map<string, number>();
        sales.forEach(sale => {
            sale.items.forEach(item => {
                productCount.set(item.productId, (productCount.get(item.productId) || 0) + item.quantity);
            });
        });
        return Array.from(productCount.entries())
            .sort(([, qtyA], [, qtyB]) => qtyB - qtyA)
            .slice(0, 5)
            .map(([productId, quantity]) => ({
                product: products.find(p => p.id === productId),
                quantity,
            }));
    }, [sales, products]);

    const COLORS = ['rgb(99, 102, 241)', 'rgb(20, 184, 166)', 'rgb(245, 158, 11)', 'rgb(59, 130, 246)', 'rgb(239, 68, 68)', 'rgb(139, 92, 246)'];
    const tickColor = theme === 'light' ? 'rgb(100, 116, 139)' : 'rgb(148, 163, 184)';
    const gridColor = theme === 'light' ? 'rgba(226, 232, 240, 0.6)' : 'rgba(51, 65, 85, 0.6)';

  return (
    <div className="space-y-8">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <CustomStatCard title="Receita Total" value={totalRevenue.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })} icon={<SalesIcon className="h-6 w-6 text-primary" />} colorClass="bg-primary/10" />
            <CustomStatCard title="Lucro Líquido" value={netProfit.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })} icon={<ProfitIcon className="h-6 w-6 text-secondary" />} colorClass="bg-secondary/10" />
            <CustomStatCard title="Vendas Realizadas" value={totalSalesCount.toString()} icon={<TagIcon className="h-6 w-6 text-amber-500" />} colorClass="bg-amber-500/10" />
            <CustomStatCard title="Itens Vendidos" value={totalItemsSold.toString()} icon={<ItemsSoldIcon className="h-6 w-6 text-sky-500" />} colorClass="bg-sky-500/10" />
        </div>
        
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
            <div className="xl:col-span-2 bg-card dark:bg-dark-card p-6 rounded-2xl shadow-lg border border-border dark:border-dark-border">
                <h3 className="text-lg font-semibold text-text-primary dark:text-dark-text-primary mb-4">Vendas nos Últimos 7 Dias</h3>
                <ResponsiveContainer width="100%" height={350}>
                    <BarChart data={salesByDayChartData} margin={{ top: 5, right: 20, left: 20, bottom: 5 }}>
                        <defs>
                            <linearGradient id="colorVendas" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="rgb(99, 102, 241)" stopOpacity={0.8}/>
                                <stop offset="95%" stopColor="rgb(99, 102, 241)" stopOpacity={0.1}/>
                            </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" stroke={gridColor} />
                        <XAxis dataKey="name" tick={{ fill: tickColor, fontSize: 12 }} axisLine={false} tickLine={false} />
                        <YAxis tickFormatter={(value) => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL', notation: 'compact' }).format(value as number)} tick={{ fill: tickColor, fontSize: 12 }} axisLine={false} tickLine={false} />
                        <Tooltip content={<CustomBarChartTooltip />} cursor={{ fill: 'rgba(99, 102, 241, 0.1)' }}/>
                        <Bar dataKey="Vendas" fill="url(#colorVendas)" radius={[8, 8, 0, 0]} />
                    </BarChart>
                </ResponsiveContainer>
            </div>
            
            <div className="space-y-6">
                <div className="bg-card dark:bg-dark-card p-6 rounded-2xl shadow-lg border border-border dark:border-dark-border">
                    <h3 className="text-lg font-semibold text-text-primary dark:text-dark-text-primary mb-4">Vendas por Categoria</h3>
                    <ResponsiveContainer width="100%" height={200}>
                        <PieChart>
                            <Pie
                                data={salesByCategoryPieData}
                                cx="50%"
                                cy="50%"
                                innerRadius={60}
                                outerRadius={80}
                                fill="#8884d8"
                                paddingAngle={5}
                                dataKey="value"
                                nameKey="name"
                            >
                                {salesByCategoryPieData.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                ))}
                            </Pie>
                            <Tooltip formatter={(value: number) => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value)} />
                        </PieChart>
                    </ResponsiveContainer>
                    <div className="mt-4 flex flex-wrap justify-center gap-x-4 gap-y-2">
                        {salesByCategoryPieData.map((entry, index) => (
                            <div key={`legend-${index}`} className="flex items-center text-sm">
                                <span className="w-3 h-3 rounded-full mr-2" style={{ backgroundColor: COLORS[index % COLORS.length] }}></span>
                                <span className="text-text-secondary dark:text-dark-text-secondary">{entry.name}</span>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="bg-card dark:bg-dark-card p-6 rounded-2xl shadow-lg border border-border dark:border-dark-border">
                    <h3 className="text-lg font-semibold text-text-primary dark:text-dark-text-primary">Top Produtos</h3>
                     <ul className="mt-4 space-y-3">
                        {topSellingProducts.map(({ product, quantity }) => product ? (
                            <li key={product.id} className="flex justify-between items-center text-sm">
                                <div>
                                    <p className="font-medium text-text-primary dark:text-dark-text-primary">{product.name}</p>
                                    <p className="text-xs text-text-secondary dark:text-dark-text-secondary">{categories.find(c => c.id === product.categoryId)?.name}</p>
                                </div>
                                <span className="font-bold text-primary bg-primary/10 px-2 py-1 rounded-md">{quantity} un.</span>
                            </li>
                        ) : null)}
                    </ul>
                </div>
            </div>
        </div>
    </div>
  );
};

export default Dashboard;

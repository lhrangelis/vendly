
import React, { useMemo, useState } from 'react';
import type { Sale, Product, Category, Channel, SaleItem } from '../types';
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, ComposedChart } from 'recharts';
import { useTheme } from '../contexts/ThemeContext';
import { WarningIcon, XCircleIcon, SalesIcon, ProfitIcon, PercentageIcon, AnalyticsIcon } from './icons/Icons';

interface AnalyticsProps {
  sales: Sale[];
  products: Product[];
  categories: Category[];
  channels: Channel[];
}

type DateFilter = 'all' | '7d' | '30d' | '365d';

const formatCurrency = (value: number) => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);
const formatCompact = (value: number) => new Intl.NumberFormat('pt-BR', { notation: 'compact', compactDisplay: 'short' }).format(value);

const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
        const dataPoint = payload[0].payload;
        return (
            <div className="bg-card dark:bg-dark-card/80 backdrop-blur-sm p-3 rounded-lg shadow-xl border border-border dark:border-dark-border">
                <p className="font-bold text-sm text-text-primary dark:text-dark-text-primary">{label}</p>
                {payload.map((pld: any) => (
                    <div key={pld.dataKey} style={{ color: pld.color }} className="mt-1">
                        {pld.name}: {pld.dataKey === 'Margem (%)' ? `${pld.value.toFixed(2)}%` : formatCurrency(pld.value)}
                    </div>
                ))}
                {(dataPoint.VendasRealizadas !== undefined || dataPoint.ItensVendidos !== undefined) && (
                    <div className="mt-2 pt-2 border-t border-border/50 dark:border-dark-border/50">
                        {dataPoint.VendasRealizadas !== undefined && (
                             <p className="text-xs text-text-secondary dark:text-dark-text-secondary">
                                Vendas no dia: <span className="font-bold text-text-primary dark:text-dark-text-primary">{dataPoint.VendasRealizadas}</span>
                             </p>
                        )}
                        {dataPoint.ItensVendidos !== undefined && (
                             <p className="text-xs text-text-secondary dark:text-dark-text-secondary mt-1">
                                Itens vendidos: <span className="font-bold text-text-primary dark:text-dark-text-primary">{dataPoint.ItensVendidos}</span>
                             </p>
                        )}
                    </div>
                )}
            </div>
        );
    }
    return null;
};

const StatCard: React.FC<{
  title: string;
  value: string;
  icon: React.ReactNode;
  colorClass: string;
  footer?: string;
}> = ({ title, value, icon, colorClass, footer }) => (
  <div className="bg-card dark:bg-dark-card p-6 rounded-2xl shadow-lg border border-border dark:border-dark-border transition-transform duration-300 hover:-translate-y-1">
    <div className="flex justify-between items-start">
        <div>
            <p className="text-sm font-medium text-text-secondary dark:text-dark-text-secondary">{title}</p>
            <p className="text-2xl font-bold text-text-primary dark:text-dark-text-primary mt-1">{value}</p>
        </div>
        <div className={`p-3 rounded-lg ${colorClass}`}>
            {icon}
        </div>
    </div>
    {footer && <p className="text-xs text-text-secondary dark:text-dark-text-secondary mt-4">{footer}</p>}
  </div>
);

const FilterButton: React.FC<{ label: string; isActive: boolean; onClick: () => void; }> = ({ label, isActive, onClick }) => (
    <button
        onClick={onClick}
        className={`px-4 py-2 text-sm font-semibold rounded-lg transition-colors ${
            isActive
                ? 'bg-primary text-white shadow'
                : 'bg-card dark:bg-dark-card/50 text-text-secondary dark:text-dark-text-secondary hover:bg-slate-100 dark:hover:bg-dark-card'
        }`}
    >
        {label}
    </button>
);


const Analytics: React.FC<AnalyticsProps> = ({ sales, products, categories, channels }) => {
    const { theme } = useTheme();
    const [dateFilter, setDateFilter] = useState<DateFilter>('all');
    const tickColor = theme === 'light' ? 'rgb(100, 116, 139)' : 'rgb(148, 163, 184)';
    const gridColor = theme === 'light' ? 'rgba(226, 232, 240, 0.6)' : 'rgba(51, 65, 85, 0.6)';

    const filteredSales = useMemo(() => {
        if (dateFilter === 'all') return sales;
        
        const now = new Date();
        const daysToSubtract = { '7d': 7, '30d': 30, '365d': 365 }[dateFilter];
        const cutoffDate = new Date();
        cutoffDate.setDate(now.getDate() - daysToSubtract);
        
        return sales.filter(sale => new Date(sale.createdAt) >= cutoffDate);
    }, [sales, dateFilter]);

    const calculateSaleProfit = (saleItems: SaleItem[]): number => {
      return saleItems.reduce((profit, item) => {
          const product = products.find(p => p.id === item.productId);
          const itemCost = product ? product.cost * item.quantity : 0;
          return profit + (item.unitPrice * item.quantity - itemCost);
      }, 0);
    };

    const { totalRevenue, totalProfit, overallProfitMargin, salesProjection } = useMemo(() => {
        const revenue = filteredSales.reduce((acc, sale) => acc + sale.total, 0);
        const profit = filteredSales.reduce((acc, sale) => acc + calculateSaleProfit(sale.items), 0);
        
        const margin = revenue > 0 ? (profit / revenue) * 100 : 0;
        
        const periodInDays = (() => {
            if (dateFilter === 'all') {
                if (filteredSales.length < 2) return 1;
                const dates = filteredSales.map(s => new Date(s.createdAt).getTime());
                const diffTime = Math.max(...dates) - Math.min(...dates);
                return Math.max(1, Math.ceil(diffTime / (1000 * 60 * 60 * 24)));
            }
            return { '7d': 7, '30d': 30, '365d': 365 }[dateFilter];
        })();

        const averageDailyRevenue = periodInDays > 0 ? revenue / periodInDays : 0;
        const next30DaysProjection = averageDailyRevenue * 30;

        return { 
            totalRevenue: revenue, 
            totalProfit: profit,
            overallProfitMargin: margin,
            salesProjection: { averageDailyRevenue, next30DaysProjection, periodInDays }
        };
    }, [filteredSales, products, dateFilter]);

    // Fix: Explicitly typed reduce accumulator to avoid 'unknown' property access errors
    const financialEvolutionData = useMemo(() => {
        const dataByDay = filteredSales.reduce<Record<string, { revenue: number; profit: number; salesCount: number; itemsSold: number; }>>((acc, sale) => {
            const date = new Date(sale.createdAt).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' });
            if (!acc[date]) {
                acc[date] = { revenue: 0, profit: 0, salesCount: 0, itemsSold: 0 };
            }
            
            const dayData = acc[date];
            dayData.revenue += sale.total;
            dayData.profit += calculateSaleProfit(sale.items);
            dayData.salesCount += 1;
            dayData.itemsSold += sale.items.reduce((sum, item) => sum + item.quantity, 0);

            return acc;
        }, {});

        return Object.entries(dataByDay).map(([date, values]) => ({
            name: date,
            Receita: values.revenue,
            Lucro: values.profit,
            'Margem (%)': values.revenue > 0 ? (values.profit / values.revenue) * 100 : 0,
            VendasRealizadas: values.salesCount,
            ItensVendidos: values.itemsSold,
        })).sort((a, b) => {
            const [dayA, monthA] = a.name.split('/');
            const [dayB, monthB] = b.name.split('/');
            return new Date(2000, Number(monthA) - 1, Number(dayA)).getTime() - new Date(2000, Number(monthB) - 1, Number(dayB)).getTime();
        });
    }, [filteredSales, products]);

    const topSellingProducts = useMemo(() => {
        const productCount = new Map<string, { quantity: number, revenue: number }>();
        filteredSales.forEach(sale => {
            sale.items.forEach(item => {
                const current = productCount.get(item.productId) || { quantity: 0, revenue: 0 };
                current.quantity += item.quantity;
                current.revenue += item.quantity * item.unitPrice;
                productCount.set(item.productId, current);
            });
        });
        return Array.from(productCount.entries())
            .map(([productId, data]) => ({
                product: products.find(p => p.id === productId),
                ...data,
            }))
            .filter(
                (p): p is { product: Product; quantity: number; revenue: number } =>
                    Boolean(p.product),
            )
            .sort((a, b) => b.quantity - a.quantity)
            .slice(0, 5);
    }, [filteredSales, products]);
    
    const topProfitableProducts = useMemo(() => {
        const productProfit = new Map<string, number>();
        filteredSales.forEach(sale => {
            sale.items.forEach(item => {
                const product = products.find(p => p.id === item.productId);
                if (product) {
                    const profit = (item.unitPrice - product.cost) * item.quantity;
                    productProfit.set(item.productId, (productProfit.get(item.productId) || 0) + profit);
                }
            });
        });
        return Array.from(productProfit.entries())
            .map(([productId, totalProfit]) => ({
                product: products.find(p => p.id === productId),
                totalProfit,
            }))
            .filter((p): p is { product: Product, totalProfit: number } => Boolean(p.product))
            .sort((a, b) => b.totalProfit - a.totalProfit)
            .slice(0, 5);
    }, [filteredSales, products]);

    // Fix: Added explicit Record type to the accumulator to prevent 'unknown' inference
    const monthlyComparisonData = useMemo(() => {
        const dataByMonth = sales.reduce<Record<string, { revenue: number, profit: number, date: Date }>>((acc, sale) => {
            const date = new Date(sale.createdAt);
            const monthKey = `${date.toLocaleString('pt-BR', { month: 'short' })}/${date.getFullYear().toString().slice(-2)}`;
            
            if (!acc[monthKey]) {
                acc[monthKey] = { revenue: 0, profit: 0, date: date };
            }
            
            const monthData = acc[monthKey];
            monthData.revenue += sale.total;
            monthData.profit += calculateSaleProfit(sale.items);
            
            return acc;
        }, {});

        return Object.entries(dataByMonth)
            .map(([name, values]) => ({
                name,
                Receita: values.revenue,
                Lucro: values.profit,
                date: values.date,
            }))
            .sort((a, b) => a.date.getTime() - b.date.getTime())
            .slice(-12);
    }, [sales, products]);

    // Fix: Explicitly typed reduce result and utilized safe property access within the loop
    const salesByChannelData = useMemo(() => {
        const channelStats = channels.reduce<Record<string, {name: string, Vendas: number, Lucro: number}>>((acc, channel) => {
            acc[channel.id] = { name: channel.name, Vendas: 0, Lucro: 0 };
            return acc;
        }, {});

        filteredSales.forEach(sale => {
            if (sale.channelId) {
                const stats = channelStats[sale.channelId];
                if (stats) {
                    const profit = calculateSaleProfit(sale.items);
                    stats.Vendas += sale.total;
                    stats.Lucro += profit;
                }
            }
        });

        return Object.values(channelStats).sort((a, b) => b.Vendas - a.Vendas);
    }, [filteredSales, channels, products]);

    const stockAlerts = useMemo(() => {
        return products
          .filter(p => p.stock < 10)
          .sort((a, b) => a.stock - b.stock);
    }, [products]);

    const recentSales = useMemo(() => {
        return [...filteredSales].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()).slice(0, 5);
    }, [filteredSales]);

    return (
        <div className="space-y-8">
            <div className="flex flex-col sm:flex-row justify-between items-start gap-4">
              <div>
                  <h2 className="text-4xl font-bold tracking-tight text-text-primary dark:text-slate-200">Análise Detalhada</h2>
                  <p className="text-text-secondary dark:text-slate-400 mt-1">Visão completa do desempenho da sua loja.</p>
              </div>
              <div className="flex-shrink-0 bg-card dark:bg-dark-card/50 p-1.5 rounded-xl flex items-center gap-1">
                <FilterButton label="Tudo" isActive={dateFilter === 'all'} onClick={() => setDateFilter('all')} />
                <FilterButton label="7 dias" isActive={dateFilter === '7d'} onClick={() => setDateFilter('7d')} />
                <FilterButton label="30 dias" isActive={dateFilter === '30d'} onClick={() => setDateFilter('30d')} />
                <FilterButton label="1 ano" isActive={dateFilter === '365d'} onClick={() => setDateFilter('365d')} />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                <StatCard title="Receita Total" value={formatCurrency(totalRevenue)} icon={<SalesIcon className="h-6 w-6 text-primary" />} colorClass="bg-primary/10" />
                <StatCard title="Lucro Total" value={formatCurrency(totalProfit)} icon={<ProfitIcon className="h-6 w-6 text-secondary" />} colorClass="bg-secondary/10" />
                <StatCard title="Margem de Lucro" value={`${overallProfitMargin.toFixed(1)}%`} icon={<PercentageIcon className="h-6 w-6 text-amber-500" />} colorClass="bg-amber-500/10" />
                <StatCard title="Projeção (30d)" value={formatCurrency(salesProjection.next30DaysProjection)} icon={<AnalyticsIcon className="h-6 w-6 text-sky-500" />} colorClass="bg-sky-500/10" footer={`Média diária (${salesProjection.periodInDays}d): ${formatCurrency(salesProjection.averageDailyRevenue)}`} />
            </div>

            <div className="bg-card dark:bg-dark-card p-6 rounded-2xl shadow-lg border border-border dark:border-dark-border">
                <h3 className="text-lg font-semibold text-text-primary dark:text-dark-text-primary mb-4">Evolução Financeira</h3>
                {filteredSales.length > 0 ? (
                    <ResponsiveContainer width="100%" height={300}>
                        <ComposedChart data={financialEvolutionData} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
                            <CartesianGrid strokeDasharray="3 3" stroke={gridColor} />
                            <XAxis dataKey="name" tick={{ fill: tickColor, fontSize: 12 }} axisLine={false} tickLine={false} />
                            <YAxis yAxisId="left" tickFormatter={(value) => formatCompact(value as number)} tick={{ fill: tickColor, fontSize: 12 }} axisLine={false} tickLine={false} />
                            <YAxis yAxisId="right" orientation="right" tickFormatter={(value) => `${value.toFixed(0)}%`} tick={{ fill: 'rgb(245, 158, 11)', fontSize: 12 }} axisLine={false} tickLine={false} />
                            <Tooltip content={<CustomTooltip />} />
                            <Legend wrapperStyle={{fontSize: "14px"}} />
                            <Bar yAxisId="left" dataKey="Receita" fill="rgba(99, 102, 241, 0.7)" radius={[4, 4, 0, 0]} barSize={20} />
                            <Line yAxisId="left" type="monotone" dataKey="Lucro" stroke="rgb(20, 184, 166)" strokeWidth={2} dot={{ r: 4 }} activeDot={{ r: 6 }} />
                            <Line yAxisId="right" type="monotone" dataKey="Margem (%)" stroke="rgb(245, 158, 11)" strokeWidth={2} strokeDasharray="5 5" dot={false} />
                        </ComposedChart>
                    </ResponsiveContainer>
                ) : (
                    <p className="text-center py-20 text-text-secondary dark:text-dark-text-secondary">Nenhum dado de venda para o período selecionado.</p>
                )}
            </div>

            <div className="bg-card dark:bg-dark-card p-6 rounded-2xl shadow-lg border border-border dark:border-dark-border">
                <h3 className="text-lg font-semibold text-text-primary dark:text-dark-text-primary mb-4">Comparativo Mensal (Últimos 12 meses)</h3>
                {monthlyComparisonData.length > 0 ? (
                    <ResponsiveContainer width="100%" height={300}>
                        <BarChart data={monthlyComparisonData} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
                            <CartesianGrid strokeDasharray="3 3" stroke={gridColor} />
                            <XAxis dataKey="name" tick={{ fill: tickColor, fontSize: 12 }} axisLine={false} tickLine={false} />
                            <YAxis tickFormatter={(value) => formatCompact(value as number)} tick={{ fill: tickColor, fontSize: 12 }} axisLine={false} tickLine={false} />
                            <Tooltip content={<CustomTooltip />} />
                            <Legend wrapperStyle={{fontSize: "14px"}} />
                            <Bar dataKey="Receita" fill="rgba(99, 102, 241, 0.7)" radius={[4, 4, 0, 0]} />
                            <Bar dataKey="Lucro" fill="rgba(20, 184, 166, 0.8)" radius={[4, 4, 0, 0]} />
                        </BarChart>
                    </ResponsiveContainer>
                ) : (
                    <p className="text-center py-20 text-text-secondary dark:text-dark-text-secondary">Dados insuficientes para o comparativo mensal.</p>
                )}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="bg-card dark:bg-dark-card p-6 rounded-2xl shadow-lg border border-border dark:border-dark-border">
                    <h3 className="text-lg font-semibold text-text-primary dark:text-dark-text-primary">Top 5 Produtos (Unidades)</h3>
                        {filteredSales.length > 0 ? (
                        <ul className="mt-4 space-y-3">
                            {topSellingProducts.map(({ product, quantity }) => product ? (
                                <li key={product.id} className="flex justify-between items-center text-sm">
                                    <div>
                                        <p className="font-semibold text-text-primary dark:text-dark-text-primary">{product.name}</p>
                                        <p className="text-xs text-text-secondary dark:text-dark-text-secondary">{categories.find(c => c.id === product.categoryId)?.name}</p>
                                    </div>
                                    <span className="font-bold text-primary bg-primary/10 px-2 py-1 rounded-md">{quantity} un.</span>
                                </li>
                            ) : null)}
                        </ul>
                        ) : (
                           <p className="text-center py-10 text-sm text-text-secondary dark:text-dark-text-secondary">Sem dados de produtos.</p>
                        )}
                </div>
                
                 <div className="bg-card dark:bg-dark-card p-6 rounded-2xl shadow-lg border border-border dark:border-dark-border">
                    <h3 className="text-lg font-semibold text-text-primary dark:text-dark-text-primary">Top 5 Produtos (Lucro)</h3>
                        {filteredSales.length > 0 ? (
                        <ul className="mt-4 space-y-3">
                            {topProfitableProducts.map(({ product, totalProfit }) => product ? (
                                <li key={product.id} className="flex justify-between items-center text-sm">
                                    <div>
                                        <p className="font-semibold text-text-primary dark:text-dark-text-primary">{product.name}</p>
                                        <p className="text-xs text-text-secondary dark:text-dark-text-secondary">{categories.find(c => c.id === product.categoryId)?.name}</p>
                                    </div>
                                    <span className="font-bold text-secondary bg-secondary/10 px-2 py-1 rounded-md">{formatCurrency(totalProfit)}</span>
                                </li>
                            ) : null)}
                        </ul>
                        ) : (
                           <p className="text-center py-10 text-sm text-text-secondary dark:text-dark-text-secondary">Sem dados de lucro.</p>
                        )}
                </div>

                <div className="bg-card dark:bg-dark-card p-6 rounded-2xl shadow-lg border border-border dark:border-dark-border lg:col-span-2">
                    <h3 className="text-lg font-semibold text-text-primary dark:text-dark-text-primary mb-4">Vendas por Canal</h3>
                    {filteredSales.length > 0 ? (
                        <ResponsiveContainer width="100%" height={200}>
                            <BarChart data={salesByChannelData} layout="vertical" margin={{ top: 0, right: 30, left: 60, bottom: 0 }}>
                            <CartesianGrid strokeDasharray="3 3" stroke={gridColor} horizontal={false} />
                            <XAxis type="number" tickFormatter={(value) => formatCompact(value as number)} tick={{ fill: tickColor, fontSize: 12 }} axisLine={false} tickLine={false} />
                            <YAxis type="category" dataKey="name" tick={{ fill: tickColor, fontSize: 12, textAnchor: 'end' }} axisLine={false} tickLine={false} interval={0} />
                            <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(99, 102, 241, 0.1)' }}/>
                            <Bar dataKey="Vendas" fill="rgb(99, 102, 241)" radius={[0, 8, 8, 0]} barSize={20} />
                            </BarChart>
                        </ResponsiveContainer>
                    ) : (
                         <p className="text-center py-10 text-sm text-text-secondary dark:text-dark-text-secondary">Sem dados de canais.</p>
                    )}
                </div>
            </div>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="bg-card dark:bg-dark-card p-6 rounded-2xl shadow-lg border border-border dark:border-dark-border">
                    <h3 className="text-lg font-semibold text-text-primary dark:text-dark-text-primary">Alertas de Estoque (&lt; 10 unidades)</h3>
                    {stockAlerts.length > 0 ? (
                        <ul className="mt-4 space-y-2 max-h-60 overflow-y-auto pr-2">
                            {stockAlerts.map(product => (
                                <li key={product.id} className="flex items-center gap-3 p-2 rounded-lg hover:bg-slate-50 dark:hover:bg-dark-card/50">
                                    {product.stock === 0 ? <XCircleIcon className="h-5 w-5 text-red-500 flex-shrink-0" /> : <WarningIcon className="h-5 w-5 text-amber-500 flex-shrink-0" />}
                                    <div className="flex-grow">
                                        <p className="font-medium text-sm text-text-primary dark:text-dark-text-primary">{product.name}</p>
                                    </div>
                                    <span className={`text-sm font-bold ${product.stock === 0 ? 'text-red-500' : 'text-amber-500'}`}>{product.stock} un.</span>
                                </li>
                            ))}
                        </ul>
                    ) : (
                        <p className="mt-4 text-center py-8 text-sm text-text-secondary dark:text-dark-text-secondary">Nenhum alerta de estoque baixo.</p>
                    )}
                </div>
                 <div className="bg-card dark:bg-dark-card p-6 rounded-2xl shadow-lg border border-border dark:border-dark-border">
                    <h3 className="text-lg font-semibold text-text-primary dark:text-dark-text-primary">Transações Recentes</h3>
                    <ul className="mt-4 space-y-3 max-h-60 overflow-y-auto pr-2">
                        {recentSales.length > 0 ? recentSales.map(sale => (
                            <li key={sale.id} className="flex justify-between items-center text-sm border-b border-border dark:border-dark-border/50 pb-2 last:border-0">
                                <div>
                                    <p className="font-medium text-text-primary dark:text-dark-text-primary">{sale.items.length} {sale.items.length > 1 ? 'itens' : 'item'}</p>
                                    <p className="text-xs text-text-secondary dark:text-dark-text-secondary">{new Date(sale.createdAt).toLocaleString('pt-BR', {day:'2-digit', month: '2-digit'})}</p>
                                </div>
                                <span className="font-bold text-secondary">{formatCurrency(sale.total)}</span>
                            </li>
                        )) : <p className="mt-4 text-center py-8 text-sm text-text-secondary dark:text-dark-text-secondary">Nenhuma venda registrada.</p>}
                    </ul>
                </div>
            </div>
        </div>
    );
};

export default Analytics;

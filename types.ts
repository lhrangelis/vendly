
export interface Category {
  id: string;
  name: string;
}

export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  cost: number;
  categoryId: string;
  stock: number;
  weight?: number;
  dimensions?: string;
  unitOfMeasure?: string;
  sku?: string;
  barcode?: string;
}

export interface SaleItem {
  productId: string;
  quantity: number;
  unitPrice: number;
}

export interface Sale {
  id: string;
  items: SaleItem[];
  total: number;
  createdAt: string;
  updatedAt: string;
  channelId?: string;
  paymentMethodId?: string;
  observations?: string;
}

export interface Budget {
  id: string;
  items: SaleItem[];
  total: number;
  clientName?: string;
  clientContact?: string;
  validUntil?: string;
  observations?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Channel {
  id:string;
  name: string;
  icon?: string;
  totalSales: number;
  totalProfit: number;
}

export interface PaymentMethod {
  id: string;
  name: string;
  icon?: string;
}

export interface Log {
  id: string;
  timestamp: string;
  action: string;
  type: 'create' | 'update' | 'delete' | 'info';
}

export interface User {
  id: string;
  name: string;
  email: string;
  avatarUrl?: string;
}

export interface Promotion {
  id: string;
  name: string;
  description?: string;
  startDate: string; // ISO string date YYYY-MM-DD
  endDate: string; // ISO string date YYYY-MM-DD
  productIds: string[];
  discountType: 'percentage' | 'fixed';
  discountValue: number;
}

export type View = 'dashboard' | 'products' | 'categories' | 'sales' | 'channels' | 'paymentMethods' | 'admin' | 'profile' | 'analytics' | 'budget' | 'promotions';

export interface Notification {
    id:string;
    productName: string;
    type: 'low_stock' | 'out_of_stock';
    message: string;
}

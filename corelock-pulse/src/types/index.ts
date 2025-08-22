export interface TokenData {
  mint: string;
  price: number;
  volume24h: number;
  marketCap: number;
  holders: number;
  priceChange24h: number;
}

export interface Transaction {
  signature: string;
  type: 'buy' | 'sell';
  amount: number;
  price: number;
  timestamp: number;
  wallet: string;
  uiAmount: number;
}

export interface WalletBalance {
  address: string;
  balance: number;
  uiBalance: number;
  percentage: number;
}

export interface PricePoint {
  timestamp: number;
  price: number;
  volume: number;
}

export interface FieldEvent {
  type: 'buy' | 'sell' | 'pulse';
  intensity: number;
  position: { x: number; y: number };
  timestamp: number;
}
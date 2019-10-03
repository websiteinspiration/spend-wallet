export interface Wallet {
  title?: string;
  image?: string;
  color?: string;
  symbol?: string;
  balance?: number;
  balanceFormatted?: string;
  balanceCurrency?: number;
  balanceCurrencyFormatted?: string;
  isActive?: boolean;
  isDefault?: boolean;
  symbolData?: any;
}

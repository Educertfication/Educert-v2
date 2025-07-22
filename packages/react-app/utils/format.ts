import { formatEther as viemFormatEther, formatUnits } from 'viem';

export function formatAddress(address: string): string {
  if (!address) return 'N/A';
  return `${address.slice(0, 6)}...${address.slice(-4)}`;
}

export function formatEther(value: bigint | string): string {
  try {
    return viemFormatEther(BigInt(value));
  } catch {
    return '0';
  }
}

export function formatEtherValue(value: bigint | string): string {
  try {
    return viemFormatEther(BigInt(value));
  } catch {
    return '0';
  }
}

export function formatUnitsValue(value: bigint | string, decimals: number = 18): string {
  try {
    return formatUnits(BigInt(value), decimals);
  } catch {
    return '0';
  }
}

export function formatDate(timestamp: number): string {
  return new Date(timestamp * 1000).toLocaleDateString();
}

export function formatDateTime(timestamp: number): string {
  return new Date(timestamp * 1000).toLocaleString();
} 
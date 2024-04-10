import { blake2AsHex } from "@polkadot/util-crypto";

export function kodaUrl(
  chain: string,
  collection: string,
  token?: string
): string {
  const base = `https://kodadot.xyz/${chain}/`;
  const path = token
    ? `gallery/${collection}-${token}`
    : `collection/${collection}`;
  return base + path;
}

export function baseTxUrl(tx: string): string {
  return `https://basescan.org/tx/${tx}`;
}

export function hashOf(value: string): string {
  return blake2AsHex(value, 256, null, true);
}

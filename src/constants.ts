import { Fetcher } from '@cloudflare/workers-types'
import { Env } from 'hono'

export interface CloudflareEnv extends Record<string, any> {
  // WAIFU_DB: D1Database;
  NFT_STORAGE: Fetcher
  CAPTURE: Fetcher
  // HYPER_MARCK: string
}

export interface HonoEnv extends Env {
  Bindings: CloudflareEnv
}

export type ChainNamespace = 'eip155'

/**
 * Current supported chain IDs:
 * - 1: Ethereum
 * - 10: Optimism
 * - 8453: Base
 * - 84532: Base Sepolia
 * - 7777777: Zora
 */
export type ChainIdEip155 = 1 | 10 | 8453 | 84532 | 7777777

type Chain = 'BASE' | 'BASE_TEST'

// https://docs.simplehash.com/reference/supported-chains-testnets
export const CHAIN_ID: Record<Chain, `${ChainNamespace}:${ChainIdEip155}`> = {
  BASE: 'eip155:8453',
  BASE_TEST: 'eip155:84532',
}

export const CONTRACT: Record<Chain, `0x${string}`> = {
  BASE: '0xc029b380f8a451cfd9e5124fa9fcad4397b8c119', // '0x1b60a7ee6bba284a6aafa1eca0a1f7ea42099373',
  BASE_TEST: '0x1b60a7ee6BBA284A6aaFA1eCA0a1f7Ea42099373'
}

export const ALTERNATIVE_CONTRACT: Record<Chain, `0x${string}`> = {
  BASE: '0x0b6504d95f9d550d274468fb6de5d13b7e64aa6a',
  BASE_TEST: '0xe70855c3b49bfe26b0ee0b016f4ce7801c773de8' // '0x132150Bb56CdFed4479ED7d4ba2824900930fBc5'
}

export const TOKEN: Record<string, `0x${string}`> = {
  LOWER: '0xcBAe5Aa4Ff18053E579EdFa53174236CbD71C0e6',
  HIGHER: '0x0578d8A44db98B23BF096A382e016e29a5Ce0ffe'
}

export const CHAIN = 'base' // 'base'
export const MINT_PRICE = '0.002'
export const TOKEN_SYMBOL = 'HIGHER'

export const JOIN_IMAGE = 'https://imagedelivery.net/jk5b6spi_m_-9qC4VTnjpg/2a725d38-de4d-4dc9-d769-b4db49435000/public'
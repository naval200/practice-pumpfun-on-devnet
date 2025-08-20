import { Connection, PublicKey } from '@solana/web3.js';
import { BondingCurveState } from './types';
/**
 * Get bonding curve state from the blockchain using direct web3 calls
 */
export declare function getBondingCurveState(connection: Connection, tokenMint: PublicKey): Promise<BondingCurveState | null>;
/**
 * Get current token price from bonding curve
 */
export declare function getCurrentTokenPrice(connection: Connection, tokenMint: PublicKey): Promise<number>;
//# sourceMappingURL=price.d.ts.map
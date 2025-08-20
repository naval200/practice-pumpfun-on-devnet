import { PublicKey, Connection, TransactionInstruction } from '@solana/web3.js';
export declare const PUMP_PROGRAM_ID: PublicKey;
export declare const GLOBAL_ACCOUNT: PublicKey;
export declare const EVENT_AUTHORITY: PublicKey;
export declare const CREATOR_VAULT: PublicKey;
export declare const FEE_RECIPIENT: PublicKey;
/**
 * Derive bonding curve address from mint
 */
export declare function deriveBondingCurveAddress(mint: PublicKey): [PublicKey, number];
/**
 * Derive associated bonding curve address
 */
export declare function deriveAssociatedBondingCurveAddress(mint: PublicKey, bondingCurve: PublicKey): [PublicKey, number];
/**
 * Derive creator vault address from creator
 */
export declare function deriveCreatorVaultAddress(creator: PublicKey): [PublicKey, number];
/**
 * Derive global volume accumulator address
 */
export declare function deriveGlobalVolumeAccumulatorAddress(): [PublicKey, number];
/**
 * Derive user volume accumulator address
 */
export declare function deriveUserVolumeAccumulatorAddress(user: PublicKey): [PublicKey, number];
/**
 * Derive event authority address
 */
export declare function deriveEventAuthorityAddress(): [PublicKey, number];
/**
 * Create compute budget instruction for setting compute unit limit
 */
export declare function createComputeUnitLimitInstruction(units: number): TransactionInstruction;
/**
 * Create compute budget instruction for setting compute unit price
 */
export declare function createComputeUnitPriceInstruction(microLamports: number): TransactionInstruction;
/**
 * Validate bonding curve account before operations
 */
export declare function validateBondingCurve(connection: Connection, mint: PublicKey, maxRetries?: number, baseDelay?: number): Promise<boolean>;
//# sourceMappingURL=bonding-curve.d.ts.map
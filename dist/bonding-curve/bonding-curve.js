import { PublicKey, TransactionInstruction } from '@solana/web3.js';
// ============================================================================
// PUMP.FUN PROGRAM CONSTANTS
// ============================================================================
export const PUMP_PROGRAM_ID = new PublicKey('6EF8rrecthR5Dkzon8Nwu78hRvfCKubJ14M5uBEwF6P');
export const GLOBAL_ACCOUNT = new PublicKey('4wTV1YmiEkRvAtNtsSGPtUrqRYQMe5SKy2uB4Jjaxnjf');
export const EVENT_AUTHORITY = new PublicKey('Ce6TQqeHC9p8KetsN6JsjHK7UTZk7nasjjnr7XxXp9F1');
export const CREATOR_VAULT = new PublicKey('72ZnbPGyFHR1Bz1pmVK4cgWNRUT9pCcapNiiUcWKWsDg');
export const FEE_RECIPIENT = new PublicKey('68yFSZxzLWJXkxxRGydZ63C6mHx1NLEDWmwN9Lb5yySg');
// Instruction discriminators moved to pumpFunSDK.ts
// ============================================================================
// PDA DERIVATION FUNCTIONS
// ============================================================================
/**
 * Derive bonding curve address from mint
 */
export function deriveBondingCurveAddress(mint) {
    return PublicKey.findProgramAddressSync([Buffer.from('bonding-curve'), mint.toBuffer()], PUMP_PROGRAM_ID);
}
/**
 * Derive associated bonding curve address
 */
export function deriveAssociatedBondingCurveAddress(mint, bondingCurve) {
    return PublicKey.findProgramAddressSync([bondingCurve.toBuffer(), mint.toBuffer()], PUMP_PROGRAM_ID);
}
/**
 * Derive creator vault address from creator
 */
export function deriveCreatorVaultAddress(creator) {
    return PublicKey.findProgramAddressSync([Buffer.from('creator-vault'), creator.toBuffer()], PUMP_PROGRAM_ID);
}
/**
 * Derive global volume accumulator address
 */
export function deriveGlobalVolumeAccumulatorAddress() {
    return PublicKey.findProgramAddressSync([Buffer.from('global_volume_accumulator')], PUMP_PROGRAM_ID);
}
/**
 * Derive user volume accumulator address
 */
export function deriveUserVolumeAccumulatorAddress(user) {
    return PublicKey.findProgramAddressSync([Buffer.from('user_volume_accumulator'), user.toBuffer()], PUMP_PROGRAM_ID);
}
/**
 * Derive event authority address
 */
export function deriveEventAuthorityAddress() {
    return PublicKey.findProgramAddressSync([Buffer.from('__event_authority')], PUMP_PROGRAM_ID);
}
// ============================================================================
// INSTRUCTION CREATION FUNCTIONS
// ============================================================================
// Create instruction function moved to pumpFunSDK.ts
// Create instruction with Anchor function moved to pumpFunSDK.ts
// Buy instruction function moved to pumpFunSDK.ts
// Sell instruction function moved to pumpFunSDK.ts
// ============================================================================
// COMPUTE BUDGET UTILITIES
// ============================================================================
/**
 * Create compute budget instruction for setting compute unit limit
 */
export function createComputeUnitLimitInstruction(units) {
    return new TransactionInstruction({
        keys: [],
        programId: new PublicKey('ComputeBudget111111111111111111111111111111'),
        data: Buffer.from([
            0x02, // SetComputeUnitLimit instruction discriminator
            ...Array.from(new Uint8Array(new Uint32Array([units]).buffer)), // compute units
        ]),
    });
}
/**
 * Create compute budget instruction for setting compute unit price
 */
export function createComputeUnitPriceInstruction(microLamports) {
    return new TransactionInstruction({
        keys: [],
        programId: new PublicKey('ComputeBudget111111111111111111111111111111'),
        data: Buffer.from([
            0x03, // SetComputeUnitPrice instruction discriminator
            ...Array.from(new Uint8Array(new Uint32Array([microLamports]).buffer)), // micro-lamports per compute unit
        ]),
    });
}
/**
 * Validate bonding curve account before operations
 */
export async function validateBondingCurve(connection, mint, maxRetries = 3, baseDelay = 1000) {
    try {
        const [bondingCurve] = deriveBondingCurveAddress(mint);
        // Try to get the bonding curve account info
        const accountInfo = await connection.getAccountInfo(bondingCurve);
        if (!accountInfo) {
            console.log('❌ Bonding curve account not found');
            return false;
        }
        if (accountInfo.data.length === 0) {
            console.log('❌ Bonding curve account has no data');
            return false;
        }
        console.log('✅ Bonding curve account is valid');
        return true;
    }
    catch (error) {
        console.warn('Error validating bonding curve:', error);
        return false;
    }
}
//# sourceMappingURL=bonding-curve.js.map
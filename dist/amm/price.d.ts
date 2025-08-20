import { Connection, PublicKey } from '@solana/web3.js';
import { PumpAmmSdk } from '@pump-fun/pump-swap-sdk';
/**
 * Check if an AMM pool has sufficient liquidity for a given token
 */
export declare function checkAMMPoolLiquidity(connection: Connection, tokenMint: PublicKey, pumpAmmSdk: PumpAmmSdk): Promise<boolean>;
/**
 * Get AMM pool information for a given token
 */
export declare function getAMMPoolInfo(connection: Connection, tokenMint: PublicKey, pumpAmmSdk: PumpAmmSdk): Promise<any>;
//# sourceMappingURL=price.d.ts.map
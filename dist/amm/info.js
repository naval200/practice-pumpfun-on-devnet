import { PumpAmmSdk } from '@pump-fun/pump-swap-sdk';
import { logError } from '../utils/debug';
/**
 * Get pool information for AMM trading
 */
export async function getPoolInfo(connection, poolKey, wallet) {
    try {
        const pumpAmmSdk = new PumpAmmSdk(connection);
        const swapSolanaState = await pumpAmmSdk.swapSolanaState(poolKey, wallet.publicKey);
        return swapSolanaState;
    }
    catch (error) {
        logError('Error getting pool info:', error);
        return null;
    }
}
//# sourceMappingURL=info.js.map
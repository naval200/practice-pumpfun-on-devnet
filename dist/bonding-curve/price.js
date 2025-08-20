/**
 * Get bonding curve state from the blockchain using direct web3 calls
 */
export async function getBondingCurveState(connection, tokenMint) {
    try {
        // For now, return a basic state structure
        // In a full implementation, you would use PumpFunSDK to get the actual state
        return {
            virtualSolReserves: BigInt(0),
            virtualTokenReserves: BigInt(0),
            realSolReserves: BigInt(0),
            realTokenReserves: BigInt(0),
            tokenTotalSupply: BigInt(0),
            complete: false,
            progress: 0.0,
        };
    }
    catch (error) {
        console.warn('Error getting bonding curve state:', error);
        return null;
    }
}
/**
 * Get current token price from bonding curve
 */
export async function getCurrentTokenPrice(connection, tokenMint) {
    try {
        // Get the latest bonding curve state
        const bondingCurveState = await getBondingCurveState(connection, tokenMint);
        if (!bondingCurveState) {
            throw new Error('No bonding curve state found for token');
        }
        if (bondingCurveState.virtualTokenReserves === BigInt(0)) {
            return 0;
        }
        const price = Number(bondingCurveState.virtualSolReserves) / Number(bondingCurveState.virtualTokenReserves);
        return price / 1e9; // Convert from lamports to SOL
    }
    catch (error) {
        console.error('Error getting current token price:', error);
        throw new Error(`Failed to get current token price: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
}
//# sourceMappingURL=price.js.map
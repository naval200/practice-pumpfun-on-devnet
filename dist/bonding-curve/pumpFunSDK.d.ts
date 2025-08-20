import { Connection, Keypair, PublicKey, Transaction, Commitment } from "@solana/web3.js";
import { Provider } from "@coral-xyz/anchor";
export declare class PumpFunSDK {
    program: any;
    connection: Connection;
    constructor(provider: Provider);
    getBondingCurvePDA(mint: PublicKey): PublicKey;
    getGlobalAccountPDA(): PublicKey;
    getCreatorVaultPDA(creator: PublicKey): PublicKey;
    getGlobalVolumeAccumulatorPDA(): PublicKey;
    getGlobalIncentiveTokenAccountPDA(mint: PublicKey): PublicKey;
    getUserVolumeAccumulatorPDA(user: PublicKey): PublicKey;
    getEventAuthorityPDA(): PublicKey;
    getCreateInstructions(creator: PublicKey, name: string, symbol: string, uri: string, mint: Keypair): Promise<any>;
    getBuyInstructionsBySolAmount(buyer: PublicKey, mint: PublicKey, buyAmountSol: bigint, slippageBasisPoints?: bigint, commitment?: Commitment): Promise<Transaction>;
    getBuyInstructions(buyer: PublicKey, mint: PublicKey, feeRecipient: PublicKey, solAmount: bigint, amount: bigint, commitment?: Commitment): Promise<Transaction>;
    getSellInstructionsByTokenAmount(seller: PublicKey, mint: PublicKey, sellTokenAmount: bigint, slippageBasisPoints?: bigint, commitment?: Commitment): Promise<Transaction>;
    getSellInstructions(seller: PublicKey, mint: PublicKey, feeRecipient: PublicKey, amount: bigint, minSolOutput: bigint): Promise<Transaction>;
    getBondingCurveAccount(mint: PublicKey, commitment?: Commitment): Promise<{
        getBuyPrice: (solAmount: bigint) => bigint;
        getSellPrice: (tokenAmount: bigint, feeBasisPoints: bigint) => bigint;
    } | null>;
    getGlobalAccount(commitment?: Commitment): Promise<{
        feeRecipient: PublicKey;
        feeBasisPoints: bigint;
    }>;
    calculateWithSlippageBuy(solAmount: bigint, slippageBasisPoints: bigint): bigint;
    calculateWithSlippageSell(solAmount: bigint, slippageBasisPoints: bigint): bigint;
}
//# sourceMappingURL=pumpFunSDK.d.ts.map
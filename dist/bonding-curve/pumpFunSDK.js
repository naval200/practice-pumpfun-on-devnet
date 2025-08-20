import { PublicKey, Transaction } from "@solana/web3.js";
import { Program } from "@coral-xyz/anchor";
import { getAssociatedTokenAddress, createAssociatedTokenAccountInstruction, getAccount } from "@solana/spl-token";
import { BN } from "bn.js";
import IDL from "../idl/pump.json";
const PROGRAM_ID = "6EF8rrecthR5Dkzon8Nwu78hRvfCKubJ14M5uBEwF6P";
const MPL_TOKEN_METADATA_PROGRAM_ID = "metaqbxxUerdq28cj1RbAWkYQm3ybzjb6a8bt518x1s";
const METADATA_SEED = "metadata";
const GLOBAL_ACCOUNT_SEED = "global";
const BONDING_CURVE_SEED = "bonding-curve";
const DEFAULT_COMMITMENT = "confirmed";
const DEFAULT_FINALITY = "confirmed";
export class PumpFunSDK {
    program; // Use any to avoid deep type inference issues
    connection;
    constructor(provider) {
        this.program = new Program(IDL, provider);
        this.connection = this.program.provider.connection;
    }
    getBondingCurvePDA(mint) {
        const [bondingCurve] = PublicKey.findProgramAddressSync([Buffer.from(BONDING_CURVE_SEED), mint.toBuffer()], this.program.programId);
        return bondingCurve;
    }
    getGlobalAccountPDA() {
        const [globalAccount] = PublicKey.findProgramAddressSync([Buffer.from(GLOBAL_ACCOUNT_SEED)], this.program.programId);
        return globalAccount;
    }
    getCreatorVaultPDA(creator) {
        const [creatorVault] = PublicKey.findProgramAddressSync([Buffer.from('creator-vault'), creator.toBuffer()], this.program.programId);
        return creatorVault;
    }
    getGlobalVolumeAccumulatorPDA() {
        const [globalVolumeAccumulator] = PublicKey.findProgramAddressSync([Buffer.from('global_volume_accumulator')], this.program.programId);
        return globalVolumeAccumulator;
    }
    getGlobalIncentiveTokenAccountPDA(mint) {
        const [globalIncentiveTokenAccount] = PublicKey.findProgramAddressSync([
            this.getGlobalVolumeAccumulatorPDA().toBuffer(),
            new PublicKey("TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA").toBuffer(),
            mint.toBuffer(),
        ], this.program.programId);
        return globalIncentiveTokenAccount;
    }
    getUserVolumeAccumulatorPDA(user) {
        const [userVolumeAccumulator] = PublicKey.findProgramAddressSync([Buffer.from('user_volume_accumulator'), user.toBuffer()], this.program.programId);
        return userVolumeAccumulator;
    }
    getEventAuthorityPDA() {
        const [eventAuthority] = PublicKey.findProgramAddressSync([Buffer.from('__event_authority')], this.program.programId);
        return eventAuthority;
    }
    async getCreateInstructions(creator, name, symbol, uri, mint) {
        const mplTokenMetadata = new PublicKey(MPL_TOKEN_METADATA_PROGRAM_ID);
        const [metadataPDA] = PublicKey.findProgramAddressSync([
            Buffer.from(METADATA_SEED),
            mplTokenMetadata.toBuffer(),
            mint.publicKey.toBuffer(),
        ], mplTokenMetadata);
        const associatedBondingCurve = await getAssociatedTokenAddress(mint.publicKey, this.getBondingCurvePDA(mint.publicKey), true);
        return this.program.methods
            .create(name, symbol, uri, creator)
            .accounts({
            mint: mint.publicKey,
            associatedBondingCurve: associatedBondingCurve,
            metadata: metadataPDA,
            user: creator,
        })
            .signers([mint])
            .transaction();
    }
    // Buy functions
    async getBuyInstructionsBySolAmount(buyer, mint, buyAmountSol, slippageBasisPoints = 500n, commitment = DEFAULT_COMMITMENT) {
        let bondingCurveAccount = await this.getBondingCurveAccount(mint, commitment);
        if (!bondingCurveAccount) {
            throw new Error(`Bonding curve account not found: ${mint.toBase58()}`);
        }
        let buyAmount = bondingCurveAccount.getBuyPrice(buyAmountSol);
        let buyAmountWithSlippage = this.calculateWithSlippageBuy(buyAmountSol, slippageBasisPoints);
        let globalAccount = await this.getGlobalAccount(commitment);
        return await this.getBuyInstructions(buyer, mint, globalAccount.feeRecipient, buyAmount, buyAmountWithSlippage);
    }
    async getBuyInstructions(buyer, mint, feeRecipient, solAmount, amount, commitment = DEFAULT_COMMITMENT) {
        const associatedBondingCurve = await getAssociatedTokenAddress(mint, this.getBondingCurvePDA(mint), true);
        const associatedUser = await getAssociatedTokenAddress(mint, buyer, false);
        let transaction = new Transaction();
        try {
            await getAccount(this.connection, associatedUser, commitment);
        }
        catch (e) {
            transaction.add(createAssociatedTokenAccountInstruction(buyer, associatedUser, buyer, mint));
        }
        const buyInstruction = await this.program.methods
            .buy(new BN(solAmount.toString()), new BN(amount.toString()))
            .accounts({
            user: buyer,
            user_ata: associatedUser,
            global_volume_accumulator: this.getGlobalVolumeAccumulatorPDA(),
            global_incentive_token_account: await this.getGlobalIncentiveTokenAccountPDA(mint),
            user_volume_accumulator: await this.getUserVolumeAccumulatorPDA(buyer),
            mint: mint,
            token_program: new PublicKey("TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA"),
            system_program: new PublicKey("11111111111111111111111111111111"),
            associated_token_program: new PublicKey("ATokenGPvbdGVxr1b2hvZbsiqW5xWH25efTNsLJA8knL"),
            event_authority: await this.getEventAuthorityPDA(),
            program: this.program.programId,
            payer: buyer,
        })
            .instruction();
        transaction.add(buyInstruction);
        return transaction;
    }
    // Sell functions
    async getSellInstructionsByTokenAmount(seller, mint, sellTokenAmount, slippageBasisPoints = 500n, commitment = DEFAULT_COMMITMENT) {
        let bondingCurveAccount = await this.getBondingCurveAccount(mint, commitment);
        if (!bondingCurveAccount) {
            throw new Error(`Bonding curve account not found: ${mint.toBase58()}`);
        }
        let globalAccount = await this.getGlobalAccount(commitment);
        let minSolOutput = bondingCurveAccount.getSellPrice(sellTokenAmount, globalAccount.feeBasisPoints);
        let sellAmountWithSlippage = this.calculateWithSlippageSell(minSolOutput, slippageBasisPoints);
        return await this.getSellInstructions(seller, mint, globalAccount.feeRecipient, sellTokenAmount, sellAmountWithSlippage);
    }
    async getSellInstructions(seller, mint, feeRecipient, amount, minSolOutput) {
        const associatedBondingCurve = await getAssociatedTokenAddress(mint, this.getBondingCurvePDA(mint), true);
        const associatedUser = await getAssociatedTokenAddress(mint, seller, false);
        let transaction = new Transaction();
        const sellInstruction = await this.program.methods
            .sell(new BN(amount.toString()), new BN(minSolOutput.toString()))
            .accounts({
            global: this.getGlobalAccountPDA(),
            feeRecipient: feeRecipient,
            mint: mint,
            bondingCurve: this.getBondingCurvePDA(mint),
            associatedBondingCurve: associatedBondingCurve,
            associatedUser: associatedUser,
            user: seller,
        })
            .instruction();
        transaction.add(sellInstruction);
        return transaction;
    }
    // Utility functions
    async getBondingCurveAccount(mint, commitment = DEFAULT_COMMITMENT) {
        const tokenAccount = await this.connection.getAccountInfo(this.getBondingCurvePDA(mint), commitment);
        if (!tokenAccount) {
            return null;
        }
        // For now, return a placeholder object - you'll need to implement BondingCurveAccount
        return {
            getBuyPrice: (solAmount) => solAmount * 1000n, // Placeholder
            getSellPrice: (tokenAmount, feeBasisPoints) => tokenAmount / 1000n // Placeholder
        };
    }
    async getGlobalAccount(commitment = DEFAULT_COMMITMENT) {
        const [globalAccountPDA] = PublicKey.findProgramAddressSync([Buffer.from(GLOBAL_ACCOUNT_SEED)], new PublicKey(PROGRAM_ID));
        const tokenAccount = await this.connection.getAccountInfo(globalAccountPDA, commitment);
        // For now, return a placeholder object - you'll need to implement GlobalAccount
        return {
            feeRecipient: new PublicKey("68yFSZxzLWJXkxxRGydZ63C6mHx1NLEDWmwN9Lb5yySg"), // Default fee recipient
            feeBasisPoints: 500n // Default 5% fee
        };
    }
    // Slippage calculation functions
    calculateWithSlippageBuy(solAmount, slippageBasisPoints) {
        return solAmount * (10000n + slippageBasisPoints) / 10000n;
    }
    calculateWithSlippageSell(solAmount, slippageBasisPoints) {
        return solAmount * (10000n - slippageBasisPoints) / 10000n;
    }
}
//# sourceMappingURL=pumpFunSDK.js.map
import { Transaction, VersionedTransaction } from '@solana/web3.js';
/**
 * Simple wallet wrapper for Anchor
 */
export class SimpleWallet {
    _keypair;
    constructor(_keypair) {
        this._keypair = _keypair;
    }
    get publicKey() {
        return this._keypair.publicKey;
    }
    get payer() {
        return this._keypair;
    }
    get keypair() {
        return this._keypair;
    }
    async signTransaction(tx) {
        if (tx instanceof Transaction) {
            tx.partialSign(this.keypair);
        }
        else if (tx instanceof VersionedTransaction) {
            tx.sign([this.keypair]);
        }
        return tx;
    }
    async signAllTransactions(txs) {
        return txs.map(tx => {
            if (tx instanceof Transaction) {
                tx.partialSign(this.keypair);
            }
            else if (tx instanceof VersionedTransaction) {
                tx.sign([this.keypair]);
            }
            return tx;
        });
    }
}
//# sourceMappingURL=wallet.js.map
import { Connection, PublicKey, LAMPORTS_PER_SOL } from '@solana/web3.js';

export const LOCK_MINT = 'GbGXSKagP8Pwak6JV7aZEVoU3TuxX4n89aTvT9oepump';
export const RPC_ENDPOINT = 'https://api.mainnet-beta.solana.com';

export const connection = new Connection(RPC_ENDPOINT, 'confirmed');

export class SolanaService {
  private connection: Connection;

  constructor() {
    this.connection = new Connection(RPC_ENDPOINT, 'confirmed');
  }

  async getTokenBalance(walletAddress: string): Promise<number> {
    try {
      const walletPubkey = new PublicKey(walletAddress);
      const tokenAccounts = await this.connection.getParsedTokenAccountsByOwner(
        walletPubkey,
        { mint: new PublicKey(LOCK_MINT) }
      );

      if (tokenAccounts.value.length === 0) {
        return 0;
      }

      const balance = tokenAccounts.value[0].account.data.parsed.info.tokenAmount.uiAmount;
      return balance || 0;
    } catch (error) {
      console.error('Error fetching token balance:', error);
      return 0;
    }
  }

  async getTokenSupply(): Promise<number> {
    try {
      const supply = await this.connection.getTokenSupply(new PublicKey(LOCK_MINT));
      return supply.value.uiAmount || 0;
    } catch (error) {
      console.error('Error fetching token supply:', error);
      return 0;
    }
  }

  async getHolderCount(): Promise<number> {
    try {
      const accounts = await this.connection.getProgramAccounts(
        new PublicKey('TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA'),
        {
          filters: [
            {
              memcmp: {
                offset: 0,
                bytes: LOCK_MINT,
              },
            },
          ],
        }
      );
      return accounts.length;
    } catch (error) {
      console.error('Error fetching holder count:', error);
      return 0;
    }
  }

  subscribeToTransactions(callback: (transaction: any) => void) {
    try {
      const subscriptionId = this.connection.onLogs(
        new PublicKey(LOCK_MINT),
        (logs) => {
          callback(logs);
        },
        'confirmed'
      );
      return subscriptionId;
    } catch (error) {
      console.error('Error subscribing to transactions:', error);
      return null;
    }
  }

  unsubscribe(subscriptionId: number) {
    try {
      this.connection.removeOnLogsListener(subscriptionId);
    } catch (error) {
      console.error('Error unsubscribing:', error);
    }
  }
}
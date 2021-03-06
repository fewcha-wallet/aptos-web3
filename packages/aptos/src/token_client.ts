import { AptosAccount } from './aptos_account';
import { AptosClient } from './aptos_client';
import { Types } from './types';
import { HexString, MaybeHexString } from './hex_string';
import { Buffer } from 'buffer/';
import assert from 'assert';

/**
 * Class for creating, minting and managing minting NFT collections and tokens
 */
export class TokenClient {
  aptosClient: AptosClient;

  /**
   * Creates new TokenClient instance
   * @param aptosClient AptosClient instance
   */
  constructor(aptosClient: AptosClient) {
    this.aptosClient = aptosClient;
  }

  /**
   * Brings together methods for generating, signing and submitting transaction
   * @param account AptosAccount which will sign a transaction
   * @param payload Transaction payload. It depends on transaction type you want to send
   * @returns Promise that resolves to transaction hash
   */
  async submitTransactionHelper(account: AptosAccount, payload: Types.TransactionPayload) {
    const txnRequest = await this.aptosClient.generateTransaction(account.address(), payload, {
      max_gas_amount: '4000',
    });
    const signedTxn = await this.aptosClient.signTransaction(account, txnRequest);
    const res = await this.aptosClient.submitTransaction(signedTxn);
    await this.aptosClient.waitForTransaction(res.hash);
    return Promise.resolve(res.hash);
  }

  /**
   * Creates a new NFT collection within the specified account
   * @param account AptosAccount where collection will be created
   * @param name Collection name
   * @param description Collection description
   * @param uri URL to additional info about collection
   * @returns A hash of transaction
   */
  async createCollection(
    account: AptosAccount,
    name: string,
    description: string,
    uri: string,
  ): Promise<Types.HexEncodedBytes> {
    const payload: Types.TransactionPayload = {
      type: 'script_function_payload',
      function: '0x1::token::create_unlimited_collection_script',
      type_arguments: [],
      arguments: [
        Buffer.from(name).toString('hex'),
        Buffer.from(description).toString('hex'),
        Buffer.from(uri).toString('hex'),
      ],
    };
    const transactionHash = await this.submitTransactionHelper(account, payload);
    return transactionHash;
  }

  /**
   * Creates a new NFT within the specified account
   * @param account AptosAccount where token will be created
   * @param collectionName Name of collection, that token belongs to
   * @param name Token name
   * @param description Token description
   * @param supply Token supply
   * @param uri URL to additional info about token
   * @param royalty_points_per_million the royal points to be provided to creator
   * @returns A hash of transaction
   */
  async createToken(
    account: AptosAccount,
    collectionName: string,
    name: string,
    description: string,
    supply: number,
    uri: string,
    royalty_points_per_million: number,
  ): Promise<Types.HexEncodedBytes> {
    const payload: Types.TransactionPayload = {
      type: 'script_function_payload',
      function: '0x1::token::create_unlimited_token_script',
      type_arguments: [],
      arguments: [
        Buffer.from(collectionName).toString('hex'),
        Buffer.from(name).toString('hex'),
        Buffer.from(description).toString('hex'),
        true,
        supply.toString(),
        Buffer.from(uri).toString('hex'),
        royalty_points_per_million.toString(),
      ],
    };
    const transactionHash = await this.submitTransactionHelper(account, payload);
    return transactionHash;
  }

  /**
   * Transfers specified amount of tokens from account to receiver
   * @param account AptosAccount where token from which tokens will be transfered
   * @param receiver  Hex-encoded 16 bytes Aptos account address to which tokens will be transfered
   * @param creator Hex-encoded 16 bytes Aptos account address to which created tokens
   * @param collectionName Name of collection where token is stored
   * @param name Token name
   * @param amount Amount of tokens which will be transfered
   * @returns A hash of transaction
   */
  async offerToken(
    account: AptosAccount,
    receiver: MaybeHexString,
    creator: MaybeHexString,
    collectionName: string,
    name: string,
    amount: number,
  ): Promise<Types.HexEncodedBytes> {
    const payload: Types.TransactionPayload = {
      type: 'script_function_payload',
      function: '0x1::token_transfers::offer_script',
      type_arguments: [],
      arguments: [
        receiver,
        creator,
        Buffer.from(collectionName).toString('hex'),
        Buffer.from(name).toString('hex'),
        amount.toString(),
      ],
    };
    const transactionHash = await this.submitTransactionHelper(account, payload);
    return transactionHash;
  }

  /**
   * Claims a token on specified account
   * @param account AptosAccount which will claim token
   * @param sender Hex-encoded 16 bytes Aptos account address which holds a token
   * @param creator Hex-encoded 16 bytes Aptos account address which created a token
   * @param collectionName Name of collection where token is stored
   * @param name Token name
   * @returns A hash of transaction
   */
  async claimToken(
    account: AptosAccount,
    sender: MaybeHexString,
    creator: MaybeHexString,
    collectionName: string,
    name: string,
  ): Promise<Types.HexEncodedBytes> {
    const payload: Types.TransactionPayload = {
      type: 'script_function_payload',
      function: '0x1::token_transfers::claim_script',
      type_arguments: [],
      arguments: [sender, creator, Buffer.from(collectionName).toString('hex'), Buffer.from(name).toString('hex')],
    };
    const transactionHash = await this.submitTransactionHelper(account, payload);
    return transactionHash;
  }

  /**
   * Removes a token from pending claims list
   * @param account AptosAccount which will remove token from pending list
   * @param receiver Hex-encoded 16 bytes Aptos account address which had to claim token
   * @param creator Hex-encoded 16 bytes Aptos account address which created a token
   * @param collectionName Name of collection where token is strored
   * @param name Token name
   * @returns A hash of transaction
   */
  async cancelTokenOffer(
    account: AptosAccount,
    receiver: MaybeHexString,
    creator: MaybeHexString,
    collectionName: string,
    name: string,
  ): Promise<Types.HexEncodedBytes> {
    const payload: Types.TransactionPayload = {
      type: 'script_function_payload',
      function: '0x1::token_transfers::cancel_offer_script',
      type_arguments: [],
      arguments: [receiver, creator, Buffer.from(collectionName).toString('hex'), Buffer.from(name).toString('hex')],
    };
    const transactionHash = await this.submitTransactionHelper(account, payload);
    return transactionHash;
  }

  /**
   * Queries collection data
   * @param creator Hex-encoded 16 bytes Aptos account address which created a collection
   * @param collectionName Collection name
   * @returns Collection data in below format
   * ```
   *  Collection {
   *    // Describes the collection
   *    description: string,
   *    // Unique name within this creators account for this collection
   *    name: string,
   *    // URL for additional information/media
   *    uri: string,
   *    // Total number of distinct Tokens tracked by the collection
   *    count: number,
   *    // Optional maximum number of tokens allowed within this collections
   *    maximum: number
   *  }
   * ```
   */
  async getCollectionData(creator: MaybeHexString, collectionName: string): Promise<any> {
    const resources = await this.aptosClient.getAccountResources(creator);
    const accountResource: { type: string; data: any } = resources.find((r) => r.type === '0x1::token::Collections');
    const { handle }: { handle: string } = accountResource.data.collections;
    const getCollectionTableItemRequest: Types.TableItemRequest = {
      key_type: '0x1::string::String',
      value_type: '0x1::token::Collection',
      key: collectionName,
    };
    // eslint-disable-next-line no-unused-vars
    const collectionTable = await this.aptosClient.getTableItem(handle, getCollectionTableItemRequest);
    return collectionTable;
  }

  /**
   * Queries token data from collection
   * @param creator Hex-encoded 16 bytes Aptos account address which created a token
   * @param collectionName Name of collection, which holds a token
   * @param tokenName Token name
   * @returns Token data in below format
   * ```
   * TokenData {
   *     // Unique name within this creators account for this Token's collection
   *     collection: string;
   *     // Describes this Token
   *     description: string;
   *     // The name of this Token
   *     name: string;
   *     // Optional maximum number of this type of Token.
   *     maximum: number;
   *     // Total number of this type of Token
   *     supply: number;
   *     /// URL for additional information / media
   *     uri: string;
   *   }
   * ```
   */
  async getTokenData(creator: MaybeHexString, collectionName: string, tokenName: string): Promise<Types.TokenData> {
    const collection: { type: string; data: any } = await this.aptosClient.getAccountResource(
      creator,
      '0x1::token::Collections',
    );
    const { handle } = collection.data.token_data;
    const tokenId = {
      creator,
      collection: collectionName,
      name: tokenName,
    };

    const getTokenTableItemRequest: Types.TableItemRequest = {
      key_type: '0x1::token::TokenId',
      value_type: '0x1::token::TokenData',
      key: tokenId,
    };

    const tableItem = await this.aptosClient.getTableItem(handle, getTokenTableItemRequest);
    return tableItem.data;
  }

  /**
   * Queries token balance for the token creator
   * @deprecated Use getTokenBalanceForAccount instead
   */
  async getTokenBalance(creator: MaybeHexString, collectionName: string, tokenName: string): Promise<Types.Token> {
    return this.getTokenBalanceForAccount(creator, {
      creator: creator instanceof HexString ? creator.hex() : creator,
      collection: collectionName,
      name: tokenName,
    });
  }

  /**
   * Queries token balance for a token account
   * @param account Hex-encoded 16 bytes Aptos account address which created a token
   * @param tokenId token id
   *
   * @example
   * ```
   * {
   *   creator: '0x1',
   *   collection: 'Some collection',
   *   name: 'Awesome token'
   * }
   * ```
   * @returns Token object in below format
   * ```
   * Token {
   *   id: TokenId;
   *   value: number;
   * }
   * ```
   */
  async getTokenBalanceForAccount(account: MaybeHexString, tokenId: Types.TokenId): Promise<Types.Token> {
    const tokenStore: { type: string; data: any } = await this.aptosClient.getAccountResource(
      account,
      '0x1::token::TokenStore',
    );
    const { handle } = tokenStore.data.tokens;

    const getTokenTableItemRequest: Types.TableItemRequest = {
      key_type: '0x1::token::TokenId',
      value_type: '0x1::token::Token',
      key: tokenId,
    };

    const tableItem = await this.aptosClient.getTableItem(handle, getTokenTableItemRequest);
    return tableItem.data;
  }

  // returns a list of token IDs of the tokens in a user's account (including the tokens that were minted)
  async getTokenIds(address: string) {
    const depositEvents = await this.aptosClient.getEventsByEventHandle(
      address,
      '0x1::token::TokenStore',
      'deposit_events',
    );
    const withdrawEvents = await this.aptosClient.getEventsByEventHandle(
      address,
      '0x1::token::TokenStore',
      'withdraw_events',
    );

    var countDeposit: Record<string, number> = {};
    var countWithdraw: Record<string, number> = {};
    var tokenIds = [];
    for (var elem of depositEvents) {
      const elem_string = JSON.stringify(elem.data.id);
      countDeposit[elem_string] = countDeposit[elem_string] ? countDeposit[elem_string] + 1 : 1;
    }
    for (var elem of withdrawEvents) {
      const elem_string = JSON.stringify(elem.data.id);
      countWithdraw[elem_string] = countWithdraw[elem_string] ? countWithdraw[elem_string] + 1 : 1;
    }

    for (var elem of depositEvents) {
      const elem_string = JSON.stringify(elem.data.id);
      const count1 = countDeposit[elem_string];
      const count2 = countWithdraw[elem_string] ? countWithdraw[elem_string] : 0;
      if (count1 - count2 == 1) {
        tokenIds.push(elem.data.id);
      }
    }
    return tokenIds;
  }

  async getTokens(address: string) {
    let localCache: Record<string, Types.AccountResource[]> = {};
    const tokenIds = await this.getTokenIds(address);
    var tokens = [];
    for (var tokenId of tokenIds) {
      let resources: Types.AccountResource[];
      if (tokenId.creator in localCache) {
        resources = localCache[tokenId.creator];
      } else {
        resources = await this.aptosClient.getAccountResources(tokenId.creator);
        localCache[tokenId.creator] = resources;
      }
      const accountResource: { type: string; data: any } = resources.find((r) => r.type === '0x1::token::Collections');
      let tableItemRequest: Types.TableItemRequest = {
        key_type: '0x1::token::TokenId',
        value_type: '0x1::token::TokenData',
        key: tokenId,
      };
      const token = (await this.aptosClient.getTableItem(accountResource.data.token_data.handle, tableItemRequest))
        .data;
      tokens.push(token);
    }
    return tokens;
  }

  async tableItem(handle: string, keyType: string, valueType: string, key: any): Promise<any> {
    const response = await fetch(`${this.aptosClient.nodeUrl}/tables/${handle}/item`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        key_type: keyType,
        value_type: valueType,
        key: key,
      }),
    });

    if (response.status == 404) {
      return null;
    } else if (response.status != 200) {
      assert(response.status == 200, await response.text());
    } else {
      return await response.json();
    }
  }
}

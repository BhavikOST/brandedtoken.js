'use strict';

const AbiBinProvider = require('../../AbiBinProvider');

const ContractName = 'GatewayComposer';

/**
 * Performs setup and deployment of GatewayComposer.
 */
class GCHelper {
  /**
   * GCHelper constructor.
   * @param originWeb3 - Origin chain web3 object.
   * @param address - GatewayComposer contract address.
   */
  constructor(originWeb3, address) {
    const oThis = this;
    oThis.originWeb3 = originWeb3;
    oThis.address = address;
    oThis.abiBinProvider = new AbiBinProvider();
  }

  /**
   * @param config - Configurations for setup:
   *                 {
   *                  "deployer": config.deployerAddress,
   *                  "owner": config.staker,
   *                  "valueToken": config.simpleTokenContractAddress,
   *                  "brandedToken": config.brandedTokenContractAddress,
   *                  }
   * @param txOptions - Tx options.
   * @param originWeb3 - Origin chain web3 object.
   * @returns {Promise} - Promise object.
   */
  setup(config, txOptions, originWeb3) {
    const oThis = this;
    originWeb3 = originWeb3 || oThis.originWeb3;

    GCHelper.validateSetupConfig(config);

    if (!txOptions) {
      txOptions = txOptions || {};
    }

    let deployParams = Object.assign({}, txOptions);
    deployParams.from = config.deployer;

    let owner, valueToken, brandedToken;
    owner = config.owner;
    valueToken = config.valueToken;
    brandedToken = config.brandedToken;

    // Deploy the Contract
    let promiseChain = oThis.deploy(owner, valueToken, brandedToken, deployParams, originWeb3);

    return promiseChain;
  }

  /**
   * Performs validation of input methods.
   *
   * @param config - Configuration parameters.
   * @returns {boolean} - True on successful validation.
   */
  static validateSetupConfig(config) {
    if (!config) {
      throw new Error('Mandatory parameter "config" missing. ');
    }

    if (!config.owner) {
      throw new Error('Mandatory configuration "owner" missing. Set config.owner address');
    }

    if (!config.valueToken) {
      throw new Error('Mandatory configuration "valueToken" missing. Set config.valueToken address');
    }

    if (!config.brandedToken) {
      throw new Error('Mandatory configuration "brandedToken" missing. Set config.brandedToken address');
    }

    return true;
  }

  /**
   * Deploys Gateway Composer.
   * @param owner - Address of the staker on the value chain.
   * @param valueToken - EIP20Token address which is staked.
   * @param brandedToken - It's a value backed minted EIP20Token.
   * @param txOptions - Transaction options for flexibility.
   * @param originWeb3 - Origin chain web3 object.
   * @returns {PromiseLike<T> | Promise<T>} - Promise object.
   */
  deploy(owner, valueToken, brandedToken, txOptions, originWeb3) {
    const oThis = this;
    originWeb3 = originWeb3 || oThis.originWeb3;

    let tx = oThis._deployRawTx(owner, valueToken, brandedToken, txOptions, originWeb3);

    let txReceipt;
    return tx
      .send(txOptions)
      .on('transactionHash', function(transactionHash) {
        console.log('\t - transaction hash:', transactionHash);
      })
      .on('error', function(error) {
        console.log('\t !! Error !!', error, '\n\t !! ERROR !!\n');
        return Promise.reject(error);
      })
      .on('receipt', function(receipt) {
        txReceipt = receipt;
      })
      .then(function(instance) {
        oThis.address = instance.options.address;
        console.log(`\t - ${ContractName} Contract Address:`, oThis.address);
        return txReceipt;
      });
  }

  /**
   * Returns raw transaction object.
   *
   * @param owner - Address of the staker on the value chain.
   * @param valueToken - EIP20Token address which is staked.
   * @param brandedToken - It's a value backed minted EIP20Token.
   * @param txOptions - Transaction options for flexibility.
   * @param originWeb3 - Origin chain web3 object.
   * @returns {PromiseLike<T>|Promise<T>|*} - Promise object.
   * @private
   */
  _deployRawTx(owner, valueToken, brandedToken, txOptions, originWeb3) {
    const oThis = this;

    const abiBinProvider = oThis.abiBinProvider;
    const abi = abiBinProvider.getABI(ContractName);
    const bin = abiBinProvider.getBIN(ContractName);

    let defaultOptions = {
      gas: '7500000'
    };

    if (txOptions) {
      Object.assign(defaultOptions, txOptions);
    }
    txOptions = defaultOptions;

    let args = [owner, valueToken, brandedToken];

    const contract = new originWeb3.eth.Contract(abi, null, txOptions);

    return contract.deploy(
      {
        data: bin,
        arguments: args
      },
      txOptions
    );
  }
}

module.exports = GCHelper;
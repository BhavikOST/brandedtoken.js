// Copyright 2019 OpenST Ltd.
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//    http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.
//
// ----------------------------------------------------------------------------
//
// http://www.simpletoken.org/
//
// ----------------------------------------------------------------------------

'use strict';

const StakeHelper = require('./StakeHelper');

/**
 * Staker performs below tasks:
 * - approves GatewayComposer for ValueToken
 * - calls GatewayComposer.requestStake
 */
class Staker {
  /**
   * Staker constructor object.
   *
   * @param originWeb3 Origin chain web3 address.
   * @param valueToken Value token contract address.
   * @param brandedToken Branded Token contract address.
   * @param gatewayComposer Gateway composer contract address.
   */
  constructor(originWeb3, valueToken, brandedToken, gatewayComposer) {
    const oThis = this;
    oThis.originWeb3 = originWeb3;
    oThis.valueToken = valueToken;
    oThis.brandedToken = brandedToken;
    oThis.gatewayComposer = gatewayComposer;
  }

  /**
   * Staker performs below tasks:
   * - approves GatewayComposer for ValueToken
   * - calls GatewayComposer.requestStake
   *
   * @param valueTokenAbi ValueToken contract ABI.
   * @param owner Owner of GatewayComposer contract.
   * @param stakeVTAmountInWei ValueToken amount which is staked.
   * @param mintBTAmountInWei Amount of BT amount which will be minted.
   * @param gatewayAddress Gateway contract address.
   * @param gasPrice Gas price that staker is ready to pay to get the stake
   *                  and mint process done.
   * @param gasLimit Gas limit that staker is ready to pay.
   * @param beneficiary The address in the auxiliary chain where the utility
   *                     tokens will be minted.
   * @param stakerGatewayNonce Nonce of the staker address stored in Gateway.
   * @param txOptions - Tx options.
   */
  async requestStake(
    valueTokenAbi,
    owner,
    stakeVTAmountInWei,
    mintBTAmountInWei,
    gatewayAddress,
    gasPrice,
    gasLimit,
    beneficiary,
    stakerGatewayNonce,
    txOptions,
  ) {
    const oThis = this;

    const stakeHelperInstance = new StakeHelper(
      oThis.originWeb3,
      oThis.brandedToken,
      oThis.gatewayComposer,
    );
    const approveForValueTokenResult = await stakeHelperInstance.approveForValueToken(
      oThis.valueToken,
      valueTokenAbi,
      stakeVTAmountInWei,
      oThis.originWeb3,
      txOptions,
    );

    console.log('approveForValueToken status:', approveForValueTokenResult.status);

    const requestStakeResult = await stakeHelperInstance.requestStake(
      owner,
      stakeVTAmountInWei,
      mintBTAmountInWei,
      gatewayAddress,
      gasPrice,
      gasLimit,
      beneficiary,
      stakerGatewayNonce,
      oThis.originWeb3,
      txOptions,
    );

    console.log('requestStake status:', requestStakeResult.status);
  }
}

module.exports = Staker;

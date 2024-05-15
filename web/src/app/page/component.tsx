"use client"
import React, { useState } from "react";
var ethUtil = require('ethereumjs-util');
var sigUtil = require('eth-sig-util');
import Web3 from "web3";
import {
  createSmartAccountClient,
  BiconomySmartAccountV2
} from "@biconomy/account";
import { ethers } from "ethers";
import { createMySession } from "./session";
import { UseSessionKeys } from "./session";
const signkey = '0x7465737400000000000000000000000000000000000000000000000000000000';

export const signData = async (web3, accounts) => {
  web3.currentProvider.sendAsync({
    method: 'net_version',
    params: [],
    jsonrpc: "2.0"
  }, function(err, result) {
    const netId = result.result;
    console.log("netId", netId);
    const msgParams = JSON.stringify({
      types:
      {
        Keys: [
          { name: "owner", type: "address" },
          { name: "signkey", type: "bytes32" }
        ]
      },
      primaryType: "Keys",
      domain: { name: accounts, signkey: signkey },
      message: {
        signer: accounts,
        signkey: signkey
      }
    })

    var from = accounts;

    console.log('CLICKED, SENDING PERSONAL SIGN REQ', 'from', from, msgParams)
    var params = [from, msgParams]
    console.dir(params)
    var method = 'eth_signTypedData_v3'

    web3.currentProvider.sendAsync({
      method,
      params,
      from,
    }, async function(err, result) {
      if (err) return console.dir(err)
      if (result.error) {
        alert(result.error.message)
      }
      if (result.error) return console.error('ERROR', result)
      console.log('TYPED SIGNED:' + JSON.stringify(result.result))

      const recovered = sigUtil.recoverTypedSignature({ data: JSON.parse(msgParams), sig: result.result })

      if (ethUtil.toChecksumAddress(recovered) === ethUtil.toChecksumAddress(from)) {
        alert('Successfully ecRecovered signer as ' + from)
      } else {
        alert('Failed to verify signer when comparing ' + result + ' to ' + from)
      }

      const signature = result.result.substring(2);
      const r = "0x" + signature.substring(0, 64);
      const s = "0x" + signature.substring(64, 128);
      const v = parseInt(signature.substring(128, 130), 16);
      console.log("r:", r);
      console.log("s:", s);
      console.log("v:", v);
      return { r, s, v }

      // await myContract.methods.verify(accounts, 2, v, r, s, signkey).send({ from: accounts });
    })
  })
}


export function DepositContract({ contractAddress, abi }) {
  const [web3, setWeb3] = useState(null);
  const [accounts, setAccounts] = useState('');
  const [myContract, setmyContract] = useState(null);
  const [balance, setBalance] = useState(0);
  const [session, setSession] = useState();
  const bundlerUrl = "https://bundler.biconomy.io/api/v2/11155111/nJPK7B3ru.dd7f7861-190d-41bd-af80-6877f74b8f44"
  const paymasterApiKey = "XvNTzmUlE.ab3f2396-fd05-49f2-a42b-9ded53017432";

  function connect() {
    if (window.ethereum) {
      window.ethereum.request({ method: 'eth_requestAccounts' })
        .then(() => {
          const web3Instance = new Web3(window.ethereum);
          setWeb3(web3Instance);

          handleSubmit(web3Instance);
          sessionCreation(window.ethereum)

          const myContract = new web3Instance.eth.Contract(abi, contractAddress);
          setmyContract(myContract);
          // const balance = myContract.methods.getBalance(userAddress).call();
          // console.log(`Balance for ${userAddress}: ${balance}`);
        })
        .catch(err => {
          console.error(err);
        });
    } else {
      alert('Please install an another Ethereum wallet.');
    }
  }

  const sessionCreation = async (ethereum) => {
    console.log("hello")
    const provider = new ethers.providers.Web3Provider(ethereum)
    await provider.send("eth_requestAccounts", []);
    let signerWallet = ethers.Wallet.createRandom()
    let signer = signerWallet.connect(provider)
    console.log(signer)
    let biconomySmartAccount = await createSmartAccountClient({
      signer,
      bundlerUrl,
      biconomyPaymasterApiKey: paymasterApiKey,
    })
    const address = biconomySmartAccount.getAccountAddress()
    console.log(biconomySmartAccount)

    const session = await createMySession(biconomySmartAccount, address);
    setSession(session);
    console.log(session)
  }

  const handleSubmit = async (web3) => {
    const account = await web3.eth.getAccounts();
    const userAddress = account[0];
    console.log(userAddress);
    setAccounts(userAddress);
  }

  return (
    <div className="App">
      {myContract ? <span>Connected</span> : <button onClick={connect}> Connect</button>}
      <br />
      <button onClick={() => UseSessionKeys(session, accounts, signkey, web3)}> Sign </button>
      <br />
      {web3 && <span>Deposits of {accounts} is {balance}</span>}
    </div >
  );
}

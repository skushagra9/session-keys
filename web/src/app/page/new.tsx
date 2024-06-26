import React, { useState } from 'react';
import { ethers } from 'ethers';
import SignMessage from './Signer';
import Web3 from 'web3';
import VerifyMessage from './VerifySignerMessage';
var ethUtil = require('ethereumjs-util');
var sigUtil = require('eth-sig-util');
// import ethUtil from 'ethereumjs-util'
// import sigUtil from 'eth-sig-util';

const domain = {
  name: 'filament',
  version: '1',
  chainId: 713715, // Replace with your chain ID
  verifyingContract: '0x0d8c4f0689d64fb4b64abfbf6ceada24b8f84934', // Replace with your contract address
};

const Order = [
  { name: 'indexToken', type: 'address' },
  { name: 'sender', type: 'address' },
  { name: 'priceX18', type: 'uint256' },
  { name: 'amount', type: 'uint256' },
  { name: 'reduceOnly', type: 'bool' },
  { name: 'isLong', type: 'bool' },
  { name: 'collateral', type: 'uint256' },

];

const messageToSign = {
  indexToken: '0x1163DA866dEdC35104DCfBb378408A874dD14e20',
  sender: '0xDdF4DD7F9114ce484508f66A8A17fee63232E2A0', // Convert 1.0 ETH to wei
  priceX18: 0,
  amount: 0,
  reduceOnly: 0,
  isLong: 0,
  collateral: 0,

};


function App() {
  const [sessionKey, setSessionKey] = useState('');
  const [signature, setSignature] = useState('');
  const [address, setAddress] = useState('');
  const [web3, setWeb3] = useState(null);
  const createSessionKey = async () => {
    // Get the signer's Ethereum address
    const web3Instance = new Web3(window.ethereum);
    const provider = new ethers.providers.Web3Provider(window.ethereum);
    const signer = await provider.getSigner();
    const address = await signer.getAddress();
    setAddress(address);
    setWeb3(web3Instance);
    const sessionKey = ethers.utils.keccak256(ethers.utils.defaultAbiCoder.encode(['address'], [address]));
    setSessionKey(sessionKey)
  };

  const signMessage = async () => {
    if (!sessionKey) {
      alert('Please create a session key first');
      return;
    }

    const msgParams = JSON.stringify({
      types:
      {
        Order: Order
      },
      primaryType: "Order",
      domain: domain,
      message: messageToSign
    })
    var from = address;
    var params = [from, msgParams]
    var method = 'eth_signTypedData_v4'
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
      console.log(recovered)
      if (ethUtil.toChecksumAddress(recovered) === ethUtil.toChecksumAddress(from)) {
        alert('Successfully ecRecovered signer as ' + from)
      } else {
        alert('Failed to verify signer when comparing ' + result + ' to ' + from)
      }

      // const signature = result.result.substring(2);
      // localStorage.set("sign", signature)
      // window.alert(signature)

      setSignature(signature);
      // await myContract.methods.verify(accounts, 2, v, r, s, signkey).send({ from: accounts });
    })


    // const signature = await eip712.sign(domain, structType, messageToSign, sessionKey, signer);
  };

  return (
    <div>
      {/* <SignMessage /> */}
      <button onClick={createSessionKey}>Create Session Key</button>
      <div>Session Key: {sessionKey}</div>
      <button onClick={signMessage}>Sign Message</button>
      <div>Signature: {signature}</div>
      {/* <VerifyMessage /> */}
    </div>
  );
}

export default App;

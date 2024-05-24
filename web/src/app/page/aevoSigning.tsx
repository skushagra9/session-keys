import { useState } from 'react';
import { promisify } from 'util';
import { ethers } from 'ethers';
import { verifySignature } from './verifySignature';
export async function aevosigning(provider) {

  const signer = ethers.Wallet.createRandom();
  localStorage.setItem('signingKey', signer.privateKey);
  const registerHash = ethers.utils._TypedDataEncoder.hash(
    {
      name: "Sei Mainnet",
      version: "1",
      chainId: 1,
    },
    {
      Register: [
        { name: "key", type: "address" },
        { name: "expiry", type: "uint256" },
      ],
    },
    {
      key: await signer.getAddress(),
      expiry: ethers.constants.MaxUint256.toString(),
    }
  );

  const account = '0x04aCcaBEa3BEd9BBc13748e70040A5A1430Ecd5f'

  const res = await promisify(provider.provider.sendAsync)({
    method: "eth_sign",
    params: [account.toLowerCase(), registerHash],
  });
  const accountSignature = res;

  const signingKeySignature = await signer._signTypedData(
    {
      name: "Sei Mainnet",
      version: "1",
      chainId: 1,
    },
    {
      SignKey: [{ name: "account", type: "address" }],
    },
    {
      account: account
    }
  );

  const orderMessage = {
    amount: 10,
  };

  const orderSignature = await signer._signTypedData(
    {
      name: "Sei Mainnet",
      version: "1",
      chainId: 1,
    },
    {
      Order: [
        { name: "amount", type: "uint256" },
      ]
    },
    orderMessage
  );

  console.log("Account Signature:", accountSignature);
  console.log("Signing Key Signature:", signingKeySignature);
  console.log("Order Signature:", orderSignature);
}

const App = () => {
  const [loading, setLoading] = useState(false);
  const [account, setAccount] = useState(null);
  const [provider, setProvider] = useState(null);

  const handleMetaMaskConnect = async () => {
    if (window.ethereum) {
      try {
        console.log("hello")
        const provider = new ethers.providers.Web3Provider(window.ethereum);
        console.log("hhihih")
        setProvider(provider);
      } catch (error) {
        console.error("Error connecting to MetaMask:", error);
      }
    } else {
      console.error("MetaMask is not installed.");
    }
  };

  const handleRegister = async () => {
    if (!provider) {
      console.error("Please connect to MetaMask first.");
      return;
    }

    setLoading(true);
    try {
      await aevosigning(provider);
    } catch (error) {
      console.error("Error during registration:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <button onClick={handleMetaMaskConnect} >
        {provider ? "Connected to MetaMask" : "Connect to MetaMask"}
      </button>
      <button onClick={handleRegister} >
        {loading ? "Processing..." : "Register"}
      </button>
      <button onClick={verifySignature} >
        VerifySignature
      </button>
    </div>
  );
};

export default App;

import { ethers } from "ethers";
import React, { useState } from "react";
import { promisify } from "util";

const orderMessage = {
  maker: '0x70e50dFB205596A635ce64Bc4da0b5Afd91F9C17',
}
// Function to handle the async operations
async function register(account, ethereum, provider) {
  // const signer = ethers.Wallet.createRandom();
  // console.log(signer.getAddress())
  // First, we hash the register data
  const registerHash = ethers.utils._TypedDataEncoder.hash(
    {
      name: "Filament",
      version: "1",
      chainId: 1,
    },
    {
      Order: [
        { name: "maker", type: "address" },
      ]
    },
    orderMessage);
  console.log(orderMessage)

  const res = await promisify(provider.provider.sendAsync)({
    method: "eth_sign",
    params: [account.toLowerCase(), registerHash],
  });

  const accountSignature = res.result;

  // // This is the signing_key_signature
  // const signingKeySignature = await signer._signTypedData(
  //   {
  //     name: "Aevo Mainnet",
  //     version: "1",
  //     chainId: 1,
  //   },
  //   {
  //     SignKey: [{ name: "account", type: "address" }],
  //   },
  //   {
  //     account: '0xDCd85ecDe9cfB784b7DE0F91EDE61064a8580a9e'
  //   }
  // );
  //
  console.log("Account Signature:", accountSignature);
  // console.log("Signing Key Signature:", signingKeySignature);
}

const App = () => {
  const [loading, setLoading] = useState(false);
  const [account, setAccount] = useState(null);
  const [provider, setProvider] = useState(null);
  const [ethereum, setEthererum] = useState(null);

  const handleMetaMaskConnect = async () => {
    if (window.ethereum) {
      try {
        console.log("hello")
        const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
        const account = accounts[0];
        const provider = new ethers.providers.Web3Provider(window.ethereum);
        setAccount(account);
        setProvider(provider);
        setEthererum(window.ethereum)
      } catch (error) {
        console.error("Error connecting to MetaMask:", error);
      }
    } else {
      console.error("MetaMask is not installed.");
    }
  };

  const handleRegister = async () => {
    if (!account || !provider) {
      console.error("Please connect to MetaMask first.");
      return;
    }

    setLoading(true);
    try {
      await register(account, ethereum, provider);
    } catch (error) {
      console.error("Error during registration:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <button onClick={handleMetaMaskConnect} >
        {account ? "Connected to MetaMask" : "Connect to MetaMask"}
      </button>
      <button onClick={handleRegister} >
        {loading ? "Processing..." : "Register"}
      </button>
    </div>
  );
};

export default App;

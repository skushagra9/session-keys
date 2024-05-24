import { ethers } from 'ethers';
import { ABI } from './abi';


export async function verifySignature() {
  if (typeof window === 'undefined' || !window.ethereum) {
    console.error("This function needs to run in a browser with MetaMask installed.");
    return;
  }

  const provider = new ethers.providers.Web3Provider(window.ethereum);
  const signer = provider.getSigner();
  const contractAddress = "0x6D10ee750212f8e918f6D5384ED34BA1e3AEf8F0";
  const contract = new ethers.Contract(contractAddress, ABI, signer);
  const storedSigningKey = localStorage.getItem('signingKey');
  if (!storedSigningKey) {
    console.error("No signing key found in local storage.");
    return;
  }
  const storedSigner = new ethers.Wallet(storedSigningKey);
  storedSigner.connect(provider);

  const orderMessage = {
    amount: 10,
  };

  const orderSignature = await storedSigner._signTypedData(
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
  console.log(orderSignature);

  const structHash = await contract.getOrderHash(orderMessage);
  console.log("here")

  const verifiedAddress = await contract.verifyTypedDataSignature(structHash, orderSignature);
  console.log("Verified Address:", verifiedAddress);
}



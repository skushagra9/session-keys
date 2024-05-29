
import { ethers } from "ethers";

const App = () => {
  const handleSignTypedData = async () => {
    if (!window.ethereum) {
      console.error("MetaMask is not installed.");
      return;
    }

    try {
      // Request user to connect their Ethereum wallet
      const accounts = await window.ethereum.request({ method: "eth_requestAccounts" });
      const userAddress = accounts[0];

      // Define the EIP-712 typed data
      const typedData = {
        domain: {
          name: "Filament",
          version: "1",
          chainId: 713715,
          verifyingContract: "0x4A5d50E9BE62Ae9b60DF87eb176A94d9919b2084",
        },
        message: {
          myMessage: "struct Order { address indexToken; address sender; uint256 price; uint256 amount, ammount of indextoken uint256 collateral}",
        },
        primaryType: "Message",
        types: {
          EIP712Domain: [
            { name: "name", type: "string" },
            { name: "version", type: "string" },
            { name: "chainId", type: "uint256" },
            { name: "verifyingContract", type: "address" },
          ],
          Message: [{ name: "myMessage", type: "string" }],
        },
      };

      // Request user to sign the typed data
      const signature = await window.ethereum.request({
        method: "eth_signTypedData_v4",
        params: [userAddress, JSON.stringify(typedData)],
      });

      console.log("Signed typed data:", signature);
    } catch (error) {
      console.error("Error signing typed data:", error);
    }
  };

  return (
    <div>
      <button onClick={handleSignTypedData}>Sign Typed Data</button>
    </div>
  );
};

export default App;


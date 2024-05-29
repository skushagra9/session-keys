(async function() {
  // connect to wallet
  const from = await ethereum.request({ method: "eth_requestAccounts" });

  const msgParams = JSON.stringify({
    domain: {
      name: "Filament",
      version: "1",
      chainId: 713715,
      verifyingContract: "0x42746d6a6e5b0ee1087db05ef30e46f899fa8273",
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
  });

  web3.currentProvider.sendAsync(
    {
      method: "eth_signTypedData_v4",
      params: [from[0], msgParams],
      from: from[0],
    },
    function(err, result) {
      if (err) return console.dir(err);
      if (result.error) {
        console.error(result.error.message);
      }
      if (result.error) return console.error("ERROR", result);
      console.log("TYPED SIGNED:" + JSON.stringify(result.result));
    }
  );
})();


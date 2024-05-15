import { polygonAmoy as chain } from "viem/chains";
import { parseAbi, encodeFunctionData } from "viem";
import {
  PaymasterMode,
  createSession,
  createSessionSmartAccountClient,
  Rule,
  Policy,
} from "@biconomy/account";
import "react-toastify/dist/ReactToastify.css";
import { createSessionKeyEOA } from "@biconomy/account";
import { signData } from "./component";
const nftAddress = "0x0A812Ec1D08BeA3E98585Cc147B696bB17031bb7";
const withSponsorship = {
  paymasterServiceData: { mode: PaymasterMode.SPONSORED },
};
const bundlerUrl = "https://bundler.biconomy.io/api/v2/11155111/nJPK7B3ru.dd7f7861-190d-41bd-af80-6877f74b8f44"
const paymasterUrl = "https://paymaster.biconomy.io/api/v1/11155111/XvNTzmUlE.ab3f2396-fd05-49f2-a42b-9ded53017432";
const chainId = 11155111;

export const createMySession = async (usersSmartAccount, address) => {
  const { sessionKeyAddress, sessionStorageClient } = await createSessionKeyEOA(
    usersSmartAccount,
    chain
  );

  const rules: Rule[] = [
    {
      offset: 0,
      /**
       * Conditions:
       *
       * 0 - Equal
       * 1 - Less than or equal
       * 2 - Less than
       * 3 - Greater than or equal
       * 4 - Greater than
       * 5 - Not equal
       */
      condition: 0,
      referenceValue: address,
    },
  ];

  const policy: Policy[] = [
    {
      sessionKeyAddress,
      contractAddress: nftAddress,
      functionSelector: "verify(address, uint, uint8, bytes32, bytes32, bytes32)",
      rules,
      interval: {
        validUntil: 0,
        validAfter: 0,
      },
      valueLimit: 0n,
    },
  ];

  const { wait, session } = await createSession(
    usersSmartAccount,
    policy,
    sessionKeyAddress,
    sessionStorageClient,
    withSponsorship
  );

  const {
    receipt: { transactionHash },
    success,
  } = await wait();
  console.log(success, transactionHash)
  return session;
}

export const UseSessionKeys = async (session, person, signkey, web3) => {
  const emulatedUsersSmartAccount = await createSessionSmartAccountClient(
    {
      accountAddress: session.sessionStorageClient.smartAccountAddress,
      bundlerUrl,
      paymasterUrl,
      chainId,
    },
    session
  );
  const { r, s, v } = await signData(web3, person);
  const nftMintTx = {
    to: nftAddress,
    data: encodeFunctionData({
      abi: parseAbi(["function verify(address person, uint amount, uint8 v, bytes32 r, bytes32 s, bytes32 signkey)"]),
      functionName: "verify",
      args: [person, BigInt(1), v, r, s, signkey],
    }),
  };

  const { wait } = await emulatedUsersSmartAccount.sendTransaction(
    nftMintTx,
    withSponsorship
  );

  const result = await wait();
  console.log(result)
}


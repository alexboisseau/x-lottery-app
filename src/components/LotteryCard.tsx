import { ethers } from "ethers";
import "./LotteryCard.scss";
import { useEffect, useState } from "react";
import {
  LOTTERY_CONTRACT_ABI,
  LOTTERY_CONTRACT_ADDRESS,
  LOTTERY_ENTRANCE_FEE,
} from "../constants";
import { GiTicket } from "react-icons/gi";
import { toast } from "react-hot-toast";
import { LotteryCardInformations } from "./LotteryCardInformations";

const getWeb3Provider = (): ethers.providers.Web3Provider | null => {
  if (!window.ethereum) return null;

  const { ethereum } = window;
  const provider = new ethers.providers.Web3Provider(ethereum);
  return provider;
};

export const LotteryCard = () => {
  /** STATE VARIABLES */
  const [hasEthereumExtension, setHasEthereumExtension] =
    useState<boolean>(false);
  const [provider, setProvider] = useState<ethers.providers.Web3Provider>();
  const [waitingForTxValidation, setWaitingForTxValidation] =
    useState<boolean>(false);

  /** METHODS */
  const getLotteryContract = (
    providerOrSigner: ethers.providers.Web3Provider | ethers.Signer
  ) => {
    try {
      const readContract = new ethers.Contract(
        LOTTERY_CONTRACT_ADDRESS,
        LOTTERY_CONTRACT_ABI,
        providerOrSigner
      );

      return readContract;
    } catch (error) {
      console.log("ERROR in getLotteryContract : ", error);
    }
  };

  const buyTicket = async () => {
    if (!provider) return;

    let signer: ethers.providers.JsonRpcSigner;

    try {
      signer = provider.getSigner();
      await signer.getAddress();
    } catch (error) {
      console.log(error);
      await window.ethereum.request({
        method: "eth_requestAccounts",
      });

      signer = provider.getSigner();
    }

    try {
      const contract = getLotteryContract(signer);

      if (!contract) return;

      setWaitingForTxValidation(true);

      const tx = await contract.enterLottery({
        value: LOTTERY_ENTRANCE_FEE,
      });

      const myPromise = new Promise<void>((resolve, reject) => {
        tx.wait().then((txResult: any) => {
          if (txResult.status === 0) {
            reject();
          } else {
            resolve();
          }

          setWaitingForTxValidation(false);
        });
      });

      toast.promise(myPromise, {
        loading: "Waiting transaction confirmation",
        success: "Transaction confirmed !",
        error: "Oops ... Transaction failed",
      });
    } catch (error) {
      setWaitingForTxValidation(false);
    }
  };

  useEffect(() => {
    if (!window.ethereum) return;
    setHasEthereumExtension(true);

    const provider = getWeb3Provider();
    if (provider === null) return;
    setProvider(provider);
  }, []);

  useEffect(() => {
    if (!provider) return;

    const contract = getLotteryContract(provider);
    if (!contract) return;
  }, [provider]);

  return (
    <div className="lottery-card">
      <h1>Welcome to xLottery !</h1>

      {!hasEthereumExtension ? (
        <p>Please, install Metamask</p>
      ) : (
        <>
          <LotteryCardInformations provider={provider!} />
          {waitingForTxValidation ? (
            <button className="buy-ticket-button">
              <span>Waiting for the validation of the transaction ...</span>
              <GiTicket />
            </button>
          ) : (
            <button className="buy-ticket-button" onClick={buyTicket}>
              <span>Buy ticket</span>
              <GiTicket />
            </button>
          )}
        </>
      )}
    </div>
  );
};

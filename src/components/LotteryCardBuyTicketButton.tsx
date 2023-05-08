import { useState } from "react";

/** CONSTANTS */
import {
  LOTTERY_CONTRACT_ABI,
  LOTTERY_CONTRACT_ADDRESS,
  LOTTERY_ENTRANCE_FEE,
} from "../constants";

/** ETHERS */
import { ethers } from "ethers";

/** REACT-HOT-TOAST */
import { toast } from "react-hot-toast";

/** REACT_ICONS */
import { GiTicket } from "react-icons/gi";

/** STYLES */
import "./LotteryCardBuyTicketButton.scss";

export interface LotteryCardBuyTicketButtonProps {
  provider: ethers.providers.Web3Provider;
}

export const LotteryCardBuyTicketButton = ({
  provider,
}: LotteryCardBuyTicketButtonProps) => {
  const [waitingForTxValidation, setWaitingForTxValidation] =
    useState<boolean>(false);

  const buyTicket = async () => {
    let signer: ethers.providers.JsonRpcSigner;

    try {
      signer = provider.getSigner();
      await signer.getAddress();
    } catch (error) {
      await window.ethereum.request({
        method: "eth_requestAccounts",
      });

      signer = provider.getSigner();
    }

    try {
      const contract = new ethers.Contract(
        LOTTERY_CONTRACT_ADDRESS,
        LOTTERY_CONTRACT_ABI,
        signer
      );

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
      console.log(error);
      setWaitingForTxValidation(false);
    }
  };

  return waitingForTxValidation ? (
    <button className="buy-ticket-button waiting">
      <span>Waiting transaction confirmation ...</span>
      <GiTicket />
    </button>
  ) : (
    <button className="buy-ticket-button" onClick={buyTicket}>
      <span>Buy ticket</span>
      <GiTicket />
    </button>
  );
};

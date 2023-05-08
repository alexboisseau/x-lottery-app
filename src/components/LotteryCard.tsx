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
import { LotteryCardBuyTicketButton } from "./LotteryCardBuyTicketButton";

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

  useEffect(() => {
    if (!window.ethereum) return;
    setHasEthereumExtension(true);

    const provider = getWeb3Provider();
    if (provider === null) return;
    setProvider(provider);
  }, []);

  return (
    <div className="lottery-card">
      <h1>Welcome to xLottery !</h1>

      {!hasEthereumExtension || !provider ? (
        <p>Please, install Metamask</p>
      ) : (
        <>
          <LotteryCardInformations provider={provider} />
          <LotteryCardBuyTicketButton provider={provider} />
        </>
      )}
    </div>
  );
};

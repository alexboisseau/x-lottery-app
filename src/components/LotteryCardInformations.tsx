import { useCallback, useEffect, useState } from "react";

/** CONSTANTS */
import {
  LOTTERY_CONTRACT_ABI,
  LOTTERY_CONTRACT_ADDRESS,
  LOTTERY_CONTRACT_EVENTS,
} from "../constants";

/** ETHERS */
import { ethers } from "ethers";

/** STYLES */
import "./LotteryCardInformations.scss";

export interface LotteryCardInformations {
  provider: ethers.providers.Web3Provider;
}

export const LotteryCardInformations = ({
  provider,
}: LotteryCardInformations) => {
  const [recentWinner, setRecentWinner] = useState<string>("");
  const [lotteryBalance, setLotteryBalance] = useState<string>("");
  const [numberOfPlayers, setNumberOfPlayers] = useState<number>(0);

  const getLotteryContract = useCallback(() => {
    return new ethers.Contract(
      LOTTERY_CONTRACT_ADDRESS,
      LOTTERY_CONTRACT_ABI,
      provider
    );
  }, [provider]);

  const getLotteryBalance = useCallback(async (): Promise<void> => {
    try {
      const balance = await provider.getBalance(LOTTERY_CONTRACT_ADDRESS);
      setLotteryBalance(ethers.utils.formatEther(balance));
    } catch (error) {
      console.log("ERROR on getLotteryBalance method : ", error);
    }
  }, [provider]);

  const getNumberOfPlayers = useCallback(async (): Promise<void> => {
    try {
      const contract = getLotteryContract();
      const numberOfPlayers = await contract.getNumberOfPlayers();
      setNumberOfPlayers(numberOfPlayers.toNumber());
    } catch (error) {
      console.log("ERROR on getNumberOfPlayers : ", error);
    }
  }, [getLotteryContract]);

  const getRecentWinner = useCallback(async (): Promise<void> => {
    try {
      const contract = getLotteryContract();
      setRecentWinner(await contract.getRecentWinner());
    } catch (error) {
      console.log("ERROR on getRecentWinner : ", error);
    }
  }, [getLotteryContract]);

  const listenEnterLotteryEvent = useCallback(() => {
    try {
      const contract = getLotteryContract();
      contract.on(LOTTERY_CONTRACT_EVENTS.LotteryEnter, () => {
        getLotteryBalance();
        getNumberOfPlayers();
      });
    } catch (error) {
      console.log("ERROR on listenEnterLotteryEvent : ", error);
    }
  }, [getLotteryContract, getLotteryBalance, getNumberOfPlayers]);

  useEffect(() => {
    getLotteryBalance();
    getNumberOfPlayers();
    getRecentWinner();
    listenEnterLotteryEvent();
  }, [
    getLotteryBalance,
    getNumberOfPlayers,
    getRecentWinner,
    listenEnterLotteryEvent,
  ]);

  return (
    <div className="lottery-card-informations">
      <p>
        <span className="label">Recent winner :</span>{" "}
        <span className="value">{recentWinner}</span>
      </p>
      <p>
        <span className="label">Lottery balance :</span>{" "}
        <span className="value">{lotteryBalance} ETH</span>
      </p>
      <p>
        <span className="label">Number of players for this round :</span>{" "}
        <span className="value">{numberOfPlayers}</span>
      </p>
    </div>
  );
};

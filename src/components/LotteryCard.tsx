import { ethers } from "ethers";
import "./LotteryCard.scss";
import { useCallback, useEffect, useState } from "react";
import {
  LOTTERY_CONTRACT_ABI,
  LOTTERY_CONTRACT_ADDRESS,
  LOTTERY_ENTRANCE_FEE,
} from "../constants";
import { GiTicket } from "react-icons/gi";
import { toast } from "react-hot-toast";

const getWeb3Provider = (): ethers.providers.Web3Provider | null => {
  if (!window.ethereum) return null;

  const { ethereum } = window;
  const provider = new ethers.providers.Web3Provider(ethereum);
  return provider;
};

export const LotteryCard = () => {
  /** STATE VARIABLES */
  const [provider, setProvider] =
    useState<ethers.providers.Web3Provider | null>(null);
  const [recentWinner, setRecentWinner] = useState<string>("");
  const [lotteryBalance, setLotteryBalance] = useState<string>("");
  const [numberOfPlayers, setNumberOfPlayers] = useState<number>(0);
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

  const getLotteryBalance = useCallback(async (): Promise<void> => {
    if (!provider) return;

    try {
      const balance = await provider.getBalance(LOTTERY_CONTRACT_ADDRESS);
      setLotteryBalance(ethers.utils.formatEther(balance));
    } catch (error) {
      console.log("ERROR on getLotteryBalance method : ", error);
    }
  }, [provider]);

  const getNumberOfPlayers = useCallback(async (): Promise<void> => {
    if (!provider) return;

    try {
      const contract = getLotteryContract(provider);
      if (!contract) return;

      const numberOfPlayers = await contract.getNumberOfPlayers();
      setNumberOfPlayers(numberOfPlayers.toNumber());
    } catch (error) {
      console.log("ERROR on getNumberOfPlayers : ", error);
    }
  }, [provider]);

  const getRecentWinner = useCallback(async (): Promise<void> => {
    if (!provider) return;

    try {
      const contract = getLotteryContract(provider);
      if (!contract) return;

      setRecentWinner(await contract.getRecentWinner());
    } catch (error) {
      console.log("ERROR on getRecentWinner : ", error);
    }
  }, [provider]);

  const handleTxValidation = useCallback(
    (address: string) => {
      console.log("TICKET BUY BY: ", address);
      if (!provider) return;

      const contract = getLotteryContract(provider);
      if (!contract) return;

      getLotteryBalance();
      getNumberOfPlayers();
    },
    [provider, getLotteryBalance, getNumberOfPlayers]
  );

  const buyTicket = async () => {
    if (!provider) return;

    try {
      const signer = provider.getSigner();
      const contract = getLotteryContract(signer);

      if (!contract) return;

      setWaitingForTxValidation(true);

      const tx = await contract.enterLottery({
        value: LOTTERY_ENTRANCE_FEE,
      });

      const myPromise = new Promise<void>((resolve, reject) => {
        tx.wait().then((txResult: any) => {
          console.log("transaction : ", txResult);
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
      console.log("Error during the tx signature");
      setWaitingForTxValidation(false);
    }
  };

  useEffect(() => {
    const provider = getWeb3Provider();
    if (provider === null) return;
    setProvider(provider);
  }, []);

  useEffect(() => {
    if (!provider) return;

    const contract = getLotteryContract(provider);
    if (!contract) return;

    contract.on("LotteryEnter", (playerAddress: string) => {
      handleTxValidation(playerAddress);
    });
  }, [handleTxValidation, provider]);

  useEffect(() => {
    getRecentWinner();
  }, [getRecentWinner]);

  useEffect(() => {
    getNumberOfPlayers();
  });

  useEffect(() => {
    getLotteryBalance();
  }, [getLotteryBalance]);

  return (
    <div className="lottery-card">
      <h1>Welcome to xLottery !</h1>

      <div className="informations">
        <p>
          <span className="label">Recent winner :</span>{" "}
          <span className="value">{recentWinner}</span>
        </p>
        <p>
          <span className="label">Current balance :</span>{" "}
          <span className="value">{lotteryBalance} ETH</span>
        </p>
        <p>
          <span className="label">Number of players for this round :</span>{" "}
          <span className="value">{numberOfPlayers}</span>
        </p>
      </div>

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
    </div>
  );
};

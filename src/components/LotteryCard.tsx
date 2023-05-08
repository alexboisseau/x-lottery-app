import { ethers } from "ethers";
import "./LotteryCard.scss";
import { useEffect, useState } from "react";
import { SEPOLIA_CHAIN_ID, SEPOLIA_CHAIN_ID_HEX } from "../constants";
import { LotteryCardInformations } from "./LotteryCardInformations";
import { LotteryCardBuyTicketButton } from "./LotteryCardBuyTicketButton";

const getWeb3Provider = (): ethers.providers.Web3Provider | null => {
  if (!window.ethereum) return null;

  const { ethereum } = window;
  const provider = new ethers.providers.Web3Provider(ethereum);
  return provider;
};

const switchNetwork = async () => {
  await window.ethereum.request({
    method: "wallet_switchEthereumChain",
    params: [{ chainId: SEPOLIA_CHAIN_ID_HEX }],
  });
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

  useEffect(() => {
    if (!provider) return;

    provider.getNetwork().then((network: ethers.providers.Network) => {
      if (network.chainId !== SEPOLIA_CHAIN_ID) {
        switchNetwork();
      }
    });
  }, [provider]);

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

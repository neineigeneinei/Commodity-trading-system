import { useState, useEffect } from "react";
import { ethers } from "ethers";
import MarketArtifact from "../artifacts/Market.json";

const MARKET_CONTRACT_ADDRESS = "0x8464135c8F25Da09e49BC8782676a84730C318bC";

const useContract = () => {
  const [contract, setContract] = useState(null);

  useEffect(() => {
    const initContract = async () => {
      try {
        if (window.ethereum) {
          const provider = new ethers.BrowserProvider(window.ethereum);
          const signer = await provider.getSigner();
          const marketContract = new ethers.Contract(
            MARKET_CONTRACT_ADDRESS,
            MarketArtifact.abi,
            signer
          );
          setContract(marketContract);
        } else {
          console.error("请安装MetaMask!");
        }
      } catch (error) {
        console.error("初始化合约失败:", error);
      }
    };

    initContract();
  }, []);

  return contract;
};

export default useContract;

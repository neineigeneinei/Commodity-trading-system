import { useState, useEffect } from "react";
import { ethers } from "ethers";
import UserAuthArtifact from "../artifacts/UserAuth.json";

const USER_AUTH_CONTRACT_ADDRESS = "0x9fE46736679d2D9a65F0992F2272dE9f3c7fa6e0";

const useUserRole = () => {
  const [userRole, setUserRole] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchUserRole = async () => {
      try {
        if (!window.ethereum || !window.ethereum.selectedAddress) {
          setUserRole(null);
          setIsLoading(false);
          return;
        }

        const provider = new ethers.BrowserProvider(window.ethereum);
        const signer = await provider.getSigner();
        const contract = new ethers.Contract(
          USER_AUTH_CONTRACT_ADDRESS,
          UserAuthArtifact.abi,
          signer
        );

        const userInfo = await contract.getUser(
          window.ethereum.selectedAddress
        );
        setUserRole(Number(userInfo.role));
        setError(null);
      } catch (error) {
        console.error("获取用户角色失败:", error);
        setError("获取用户角色失败");
        setUserRole(null);
      } finally {
        setIsLoading(false);
      }
    };

    fetchUserRole();

    // 监听钱包地址变化
    if (window.ethereum) {
      window.ethereum.on("accountsChanged", fetchUserRole);
    }

    return () => {
      if (window.ethereum) {
        window.ethereum.removeListener("accountsChanged", fetchUserRole);
      }
    };
  }, []);

  return { userRole, isLoading, error };
};

export default useUserRole;

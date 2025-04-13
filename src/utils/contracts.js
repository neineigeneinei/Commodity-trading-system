import { ethers } from "ethers";
import UserAuthABI from "../artifacts/UserAuth.json";

// 合约地址，需要在部署后更新
export const USER_AUTH_ADDRESS = "0x71C95911E9a5D330f4D621842EC243EE1343292e";

// 获取以太坊提供者和签名者
export const getEthereumProvider = async () => {
  if (!window.ethereum) {
    throw new Error("请安装MetaMask钱包");
  }
  await window.ethereum.request({ method: "eth_requestAccounts" });
  const provider = new ethers.BrowserProvider(window.ethereum);
  const signer = await provider.getSigner();
  return { provider, signer };
};

// 创建UserAuth合约实例
export const getUserAuthContract = async (signer) => {
  return new ethers.Contract(USER_AUTH_ADDRESS, UserAuthABI.abi, signer);
};

// 用户注册
export const registerUser = async (name) => {
  try {
    const { signer } = await getEthereumProvider();
    const contract = await getUserAuthContract(signer);

    const tx = await contract.registerUser(name);
    await tx.wait();

    return { success: true };
  } catch (error) {
    console.error("注册失败:", error);
    return { success: false, error: error.message };
  }
};

// 检查用户是否为管理员
export const checkIsAdmin = async () => {
  try {
    const { signer } = await getEthereumProvider();
    const contract = await getUserAuthContract(signer);
    const address = await signer.getAddress();
    const isAdmin = await contract.isAdmin(address);
    return { success: true, isAdmin };
  } catch (error) {
    console.error("检查管理员身份失败:", error);
    return { success: false, error: error.message };
  }
};

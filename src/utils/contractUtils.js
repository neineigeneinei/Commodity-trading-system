/* global BigInt */
import { ethers } from "ethers";
import MarketArtifact from "../artifacts/Market.json";
import UserAuthArtifact from "../artifacts/UserAuth.json";

const MARKET_CONTRACT_ADDRESS = "0x8464135c8F25Da09e49BC8782676a84730C318bC";
const USER_AUTH_CONTRACT_ADDRESS = "0x71C95911E9a5D330f4D621842EC243EE1343292e";

// 获取以太坊提供者
const getProvider = () => {
  if (!window.ethereum) {
    throw new Error("请安装MetaMask钱包");
  }
  return new ethers.BrowserProvider(window.ethereum);
};

// 获取签名者
const getSigner = async () => {
  const provider = getProvider();
  await provider.send("eth_requestAccounts", []);
  return provider.getSigner();
};

// 获取Market合约实例
const getMarketContract = async (withSigner = false) => {
  if (!MARKET_CONTRACT_ADDRESS) {
    throw new Error("未设置Market合约地址");
  }
  const provider = getProvider();
  const contract = new ethers.Contract(
    MARKET_CONTRACT_ADDRESS,
    MarketArtifact.abi,
    withSigner ? await getSigner() : provider
  );

  // 重写合约方法以确保正确处理数值类型
  const originalGetProduct = contract.getProduct;
  contract.getProduct = async (productId) => {
    const numericId = BigInt(productId);
    return originalGetProduct(numericId);
  };

  return contract;
};

// 获取UserAuth合约实例
const getUserAuthContract = async (withSigner = false) => {
  if (!USER_AUTH_CONTRACT_ADDRESS) {
    throw new Error("未设置UserAuth合约地址");
  }
  const provider = getProvider();
  const contract = new ethers.Contract(
    USER_AUTH_CONTRACT_ADDRESS,
    UserAuthArtifact.abi,
    withSigner ? await getSigner() : provider
  );
  return contract;
};

// 上架商品
const listProduct = async (name, price, mainCategory, subCategory, image) => {
  try {
    // 获取合约实例和签名者
    const provider = getProvider();
    const signer = await getSigner();
    const address = await signer.getAddress();

    console.log("合约地址:", MARKET_CONTRACT_ADDRESS);
    console.log("调用者地址:", address);

    // 检查用户是否有权限上架商品
    const userAuthContract = await getUserAuthContract();
    console.log("UserAuth合约地址:", USER_AUTH_CONTRACT_ADDRESS);

    try {
      const isSeller = await userAuthContract.isSeller(address);
      console.log("用户卖家状态:", isSeller);
      if (!isSeller) {
        throw new Error("用户不是卖家，无法上架商品");
      }
    } catch (authError) {
      console.error("检查卖家权限失败:", authError);
      throw new Error(`检查卖家权限失败: ${authError.message}`);
    }

    // 使用ethers.parseEther将价格转换为Wei单位
    const priceValue = ethers.parseEther(price.toString());

    // 参数验证
    if (!name || typeof name !== "string") throw new Error("商品名称无效");
    if (!mainCategory || typeof mainCategory !== "string")
      throw new Error("主分类无效");
    if (!subCategory || typeof subCategory !== "string")
      throw new Error("子分类无效");
    if (!image || typeof image !== "string") throw new Error("图片地址无效");

    // 获取合约实例
    const contract = await getMarketContract(true);

    // 检查网络状态
    try {
      const network = await provider.getNetwork();
      console.log("当前网络:", {
        chainId: network.chainId.toString(),
        name: network.name,
      });

      // 检查用户余额
      const balance = await provider.getBalance(address);
      console.log("用户余额:", ethers.formatEther(balance), "ETH");
    } catch (networkError) {
      console.error("获取网络信息失败:", networkError);
    }

    // 调用合约方法
    console.log("准备调用合约方法，参数:", {
      name,
      price: priceValue, // 使用原始价格值
      mainCategory,
      subCategory,
      image,
    });

    let tx;
    let productId;
    try {
      const estimatedGas = await contract.listProduct.estimateGas(
        name,
        priceValue,
        mainCategory,
        subCategory,
        image
      );
      console.log("预估gas费用:", estimatedGas.toString());

      tx = await contract.listProduct(
        name,
        priceValue,
        mainCategory,
        subCategory,
        image,
        { gasLimit: Math.floor(Number(estimatedGas) * 1.2) } // 使用数值计算，设置gas限制为预估值的1.2倍
      );
      console.log("交易已发送，等待确认...");
      console.log("交易哈希:", tx.hash);

      const receipt = await tx.wait();
      console.log("交易收据:", {
        blockNumber: receipt.blockNumber,
        gasUsed: receipt.gasUsed.toString(),
        status: receipt.status,
      });

      // 从交易收据中获取ProductListed事件
      const productListedEvent = receipt.logs
        .map((log) => {
          try {
            return contract.interface.parseLog(log);
          } catch (e) {
            return null;
          }
        })
        .find((event) => event && event.name === "ProductListed");

      if (!productListedEvent) {
        throw new Error("未能从交易收据中获取商品ID");
      }

      productId = productListedEvent.args[0];
      console.log("获取到区块链商品ID:", productId.toString());
    } catch (txError) {
      console.error("交易执行失败:", txError);
      throw new Error(`交易执行失败: ${txError.message}`);
    }

    return {
      success: true,
      transactionHash: tx.hash,
      productId: productId.toString(),
    };
  } catch (error) {
    console.error("上架商品失败:", error);
    throw error;
  }
};

// 购买商品
const buyProduct = async (productId, price) => {
  try {
    const contract = await getMarketContract(true);
    const priceInWei = ethers.parseEther(price.toString());
    // 确保productId是数字类型
    const numericProductId = BigInt(productId);
    const tx = await contract.buyProduct(numericProductId, {
      value: priceInWei,
    });
    const receipt = await tx.wait();
    return {
      success: true,
      transactionHash: receipt.transactionHash,
    };
  } catch (error) {
    console.error("购买商品失败:", error);
    throw error;
  }
};

// 获取商品详情
const getProduct = async (productId) => {
  try {
    const contract = await getMarketContract();
    const product = await contract.getProduct(productId);
    return {
      id: product.id.toString(),
      name: product.name,
      price: product.price,
      mainCategory: product.mainCategory,
      subCategory: product.subCategory,
      image: product.image,
      specifications: product.specifications,
      sales: product.sales.toString(),
      seller: product.seller,
      isActive: product.isActive,
    };
  } catch (error) {
    console.error("获取商品详情失败:", error);
    throw error;
  }
};

export {
  getProvider,
  getSigner,
  getMarketContract,
  getUserAuthContract,
  listProduct,
  buyProduct,
  getProduct,
};

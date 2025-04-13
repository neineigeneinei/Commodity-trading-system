const express = require("express");
const router = express.Router();
const Database = require("../database/db");
const { v4: uuidv4 } = require("uuid");
const { Web3 } = require("web3");
const UserAuth = require("../contracts/contracts/UserAuth.sol/UserAuth.json");

// 初始化Web3
const web3 = new Web3(process.env.WEB3_PROVIDER_URL);
const adminAccount = web3.eth.accounts.privateKeyToAccount(
  process.env.ADMIN_PRIVATE_KEY
);
web3.eth.accounts.wallet.add(adminAccount);
const userAuthContract = new web3.eth.Contract(
  UserAuth.abi,
  process.env.USER_AUTH_CONTRACT_ADDRESS
);

// 用户注册
router.post("/register", async (req, res) => {
  try {
    const { walletAddress, username, email, password } = req.body;  // 添加 email 和 password
    console.log("收到注册请求:", { walletAddress, username, email });

    // 验证请求数据
    if (!walletAddress || !username || !email || !password) {  // 添加验证
      return res.status(400).json({
        success: false,
        message: "钱包地址、用户名、邮箱和密码是必需的",
      });
    }

    // 暂时注释该段钱包地址注册匹配的功能，便于测试
    // 检查钱包地址是否已注册
    const existingUser = await Database.findOne("users", {
      wallet_address: walletAddress,
    });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: "该钱包地址已注册",
      });
    }

    // 在数据库中创建用户
    const userId = uuidv4();
    const userData = {
      id: userId,
      wallet_address: walletAddress,
      username: username,
      email: email,           
      password: password,     
      created_at: new Date(),
      updated_at: new Date(),
    };

    await Database.insert("users", userData);
    console.log("用户数据库记录创建成功");

    res.status(201).json({
      success: true,
      message: "用户注册成功",
      data: {
        userId,
        walletAddress,
        username,
        contractAddress: process.env.USER_AUTH_CONTRACT_ADDRESS,
        contractABI: UserAuth.abi,
      },
    });
  } catch (error) {
    console.error("注册过程发生错误:", error);
    res.status(500).json({
      success: false,
      message: "用户注册失败",
      error: error.message,
    });
  }
});

// 用户登录
router.post("/login", async (req, res) => {
  try {
    const { email, password, walletAddress } = req.body;

    // 验证请求数据
    if (!email || !password || !walletAddress) {
      return res.status(400).json({
        success: false,
        message: "邮箱、密码和钱包地址都是必需的",
      });
    }

    // 先通过邮箱查找用户
    const user = await Database.findOne("users", { email });
    if (!user) {
      return res.status(401).json({
        success: false,
        message: "用户不存在",
      });
    }

    // 验证钱包地址
    if (user.wallet_address !== walletAddress) {
      return res.status(401).json({
        success: false,
        message: "钱包地址不匹配",
      });
    }

    // 验证密码
    if (user.password !== password) { // 注意：实际应用中应该使用加密密码
      return res.status(401).json({
        success: false,
        message: "密码错误",
      });
    }

    // 调用智能合约验证用户状态
    try {
      const userInfo = await userAuthContract.methods
        .getUser(walletAddress)
        .call();

      // 格式化智能合约返回的数据
      const formattedUserInfo = {
        role: Number(userInfo.role),
        isActive: Boolean(userInfo.isActive),
        registerTime: userInfo.registerTime.toString()
      };

      res.json({
        success: true,
        message: "登录成功",
        data: {
          userId: user.id,
          walletAddress: user.wallet_address,
          username: user.username,
          email: user.email,
          role: formattedUserInfo.role || "user",
          isActive: formattedUserInfo.isActive,
          registerTime: formattedUserInfo.registerTime
        },
      });
    } catch (contractError) {
      // 如果智能合约调用失败，仍然允许登录，但使用默认角色
      console.error("智能合约调用错误:", contractError);
      res.json({
        success: true,
        message: "登录成功（无法验证智能合约状态）",
        data: {
          userId: user.id,
          walletAddress: user.wallet_address,
          username: user.username,
          email: user.email,
          role: "user",
        },
      });
    }
  } catch (error) {
    console.error("登录过程发生错误:", error);
    res.status(500).json({
      success: false,
      message: "登录失败",
      error: error.message,
    });
  }
});

// 获取用户信息
router.get("/profile", async (req, res) => {
  try {
    // TODO: 从JWT令牌中获取用户ID
    // TODO: 从数据库获取用户信息
    res.json({
      success: true,
      data: {
        email: "user@example.com",
        walletAddress: "0x...",
        // 其他用户信息
      },
      message: "获取用户信息成功",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "获取用户信息失败",
      error: error.message,
    });
  }
});

// 更新用户信息
router.put("/profile", async (req, res) => {
  try {
    const updateData = req.body;
    // TODO: 更新数据库中的用户信息
    res.json({
      success: true,
      message: "用户信息更新成功",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "用户信息更新失败",
      error: error.message,
    });
  }
});

module.exports = router;

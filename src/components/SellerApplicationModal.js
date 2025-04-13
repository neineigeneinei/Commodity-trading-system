import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Box,
} from "@mui/material";
import { ethers } from "ethers";

const SellerApplicationModal = ({
  show,
  onHide,
  userAuthContract,
  userWallet,
}) => {
  const [userInfo, setUserInfo] = useState({
    name: "",
    registerTime: "",
    balance: "0",
  });
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (show && userWallet && userAuthContract) {
      fetchUserInfo();
    }
  }, [show, userWallet, userAuthContract]);

  const fetchUserInfo = async () => {
    try {
      // 从智能合约获取用户信息
      const userData = await userAuthContract.getUser(userWallet);
      console.log("合约返回的原始数据:", userData);

      // 获取账户余额
      const provider = new ethers.BrowserProvider(window.ethereum);
      const balance = await provider.getBalance(userWallet);
      const balanceInEth = ethers.formatEther(balance);

      // 检查用户数据
      if (!userData || !userData.name) {
        throw new Error("用户未注册");
      }

      // 检查用户状态
      if (!userData.isActive) {
        throw new Error("用户账户未激活");
      }

      setUserInfo({
        name: userData.name || "未设置",
        registerTime: userData.registerTime
          ? new Date(Number(userData.registerTime) * 1000).toLocaleString()
          : "未知",
        balance: balanceInEth,
      });
    } catch (error) {
      console.error("获取用户信息失败:", error);
      // 设置默认值
      const provider = new ethers.BrowserProvider(window.ethereum);
      const balance = await provider.getBalance(userWallet);

      setUserInfo({
        name: "未注册用户",
        registerTime: "未注册",
        balance: ethers.formatEther(balance),
      });

      // 显示具体错误信息
      if (error.message.includes("未激活")) {
        alert("您的账户未激活，请联系管理员");
      }
    }
  };

  const handleSubmit = async () => {
    setIsLoading(true);
    // console.log("handleSubmit");

    try {
      // 调用智能合约
      const tx = await userAuthContract.applyForSeller();
      await tx.wait();

      // 调用后端API
      const response = await fetch(
        "http://localhost:5000/api/seller-applications/",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            walletAddress: userWallet,
            userName: userInfo.name,
          }),
        }
      );

      if (!response.ok) {
        throw new Error("后端API调用失败");
      }

      onHide();
      alert("申请已提交成功！");
    } catch (error) {
      console.error("提交申请失败:", error);
      alert("提交申请失败，请稍后重试");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog
      open={show}
      onClose={onHide}
      PaperProps={{
        sx: {
          backgroundColor: "white",
          minWidth: "400px",
          borderRadius: 2,
        },
      }}
    >
      <DialogTitle
        sx={{ color: "#333", textAlign: "center", fontSize: "1.5rem", pt: 3 }}
      >
        申请成为卖家
      </DialogTitle>
      <DialogContent>
        <Box sx={{ p: 3 }}>
          <TextField
            fullWidth
            label="用户名"
            value={userInfo.name}
            disabled
            margin="normal"
            sx={{
              "& .MuiOutlinedInput-root": {
                "& fieldset": { borderColor: "rgba(0, 0, 0, 0.23)" },
                "&:hover fieldset": { borderColor: "rgba(0, 0, 0, 0.5)" },
                "&.Mui-focused fieldset": { borderColor: "#FFD700" },
                "& input": { color: "#333" },
                "&.Mui-disabled": {
                  "& fieldset": { borderColor: "rgba(0, 0, 0, 0.23)" },
                  "& input": { color: "rgba(0, 0, 0, 0.6)" },
                },
              },
              "& .MuiInputLabel-root": {
                color: "rgba(0, 0, 0, 0.6)",
                "&.Mui-disabled": { color: "rgba(0, 0, 0, 0.38)" },
              },
            }}
          />
          <TextField
            fullWidth
            label="注册时间"
            value={userInfo.registerTime}
            disabled
            margin="normal"
            sx={{
              "& .MuiOutlinedInput-root": {
                "& fieldset": { borderColor: "rgba(0, 0, 0, 0.23)" },
                "&:hover fieldset": { borderColor: "rgba(0, 0, 0, 0.5)" },
                "&.Mui-focused fieldset": { borderColor: "#FFD700" },
                "& input": { color: "#333" },
                "&.Mui-disabled": {
                  "& fieldset": { borderColor: "rgba(0, 0, 0, 0.23)" },
                  "& input": { color: "rgba(0, 0, 0, 0.6)" },
                },
              },
              "& .MuiInputLabel-root": {
                color: "rgba(0, 0, 0, 0.6)",
                "&.Mui-disabled": { color: "rgba(0, 0, 0, 0.38)" },
              },
            }}
          />
          <TextField
            fullWidth
            label="账户余额"
            value={`${userInfo.balance} ETH`}
            disabled
            margin="normal"
            sx={{
              "& .MuiOutlinedInput-root": {
                "& fieldset": { borderColor: "rgba(0, 0, 0, 0.23)" },
                "&:hover fieldset": { borderColor: "rgba(0, 0, 0, 0.5)" },
                "&.Mui-focused fieldset": { borderColor: "#FFD700" },
                "& input": { color: "#333" },
                "&.Mui-disabled": {
                  "& fieldset": { borderColor: "rgba(0, 0, 0, 0.23)" },
                  "& input": { color: "rgba(0, 0, 0, 0.6)" },
                },
              },
              "& .MuiInputLabel-root": {
                color: "rgba(0, 0, 0, 0.6)",
                "&.Mui-disabled": { color: "rgba(0, 0, 0, 0.38)" },
              },
            }}
          />
        </Box>
      </DialogContent>
      <DialogActions sx={{ p: 3, pt: 1 }}>
        <Button
          onClick={onHide}
          sx={{
            color: "#333",
            borderColor: "rgba(255, 215, 0, 0.1)",
            "&:hover": {
              borderColor: "#FFD700",
              backgroundColor: "rgba(255, 215, 0, 0.1)",
            },
          }}
          variant="outlined"
        >
          取消
        </Button>
        <Button
          onClick={handleSubmit}
          disabled={isLoading}
          sx={{
            backgroundColor: "#FFD700",
            color: "black",
            borderRadius: 2,
            px: 4,
            "&:hover": {
              backgroundColor: "#FFD700",
              opacity: 0.9,
            },
            "&.Mui-disabled": {
              backgroundColor: "rgba(255, 215, 0, 0.3)",
              color: "rgba(255, 255, 255, 0.5)",
            },
          }}
          variant="contained"
        >
          {isLoading ? "提交中..." : "提交申请"}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default SellerApplicationModal;

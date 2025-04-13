import React, { useState, useEffect } from "react";
import {
  Box,
  Typography,
  Grid,
  Paper,
  Button,
  IconButton,
  CircularProgress,
} from "@mui/material";
import { Delete } from "@mui/icons-material";
import useContract from "../hooks/useContract";
import { ethers } from "ethers";

const Cart = () => {
  const contract = useContract();
  const [cartItems, setCartItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [checkoutLoading, setCheckoutLoading] = useState(false);

  useEffect(() => {
    const fetchCartItems = async () => {
      try {
        // 获取当前用户的钱包地址
        const walletAddress = window.ethereum?.selectedAddress;
        if (!walletAddress) {
          setError("请先连接钱包");
          setLoading(false);
          return;
        }

        const response = await fetch(
          `http://localhost:5000/api/cart/${walletAddress}`
        );
        const data = await response.json();

        if (data.success) {
          setCartItems(data.data);
        } else {
          setError(data.message || "获取购物车数据失败");
        }
      } catch (error) {
        console.error("获取购物车数据出错:", error);
        setError("获取购物车数据失败，请稍后重试");
      } finally {
        setLoading(false);
      }
    };

    fetchCartItems();
  }, []);

  // 删除购物车商品
  const handleDelete = async (id) => {
    try {
      const walletAddress = window.ethereum?.selectedAddress;
      if (!walletAddress) {
        setError("请先连接钱包");
        return;
      }

      const response = await fetch(`http://localhost:5000/api/cart/${id}`, {
        method: "DELETE",
      });
      const result = await response.json();

      if (result.success) {
        setCartItems(cartItems.filter((item) => item.id !== id));
      } else {
        console.error("删除商品失败:", result.message);
      }
    } catch (error) {
      console.error("删除商品时出错:", error);
    }
  };

  // 计算总价
  const total = cartItems.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0
  );

  if (loading) {
    return (
      <Box
        sx={{
          padding: "20px 104px 0 104px",
          backgroundColor: "#211a21",
          minHeight: "100vh",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        <CircularProgress sx={{ color: "#FFD700" }} />
      </Box>
    );
  }

  if (error) {
    return (
      <Box
        sx={{
          padding: "20px 104px 0 104px",
          backgroundColor: "#211a21",
          minHeight: "100vh",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          flexDirection: "column",
        }}
      >
        <Typography variant="h6" sx={{ color: "#FFD700" }}>
          {error}
        </Typography>
      </Box>
    );
  }

  const handleCheckout = async () => {
    try {
      setCheckoutLoading(true);
      if (!window.ethereum || !window.ethereum.selectedAddress) {
        setError("请先连接钱包");
        return;
      }

      if (!contract) {
        setError("智能合约未初始化，请稍后重试");
        return;
      }

      // 计算所有商品的总价
      const totalPrice = cartItems.reduce(
        (sum, item) => sum + Number(item.price) * Number(item.quantity),
        0
      );

      // 一次性支付所有商品的总价
      // 循环调用合约的buyProduct方法购买每个商品
      for (const item of cartItems) {
        const transaction = await contract.buyProduct(
          parseInt(item.numeric_id),
          {
            value: ethers.parseEther(
              (Number(item.price) * Number(item.quantity)).toString()
            ),
          }
        );

        console.log(
          `商品 ${item.name} 交易已发送,等待确认。交易hash:`,
          transaction.hash
        );
        await transaction.wait();
        console.log(`商品 ${item.name} 交易已确认`);

        // 创建订单
        const timestamp = new Date().getTime();
        const randomNum = Math.floor(Math.random() * 10000);
        const orderId = `ORDER${timestamp}${randomNum}`;

        const orderResponse = await fetch("http://localhost:5000/api/orders", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            orderId: orderId,
            productId: parseInt(item.numeric_id),
            walletAddress: window.ethereum.selectedAddress,
            price: Number(item.price),
            quantity: Number(item.quantity),
            transactionHash: transaction.hash,
            productName: item.name,
            productImage: item.image_url,
          }),
        });

        if (!orderResponse.ok) {
          throw new Error(`创建商品 ${item.name} 的订单失败`);
        }
      }

      // 清空购物车
      const clearCartResponse = await fetch(
        `http://localhost:5000/api/cart/${window.ethereum.selectedAddress}/clear`,
        {
          method: "DELETE",
        }
      );

      if (!clearCartResponse.ok) {
        throw new Error("清空购物车失败");
      }

      // 更新购物车状态
      setCartItems([]);
      alert("结算成功！");
    } catch (error) {
      console.error("结算过程中出错：", error);
      setError("结算失败，请稍后重试");
    } finally {
      setCheckoutLoading(false);
    }
  };

  return (
    <Box
      sx={{
        padding: "20px 104px 0 104px",
        backgroundColor: "#211a21",
        minHeight: "100vh",
      }}
    >
      <Typography
        variant="h4"
        sx={{
          color: "#FFD700",
          marginBottom: "20px",
          textAlign: "center",
          fontWeight: "bold",
        }}
      >
        购物车
      </Typography>
      {cartItems.length === 0 ? (
        <Typography
          variant="h6"
          sx={{
            color: "white",
            textAlign: "center",
            marginTop: "50px",
          }}
        >
          购物车是空的
        </Typography>
      ) : (
        <Grid container spacing={3}>
          <Grid item xs={12} md={8}>
            {cartItems.map((item) => (
              <Paper
                key={item.id}
                sx={{
                  padding: 2,
                  backgroundColor: "#2d262c",
                  color: "white",
                  marginBottom: 2,
                  display: "flex",
                  alignItems: "center",
                }}
              >
                <Box
                  sx={{
                    width: 100,
                    height: 100,
                    marginRight: 2,
                    overflow: "hidden",
                    borderRadius: 1,
                  }}
                >
                  <img
                    src={item.image_url}
                    alt={item.name}
                    style={{
                      width: "100%",
                      height: "100%",
                      objectFit: "cover",
                    }}
                    onError={(e) => {
                      e.target.onerror = null;
                      e.target.src = "/images/default-product.jpg";
                    }}
                  />
                </Box>
                <Box sx={{ flexGrow: 1 }}>
                  <Typography variant="h6" sx={{ color: "#FFD700" }}>
                    {item.name}
                  </Typography>
                  <Typography variant="body1" sx={{ color: "#FFD700" }}>
                    {Number(item.price).toFixed(3)} ETH
                  </Typography>
                  <Typography variant="body2" sx={{ color: "#888" }}>
                    添加时间: {new Date(item.created_at).toLocaleString()}
                  </Typography>
                </Box>
                <IconButton
                  onClick={() => handleDelete(item.id)}
                  sx={{
                    color: "#FFD700",
                    "&:hover": {
                      color: "#ff4444",
                    },
                  }}
                >
                  <Delete />
                </IconButton>
              </Paper>
            ))}
          </Grid>
          <Grid item xs={12} md={4}>
            <Paper
              sx={{
                padding: 2,
                backgroundColor: "#2d262c",
                color: "white",
                position: "sticky",
                top: 100,
              }}
            >
              <Typography
                variant="h6"
                sx={{ color: "#FFD700", marginBottom: 2 }}
              >
                订单摘要
              </Typography>
              <Typography variant="body1" sx={{ marginBottom: 2 }}>
                商品总数:{" "}
                {cartItems.reduce((sum, item) => sum + item.quantity, 0)}
              </Typography>
              <Typography
                variant="h6"
                sx={{ color: "#FFD700", marginBottom: 2 }}
              >
                总计: {total.toFixed(3)} ETH
              </Typography>
              <Button
                variant="contained"
                fullWidth
                onClick={handleCheckout}
                disabled={checkoutLoading}
                sx={{
                  backgroundColor: "#FFD700",
                  color: "black",
                  "&:hover": {
                    backgroundColor: "#FFC000",
                  },
                }}
              >
                {checkoutLoading ? (
                  <CircularProgress size={24} sx={{ color: "black" }} />
                ) : (
                  "结算"
                )}
              </Button>
            </Paper>
          </Grid>
        </Grid>
      )}
    </Box>
  );
};

export default Cart;

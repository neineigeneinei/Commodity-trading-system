import React, { useState, useEffect } from "react";
import {
  Box,
  Typography,
  Grid,
  Paper,
  CircularProgress,
  Chip,
} from "@mui/material";

const MyOrders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const walletAddress = window.ethereum?.selectedAddress;
        if (!walletAddress) {
          setError("请先连接钱包");
          setLoading(false);
          return;
        }

        const response = await fetch(
          `http://localhost:5000/api/orders/${walletAddress}`
        );
        const data = await response.json();

        if (data.success) {
          setOrders(data.data);
        } else {
          setError(data.message || "获取订单数据失败");
        }
      } catch (error) {
        console.error("获取订单数据出错:", error);
        setError("获取订单数据失败，请稍后重试");
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, []);

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
        我的订单
      </Typography>
      {orders.length === 0 ? (
        <Typography
          variant="h6"
          sx={{
            color: "white",
            textAlign: "center",
            marginTop: "50px",
          }}
        >
          暂无订单
        </Typography>
      ) : (
        <Grid container spacing={3}>
          {orders.map((order) => (
            <Grid item xs={12} key={order.id}>
              <Paper
                sx={{
                  padding: 2,
                  backgroundColor: "#2d262c",
                  color: "white",
                }}
              >
                <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
                  <Typography
                    variant="h6"
                    sx={{ color: "#FFD700", flexGrow: 1 }}
                  >
                    订单号: {order.orderId}
                  </Typography>
                  <Chip
                    label={order.status}
                    sx={{
                      backgroundColor:
                        order.status === "已完成" ? "#4CAF50" : "#FFA726",
                      color: "white",
                    }}
                  />
                </Box>
                <Box sx={{ display: "flex", gap: 2 }}>
                  <Box
                    sx={{
                      width: 100,
                      height: 100,
                      overflow: "hidden",
                      borderRadius: 1,
                    }}
                  >
                    <img
                      src={order.productImage}
                      alt={order.productName}
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
                      {order.productName}
                    </Typography>
                    <Typography variant="body1" sx={{ color: "#FFD700" }}>
                      {Number(order.price).toFixed(3)} ETH
                    </Typography>
                    <Typography variant="body2" sx={{ color: "#888" }}>
                      数量: {order.quantity}
                    </Typography>
                    <Typography variant="body2" sx={{ color: "#888" }}>
                      交易时间: {new Date(order.created_at).toLocaleString()}
                    </Typography>
                    <Typography
                      variant="body2"
                      sx={{
                        color: "#888",
                        wordBreak: "break-all",
                      }}
                    >
                      交易哈希: {order.transactionHash}
                    </Typography>
                  </Box>
                </Box>
              </Paper>
            </Grid>
          ))}
        </Grid>
      )}
    </Box>
  );
};

export default MyOrders;
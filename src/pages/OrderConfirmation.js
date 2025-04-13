import React from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Box, Typography, Paper, Button, Grid } from "@mui/material";
import { CheckCircle } from "@mui/icons-material";

const OrderConfirmation = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { product, transactionInfo } = location.state || {};

  if (!product || !transactionInfo) {
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
        <Typography variant="h4" sx={{ color: "white" }}>
          订单信息不存在
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
      <Paper
        sx={{
          padding: 4,
          backgroundColor: "#2d262c",
          color: "white",
          borderRadius: 2,
          maxWidth: 800,
          margin: "0 auto",
        }}
      >
        <Box
          sx={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: 3,
          }}
        >
          <CheckCircle sx={{ color: "#4CAF50", fontSize: 64 }} />
          <Typography variant="h4" sx={{ color: "#FFD700" }}>
            购买成功！
          </Typography>

          <Grid container spacing={3}>
            <Grid item xs={12}>
              <Typography variant="h6" sx={{ color: "#FFD700", mb: 1 }}>
                订单信息
              </Typography>
              <Typography variant="body1">
                订单编号: {transactionInfo.orderId}
              </Typography>
              <Typography variant="body1">
                交易哈希: {transactionInfo.transactionHash}
              </Typography>
            </Grid>

            <Grid item xs={12}>
              <Typography variant="h6" sx={{ color: "#FFD700", mb: 1 }}>
                商品信息
              </Typography>
              <Box sx={{ display: "flex", gap: 2, alignItems: "center" }}>
                <img
                  src={product.image}
                  alt={product.name}
                  style={{
                    width: 100,
                    height: 100,
                    objectFit: "cover",
                    borderRadius: 8,
                  }}
                />
                <Box>
                  <Typography variant="h6">{product.name}</Typography>
                  <Typography variant="body1" sx={{ color: "#FFD700" }}>
                    {product.price} ETH
                  </Typography>
                  <Typography variant="body2" sx={{ color: "#888" }}>
                    {product.mainCategory} - {product.subCategory}
                  </Typography>
                </Box>
              </Box>
            </Grid>
          </Grid>

          <Box sx={{ display: "flex", gap: 2, mt: 3 }}>
            <Button
              variant="contained"
              onClick={() => navigate("/")}
              sx={{
                backgroundColor: "#FFD700",
                color: "#000",
                "&:hover": {
                  backgroundColor: "#FFC000",
                },
              }}
            >
              返回首页
            </Button>
            <Button
              variant="outlined"
              onClick={() => navigate("/buy")}
              sx={{
                color: "#FFD700",
                borderColor: "#FFD700",
                "&:hover": {
                  borderColor: "#FFD700",
                  backgroundColor: "rgba(255, 215, 0, 0.1)",
                },
              }}
            >
              继续购物
            </Button>
          </Box>
        </Box>
      </Paper>
    </Box>
  );
};

export default OrderConfirmation;
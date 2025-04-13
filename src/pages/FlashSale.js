import React from "react";
import { Typography, Box, Paper, Grid } from "@mui/material";
import { useNavigate } from "react-router-dom";

const FlashSale = () => {
  const navigate = useNavigate();
  // 模拟限时低价商品数据
  const flashSaleProducts = Array.from({ length: 12 }).map((_, index) => ({
    id: index + 1,
    name: `限时商品${index + 1}`,
    originalPrice: (Math.random() * 0.09 + 0.02).toFixed(3),
    currentPrice: (Math.random() * 0.09 + 0.01).toFixed(3),
    image: `/images/flash${(index % 5) + 1}.jpg`,
    remainingTime: Math.floor(Math.random() * 24 * 60), // 剩余分钟数
  }));

  // 格式化剩余时间
  const formatRemainingTime = (minutes) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${hours}小时${mins}分钟`;
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
          marginBottom: "30px",
          textAlign: "center",
          fontWeight: "bold",
        }}
      >
        限时低价
      </Typography>
      <Grid container spacing={3}>
        {flashSaleProducts.map((product) => (
          <Grid item xs={12} sm={6} md={3} key={product.id}>
            <Paper
              sx={{
                padding: 2,
                backgroundColor: "#2d262c",
                color: "white",
                textAlign: "center",
                transition: "transform 0.2s",
                cursor: "pointer",
                "&:hover": {
                  transform: "scale(1.05)",
                  boxShadow: "0 8px 16px rgba(255,215,0,0.2)",
                },
              }}
              onClick={() => navigate(`/product/${product.id}`)}
            >
              <Box
                sx={{
                  width: "100%",
                  height: 200,
                  marginBottom: 2,
                  overflow: "hidden",
                  borderRadius: 1,
                  position: "relative",
                }}
              >
                <img
                  src={product.image}
                  alt={product.name}
                  style={{
                    width: "100%",
                    height: "100%",
                    objectFit: "cover",
                  }}
                />
                <Box
                  sx={{
                    position: "absolute",
                    top: 10,
                    right: 10,
                    backgroundColor: "rgba(255, 0, 0, 0.8)",
                    color: "white",
                    padding: "4px 8px",
                    borderRadius: 1,
                    fontSize: "0.875rem",
                  }}
                >
                  剩余 {formatRemainingTime(product.remainingTime)}
                </Box>
              </Box>
              <Typography
                variant="h6"
                sx={{ color: "#FFD700", marginBottom: 1 }}
              >
                {product.name}
              </Typography>
              <Typography
                variant="body1"
                sx={{ color: "#FFD700", fontSize: "1.2rem" }}
              >
                {product.currentPrice} ETH
              </Typography>
              <Typography
                variant="body2"
                sx={{
                  color: "#888",
                  textDecoration: "line-through",
                  marginTop: 0.5,
                }}
              >
                原价: {product.originalPrice} ETH
              </Typography>
            </Paper>
          </Grid>
        ))}
      </Grid>
    </Box>
  );
};

export default FlashSale;
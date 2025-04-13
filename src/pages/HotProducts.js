import React from "react";
import { Typography, Box, Paper, Grid } from "@mui/material";
import { useNavigate } from "react-router-dom";

const HotProducts = () => {
  const navigate = useNavigate();
  // 模拟热门商品数据
  const hotProducts = Array.from({ length: 12 }).map((_, index) => ({
    id: index + 1,
    name: `热门商品${index + 1}`,
    price: (Math.random() * 0.09 + 0.01).toFixed(3),
    image: `/images/hot${(index % 5) + 1}.jpg`,
    sales: Math.floor(Math.random() * 1000),
    mainCategory: "能源",
    subCategory: "原油",
  }));

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
        热门产品
      </Typography>
      <Grid container spacing={3}>
        {hotProducts.map((product) => (
          <Grid item xs={12} sm={6} md={3} key={product.id}>
            <Paper
              onClick={() => navigate(`/product/${product.id}`)}
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
            >
              <Box
                sx={{
                  width: "100%",
                  height: 200,
                  marginBottom: 2,
                  overflow: "hidden",
                  borderRadius: 1,
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
              </Box>
              <Typography
                variant="h6"
                sx={{ color: "#FFD700", marginBottom: 1 }}
              >
                {product.name}
              </Typography>
              <Typography
                variant="body2"
                sx={{ color: "#888", marginBottom: 1 }}
              >
                类目: {product.mainCategory} - {product.subCategory}
              </Typography>
              <Typography
                variant="body1"
                sx={{ color: "#FFD700", fontSize: "1.2rem" }}
              >
                {product.price} ETH
              </Typography>
              <Typography
                variant="body2"
                sx={{ color: "#888", marginTop: 1 }}
              >
                销量: {product.sales} 件
              </Typography>
            </Paper>
          </Grid>
        ))}
      </Grid>
    </Box>
  );
};

export default HotProducts;
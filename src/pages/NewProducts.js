import React from "react";
import { Typography, Box, Paper, Grid } from "@mui/material";
import { useNavigate } from "react-router-dom";

const NewProducts = () => {
  const navigate = useNavigate();
  // 模拟最新上架商品数据
  const newProducts = Array.from({ length: 12 }).map((_, index) => ({
    id: index + 1,
    name: `新品${index + 1}`,
    price: (Math.random() * 0.09 + 0.01).toFixed(3),
    image: `/images/new${(index % 5) + 1}.jpg`,
    mainCategory: "金属",
    subCategory: "贵金属",
    listingTime: Math.floor(Math.random() * 24),
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
        最近上新
      </Typography>
      <Grid container spacing={3}>
        {newProducts.map((product) => (
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
                    backgroundColor: "rgba(0, 255, 0, 0.8)",
                    color: "white",
                    padding: "4px 8px",
                    borderRadius: 1,
                    fontSize: "0.875rem",
                  }}
                >
                  新品
                </Box>
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
                上架时间: {product.listingTime}小时前
              </Typography>
            </Paper>
          </Grid>
        ))}
      </Grid>
    </Box>
  );
};

export default NewProducts;
import React from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Box, Typography, Paper, Grid, Button } from "@mui/material";
import { CheckCircle } from "@mui/icons-material";

const PublishSuccess = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const product = location.state?.product;

  if (!product) {
    navigate("/sell");
    return null;
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
          marginBottom: "30px",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          //   verticalAlign: "middle",
        }}
      >
        <CheckCircle sx={{ color: "#4CAF50", fontSize: 64 }} />
        商品发布成功
      </Typography>
      <Grid container justifyContent="center">
        <Grid item xs={12} md={8}>
          <Paper
            sx={{
              padding: 3,
              backgroundColor: "#2d262c",
              color: "white",
            }}
          >
            <Box sx={{ display: "flex", flexDirection: "column", gap: 3 }}>
              <Typography variant="h5" sx={{ color: "#FFD700" }}>
                商品信息
              </Typography>
              <Box
                sx={{
                  width: "100%",
                  height: 300,
                  overflow: "hidden",
                  borderRadius: 1,
                  marginBottom: 2,
                }}
              >
                {product.image && (
                  <img
                    src={URL.createObjectURL(product.image)}
                    alt={product.name}
                    style={{
                      width: "100%",
                      height: "100%",
                      objectFit: "cover",
                    }}
                  />
                )}
              </Box>
              <Typography variant="h6">
                商品名称：
                <span style={{ color: "#FFD700" }}>{product.name}</span>
              </Typography>
              <Typography variant="h6">
                商品价格：
                <span style={{ color: "#FFD700" }}>{product.price} ETH</span>
              </Typography>
              <Typography variant="h6">
                商品类目：
                <span style={{ color: "#FFD700" }}>
                  {product.mainCategory} - {product.subCategory}
                </span>
              </Typography>
              <Typography variant="h6">商品描述：</Typography>
              <Typography
                variant="body1"
                sx={{
                  color: "#FFD700",
                  backgroundColor: "rgba(255, 215, 0, 0.1)",
                  padding: 2,
                  borderRadius: 1,
                }}
              >
                {product.description}
              </Typography>
              <Box
                sx={{
                  display: "flex",
                  gap: 2,
                  justifyContent: "center",
                  marginTop: 2,
                }}
              >
                <Button
                  variant="contained"
                  onClick={() => navigate("/sell")}
                  sx={{
                    backgroundColor: "#FFD700",
                    color: "black",
                    "&:hover": {
                      backgroundColor: "#FFC000",
                    },
                  }}
                >
                  继续发布
                </Button>
                <Button
                  variant="outlined"
                  onClick={() => navigate("/")}
                  sx={{
                    color: "#FFD700",
                    borderColor: "#FFD700",
                    "&:hover": {
                      borderColor: "#FFD700",
                      backgroundColor: "rgba(255, 215, 0, 0.1)",
                    },
                  }}
                >
                  返回首页
                </Button>
              </Box>
            </Box>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
};

export default PublishSuccess;

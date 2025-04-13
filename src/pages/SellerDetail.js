import React, { useState, useEffect } from "react";
import { Typography, Box, Paper, Avatar, Rating, Grid } from "@mui/material";
import { LocalMall, Timeline, Person } from "@mui/icons-material";
import { useNavigate, useParams } from "react-router-dom";
import axios from "axios";

export default function SellerDetail() {
  const navigate = useNavigate();
  const { walletAddress } = useParams();
  const [sellerData, setSellerData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSellerData = async () => {
      try {
        const response = await axios.get(`http://localhost:5000/api/seller-detail/${walletAddress}`);
        setSellerData(response.data.data);
      } catch (error) {
        console.error("获取卖家数据失败:", error);
      } finally {
        setLoading(false);
      }
    };

    if (walletAddress) {
      fetchSellerData();
    }
  }, [walletAddress]);

  const handleProductClick = (productId) => {
    navigate(`/product/${productId}`);
  };

  if (loading || !sellerData) {
    return (
      <Box sx={{ padding: "20px", textAlign: "center", color: "#FFD700" }}>
        加载中...
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
          marginBottom: "30px",
          textAlign: "center",
          fontWeight: "bold",
        }}
      >
        卖家详情
      </Typography>
      {/* 卖家基本信息卡片 */}
      <Paper
        sx={{
          backgroundColor: "#2d262c",
          padding: 3,
          marginBottom: 3,
          color: "white",
          borderRadius: 2,
        }}
      >
        <Box
          sx={{
            display: "flex",
            gap: 3,
            alignItems: "center",
            marginBottom: 3,
          }}
        >
          <Avatar
            src={sellerData.avatar_url}
            sx={{ width: 120, height: 120, border: "2px solid #FFD700" }}
          />
          <Box>
            <Typography variant="h4" sx={{ color: "#FFD700", marginBottom: 1 }}>
              {sellerData.name}
            </Typography>
            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                gap: 1,
                marginBottom: 1,
              }}
            >
              <Rating value={sellerData.rating} precision={0.1} readOnly />
              <Typography sx={{ color: "#FFD700" }}>
                {sellerData.rating}
              </Typography>
            </Box>
            <Typography variant="body1" sx={{ color: "#888" }}>
              加入时间：{new Date(sellerData.join_date).toLocaleDateString()}
            </Typography>
          </Box>
        </Box>
        <Typography variant="body1" sx={{ color: "white" }}>
          {sellerData.description}
        </Typography>
      </Paper>

      {/* 销售统计 */}
      <Grid container spacing={3} sx={{ marginBottom: 3 }}>
        <Grid item xs={12} md={4}>
          <Paper
            sx={{
              backgroundColor: "#2d262c",
              padding: 3,
              color: "white",
              borderRadius: 2,
              height: "100%",
            }}
          >
            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                gap: 2,
                marginBottom: 2,
              }}
            >
              <LocalMall sx={{ color: "#FFD700", fontSize: 40 }} />
              <Typography variant="h6">总销售额</Typography>
            </Box>
            <Typography variant="h4" sx={{ color: "#FFD700" }}>
              {sellerData.total_sales} ETH
            </Typography>
          </Paper>
        </Grid>
        <Grid item xs={12} md={4}>
          <Paper
            sx={{
              backgroundColor: "#2d262c",
              padding: 3,
              color: "white",
              borderRadius: 2,
              height: "100%",
            }}
          >
            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                gap: 2,
                marginBottom: 2,
              }}
            >
              <Timeline sx={{ color: "#FFD700", fontSize: 40 }} />
              <Typography variant="h6">月度销售额</Typography>
            </Box>
            <Typography variant="h4" sx={{ color: "#FFD700" }}>
              {sellerData.monthly_sales} ETH
            </Typography>
          </Paper>
        </Grid>
        <Grid item xs={12} md={4}>
          <Paper
            sx={{
              backgroundColor: "#2d262c",
              padding: 3,
              color: "white",
              borderRadius: 2,
              height: "100%",
            }}
          >
            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                gap: 2,
                marginBottom: 2,
              }}
            >
              <Person sx={{ color: "#FFD700", fontSize: 40 }} />
              <Typography variant="h6">商品数量</Typography>
            </Box>
            <Typography variant="h4" sx={{ color: "#FFD700" }}>
              {sellerData.products_count}
            </Typography>
          </Paper>
        </Grid>
      </Grid>

      {/* 在售商品 */}
      <Typography
        variant="h5"
        sx={{ color: "white", marginBottom: 2, marginTop: 7 }}
      >
        在售商品
      </Typography>
      <Grid container spacing={3}>
        {sellerData.products?.map((product) => (
          <Grid item xs={12} sm={6} md={4} key={product.id}>
            <Paper
              onClick={() => handleProductClick(product.id)}
              sx={{
                cursor: "pointer",
                backgroundColor: "#2d262c",
                borderRadius: 2,
                overflow: "hidden",
                transition: "transform 0.2s",
                "&:hover": {
                  transform: "scale(1.02)",
                  boxShadow: "0 8px 16px rgba(255,215,0,0.2)",
                },
              }}
            >
              <Box
                sx={{
                  width: "100%",
                  height: 200,
                  overflow: "hidden",
                }}
              >
                <img
                  src={product.image_url}
                  alt={product.name}
                  style={{
                    width: "100%",
                    height: "100%",
                    objectFit: "cover",
                  }}
                />
              </Box>
              <Box sx={{ padding: 2 }}>
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
                  {product.main_category} - {product.sub_category}
                </Typography>
                <Typography variant="body1" sx={{ color: "white" }}>
                  {product.price} ETH
                </Typography>
                <Typography variant="body2" sx={{ color: "#888" }}>
                  销量: {product.sales}
                </Typography>
              </Box>
            </Paper>
          </Grid>
        ))}
      </Grid>
    </Box>
  );
}

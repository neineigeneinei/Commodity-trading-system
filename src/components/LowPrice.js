import React, { useEffect, useState } from "react";
import { Typography, Box, Paper, Button } from "@mui/material";
import { useNavigate } from "react-router-dom";
import "../App.css";

export default function LowPrice() {
  const navigate = useNavigate();
  const [products, setProducts] = useState([]);
  const [hotProducts, setHotProducts] = useState([]);
  const [newProducts, setNewProducts] = useState([]);

  useEffect(() => {
    // 获取限时低价商品
    const fetchProducts = async () => {
      try {
        const response = await fetch("http://localhost:5000/api/products");
        const data = await response.json();
        if (data.success && data.data) {
          // 按价格升序排序
          const sortedProducts = data.data
            .sort((a, b) => parseFloat(a.price) - parseFloat(b.price))
            .slice(0, 5);
          setProducts(sortedProducts);
        }
      } catch (error) {
        console.error("获取商品数据失败:", error);
      }
    };

    // 获取热门产品
    const fetchHotProducts = async () => {
      try {
        const response = await fetch("http://localhost:5000/api/products");
        const data = await response.json();
        if (data.success && data.data) {
          // 按销量降序排序
          const sortedProducts = data.data
            .sort((a, b) => (b.sales || 0) - (a.sales || 0))
            .slice(0, 5);
          setHotProducts(sortedProducts);
        }
      } catch (error) {
        console.error("获取热门商品失败:", error);
      }
    };

    // 获取最新产品
    const fetchNewProducts = async () => {
      try {
        const response = await fetch("http://localhost:5000/api/products");
        const data = await response.json();
        if (data.success && data.data) {
          // 按创建时间降序排序
          const sortedProducts = data.data
            .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
            .slice(0, 5);
          setNewProducts(sortedProducts);
        }
      } catch (error) {
        console.error("获取最新商品失败:", error);
      }
    };

    fetchProducts();
    fetchHotProducts();
    fetchNewProducts();
  }, []);

  return (
    <Box sx={{ width: "100%" }}>
      {/* 限时低价标题和按钮 */}
      <Box
        sx={{
          padding: "20px 104px 0 104px",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <Typography
          variant="h4"
          sx={{
            color: "white",
            fontWeight: "bold",
          }}
        >
          限时低价
        </Typography>
        <Button
          variant="outlined"
          onClick={() => navigate("/flash-sale")}
          sx={{
            color: "#FFD700",
            borderColor: "#FFD700",
            "&:hover": {
              borderColor: "#FFD700",
              backgroundColor: "rgba(255, 215, 0, 0.1)",
            },
          }}
        >
          了解更多
        </Button>
      </Box>

      {/* 限时低价商品展示 */}
      <Box
        sx={{
          display: "flex",
          justifyContent: "center",
          gap: 4.8,
          padding: "30px",
          backgroundColor: "#211a21",
        }}
      >
        {products.map((product) => (
          <Paper
            key={product.id}
            onClick={() => navigate(`/product/${product.id}`)}
            sx={{
              width: 200,
              padding: 2,
              backgroundColor: "#2d262c",
              color: "white",
              textAlign: "center",
              borderRadius: 2,
              transition: "transform 0.2s",
              "&:hover": {
                transform: "scale(1.05)",
                boxShadow: "0 8px 16px rgba(255,215,0,0.2)",
              },
            }}
          >
            <Typography
              variant="h6"
              sx={{
                color: "#FFD700",
                marginBottom: 1,
                fontWeight: "bold",
              }}
            >
              限时低价
            </Typography>
            <Box
              sx={{
                width: "100%",
                height: 150,
                marginBottom: 1,
                overflow: "hidden",
                borderRadius: 1,
              }}
            >
              <img
                src={product.image_url || `/images/flash1.jpg`}
                alt={product.name}
                style={{
                  width: "100%",
                  height: "100%",
                  objectFit: "cover",
                }}
              />
            </Box>
            <Typography variant="body1" sx={{ color: "#FFD700" }}>
              {parseFloat(product.price).toFixed(3)} ETH
            </Typography>
            <Typography variant="body2" sx={{ color: "#888" }}>
              原价: {(parseFloat(product.price) * 1.2).toFixed(3)} ETH
            </Typography>
          </Paper>
        ))}
      </Box>

      {/* 热门产品标题和按钮 */}
      <Box
        sx={{
          padding: "20px 104px 0 104px",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <Typography
          variant="h4"
          sx={{
            color: "white",
            fontWeight: "bold",
          }}
        >
          热门产品
        </Typography>
        <Button
          variant="outlined"
          onClick={() => navigate("/hot-products")}
          sx={{
            color: "#FFD700",
            borderColor: "#FFD700",
            "&:hover": {
              borderColor: "#FFD700",
              backgroundColor: "rgba(255, 215, 0, 0.1)",
            },
          }}
        >
          了解更多
        </Button>
      </Box>

      {/* 热门产品展示 */}
      <Box
        sx={{
          display: "flex",
          justifyContent: "center",
          gap: 4.8,
          padding: "30px",
          backgroundColor: "#211a21",
        }}
      >
        {hotProducts.map((product) => (
          <Paper
            key={product.id}
            onClick={() => navigate(`/product/${product.id}`)}
            sx={{
              width: 200,
              padding: 2,
              backgroundColor: "#2d262c",
              color: "white",
              textAlign: "center",
              borderRadius: 2,
              transition: "transform 0.2s",
              "&:hover": {
                transform: "scale(1.05)",
                boxShadow: "0 8px 16px rgba(255,215,0,0.2)",
              },
            }}
          >
            <Typography
              variant="h6"
              sx={{
                color: "#FFD700",
                marginBottom: 1,
                fontWeight: "bold",
              }}
            >
              热门产品
            </Typography>
            <Box
              sx={{
                width: "100%",
                height: 150,
                marginBottom: 1,
                overflow: "hidden",
                borderRadius: 1,
              }}
            >
              <img
                src={product.image_url || `/images/hot1.jpg`}
                alt={product.name}
                style={{
                  width: "100%",
                  height: "100%",
                  objectFit: "cover",
                }}
              />
            </Box>
            <Typography variant="body1" sx={{ color: "#FFD700" }}>
              {parseFloat(product.price).toFixed(3)} ETH
            </Typography>
            <Typography variant="body2" sx={{ color: "#888" }}>
              销量: {product.sales || 0} 件
            </Typography>
          </Paper>
        ))}
      </Box>

      {/* 最近上新标题和按钮 */}
      <Box
        sx={{
          padding: "20px 104px 0 104px",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <Typography
          variant="h4"
          sx={{
            color: "white",
            fontWeight: "bold",
          }}
        >
          最近上新
        </Typography>
        <Button
          variant="outlined"
          onClick={() => navigate("/new-products")}
          sx={{
            color: "#FFD700",
            borderColor: "#FFD700",
            "&:hover": {
              borderColor: "#FFD700",
              backgroundColor: "rgba(255, 215, 0, 0.1)",
            },
          }}
        >
          了解更多
        </Button>
      </Box>

      {/* 最近上新展示 */}
      <Box
        sx={{
          display: "flex",
          justifyContent: "center",
          gap: 4.8,
          padding: "30px",
          backgroundColor: "#211a21",
        }}
      >
        {newProducts.map((product) => (
          <Paper
            key={product.id}
            onClick={() => navigate(`/product/${product.id}`)}
            sx={{
              width: 200,
              padding: 2,
              backgroundColor: "#2d262c",
              color: "white",
              textAlign: "center",
              borderRadius: 2,
              transition: "transform 0.2s",
              "&:hover": {
                transform: "scale(1.05)",
                boxShadow: "0 8px 16px rgba(255,215,0,0.2)",
              },
            }}
          >
            <Typography
              variant="h6"
              sx={{
                color: "#FFD700",
                marginBottom: 1,
                fontWeight: "bold",
              }}
            >
              最近上新
            </Typography>
            <Box
              sx={{
                width: "100%",
                height: 150,
                marginBottom: 1,
                overflow: "hidden",
                borderRadius: 1,
              }}
            >
              <img
                src={product.image_url || `/images/new1.jpg`}
                alt={product.name}
                style={{
                  width: "100%",
                  height: "100%",
                  objectFit: "cover",
                }}
              />
            </Box>
            <Typography variant="body1" sx={{ color: "#FFD700" }}>
              {parseFloat(product.price).toFixed(3)} ETH
            </Typography>
            <Typography variant="body2" sx={{ color: "#888" }}>
              上新时间:{" "}
              {Math.floor(
                (Date.now() - new Date(product.created_at).getTime()) /
                  (1000 * 60 * 60)
              )}
              小时前
            </Typography>
          </Paper>
        ))}
      </Box>
    </Box>
  );
}

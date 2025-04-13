import React, { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Box, Typography, Grid, Paper } from "@mui/material";

// 从Sell组件导入类目数据
const categoryMenuItems = {
  能源: ["原油", "天然气", "煤炭", "其他"],
  金属: ["贵金属", "工业金属", "黑色金属"],
  农产品: ["谷物", "油籽", "软商品", "畜产品"],
  化工: ["化工原料", "化肥"],
  其他: ["橡胶", "木材", "纸浆"],
  特殊商品: ["稀土", "稀有金属"],
};

const Buy = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [products, setProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);

  // 从URL中获取类目参数
  const searchParams = new URLSearchParams(location.search);
  const mainCategory = searchParams.get("mainCategory");
  const subCategory = searchParams.get("subCategory");
  const keyword = searchParams.get("keyword");
  console.log("组件重新渲染,URL参数:", { mainCategory, subCategory, keyword });

  useEffect(() => {
    console.log("useEffect触发,keyword值:", keyword);
    // 从后端API获取商品数据
    const fetchProducts = async () => {
      try {
        let url = "http://localhost:5000/api/products";
        if (keyword) {
          url = `http://localhost:5000/api/products/search?keyword=${encodeURIComponent(
            keyword
          )}`;
          console.log("搜索URL:", url);
        }
        console.log("开始发送API请求...");
        const response = await fetch(url);
        const data = await response.json();
        console.log("API返回数据:", data);
        if (data.success) {
          console.log("设置商品数据，数量:", data.data.length);
          setProducts(data.data);
        } else {
          console.error("获取商品列表失败:", data.message);
        }
      } catch (error) {
        console.error("获取商品列表出错:", error);
      }
    };

    fetchProducts();
  }, [keyword]);

  useEffect(() => {
    // 根据类目参数和关键字筛选商品
    console.log("开始筛选商品，当前商品数量:", products.length);
    console.log("筛选条件:", { mainCategory, subCategory, keyword });

    let filtered = products;

    // 如果有关键字，先按关键字筛选
    if (keyword) {
      filtered = products.filter((product) =>
        product.name.toLowerCase().includes(keyword.toLowerCase())
      );
    }

    // 如果有类目，再按类目筛选
    if (mainCategory) {
      filtered = filtered.filter(
        (product) =>
          product.main_category === mainCategory &&
          (!subCategory || product.sub_category === subCategory)
      );
    }

    console.log("筛选后商品数量:", filtered.length);
    setFilteredProducts(filtered);
  }, [products, mainCategory, subCategory, keyword]);

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
        {mainCategory
          ? `${mainCategory}${subCategory ? ` - ${subCategory}` : ""}`
          : "所有商品"}
      </Typography>
      <Grid container spacing={3}>
        {filteredProducts.map((product) => (
          <Grid item xs={12} sm={6} md={3} key={product.id}>
            <Paper
              onClick={() => navigate(`/product/${product.id}`)}
              sx={{
                cursor: "pointer",
                padding: 2,
                backgroundColor: "#2d262c",
                color: "white",
                textAlign: "center",
                transition: "transform 0.2s",
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
                  src={product.image_url}
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
                类目: {product.main_category} - {product.sub_category}
              </Typography>
              <Typography variant="body1" sx={{ color: "#FFD700" }}>
                {Number(product.price).toFixed(3)} ETH
              </Typography>
              <Typography variant="body2" sx={{ color: "#888", marginTop: 1 }}>
                销量: {product.sales || 0} 件
              </Typography>
            </Paper>
          </Grid>
        ))}
      </Grid>
    </Box>
  );
};

export default Buy;

import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ethers } from "ethers";
import {
  Box,
  Typography,
  Paper,
  Grid,
  Button,
  Dialog,
  DialogContent,
  DialogActions,
} from "@mui/material";
import { CheckCircle } from "@mui/icons-material";
import useContract from "../hooks/useContract";
// import useUserRole from "../hooks/useUserRole";

const ProductDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [orderSuccess, setOrderSuccess] = useState(false);
  const [orderInfo, setOrderInfo] = useState(null);
  const [cartSuccess, setCartSuccess] = useState(false);

  const contract = useContract();

  const [buyLoading, setBuyLoading] = useState(false);
  // const { userRole, isLoading: userRoleLoading } = useUserRole();

  const isWalletConnected = window.ethereum && window.ethereum.selectedAddress;
  // const isBuyer = userRole === 1; // Role.Buyer = 1

  const handleBuy = async () => {
    if (!isWalletConnected) {
      alert("请先连接钱包");
      return;
    }

    try {
      setBuyLoading(true);
      console.log("开始购买流程，商品信息:", product);

      // 检查钱包是否已连接
      if (!window.ethereum || !window.ethereum.selectedAddress) {
        console.log("钱包未连接");
        alert("请先连接钱包");
        return;
      }
      console.log("钱包已连接，地址:", window.ethereum.selectedAddress);

      // 检查合约是否初始化
      if (!contract) {
        console.log("合约未初始化");
        alert("智能合约未初始化，请稍后重试");
        return;
      }
      console.log("合约已初始化");

      // 获取用户钱包地址
      const walletAddress = window.ethereum.selectedAddress;
      console.log("用户钱包地址:", walletAddress);

      // 检查商品在区块链上的状态
      const numericId =
        product.numeric_id ||
        parseInt(product.productId) ||
        parseInt(product.blockchain_id);
      if (isNaN(numericId)) {
        console.error("缺少有效的区块链商品ID:", product);
        throw new Error("商品信息不完整或区块链ID格式无效");
      }
      console.log("区块链商品ID:", numericId);

      // 获取商品状态
      console.log("准备获取链上商品状态,ID:", numericId);
      const onChainProduct = await contract.getProduct(numericId);
      console.log("链上商品状态:", onChainProduct);
      if (!onChainProduct.isActive) {
        console.error("商品不可购买，状态:", onChainProduct);
        throw new Error("该商品当前不可购买");
      }

      console.log("准备发起购买交易，参数:", {
        numericId,
        price: product.price.toString(),
        value: ethers.parseEther(product.price.toString()).toString(),
      });

      const transaction = await contract.buyProduct(numericId, {
        value: ethers.parseEther(product.price.toString()),
      });
      console.log("交易已发送,等待确认。交易hash:", transaction.hash);

      // 等待交易确认
      const receipt = await transaction.wait();
      console.log("交易已确认，详细信息:", receipt);

      // 生成订单号
      const timestamp = new Date().getTime();
      const randomNum = Math.floor(Math.random() * 10000);
      const orderId = `ORDER${timestamp}${randomNum}`;

      console.log("订单请求参数：", {
        orderId: orderId,
        productId: numericId,
        walletAddress: walletAddress,
        price: product.price,
        transactionHash: receipt.hash,
      });
      // 调用后端API创建订单
      const orderResponse = await fetch("http://localhost:5000/api/orders", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          orderId: orderId,
          productId: numericId,
          walletAddress: walletAddress,
          price: product.price,
          quantity: 1,
          productName: product.name,
          productImage: product.image_url,
          mainCategory: product.main_category,
          subCategory: product.sub_category,
          transactionHash: receipt.hash,
        }),
      });

      const orderData = await orderResponse.json();
      if (orderData.success) {
        setOrderInfo({
          orderId: orderId,
          transactionHash: receipt.hash,
        });
        setOrderSuccess(true);
      } else {
        console.error("订单创建失败:", orderData);
        alert("订单创建失败，请稍后重试");
      }
    } catch (error) {
      console.error("购买过程中出错：", error);
      alert("购买失败，请稍后重试");
    } finally {
      setBuyLoading(false);
    }
  };

  // 关闭成功弹窗
  const handleCloseSuccessDialog = () => {
    setOrderSuccess(false);
  };

  // 查看订单详情
  const handleViewOrder = () => {
    if (orderInfo && orderInfo.orderId) {
      // 检查是否有订单ID，如果有则导航到订单详情页
      // 如果订单详情页面不存在或未实现，可以先关闭弹窗并显示提示信息
      try {
        navigate(`/order/${orderInfo.orderId}`);
      } catch (error) {
        console.error("导航到订单详情页失败:", error);
        alert("订单已创建成功，订单详情页面正在开发中");
        navigate("/");
      }
    } else {
      // 如果没有订单ID，则只关闭弹窗
      alert("订单信息不完整，无法查看详情");
    }
    setOrderSuccess(false);
  };

  const handleAddToCart = async () => {
    try {
      if (!window.ethereum || !window.ethereum.selectedAddress) {
        alert("请先连接钱包");
        return;
      }

      const response = await fetch("http://localhost:5000/api/cart", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          productId: product.id,
          walletAddress: window.ethereum.selectedAddress,
          quantity: 1,
          price: product.price,
          productName: product.name,
          productImage: product.image,
          mainCategory: product.mainCategory,
          subCategory: product.subCategory,
        }),
      });

      const data = await response.json();
      if (data.success) {
        setCartSuccess(true);
      } else {
        throw new Error(data.message || "加入购物车失败");
      }
    } catch (error) {
      console.error("加入购物车出错：", error);
      alert("加入购物车失败，请稍后重试");
    }
  };

  const handleCloseCartDialog = () => {
    setCartSuccess(false);
  };

  const handleGoToCart = () => {
    navigate("/cart");
    setCartSuccess(false);
  };

  useEffect(() => {
    const fetchProductDetail = async () => {
      try {
        setLoading(true);
        const response = await fetch(
          `http://localhost:5000/api/products/${id}`
        );
        if (!response.ok) {
          throw new Error("获取商品信息失败");
        }
        const data = await response.json();
        if (data.success && data.data) {
          // 处理规格参数，确保它是一个对象
          let specifications = {};
          try {
            if (data.data.specifications) {
              if (typeof data.data.specifications === "string") {
                specifications = JSON.parse(data.data.specifications);
              } else if (typeof data.data.specifications === "object") {
                specifications = data.data.specifications;
              }
            }
          } catch (parseError) {
            console.error("解析规格参数失败:", parseError);
            specifications = {};
          }

          // 确保所有必要的字段都存在
          const formattedProduct = {
            id: data.data.id,
            name: data.data.name || "未命名商品",
            price: data.data.price || "0",
            description: data.data.description || "暂无描述",
            image:
              data.data.image_url ||
              data.data.image ||
              "/images/default-image.svg",
            mainCategory:
              data.data.main_category || data.data.mainCategory || "未分类",
            subCategory: data.data.sub_category || data.data.subCategory || "",
            sales: data.data.sales || "0",
            specifications: specifications,
            numeric_id: data.data.numeric_id, // 添加numeric_id字段
            productId: data.data.productId || data.data.blockchain_id, // 保留原有的productId字段
          };

          setProduct(formattedProduct);
          console.log("成功加载商品数据:", formattedProduct);
        } else if (!data.success) {
          console.error("API返回错误:", data);
          throw new Error(data.message || "商品不存在");
        } else {
          console.error("API返回成功但没有商品数据:", data);
          throw new Error("商品数据格式不正确");
        }
      } catch (error) {
        console.error("获取商品详情出错:", error);
        setError("获取商品信息失败，请稍后再试");
      } finally {
        setLoading(false);
      }
    };

    fetchProductDetail();
  }, [id]);

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
        <Typography variant="h4" sx={{ color: "white" }}>
          加载中...
        </Typography>
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
        <Typography variant="h4" sx={{ color: "#FFD700", marginBottom: 2 }}>
          出错了
        </Typography>
        <Typography variant="body1" sx={{ color: "white" }}>
          {error}
        </Typography>
        <Button
          variant="contained"
          onClick={() => navigate("/")}
          sx={{
            marginTop: 3,
            backgroundColor: "#FFD700",
            color: "#000",
            "&:hover": {
              backgroundColor: "#FFC000",
            },
          }}
        >
          返回首页
        </Button>
      </Box>
    );
  }

  if (!product) {
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
        <Typography variant="h4" sx={{ color: "#FFD700", marginBottom: 2 }}>
          商品不存在
        </Typography>
        <Button
          variant="contained"
          onClick={() => navigate("/")}
          sx={{
            marginTop: 3,
            backgroundColor: "#FFD700",
            color: "#000",
            "&:hover": {
              backgroundColor: "#FFC000",
            },
          }}
        >
          返回首页
        </Button>
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
        商品详情
      </Typography>
      <Grid container spacing={4}>
        {/* 商品图片 */}
        <Grid item xs={12} md={6}>
          <Paper
            sx={{
              padding: 2,
              backgroundColor: "#2d262c",
              borderRadius: 2,
            }}
          >
            <Box
              sx={{
                width: "100%",
                height: 400,
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
                onError={(e) => {
                  e.target.onerror = null;
                  e.target.src = "/images/default-image.svg";
                }}
              />
            </Box>
          </Paper>
        </Grid>

        {/* 商品信息 */}
        <Grid item xs={12} md={6}>
          <Paper
            sx={{
              padding: 3,
              backgroundColor: "#2d262c",
              color: "white",
              borderRadius: 2,
            }}
          >
            <Typography variant="h4" sx={{ color: "#FFD700", marginBottom: 2 }}>
              {product.name}
            </Typography>
            <Typography variant="h5" sx={{ color: "#FFD700", marginBottom: 2 }}>
              {product.price} ETH
            </Typography>
            <Typography variant="body1" sx={{ color: "#888", marginBottom: 2 }}>
              类目: {product.mainCategory} - {product.subCategory}
            </Typography>
            <Typography variant="body1" sx={{ color: "#888", marginBottom: 2 }}>
              销量: {product.sales} 件
            </Typography>
            <Typography
              variant="h6"
              sx={{ color: "#FFD700", marginTop: 3, marginBottom: 1 }}
            >
              商品描述
            </Typography>
            <Typography
              variant="body1"
              sx={{ color: "white", marginBottom: 3 }}
            >
              {product.description}
            </Typography>
            <Typography variant="h6" sx={{ color: "#FFD700", marginBottom: 1 }}>
              规格参数
            </Typography>
            {product.specifications &&
              Object.entries(product.specifications).map(([key, value]) => (
                <Typography
                  key={key}
                  variant="body1"
                  sx={{ color: "white", marginBottom: 1 }}
                >
                  {key}: {value}
                </Typography>
              ))}
            <Button
              variant="contained"
              fullWidth
              onClick={handleBuy}
              disabled={buyLoading || !isWalletConnected}
              sx={{
                marginTop: 4,
                backgroundColor: "#FFD700",
                color: "#000",
                fontWeight: "bold",
                padding: "12px",
                fontSize: "1.1rem",
                "&:hover": {
                  backgroundColor: "#FFC000",
                  transform: "scale(1.02)",
                  boxShadow: "0 8px 16px rgba(255,215,0,0.2)",
                },
                "&.Mui-disabled": {
                  backgroundColor: "rgba(255, 215, 0, 0.3)",
                  color: "rgba(0, 0, 0, 0.26)",
                },
              }}
            >
              {buyLoading ? "购买中..." : "立即购买"}
            </Button>
            <Button
              variant="contained"
              fullWidth
              onClick={handleAddToCart}
              disabled={!isWalletConnected}
              sx={{
                marginTop: 2,
                backgroundColor: "#2d262c",
                color: "#FFD700",
                fontWeight: "bold",
                padding: "12px",
                fontSize: "1.1rem",
                border: "2px solid #FFD700",
                "&:hover": {
                  backgroundColor: "rgba(255,215,0,0.1)",
                  transform: "scale(1.02)",
                  boxShadow: "0 8px 16px rgba(255,215,0,0.2)",
                },
              }}
            >
              加入购物车
            </Button>
          </Paper>
        </Grid>
      </Grid>

      {/* 购买成功弹窗 */}
      <Dialog
        open={orderSuccess}
        onClose={handleCloseSuccessDialog}
        maxWidth="md"
        PaperProps={{
          style: {
            backgroundColor: "#2d262c",
            borderRadius: 16,
            padding: 16,
            minWidth: 400,
          },
        }}
      >
        <DialogContent>
          <Box
            sx={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: 3,
              color: "white",
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
                {orderInfo && (
                  <>
                    <Typography variant="body1">
                      订单编号: {orderInfo.orderId}
                    </Typography>
                    {orderInfo.transactionHash && (
                      <Typography variant="body1">
                        交易哈希: {orderInfo.transactionHash}
                      </Typography>
                    )}
                  </>
                )}
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
        </DialogContent>
      </Dialog>
      {/* 加入购物车成功弹窗 */}
      <Dialog
        open={cartSuccess}
        onClose={handleCloseCartDialog}
        maxWidth="sm"
        PaperProps={{
          style: {
            backgroundColor: "#2d262c",
            borderRadius: 16,
            padding: 16,
          },
        }}
      >
        <DialogContent>
          <Box
            sx={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: 3,
              color: "white",
            }}
          >
            <CheckCircle sx={{ color: "#4CAF50", fontSize: 64 }} />
            <Typography variant="h4" sx={{ color: "#FFD700" }}>
              已加入购物车！
            </Typography>
            <Box sx={{ display: "flex", gap: 2, mt: 2 }}>
              <Button
                variant="contained"
                onClick={handleGoToCart}
                sx={{
                  backgroundColor: "#FFD700",
                  color: "#000",
                  "&:hover": {
                    backgroundColor: "#FFC000",
                  },
                }}
              >
                前往购物车
              </Button>
              <Button
                variant="outlined"
                onClick={handleCloseCartDialog}
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
        </DialogContent>
      </Dialog>
    </Box>
  );
};

export default ProductDetail;

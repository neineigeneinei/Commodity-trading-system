import React, { useState } from "react";
import {
  Box,
  Typography,
  Paper,
  TextField,
  Button,
  Grid,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  CircularProgress,
  Snackbar,
  Alert,
} from "@mui/material";
import { CloudUpload } from "@mui/icons-material";
import { useNavigate } from "react-router-dom";
import { listProduct } from "../utils/contractUtils";
import { ethers } from "ethers";
import UserAuthABI from "../artifacts/UserAuth.json";
import { USER_AUTH_ADDRESS } from "../utils/contracts";

const Sell = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: "",
    price: "",
    description: "",
    image: null,
    mainCategory: "",
    subCategory: "",
    specifications: "",
    grade: "",
    origin: "",
  });
  const [loading, setLoading] = useState(false);
  const [alert, setAlert] = useState({
    open: false,
    message: "",
    severity: "success",
  });
  const categoryMenuItems = {
    能源: ["原油", "天然气", "煤炭", "其他"],
    金属: ["贵金属", "工业金属", "黑色金属"],
    农产品: ["谷物", "油籽", "软商品", "畜产品"],
    化工: ["化工原料", "化肥"],
    其他: ["橡胶", "木材", "纸浆"],
    特殊商品: ["稀土", "稀有金属"],
  };
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };
  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setFormData((prev) => ({
        ...prev,
        image: file,
      }));
    }
  };
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      // 检查是否连接了钱包
      if (!window.ethereum || !window.ethereum.selectedAddress) {
        throw new Error("请先连接钱包");
      }

      // 检查用户是否具有卖家权限
      const provider = new ethers.BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();
      const userAuthContract = new ethers.Contract(
        USER_AUTH_ADDRESS,
        UserAuthABI.abi,
        signer
      );
      console.log(provider);
      console.log(signer);
      console.log(userAuthContract);

      // 添加详细的错误检查
      try {
        const isSeller = await userAuthContract.isSeller(
          window.ethereum.selectedAddress
        );
        console.log("卖家状态检查:", isSeller);
        if (!isSeller) {
          throw new Error("您还不是卖家，请先申请成为卖家");
        }
      } catch (error) {
        console.error("检查卖家权限时出错:", error);
        throw new Error(`检查卖家权限失败: ${error.message}`);
      }

      // 验证价格格式
      if (isNaN(formData.price) || formData.price <= 0) {
        throw new Error("请输入有效的价格");
      }

      // 调用合约上架商品
      let contractResult;
      try {
        console.log("准备上架商品，参数:", {
          name: formData.name,
          price: formData.price,
          mainCategory: formData.mainCategory,
          subCategory: formData.subCategory,
          imageName: formData.image ? formData.image.name : "",
        });

        contractResult = await listProduct(
          formData.name,
          formData.price.toString(),
          formData.mainCategory,
          formData.subCategory,
          formData.image ? formData.image.name : ""
        );
        console.log("合约调用结果:", contractResult);

        if (!contractResult || !contractResult.productId) {
          throw new Error("未能获取区块链商品ID");
        }
      } catch (error) {
        console.error("合约调用错误:", error);
        throw new Error(`合约调用失败: ${error.message}`);
      }

      // 创建FormData对象来处理文件上传和商品信息
      const formDataToSend = new FormData();
      formDataToSend.append("name", formData.name);
      formDataToSend.append("price", formData.price);
      formDataToSend.append("description", formData.description);
      formDataToSend.append("mainCategory", formData.mainCategory);
      formDataToSend.append("subCategory", formData.subCategory);
      formDataToSend.append("specifications", formData.specifications);
      formDataToSend.append("grade", formData.grade);
      formDataToSend.append("origin", formData.origin);
      formDataToSend.append("walletAddress", window.ethereum.selectedAddress);

      // 检查contractResult是否存在并包含所需属性
      if (contractResult && contractResult.productId) {
        formDataToSend.append("productId", contractResult.productId);
      }
      if (contractResult && contractResult.transactionHash) {
        formDataToSend.append(
          "transactionHash",
          contractResult.transactionHash
        );
      }

      if (formData.image) {
        formDataToSend.append("image", formData.image);
      }

      // 发送包含所有信息的请求到后端
      const response = await fetch("http://localhost:5000/api/products", {
        method: "POST",
        body: formDataToSend,
      });

      const result = await response.json();

      if (result.success) {
        navigate("/publish-success", { state: { product: formData } });
      } else {
        throw new Error(result.message || "发布失败");
      }
    } catch (error) {
      setAlert({
        open: true,
        message: `发布失败: ${error.message}`,
        severity: "error",
      });
    } finally {
      setLoading(false);
    }
  };
  return (
    <Box
      sx={{
        padding: "100px 20px 20px 20px",
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
        出售商品
      </Typography>
      <Grid container justifyContent="center">
        <Grid item xs={12} md={6}>
          <Paper
            component="form"
            onSubmit={handleSubmit}
            sx={{
              padding: 3,
              backgroundColor: "#2d262c",
              color: "white",
            }}
          >
            <Box sx={{ display: "flex", flexDirection: "column", gap: 3 }}>
              <TextField
                name="name"
                label="商品名称"
                value={formData.name}
                onChange={handleInputChange}
                required
                fullWidth
                sx={{
                  "& .MuiOutlinedInput-root": {
                    color: "white",
                    "& fieldset": {
                      borderColor: "#FFD700",
                    },
                    "&:hover fieldset": {
                      borderColor: "#FFD700",
                    },
                  },
                  "& .MuiInputLabel-root": {
                    color: "#FFD700",
                  },
                }}
              />
              <FormControl fullWidth required>
                <InputLabel sx={{ color: "#FFD700" }}>商品类目</InputLabel>
                <Select
                  name="mainCategory"
                  value={formData.mainCategory}
                  onChange={handleInputChange}
                  sx={{
                    color: "white",
                    "& .MuiOutlinedInput-notchedOutline": {
                      borderColor: "#FFD700",
                    },
                    "&:hover .MuiOutlinedInput-notchedOutline": {
                      borderColor: "#FFD700",
                    },
                    "& .MuiSvgIcon-root": {
                      color: "#FFD700",
                    },
                  }}
                >
                  {Object.keys(categoryMenuItems).map((category) => (
                    <MenuItem key={category} value={category}>
                      {category}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
              {formData.mainCategory && (
                <FormControl fullWidth required>
                  <InputLabel sx={{ color: "#FFD700" }}>子类目</InputLabel>
                  <Select
                    name="subCategory"
                    value={formData.subCategory}
                    onChange={handleInputChange}
                    sx={{
                      color: "white",
                      "& .MuiOutlinedInput-notchedOutline": {
                        borderColor: "#FFD700",
                      },
                      "&:hover .MuiOutlinedInput-notchedOutline": {
                        borderColor: "#FFD700",
                      },
                      "& .MuiSvgIcon-root": {
                        color: "#FFD700",
                      },
                    }}
                  >
                    {categoryMenuItems[formData.mainCategory]?.map(
                      (subCategory) => (
                        <MenuItem key={subCategory} value={subCategory}>
                          {subCategory}
                        </MenuItem>
                      )
                    )}
                  </Select>
                </FormControl>
              )}
              <TextField
                name="price"
                label="价格 (ETH)"
                type="number"
                value={formData.price}
                onChange={handleInputChange}
                required
                fullWidth
                inputProps={{ step: "0.001", min: "0", max: "1000" }}
                sx={{
                  "& .MuiOutlinedInput-root": {
                    color: "white",
                    "& fieldset": {
                      borderColor: "#FFD700",
                    },
                    "&:hover fieldset": {
                      borderColor: "#FFD700",
                    },
                  },
                  "& .MuiInputLabel-root": {
                    color: "#FFD700",
                  },
                }}
              />
              <TextField
                name="description"
                label="商品描述"
                multiline
                rows={4}
                value={formData.description}
                onChange={handleInputChange}
                required
                fullWidth
                sx={{
                  "& .MuiOutlinedInput-root": {
                    color: "white",
                    "& fieldset": {
                      borderColor: "#FFD700",
                    },
                    "&:hover fieldset": {
                      borderColor: "#FFD700",
                    },
                  },
                  "& .MuiInputLabel-root": {
                    color: "#FFD700",
                  },
                }}
              />
              <TextField
                name="specifications"
                label="产品规格"
                value={formData.specifications}
                onChange={handleInputChange}
                required
                fullWidth
                placeholder="请输入产品的具体规格，如：重量、尺寸、包装规格等"
                sx={{
                  "& .MuiOutlinedInput-root": {
                    color: "white",
                    "& fieldset": {
                      borderColor: "#FFD700",
                    },
                    "&:hover fieldset": {
                      borderColor: "#FFD700",
                    },
                  },
                  "& .MuiInputLabel-root": {
                    color: "#FFD700",
                  },
                }}
              />
              <TextField
                name="grade"
                label="产品等级"
                value={formData.grade}
                onChange={handleInputChange}
                required
                fullWidth
                placeholder="请输入产品的品质等级，如：优级品、一级品、二级品等"
                sx={{
                  "& .MuiOutlinedInput-root": {
                    color: "white",
                    "& fieldset": {
                      borderColor: "#FFD700",
                    },
                    "&:hover fieldset": {
                      borderColor: "#FFD700",
                    },
                  },
                  "& .MuiInputLabel-root": {
                    color: "#FFD700",
                  },
                }}
              />
              <TextField
                name="origin"
                label="产品来源"
                value={formData.origin}
                onChange={handleInputChange}
                required
                fullWidth
                placeholder="请输入产品的产地或供应商信息"
                sx={{
                  "& .MuiOutlinedInput-root": {
                    color: "white",
                    "& fieldset": {
                      borderColor: "#FFD700",
                    },
                    "&:hover fieldset": {
                      borderColor: "#FFD700",
                    },
                  },
                  "& .MuiInputLabel-root": {
                    color: "#FFD700",
                  },
                }}
              />
              <Button
                component="label"
                variant="outlined"
                startIcon={<CloudUpload />}
                sx={{
                  color: "#FFD700",
                  borderColor: "#FFD700",
                  "&:hover": {
                    borderColor: "#FFD700",
                    backgroundColor: "rgba(255, 215, 0, 0.1)",
                  },
                }}
              >
                上传商品图片
                <input
                  type="file"
                  hidden
                  accept="image/*"
                  onChange={handleImageChange}
                />
              </Button>
              {formData.image && (
                <Typography variant="body2" sx={{ color: "#FFD700" }}>
                  已选择文件: {formData.image.name}
                </Typography>
              )}
              <Button
                type="submit"
                variant="contained"
                fullWidth
                disabled={loading}
                sx={{
                  backgroundColor: "#FFD700",
                  color: "black",
                  "&:hover": {
                    backgroundColor: "#FFC000",
                  },
                }}
              >
                {loading ? <CircularProgress size={24} /> : "发布商品"}
              </Button>
              <Snackbar
                open={alert.open}
                autoHideDuration={6000}
                onClose={() => setAlert({ ...alert, open: false })}
              >
                <Alert
                  onClose={() => setAlert({ ...alert, open: false })}
                  severity={alert.severity}
                  sx={{ width: "100%" }}
                >
                  {alert.message}
                </Alert>
              </Snackbar>
            </Box>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
};

export default Sell;

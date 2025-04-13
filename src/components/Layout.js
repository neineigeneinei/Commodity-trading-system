import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { ethers } from "ethers";
import UserAuthABI from "../artifacts/UserAuth.json";
import { USER_AUTH_ADDRESS } from "../utils/contracts";
import {
  AppBar,
  Toolbar,
  Typography,
  Button,
  TextField,
  Box,
  Menu,
  MenuItem,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Grid,
  Paper,
} from "@mui/material";
import {
  Search,
  ShoppingBag,
  ShoppingCart,
  Store,
  Logout,
  AccountCircle,
  Person,
  Assignment,
} from "@mui/icons-material";
import SecCarousel from "./SecCarousel";
import SellerApplicationModal from "./SellerApplicationModal";

const Layout = ({ children }) => {
  const navigate = useNavigate();
  const [account, setAccount] = useState("");
  const [buyAnchorEl, setBuyAnchorEl] = useState(null);
  const [sellAnchorEl, setSellAnchorEl] = useState(null);
  const [userMenuAnchorEl, setUserMenuAnchorEl] = useState(null);
  const [loginOpen, setLoginOpen] = useState(false);
  const [loginData, setLoginData] = useState({
    email: "",
    password: "",
  });
  const [isRegistering, setIsRegistering] = useState(false);
  const [registerOpen, setRegisterOpen] = useState(false);
  const [registerData, setRegisterData] = useState({
    username: "",
    email: "",
    password: "",
    confirmPassword: "",
  });
  const [sellerApplicationOpen, setSellerApplicationOpen] = useState(false);
  const [userAuthContract, setUserAuthContract] = useState(null);

  const handleSellerApplicationOpen = async () => {
    try {
      const provider = new ethers.BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();
      const contract = new ethers.Contract(
        USER_AUTH_ADDRESS,
        UserAuthABI.abi,
        signer
      );
      setUserAuthContract(contract);
      setSellerApplicationOpen(true);
    } catch (error) {
      console.error("初始化合约失败:", error);
      alert("初始化失败，请稍后重试");
    }
  };

  // 连接MetaMask钱包
  const connectWallet = async () => {
    // 如果已经连接了钱包，则不执行任何操作

    if (typeof window.ethereum !== "undefined") {
      try {
        // console.log("开始连接钱包...");
        const accounts = await window.ethereum.request({
          method: "eth_requestAccounts",
        });
        setAccount(accounts[0]);
        console.log("钱包连接成功:", accounts[0]);

        // 检查是否为管理员（合约部署者）
        // console.log("开始初始化Provider...");
        const provider = new ethers.BrowserProvider(window.ethereum);
        // console.log("Provider初始化成功:", provider);

        // console.log("开始获取Signer...");
        const signer = await provider.getSigner();
        // console.log("Signer获取成功:", signer.address);

        // console.log("开始创建合约实例...");

        // console.log("合约实例创建成功");

        // 检查是否为管理员
        console.log("开始检查管理员身份...");
        const { success, isAdmin: isAdminUser, error } = await checkIsAdmin();
        if (!success) {
          console.error("检查管理员身份失败:", error);
          return;
        }
        if (isAdminUser) {
          console.log("当前用户是管理员，正在跳转到管理员界面...");
          navigate("/admin");
          return;
        }

        // 非管理员才显示登录框
        setLoginOpen(true);

        window.ethereum.on("accountsChanged", (newAccounts) => {
          if (newAccounts.length === 0) {
            setAccount("");
            console.log("钱包已断开连接");
          } else {
            setAccount(newAccounts[0]);
            console.log("账户已切换:", newAccounts[0]);
          }
        });
      } catch (error) {
        console.error("连接钱包失败:", error.message);
        setAccount("");
      }
    } else {
      console.error("请安装MetaMask!");
      window.open("https://metamask.io/download/", "_blank");
    }
  };

  // 检查是否为管理员
  const checkIsAdmin = async () => {
    try {
      const provider = new ethers.BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();
      const contract = new ethers.Contract(
        USER_AUTH_ADDRESS,
        UserAuthABI.abi,
        signer
      );
      const isAdminResult = await contract.isAdmin(await signer.getAddress());
      return { success: true, isAdmin: isAdminResult, error: null };
    } catch (error) {
      console.error("检查管理员身份时出错:", error);
      return { success: false, isAdmin: false, error: error.message };
    }
  };

  const handleLoginClose = () => {
    setLoginOpen(false);
    setLoginData({
      email: "",
      password: "",
    });
  };

  const handleRegisterOpen = () => {
    setLoginOpen(false);
    setRegisterOpen(true);
  };

  const handleRegisterClose = () => {
    setRegisterOpen(false);
    setRegisterData({
      username: "",
      email: "",
      password: "",
      confirmPassword: "",
    });
  };

  const handleRegisterSubmit = async () => {
    if (registerData.password !== registerData.confirmPassword) {
      alert("两次输入的密码不一致");
      return;
    }

    setIsRegistering(true);
    try {
      const provider = new ethers.BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();

      const userAuthContract = new ethers.Contract(
        USER_AUTH_ADDRESS,
        UserAuthABI.abi,
        signer
      );

      // 先检查用户是否已注册
      try {
        const user = await userAuthContract.getUser(account);
        console.log(user);

        if (user.wallet !== "0x0000000000000000000000000000000000000000") {
          alert("该钱包地址已经注册过了");
          setIsRegistering(false);
          return;
        }
      } catch (error) {
        console.error("检查用户状态失败:", error);
      }

      // 调用智能合约的注册方法
      const tx = await userAuthContract.registerUser(registerData.username);
      console.log("注册交易已发送:", tx.hash);
      await tx.wait();
      console.log("注册交易已确认");

      // 调用后端API完成注册
      const response = await fetch("http://localhost:5000/api/auth/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          username: registerData.username,
          email: registerData.email,
          password: registerData.password,
          walletAddress: account,
        }),
      });

      if (response.ok) {
        alert("注册成功！");
        handleRegisterClose();
      } else {
        throw new Error("注册失败");
      }
    } catch (error) {
      console.error("注册失败:", error);
      alert("注册失败，请稍后重试");
    } finally {
      setIsRegistering(false);
    }
  };

  const handleLoginSubmit = async () => {
    try {
      // 验证必填字段
      if (!loginData.email || !loginData.password) {
        alert("请填写邮箱和密码");
        return;
      }

      // 验证钱包连接
      if (!account) {
        alert("请先连接钱包");
        return;
      }

      // 调用后端API完成登录
      const response = await fetch("http://localhost:5000/api/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: loginData.email,
          password: loginData.password,
          walletAddress: account,
        }),
      });

      const result = await response.json();

      if (result.success) {
        console.log("登录成功");
        handleLoginClose();
        localStorage.setItem(
          "userInfo",
          JSON.stringify({
            email: loginData.email,
            walletAddress: account,
            role: result.data.role,
            username: result.data.username,
          })
        );
      } else {
        alert("登录失败: " + result.message);
      }
    } catch (error) {
      console.error("登录出错:", error);
      alert("登录失败，请稍后重试");
    }
  };

  const handleBuyClick = () => {
    navigate("/buy");
  };

  const handleBuyClose = () => {
    setBuyAnchorEl(null);
  };

  const handleMyOrders = () => {
    navigate("/my-orders");
  };

  const handleSellClick = (event) => {
    setSellAnchorEl(event.currentTarget);
  };

  const handleSellClose = () => {
    setSellAnchorEl(null);
  };

  const handleSell = () => {
    handleSellClose();
    navigate("/sell");
  };

  const handleOrderManagement = () => {
    handleSellClose();
    navigate("/order-management");
  };

  const handleCart = () => {
    navigate("/cart");
  };

  const [searchResults, setSearchResults] = useState([]);
  const [searchDialogOpen, setSearchDialogOpen] = useState(false);

  const handleSearch = async (event) => {
    if (event.key === "Enter") {
      try {
        const keyword = event.target.value;
        navigate(`/buy?keyword=${encodeURIComponent(keyword)}`);
      } catch (error) {
        console.error("搜索请求失败:", error);
        alert("搜索失败，请稍后重试");
      }
    }
  };

  const handleSearchResultClick = (productId) => {
    setSearchDialogOpen(false);
    navigate(`/product/${productId}`);
  };

  const handleSearchDialogClose = () => {
    setSearchDialogOpen(false);
  };

  const handleDisconnect = async () => {
    try {
      await window.ethereum.request({
        method: "wallet_requestPermissions",
        params: [{ eth_accounts: {} }],
      });
      await window.ethereum.request({
        method: "eth_requestAccounts",
        params: [],
      });
      setAccount("");
      navigate("/");
      console.log("钱包已断开连接");
    } catch (error) {
      console.error("断开钱包连接失败:", error.message);
    }
  };

  useEffect(() => {
    if (window.ethereum) {
      window.ethereum.on("disconnect", () => {
        setAccount("");
        navigate("/");
        console.log("钱包已断开连接");
      });

      return () => {
        window.ethereum.removeListener("disconnect", () => {
          setAccount("");
          navigate("/");
          console.log("钱包已断开连接");
        });
      };
    }
  }, [navigate]);

  return (
    <div>
      <AppBar position="fixed" sx={{ backgroundColor: "#FFD700" }}>
        <Toolbar>
          <Box sx={{ display: "flex", alignItems: "center", marginRight: 2 }}>
            <img
              src="/logo2.png"
              alt="Logo"
              style={{ height: "40px", width: "auto" }}
            />
          </Box>
          <Typography
            variant="h6"
            component="div"
            sx={{ flexGrow: 1, color: "black", cursor: "pointer" }}
            onClick={() => navigate("/")}
          >
            区块链大宗商品交易管理平台
          </Typography>

          <Box sx={{ flexGrow: 20, display: "flex", marginLeft: "20px" }}>
            <TextField
              variant="outlined"
              size="small"
              placeholder="搜索商品..."
              onKeyPress={handleSearch}
              sx={{
                width: "650px",
                backgroundColor: "white",
                borderRadius: 1,
              }}
              InputProps={{
                startAdornment: (
                  <Search sx={{ color: "gray", marginRight: 2 }} />
                ),
              }}
            />
          </Box>

          <Button
            color="inherit"
            sx={{ marginRight: 0.5, color: "black" }}
            startIcon={<ShoppingBag />}
            onClick={handleBuyClick}
          >
            购买
          </Button>

          <Button
            color="inherit"
            sx={{ marginRight: 0.5, color: "black" }}
            startIcon={<ShoppingCart />}
            onClick={handleCart}
          >
            购物车
          </Button>

          <Button
            color="inherit"
            sx={{ marginRight: 1, color: "black" }}
            startIcon={<Store />}
            onClick={handleSellClick}
          >
            出售
          </Button>
          <Menu
            anchorEl={sellAnchorEl}
            open={Boolean(sellAnchorEl)}
            onClose={handleSellClose}
            PaperProps={{
              sx: {
                backgroundColor: "#2d262c",
              },
            }}
          >
            <MenuItem
              onClick={handleSell}
              sx={{
                color: "white",
                "&:hover": {
                  backgroundColor: "rgba(255, 215, 0, 0.1)",
                  color: "#FFD700",
                },
              }}
            >
              出售
            </MenuItem>
            <MenuItem
              onClick={handleOrderManagement}
              sx={{
                color: "white",
                "&:hover": {
                  backgroundColor: "rgba(255, 215, 0, 0.1)",
                  color: "#FFD700",
                },
              }}
            >
              订单管理
            </MenuItem>
          </Menu>

          <Button
            variant="contained"
            onClick={connectWallet}
            sx={{
              backgroundColor: account ? "#4CAF50" : "#211a21",
              color: "white",
              "&:hover": {
                backgroundColor: account ? "#45a049" : "#2d262c",
              },
            }}
          >
            {account
              ? `${account.slice(0, 6)}...${account.slice(-4)}`
              : "连接钱包"}
          </Button>
          {account && (
            <>
              <IconButton
                onClick={handleDisconnect}
                sx={{
                  marginLeft: 1,
                  backgroundColor: "#211a21",
                  color: "white",
                  "&:hover": {
                    backgroundColor: "#2d262c",
                  },
                }}
              >
                <Logout />
              </IconButton>
              <IconButton
                onClick={(event) => setUserMenuAnchorEl(event.currentTarget)}
                sx={{
                  marginLeft: 1,
                  backgroundColor: "#211a21",
                  color: "white",
                  "&:hover": {
                    backgroundColor: "#2d262c",
                  },
                }}
              >
                <AccountCircle />
              </IconButton>
              <Menu
                anchorEl={userMenuAnchorEl}
                open={Boolean(userMenuAnchorEl)}
                onClose={() => setUserMenuAnchorEl(null)}
                PaperProps={{
                  sx: {
                    backgroundColor: "#2d262c",
                  },
                }}
              >
                <MenuItem
                  onClick={() => {
                    setUserMenuAnchorEl(null);
                    handleSellerApplicationOpen();
                  }}
                  sx={{
                    color: "white",
                    "&:hover": {
                      backgroundColor: "rgba(255, 215, 0, 0.1)",
                      color: "#FFD700",
                    },
                  }}
                >
                  <Person sx={{ mr: 1 }} />
                  升级为卖家
                </MenuItem>
                <MenuItem
                  onClick={() => {
                    setUserMenuAnchorEl(null);
                    navigate("/my-orders");
                  }}
                  sx={{
                    color: "white",
                    "&:hover": {
                      backgroundColor: "rgba(255, 215, 0, 0.1)",
                      color: "#FFD700",
                    },
                  }}
                >
                  <Assignment sx={{ mr: 1 }} />
                  我的订单
                </MenuItem>
              </Menu>
            </>
          )}
        </Toolbar>
      </AppBar>

      <SecCarousel />

      <Box sx={{ marginTop: "128px" }}>{children}</Box>

      {/* 登录对话框 */}
      <Dialog
        open={loginOpen}
        onClose={handleLoginClose}
        maxWidth="sm"
        fullWidth
        PaperProps={{
          sx: {
            backgroundColor: "#2d262c",
            color: "white",
            minWidth: "500px",
            minHeight: "400px",
            margin: "20px",
            "& .MuiDialogTitle-root": {
              padding: "32px 24px",
              fontSize: "1.5rem",
            },
            "& .MuiDialogContent-root": {
              padding: "32px 24px",
              display: "flex",
              flexDirection: "column",
              justifyContent: "center",
            },
            "& .MuiDialogActions-root": {
              padding: "32px 24px",
            },
          },
        }}
      >
        <DialogTitle sx={{ color: "#FFD700" }}>用户登录</DialogTitle>
        <DialogContent>
          <Box sx={{ display: "flex", flexDirection: "column", gap: 2, mt: 2 }}>
            <TextField
              label="邮箱"
              type="email"
              value={loginData.email}
              onChange={(e) =>
                setLoginData({ ...loginData, email: e.target.value })
              }
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
              label="密码"
              type="password"
              value={loginData.password}
              onChange={(e) =>
                setLoginData({ ...loginData, password: e.target.value })
              }
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
            <Typography
              variant="body2"
              sx={{
                color: "#FFD700",
                cursor: "pointer",
                textAlign: "right",
                "&:hover": {
                  textDecoration: "underline",
                },
              }}
              onClick={handleRegisterOpen}
            >
              没有账号？立即注册！
            </Typography>
          </Box>
        </DialogContent>
        <DialogActions sx={{ padding: 2 }}>
          <Button
            onClick={handleLoginClose}
            sx={{
              color: "#FFD700",
              borderColor: "#FFD700",
              "&:hover": {
                borderColor: "#FFD700",
                backgroundColor: "rgba(255, 215, 0, 0.1)",
              },
            }}
          >
            取消
          </Button>
          <Button
            onClick={handleLoginSubmit}
            variant="contained"
            sx={{
              backgroundColor: "#FFD700",
              color: "black",
              "&:hover": {
                backgroundColor: "#FFC000",
              },
            }}
          >
            登录
          </Button>
        </DialogActions>
      </Dialog>

      {/* 注册对话框 */}
      <Dialog
        open={registerOpen}
        onClose={handleRegisterClose}
        maxWidth="sm"
        fullWidth
        PaperProps={{
          sx: {
            backgroundColor: "#2d262c",
            color: "white",
            minWidth: "500px",
            minHeight: "500px",
            margin: "20px",
            "& .MuiDialogTitle-root": {
              padding: "32px 24px",
              fontSize: "1.5rem",
            },
            "& .MuiDialogContent-root": {
              padding: "32px 24px",
              display: "flex",
              flexDirection: "column",
              justifyContent: "center",
            },
            "& .MuiDialogActions-root": {
              padding: "32px 24px",
            },
          },
        }}
      >
        <DialogTitle sx={{ color: "#FFD700" }}>用户注册</DialogTitle>
        <DialogContent>
          <Box sx={{ display: "flex", flexDirection: "column", gap: 2, mt: 2 }}>
            <TextField
              label="用户名"
              value={registerData.username}
              onChange={(e) =>
                setRegisterData({ ...registerData, username: e.target.value })
              }
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
              label="邮箱"
              type="email"
              value={registerData.email}
              onChange={(e) =>
                setRegisterData({ ...registerData, email: e.target.value })
              }
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
              label="密码"
              type="password"
              value={registerData.password}
              onChange={(e) =>
                setRegisterData({ ...registerData, password: e.target.value })
              }
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
              label="确认密码"
              type="password"
              value={registerData.confirmPassword}
              onChange={(e) =>
                setRegisterData({
                  ...registerData,
                  confirmPassword: e.target.value,
                })
              }
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
          </Box>
        </DialogContent>
        <DialogActions sx={{ padding: 2 }}>
          <Button
            onClick={handleRegisterClose}
            sx={{
              color: "#FFD700",
              borderColor: "#FFD700",
              "&:hover": {
                borderColor: "#FFD700",
                backgroundColor: "rgba(255, 215, 0, 0.1)",
              },
            }}
          >
            取消
          </Button>
          <Button
            onClick={handleRegisterSubmit}
            variant="contained"
            disabled={isRegistering}
            sx={{
              backgroundColor: "#FFD700",
              color: "black",
              "&:hover": {
                backgroundColor: "#FFC000",
              },
            }}
          >
            {isRegistering ? "注册中..." : "注册"}
          </Button>
        </DialogActions>
      </Dialog>

      {/* 卖家申请对话框 */}
      <SellerApplicationModal
        show={sellerApplicationOpen}
        onHide={() => setSellerApplicationOpen(false)}
        userAuthContract={userAuthContract}
        userWallet={account}
      />

      <Dialog
        open={searchDialogOpen}
        onClose={handleSearchDialogClose}
        maxWidth="md"
        fullWidth
        PaperProps={{
          sx: {
            backgroundColor: "#2d262c",
            color: "white",
          },
        }}
      >
        <DialogTitle sx={{ color: "#FFD700" }}>搜索结果</DialogTitle>
        <DialogContent>
          <Grid container spacing={2}>
            {searchResults.map((product) => (
              <Grid item xs={12} sm={6} md={4} key={product.id}>
                <Paper
                  sx={{
                    p: 2,
                    cursor: "pointer",
                    backgroundColor: "#211a21",
                    "&:hover": {
                      backgroundColor: "#3d363c",
                    },
                  }}
                  onClick={() => handleSearchResultClick(product.id)}
                >
                  <Box
                    sx={{
                      width: "100%",
                      height: 150,
                      overflow: "hidden",
                      mb: 1,
                    }}
                  >
                    <img
                      src={product.image_url || "/images/default-image.svg"}
                      alt={product.name}
                      style={{
                        width: "100%",
                        height: "100%",
                        objectFit: "cover",
                      }}
                    />
                  </Box>
                  <Typography variant="h6" sx={{ color: "#FFD700" }}>
                    {product.name}
                  </Typography>
                  <Typography variant="body2" sx={{ color: "#888" }}>
                    {product.price} ETH
                  </Typography>
                </Paper>
              </Grid>
            ))}
          </Grid>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Layout;

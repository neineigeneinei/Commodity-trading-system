import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ethers } from "ethers";
import {
  AppBar,
  Toolbar,
  Typography,
  Button,
  Menu,
  MenuItem,
  Box,
  Paper,
} from "@mui/material";
import {
  LocalGasStation,
  Build,
  Agriculture,
  Science,
  Category,
  Stars,
  Timeline,
  AccountTree,
} from "@mui/icons-material";
import "../App.css"; // 自定义样式

export default function SecCarousel() {
  const navigate = useNavigate();
  const [anchorEl, setAnchorEl] = useState(null);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [totalBlocks, setTotalBlocks] = useState(0);
  const [platformBlocks, setPlatformBlocks] = useState(0);

  useEffect(() => {
    const fetchBlockData = async () => {
      try {
        const provider = new ethers.JsonRpcProvider("http://127.0.0.1:8545");
        const blockNumber = await provider.getBlockNumber();
        setTotalBlocks(blockNumber);

        // 获取平台交易区块数（这里需要根据实际情况修改）
        const response = await fetch(
          "http://localhost:5000/api/transactions/count"
        );
        const data = await response.json();
        setPlatformBlocks(data.count || 0);
      } catch (error) {
        console.error("获取区块数据失败:", error);
      }
    };

    fetchBlockData();
    const interval = setInterval(fetchBlockData, 10000); // 每10秒更新一次

    return () => clearInterval(interval);
  }, []);

  const handleClick = (event, category) => {
    setAnchorEl(event.currentTarget);
    setSelectedCategory(category);
  };

  const handleClose = (subItem, mainCategory) => {
    setAnchorEl(null);
    setSelectedCategory(null);
    navigate(
      `/buy?mainCategory=${encodeURIComponent(
        mainCategory
      )}&subCategory=${encodeURIComponent(subItem)}`
    );
  };

  const categoryMenuItems = {
    能源: ["原油", "天然气", "煤炭", "其他"],
    金属: ["贵金属", "工业金属", "黑色金属"],
    农产品: ["谷物", "油籽", "软商品", "畜产品"],
    化工: ["化工原料", "化肥"],
    其他: ["橡胶", "木材", "纸浆"],
    特殊商品: ["稀土", "稀有金属"],
  };

  return (
    <div>
      <AppBar position="fixed" sx={{ top: 64, backgroundColor: "#2d262c" }}>
        <Toolbar sx={{ display: "flex", justifyContent: "space-between" }}>
          <Box sx={{ display: "flex", alignItems: "center", flex: 1 }}>
            <Typography variant="h6" sx={{ color: "#FFD700", marginRight: 2 }}>
              产品类目
            </Typography>
            {[
              { text: "能源", icon: <LocalGasStation /> },
              { text: "金属", icon: <Build /> },
              { text: "农产品", icon: <Agriculture /> },
              { text: "化工", icon: <Science /> },
              { text: "其他", icon: <Category /> },
              { text: "特殊商品", icon: <Stars /> },
            ].map((item) => (
              <div key={item.text}>
                <Button
                  color="inherit"
                  onClick={(e) => handleClick(e, item.text)}
                  sx={{
                    color: "white",
                    marginRight: 0,
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    padding: "8px 12px",
                    "&:hover": {
                      color: "#FFD700",
                      backgroundColor: "rgba(255, 215, 0, 0.1)",
                    },
                  }}
                >
                  {item.icon}
                  <Typography variant="caption" sx={{ mt: 0.5 }}>
                    {item.text}
                  </Typography>
                </Button>
                <Menu
                  anchorEl={anchorEl}
                  open={Boolean(anchorEl) && selectedCategory === item.text}
                  onClose={handleClose}
                  PaperProps={{
                    sx: {
                      backgroundColor: "#2d262c",
                    },
                  }}
                >
                  {categoryMenuItems[item.text]?.map((subItem) => (
                    <MenuItem
                      key={subItem}
                      onClick={() => handleClose(subItem, item.text)}
                      sx={{
                        color: "white",
                        "&:hover": {
                          color: "#FFD700",
                          backgroundColor: "rgba(255, 215, 0, 0.1)",
                        },
                      }}
                    >
                      {subItem}
                    </MenuItem>
                  ))}
                </Menu>
              </div>
            ))}
          </Box>

          <Box sx={{ display: "flex", gap: 2 }}>
            <Paper
              elevation={3}
              sx={{
                padding: "10px 20px",
                backgroundColor: "#2d262c",
                border: "1px solid #FFD700",
                display: "flex",
                alignItems: "center",
                gap: 1,
                marginTop: 0.5,
              }}
            >
              <Timeline sx={{ color: "#FFD700" }} />
              <Box>
                <Typography variant="body2" sx={{ color: "#FFD700" }}>
                  总区块数
                </Typography>
                <Typography
                  variant="h6"
                  sx={{ color: "#FFD700", fontWeight: "bold" }}
                >
                  {totalBlocks}
                </Typography>
              </Box>
            </Paper>

            <Paper
              elevation={3}
              sx={{
                padding: "10px 20px",
                backgroundColor: "#2d262c",
                border: "1px solid #FFD700",
                display: "flex",
                alignItems: "center",
                gap: 1,
                marginTop: 0.5,
              }}
            >
              <AccountTree sx={{ color: "#FFD700" }} />
              <Box>
                <Typography variant="body2" sx={{ color: "#FFD700" }}>
                  交易区块数
                </Typography>
                <Typography
                  variant="h6"
                  sx={{ color: "#FFD700", fontWeight: "bold" }}
                >
                  {platformBlocks}
                </Typography>
              </Box>
            </Paper>
          </Box>
        </Toolbar>
      </AppBar>
    </div>
  );
}

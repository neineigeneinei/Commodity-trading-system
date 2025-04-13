import React, { useState, useEffect } from "react";
import { Typography, Box, Paper, Divider } from "@mui/material";
import { useNavigate } from "react-router-dom";

// NFT奖励等级配置
const NFT_REWARDS = [
  {
    level: "塑料",
    trades: 10,
    image: "/images/1.jpeg",
    rarity: "基础",
  },
  {
    level: "青铜",
    trades: 30,
    image: "/images/2.jpeg",
    rarity: "普通",
  },
  {
    level: "白银",
    trades: 60,
    image: "/images/3.jpeg",
    rarity: "进阶",
  },
  {
    level: "黄金",
    trades: 100,
    image: "/images/4.jpeg",
    rarity: "精良",
  },
  {
    level: "钻石",
    trades: 200,
    image: "/images/5.jpeg",
    rarity: "稀有",
  },
  {
    level: "大师",
    trades: 350,
    image: "/images/6.jpeg",
    rarity: "史诗",
  },
  {
    level: "主宰",
    trades: 500,
    image: "/images/7.jpeg",
    rarity: "神话",
  },
  {
    level: "起源",
    trades: 1000,
    image: "/images/8.jpeg",
    rarity: "???",
  },
];

/* 热销商品展示区域 */
export default function Display() {
  const navigate = useNavigate();
  const [userTrades, setUserTrades] = useState(0);
  const [earnedNFTs, setEarnedNFTs] = useState([]);

  // 模拟获取用户交易次数和已获得的NFT
  useEffect(() => {
    // 这里应该从后端API获取实际数据
    setUserTrades(1200);
    setEarnedNFTs(NFT_REWARDS.filter((nft) => nft.trades <= 75));
  }, []);

  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        padding: "40px 20px",
        backgroundColor: "#211a21",
      }}
    >
      <Typography
        variant="h4"
        sx={{
          color: "#FFD700",
          marginBottom: "30px",
          fontWeight: "bold",
        }}
      >
        交易成就
      </Typography>

      {/* NFT奖励展示区域 */}
      <Box
        sx={{
          width: "80%",
          maxWidth: "1200px",
          marginBottom: "40px",
          backgroundColor: "#2d262c",
          padding: "20px",
          borderRadius: "12px",
        }}
      >
        <Typography
          variant="h5"
          sx={{
            color: "#FFD700",
            marginBottom: "20px",
            fontWeight: "bold",
          }}
        >
          交易奖励NFT展示 (当前交易次数: {userTrades})
        </Typography>
        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: "repeat(4, 1fr)",
            gap: "20px",
            marginBottom: "20px",
          }}
        >
          {NFT_REWARDS.map((nft, index) => {
            const isEarned = userTrades >= nft.trades;
            return (
              <Paper
                key={index}
                sx={{
                  padding: 0,
                  backgroundColor: isEarned ? "#3d363c" : "#2d262c",
                  borderRadius: "8px",
                  opacity: isEarned ? 1 : 0.5,
                  transition: "transform 0.2s",
                  position: "relative",
                  overflow: "hidden",
                  "&:hover": {
                    transform: isEarned ? "scale(1.05)" : "none",
                    boxShadow: isEarned
                      ? "0 8px 16px rgba(255,215,0,0.2)"
                      : "none",
                  },
                }}
              >
                <Box
                  sx={{
                    width: "100%",
                    height: "250px",
                    position: "relative",
                    aspectRatio: "1",
                  }}
                >
                  <img
                    src={nft.image}
                    alt={`${nft.level} NFT`}
                    style={{
                      width: "100%",
                      height: "100%",
                      objectFit: "cover",
                    }}
                  />
                  {!isEarned && (
                    <Box
                      sx={{
                        position: "absolute",
                        top: 0,
                        left: 0,
                        right: 0,
                        bottom: 0,
                        backgroundColor: "rgba(0,0,0,0.5)",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                      }}
                    >
                      <Typography sx={{ color: "white" }}>
                        需要{nft.trades}次交易
                      </Typography>
                    </Box>
                  )}
                  <Box
                    sx={{
                      position: "absolute",
                      bottom: 0,
                      left: 0,
                      right: 0,
                      padding: "15px",
                      background:
                        "linear-gradient(to top, rgba(0,0,0,0.8), rgba(0,0,0,0))",
                    }}
                  >
                    <Typography variant="h6" sx={{ color: "#FFD700", mb: 1 }}>
                      {nft.level}
                    </Typography>
                    <Typography variant="body2" sx={{ color: "#fff" }}>
                      稀有度: {nft.rarity}
                    </Typography>
                    <Typography variant="body2" sx={{ color: "#fff" }}>
                      条件: {nft.trades}次交易
                    </Typography>
                  </Box>
                </Box>
              </Paper>
            );
          })}
        </Box>
      </Box>
    </Box>
  );
}

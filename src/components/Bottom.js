import React, { useEffect, useState } from "react";
import {
  Typography,
  Button,
  Box,
  Divider,
  Grid,
  IconButton,
} from "@mui/material";
import {
  Facebook,
  Twitter,
  Instagram,
  LinkedIn,
  Chat as WechatIcon,
  Message as QQIcon,
} from "@mui/icons-material";
import "../App.css"; // 自定义样式

/* 底部交易区域 */

export default function Bottom() {
  const [products, setProducts] = useState([]);
  return (
    <Box
      sx={{
        backgroundColor: "#2d262c",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        marginTop: 4,
        padding: "60px 0",
      }}
    >
      <Typography
        variant="h3"
        sx={{
          color: "white",
          fontWeight: "bold",
          marginBottom: "30px",
          textShadow: "2px 2px 4px rgba(0, 0, 0, 0.3)",
        }}
      >
        现在开启交易！
      </Typography>

      <Button
        variant="contained"
        onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
        sx={{
          backgroundColor: "#FFD700",
          color: "#000",
          padding: "15px 60px",
          fontSize: "1.2rem",
          fontWeight: "bold",
          borderRadius: "10px",
          marginBottom: "30px",
          "&:hover": {
            backgroundColor: "#FFC000",
            transform: "scale(1.05)",
            boxShadow: "0 8px 16px rgba(255, 215, 0, 0.3)",
          },
        }}
      >
        立即交易
      </Button>

      <Divider
        sx={{
          width: "90%",
          backgroundColor: "rgba(237, 219, 219, 0.52)",
          margin: "30px 0 30px 0",
        }}
      />

      {/* 页脚内容 */}
      <Box sx={{ width: "90%", mt: 4 }}>
        <Grid container spacing={3}>
          {/* 左侧区域 */}
          <Grid item xs={4}>
            <Typography
              variant="h6"
              sx={{
                color: "#FFD700",
                fontWeight: "bold",
                mb: 2,
              }}
            >
              链宗
            </Typography>
            <Typography
              variant="body2"
              sx={{
                color: "white",
                mb: 5,
                lineHeight: 2,
              }}
            >
              区块链赋能大宗商品交易，智能合约自动执行，交易透明可信，降低成本，提升效率，让大宗商品交易更安全、更便捷！
            </Typography>
            <Typography
              variant="h6"
              sx={{
                color: "#FFD700",
                fontWeight: "bold",
                mb: 2,
              }}
            >
              加入社区
            </Typography>
            <Box sx={{ display: "flex", gap: 2 }}>
              <IconButton
                onClick={() =>
                  window.open("https://facebook.com/lianzong", "_blank")
                }
                sx={{
                  color: "#FFD700",
                  transition: "all 0.3s ease",
                  "&:hover": {
                    backgroundColor: "rgba(255, 215, 0, 0.1)",
                    transform: "scale(1.1)",
                  },
                }}
              >
                <Facebook />
              </IconButton>
              <IconButton
                onClick={() =>
                  window.open("https://twitter.com/lianzong", "_blank")
                }
                sx={{
                  color: "#FFD700",
                  transition: "all 0.3s ease",
                  "&:hover": {
                    backgroundColor: "rgba(255, 215, 0, 0.1)",
                    transform: "scale(1.1)",
                  },
                }}
              >
                <Twitter />
              </IconButton>
              <IconButton
                onClick={() =>
                  window.open("https://instagram.com/lianzong", "_blank")
                }
                sx={{
                  color: "#FFD700",
                  transition: "all 0.3s ease",
                  "&:hover": {
                    backgroundColor: "rgba(255, 215, 0, 0.1)",
                    transform: "scale(1.1)",
                  },
                }}
              >
                <Instagram />
              </IconButton>
              <IconButton
                onClick={() =>
                  window.open("https://linkedin.com/company/lianzong", "_blank")
                }
                sx={{
                  color: "#FFD700",
                  transition: "all 0.3s ease",
                  "&:hover": {
                    backgroundColor: "rgba(255, 215, 0, 0.1)",
                    transform: "scale(1.1)",
                  },
                }}
              >
                <LinkedIn />
              </IconButton>
              <IconButton
                onClick={() =>
                  window.open("https://wechat.com/lianzong", "_blank")
                }
                sx={{
                  color: "#FFD700",
                  transition: "all 0.3s ease",
                  "&:hover": {
                    backgroundColor: "rgba(255, 215, 0, 0.1)",
                    transform: "scale(1.1)",
                  },
                }}
              >
                <WechatIcon />
              </IconButton>
              <IconButton
                onClick={() =>
                  window.open("https://im.qq.com/lianzong", "_blank")
                }
                sx={{
                  color: "#FFD700",
                  transition: "all 0.3s ease",
                  "&:hover": {
                    backgroundColor: "rgba(255, 215, 0, 0.1)",
                    transform: "scale(1.1)",
                  },
                }}
              >
                <QQIcon />
              </IconButton>
            </Box>
          </Grid>

          {/* 右侧区域 - 占2/3宽度 */}
          <Grid item xs={8}>
            <Grid container spacing={3}>
              {/* 学习 */}
              <Grid item xs={3}>
                <Typography
                  variant="h6"
                  sx={{
                    color: "#FFD700",
                    fontWeight: "bold",
                    mb: 2,
                  }}
                >
                  学习
                </Typography>
                <Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
                  <Typography variant="body2" sx={{ color: "white" }}>
                    什么是区块链
                  </Typography>
                  <Typography variant="body2" sx={{ color: "white" }}>
                    交易指南
                  </Typography>
                  <Typography variant="body2" sx={{ color: "white" }}>
                    市场分析
                  </Typography>
                  <Typography variant="body2" sx={{ color: "white" }}>
                    监管制度
                  </Typography>
                  <Typography variant="body2" sx={{ color: "white" }}>
                    交易策略
                  </Typography>
                  <Typography variant="body2" sx={{ color: "white" }}>
                    典型案例
                  </Typography>
                  <Typography variant="body2" sx={{ color: "white" }}>
                    行业动态
                  </Typography>
                </Box>
              </Grid>

              {/* 产品 */}
              <Grid item xs={3}>
                <Typography
                  variant="h6"
                  sx={{
                    color: "#FFD700",
                    fontWeight: "bold",
                    mb: 2,
                  }}
                >
                  产品
                </Typography>
                <Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
                  <Typography variant="body2" sx={{ color: "white" }}>
                    商品列表
                  </Typography>
                  <Typography variant="body2" sx={{ color: "white" }}>
                    热门交易
                  </Typography>
                  <Typography variant="body2" sx={{ color: "white" }}>
                    最新上架
                  </Typography>
                  <Typography variant="body2" sx={{ color: "white" }}>
                    价格走势
                  </Typography>
                </Box>
              </Grid>

              {/* 帮助 */}
              <Grid item xs={3}>
                <Typography
                  variant="h6"
                  sx={{
                    color: "#FFD700",
                    fontWeight: "bold",
                    mb: 2,
                  }}
                >
                  帮助
                </Typography>
                <Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
                  <Typography variant="body2" sx={{ color: "white" }}>
                    常见问题
                  </Typography>
                  <Typography variant="body2" sx={{ color: "white" }}>
                    交易流程
                  </Typography>
                  <Typography variant="body2" sx={{ color: "white" }}>
                    联系客服
                  </Typography>
                  <Typography variant="body2" sx={{ color: "white" }}>
                    问题反馈
                  </Typography>
                </Box>
              </Grid>

              {/* 关于我们 */}
              <Grid item xs={3}>
                <Typography
                  variant="h6"
                  sx={{
                    color: "#FFD700",
                    fontWeight: "bold",
                    mb: 2,
                  }}
                >
                  关于我们
                </Typography>
                <Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
                  <Typography variant="body2" sx={{ color: "white" }}>
                    公司简介
                  </Typography>
                  <Typography variant="body2" sx={{ color: "white" }}>
                    团队介绍
                  </Typography>
                  <Typography variant="body2" sx={{ color: "white" }}>
                    加入我们
                  </Typography>
                  <Typography variant="body2" sx={{ color: "white" }}>
                    联系我们
                  </Typography>
                </Box>
              </Grid>
            </Grid>
          </Grid>
        </Grid>
      </Box>

      <Divider
        sx={{
          width: "90%",
          backgroundColor: "rgba(237, 219, 219, 0.52)",
          margin: "70px 0 30px 0",
        }}
      />

      {/* 版权信息和隐私条款 */}
      <Box
        sx={{
          width: "90%",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          mb: 2,
        }}
      >
        <Typography variant="body2" sx={{ color: "rgba(255, 255, 255, 0.7)" }}>
          © {new Date().getFullYear()} 链宗集团股份有限公司 |
          地址：学府路一段24号
        </Typography>
        <Typography
          variant="body2"
          sx={{
            color: "rgba(255, 255, 255, 0.7)",
            cursor: "pointer",
            "&:hover": {
              color: "#FFD700",
            },
          }}
        >
          隐私条款
        </Typography>
      </Box>
    </Box>
  );
}

const express = require("express");
const router = express.Router();
const Database = require("../database/db");

// 获取卖家详情
router.get("/:walletAddress", async (req, res) => {
  try {
    const { walletAddress } = req.params;

    // 获取卖家信息
    const seller = await Database.findOne("sellers", {
      wallet_address: walletAddress,
    });

    if (!seller) {
      return res.status(404).json({
        success: false,
        message: "卖家不存在",
      });
    }

    // 获取卖家的商品列表
    const products = await Database.findMany(
      "products",
      { seller_id: seller.id },
      { orderBy: "created_at DESC" }
    );

    res.json({
      success: true,
      data: {
        ...seller,
        products,
      },
    });
  } catch (error) {
    console.error("获取卖家详情失败:", error);
    res.status(500).json({
      success: false,
      message: "获取卖家详情失败",
      error: error.message,
    });
  }
});

module.exports = router;

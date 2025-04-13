const express = require("express");
const router = express.Router();
const db = require("../database/db");
const { v4: uuidv4 } = require("uuid");

// 创建卖家记录
router.post("/", async (req, res) => {
  try {
    const { wallet_address, name, created_at } = req.body;

    // 验证必要字段
    if (!wallet_address || !name) {
      return res.status(400).json({
        success: false,
        message: "缺少必要字段",
      });
    }

    // 检查卖家是否已存在
    const existingSeller = await db.query(
      "SELECT * FROM sellers WHERE wallet_address = ?",
      [wallet_address]
    );

    if (existingSeller && existingSeller.length > 0) {
      return res.status(400).json({
        success: false,
        message: "该卖家已存在",
      });
    }

    // 创建新卖家记录
    const id = uuidv4();
    const result = await db.query(
      "INSERT INTO sellers (id, wallet_address, name, created_at) VALUES (?, ?, ?, ?)",
      [id, wallet_address, name, created_at]
    );

    res.json({
      success: true,
      message: "卖家记录创建成功",
      data: result,
    });
  } catch (error) {
    console.error("创建卖家记录失败:", error);
    res.status(500).json({
      success: false,
      message: "创建卖家记录失败",
    });
  }
});

module.exports = router;

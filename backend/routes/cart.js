const express = require("express");
const router = express.Router();
const Database = require("../database/db");
const { v4: uuidv4 } = require("uuid");

// 添加商品到购物车
router.post("/", async (req, res) => {
  try {
    const { productId, walletAddress, quantity = 1 } = req.body;

    // 验证必要字段
    if (!productId || !walletAddress) {
      return res.status(400).json({
        success: false,
        message: "缺少必要字段",
      });
    }

    // 检查用户是否存在，不存在则创建
    const user = await Database.findOne("users", {
      wallet_address: walletAddress,
    });
    let userId;

    if (!user) {
      userId = uuidv4();
      await Database.insert("users", {
        id: userId,
        wallet_address: walletAddress,
        created_at: new Date(),
        updated_at: new Date(),
      });
    } else {
      userId = user.id;
    }

    // 检查商品是否已在购物车中
    const existingCartItem = await Database.findOne("cart_items", {
      user_id: userId,
      product_id: productId,
    });

    if (existingCartItem) {
      // 更新数量
      await Database.update(
        "cart_items",
        {
          quantity: existingCartItem.quantity + quantity,
          updated_at: new Date(),
        },
        { id: existingCartItem.id }
      );
    } else {
      // 获取商品信息
      const product = await Database.findOne("products", { id: productId });

      if (!product) {
        return res.status(404).json({
          success: false,
          message: "商品不存在",
        });
      }

      // 创建新的购物车项
      await Database.insert("cart_items", {
        id: uuidv4(),
        user_id: userId,
        product_id: productId,
        quantity,
        name: product.name,
        price: product.price,
        image_url: product.image_url,
        numeric_id: product.numeric_id,
        created_at: new Date(),
        updated_at: new Date(),
      });
    }

    res.status(201).json({
      success: true,
      message: "商品已添加到购物车",
    });
  } catch (error) {
    console.error("添加商品到购物车失败:", error);
    res.status(500).json({
      success: false,
      message: "添加商品到购物车失败",
      error: error.message,
    });
  }
});

// 获取用户购物车商品列表
router.get("/:walletAddress", async (req, res) => {
  try {
    const { walletAddress } = req.params;

    // 获取用户ID
    const user = await Database.findOne("users", {
      wallet_address: walletAddress,
    });
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "用户不存在",
      });
    }

    // 获取购物车商品
    const cartItems = await Database.findMany(
      "cart_items",
      { user_id: user.id },
      { orderBy: "created_at DESC" }
    );

    // 获取商品详情
    const cartItemsWithDetails = await Promise.all(
      cartItems.map(async (item) => {
        const product = await Database.findOne("products", {
          id: item.product_id,
        });
        return {
          ...item,
          product,
        };
      })
    );

    res.json({
      success: true,
      data: cartItemsWithDetails,
      message: "获取购物车列表成功",
    });
  } catch (error) {
    console.error("获取购物车列表失败:", error);
    res.status(500).json({
      success: false,
      message: "获取购物车列表失败",
      error: error.message,
    });
  }
});

// 从购物车中删除商品
router.delete("/:cartItemId", async (req, res) => {
  try {
    const { cartItemId } = req.params;
    const result = await Database.delete("cart_items", { id: cartItemId });

    if (result.affectedRows === 0) {
      return res.status(404).json({
        success: false,
        message: "购物车商品不存在",
      });
    }

    res.json({
      success: true,
      message: "商品已从购物车中删除",
    });
  } catch (error) {
    console.error("从购物车删除商品失败:", error);
    res.status(500).json({
      success: false,
      message: "从购物车删除商品失败",
      error: error.message,
    });
  }
});

// 更新购物车商品数量
router.put("/:cartItemId", async (req, res) => {
  try {
    const { cartItemId } = req.params;
    const { quantity } = req.body;

    if (!quantity || quantity < 1) {
      return res.status(400).json({
        success: false,
        message: "无效的商品数量",
      });
    }

    const result = await Database.update(
      "cart_items",
      {
        quantity,
        updated_at: new Date(),
      },
      { id: cartItemId }
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({
        success: false,
        message: "购物车商品不存在",
      });
    }

    res.json({
      success: true,
      message: "购物车商品数量已更新",
    });
  } catch (error) {
    console.error("更新购物车商品数量失败:", error);
    res.status(500).json({
      success: false,
      message: "更新购物车商品数量失败",
      error: error.message,
    });
  }
});

// 清空用户购物车
router.delete("/:walletAddress/clear", async (req, res) => {
  try {
    const { walletAddress } = req.params;

    // 获取用户ID
    const user = await Database.findOne("users", {
      wallet_address: walletAddress,
    });
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "用户不存在",
      });
    }

    // 删除该用户的所有购物车商品
    await Database.deleteMany("cart_items", { user_id: user.id });

    res.json({
      success: true,
      message: "购物车已清空",
    });
  } catch (error) {
    console.error("清空购物车失败:", error);
    res.status(500).json({
      success: false,
      message: "清空购物车失败",
      error: error.message,
    });
  }
});

module.exports = router;

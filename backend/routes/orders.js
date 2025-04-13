const express = require("express");
const router = express.Router();
const pool = require("../config/database");

// 获取所有订单（管理员接口）
router.get("/", async (req, res) => {
  try {
    const [orders] = await pool.execute(
      `SELECT o.*, 
              u_buyer.wallet_address as buyer_address,
              oi.quantity,
              p.name as product_name,
              p.image_url as product_image,
              p.numeric_id as product_id
       FROM orders o
       LEFT JOIN users u_buyer ON o.buyer_id = u_buyer.id
       LEFT JOIN order_items oi ON o.id = oi.order_id
       LEFT JOIN products p ON oi.product_id = p.id
       ORDER BY o.created_at DESC`
    );

    res.json({
      success: true,
      data: orders,
    });
  } catch (error) {
    console.error("获取订单列表失败:", error);
    res.status(500).json({
      success: false,
      message: "获取订单列表失败",
    });
  }
});

// 更新订单冻结状态（管理员接口）
router.put("/:orderId/freeze", async (req, res) => {
  try {
    const { orderId } = req.params;
    const { isFrozen, processedBy } = req.body;

    await pool.execute(
      "UPDATE orders SET is_frozen = ?, processed_by = ?, updated_at = NOW() WHERE id = ?",
      [isFrozen, processedBy, orderId]
    );

    res.json({
      success: true,
      message: isFrozen ? "订单已冻结" : "订单已解冻",
    });
  } catch (error) {
    console.error("更新订单状态失败:", error);
    res.status(500).json({
      success: false,
      message: "更新订单状态失败",
    });
  }
});

// 创建订单
router.post("/", async (req, res) => {
  try {
    const {
      orderId,
      productId,
      walletAddress,
      price,
      quantity,
      transactionHash,
    } = req.body;

    // 验证必要字段
    if (!orderId || !productId || !walletAddress || !price) {
      return res.status(400).json({
        success: false,
        message: "缺少必要的订单信息",
      });
    }

    // 开启数据库事务
    const connection = await pool.getConnection();
    await connection.beginTransaction();

    try {
      // 检查用户是否存在
      const [userRows] = await connection.execute(
        "SELECT id FROM users WHERE wallet_address = ?",
        [walletAddress]
      );

      let userId;
      if (userRows.length === 0) {
        // 如果用户不存在，创建新用户
        const { v4: uuidv4 } = require("uuid");
        userId = uuidv4();
        await connection.execute(
          "INSERT INTO users (id, wallet_address, created_at, updated_at) VALUES (?, ?, NOW(), NOW())",
          [userId, walletAddress]
        );
      } else {
        userId = userRows[0].id;
      }

      // 创建订单记录
      const [orderResult] = await connection.execute(
        `INSERT INTO orders (id, buyer_id, total_amount, status, transaction_hash, created_at) 
         VALUES (?, ?, ?, 'completed', ?, NOW())`,
        [orderId, userId, price, transactionHash]
      );

      // 根据numeric_id查询商品的id
      const [productRows] = await connection.execute(
        "SELECT id FROM products WHERE numeric_id = ?",
        [productId]
      );

      if (productRows.length === 0) {
        throw new Error("商品不存在");
      }

      // 创建订单项记录
      const { v4: uuidv4 } = require("uuid");
      const orderItemId = uuidv4();
      const orderItemData = {
        id: orderItemId,
        order_id: orderId,
        product_id: productRows[0].id,
        quantity: quantity || 1,
        price: price,
      };

      await connection.execute(
        `INSERT INTO order_items (id, order_id, product_id, quantity, price) 
         VALUES (?, ?, ?, ?, ?)`,
        [
          orderItemData.id,
          orderItemData.order_id,
          orderItemData.product_id,
          orderItemData.quantity,
          orderItemData.price,
        ]
      );

      // 更新商品销量
      await connection.execute(
        `UPDATE products SET sales = sales + ? WHERE numeric_id = ?`,
        [quantity, productId]
      );

      // 提交事务
      await connection.commit();

      res.json({
        success: true,
        data: {
          orderId,
          message: "订单创建成功",
        },
      });
    } catch (error) {
      // 如果出错，回滚事务
      await connection.rollback();
      throw error;
    } finally {
      connection.release();
    }
  } catch (error) {
    console.error("创建订单失败:", error);
    res.status(500).json({
      success: false,
      message: "创建订单失败，请稍后重试",
    });
  }
});

// 获取用户的订单列表
router.get("/:walletAddress", async (req, res) => {
  try {
    const { walletAddress } = req.params;

    // 验证钱包地址
    if (!walletAddress) {
      return res.status(400).json({
        success: false,
        message: "缺少钱包地址",
      });
    }

    const connection = await pool.getConnection();

    try {
      // 联合查询获取订单信息、订单项和商品信息
      const [orders] = await connection.execute(
        `SELECT 
          o.id,
          o.id as orderId,
          o.status,
          o.created_at,
          o.total_amount as price,
          o.transaction_hash as transactionHash,
          oi.quantity,
          p.name as productName,
          p.image_url as productImage,
          p.numeric_id as productId
        FROM orders o
        JOIN users u ON o.buyer_id = u.id
        JOIN order_items oi ON o.id = oi.order_id
        JOIN products p ON oi.product_id = p.id
        WHERE u.wallet_address = ?
        ORDER BY o.created_at DESC`,
        [walletAddress]
      );

      res.json({
        success: true,
        data: orders,
      });
    } finally {
      connection.release();
    }
  } catch (error) {
    console.error("获取订单列表失败:", error);
    res.status(500).json({
      success: false,
      message: "获取订单列表失败，请稍后重试",
    });
  }
});

module.exports = router;

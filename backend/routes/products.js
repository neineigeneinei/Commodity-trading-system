const express = require("express");
const router = express.Router();
const Database = require("../database/db");
const { v4: uuidv4 } = require("uuid");
const multer = require("multer");
const path = require("path");
const OSS = require("ali-oss");

// 配置阿里云OSS客户端
const ossClient = new OSS({
  region: process.env.OSS_REGION,
  accessKeyId: process.env.OSS_ACCESS_KEY_ID,
  accessKeySecret: process.env.OSS_ACCESS_KEY_SECRET,
  bucket: process.env.OSS_BUCKET,
});

// 配置multer用于处理文件上传到内存
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

// 上传文件到OSS
async function uploadToOSS(file) {
  try {
    const fileName = `products/${Date.now()}${path.extname(file.originalname)}`;
    const result = await ossClient.put(fileName, file.buffer);
    return result.url; // 返回文件的OSS访问地址
  } catch (error) {
    console.error("上传到OSS失败:", error);
    throw error;
  }
}

// 专门处理OSS上传的接口
router.post("/upload-to-oss", upload.single("image"), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: "请上传文件",
      });
    }

    const url = await uploadToOSS(req.file);

    res.json({
      success: true,
      url,
      message: "文件上传成功",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "文件上传失败",
      error: error.message,
    });
  }
});

// 搜索商品
router.get("/search", async (req, res) => {
  try {
    const { keyword } = req.query;

    if (!keyword) {
      return res.status(400).json({
        success: false,
        message: "请提供搜索关键词",
      });
    }

    const products = await Database.findMany(
      "products",
      {},
      {
        where: `name LIKE '%${keyword}%'`,
        orderBy: "created_at DESC",
      }
    );

    res.json({
      success: true,
      data: products,
      message: "搜索成功",
    });
  } catch (error) {
    console.error("搜索商品失败:", error);
    res.status(500).json({
      success: false,
      message: "搜索失败",
      error: error.message,
    });
  }
});

// 获取商品列表，支持热门商品查询
router.get("/", async (req, res) => {
  try {
    const { hot } = req.query;
    const options = {
      orderBy: hot === "true" ? "sales DESC" : "created_at DESC",
      ...(hot === "true" && { limit: 5 }),
    };

    const products = await Database.findMany("products", {}, options);

    res.json({
      success: true,
      data: products,
      message: "获取商品列表成功",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "获取商品列表失败",
      error: error.message,
    });
  }
});

// 获取单个商品详情
router.get("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const product = await Database.findOne("products", { id });

    if (!product) {
      return res.status(404).json({
        success: false,
        message: "商品不存在",
      });
    }

    res.json({
      success: true,
      data: product,
      message: "获取商品详情成功",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "获取商品详情失败",
      error: error.message,
    });
  }
});

// 创建新商品
router.post("/", upload.single("image"), async (req, res) => {
  try {
    // 验证必要字段
    if (
      !req.body.name ||
      !req.body.price ||
      !req.body.mainCategory ||
      !req.body.subCategory
    ) {
      return res.status(400).json({
        success: false,
        message: "缺少必要字段",
      });
    }

    // 首先检查用户是否存在
    const user = await Database.findOne("users", {
      wallet_address: req.body.walletAddress,
    });
    let userId;

    if (!user) {
      // 如果用户不存在，先创建用户
      userId = uuidv4();
      await Database.insert("users", {
        id: userId,
        wallet_address: req.body.walletAddress,
        created_at: new Date(),
        updated_at: new Date(),
      });
    } else {
      userId = user.id;
    }

    // 上传图片到OSS
    let imageUrl = null;
    if (req.file) {
      imageUrl = await uploadToOSS(req.file);
    }

    const productData = {
      id: uuidv4(),
      name: req.body.name,
      price: req.body.price,
      description: req.body.description || "",
      main_category: req.body.mainCategory,
      sub_category: req.body.subCategory,
      image_url: imageUrl,
      seller_id: userId,
      numeric_id: req.body.productId, // 保存区块链商品ID
      created_at: new Date(),
      updated_at: new Date(),
    };

    await Database.insert("products", productData);

    res.status(201).json({
      success: true,
      data: productData,
      message: "商品创建成功",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "商品创建失败",
      error: error.message,
    });
  }
});

// 更新商品信息
router.put("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = {
      ...req.body,
      updated_at: new Date(),
    };

    const result = await Database.update("products", updateData, { id });

    if (result.affectedRows === 0) {
      return res.status(404).json({
        success: false,
        message: "商品不存在",
      });
    }

    res.json({
      success: true,
      data: updateData,
      message: "商品更新成功",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "商品更新失败",
      error: error.message,
    });
  }
});

// 删除商品
router.delete("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const result = await Database.delete("products", { id });

    if (result.affectedRows === 0) {
      return res.status(404).json({
        success: false,
        message: "商品不存在",
      });
    }

    res.json({
      success: true,
      message: "商品删除成功",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "商品删除失败",
      error: error.message,
    });
  }
});

module.exports = router;

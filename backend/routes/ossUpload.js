const express = require("express");
const router = express.Router();
const OSS = require("ali-oss");
const multer = require("multer");
const path = require("path");

// 配置阿里云OSS
const client = new OSS({
  region: "oss-cn-chengdu",
  accessKeyId: process.env.OSS_ACCESS_KEY_ID,
  accessKeySecret: process.env.OSS_ACCESS_KEY_SECRET,
  bucket: "tangsun",
});

// 配置multer处理文件上传
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

// 上传文件到OSS
router.post("/upload-to-oss", upload.single("image"), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: "未上传文件" });
    }

    // 生成唯一文件名
    const fileName = `products/${Date.now()}${path.extname(
      req.file.originalname
    )}`;

    // 上传到OSS
    const result = await client.put(fileName, req.file.buffer);

    res.json({
      success: true,
      url: result.url,
      message: "文件上传成功",
    });
  } catch (error) {
    console.error("OSS上传错误:", error);
    res.status(500).json({
      success: false,
      message: "文件上传失败",
      error: error.message,
    });
  }
});

module.exports = router;

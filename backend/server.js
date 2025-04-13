const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const bodyParser = require("body-parser");
const morgan = require("morgan");

// 加载环境变量
dotenv.config();

const app = express();

// 中间件配置
app.use(cors());
app.use(morgan("dev"));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// 基本路由
app.get("/", (req, res) => {
  res.json({ message: "欢迎使用链宗商品交易平台API" });
});

// API路由
app.use("/api/products", require("./routes/products"));
app.use("/api/upload-to-oss", require("./routes/products"));
app.use("/api/auth", require("./routes/users"));
app.use("/api/transactions", require("./routes/transactions"));
app.use("/api/seller-applications", require("./routes/sellerApplications"));
app.use("/api/orders", require("./routes/orders"));
app.use("/api/cart", require("./routes/cart"));
app.use("/api/sellers", require("./routes/sellers"));
app.use("/api/seller-detail", require("./routes/seller-detail"));

// 错误处理中间件
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: "服务器内部错误" });
});

// 设置端口号
const PORT = process.env.PORT || 5000;

// 启动服务器
app.listen(PORT, () => {
  console.log(`服务器运行在端口 ${PORT}`);
});

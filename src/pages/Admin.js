import React, { useState, useEffect } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Typography,
  Box,
  Alert,
  Snackbar,
} from "@mui/material";
import axios from "axios";
import { ethers } from "ethers";
import UserAuthABI from "../artifacts/UserAuth.json";
import { USER_AUTH_ADDRESS } from "../utils/contracts";

const Admin = () => {
  const [applications, setApplications] = useState([]);
  const [selectedApp, setSelectedApp] = useState(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [reason, setReason] = useState("");
  const [loading, setLoading] = useState(false);
  const [transactions, setTransactions] = useState([]);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "success",
  });

  useEffect(() => {
    fetchApplications();
    fetchTransactions();
  }, []);

  const fetchTransactions = async () => {
    try {
      const response = await axios.get("http://localhost:5000/api/orders");
      setTransactions(response.data.data);
    } catch (error) {
      setSnackbar({
        open: true,
        message: "获取交易列表失败",
        severity: "error",
      });
    }
  };

  const handleFreezeTransaction = async (orderId, isFrozen) => {
    try {
      await axios.put(`http://localhost:5000/api/orders/${orderId}/freeze`, {
        isFrozen,
        processedBy: localStorage.getItem("walletAddress"),
      });

      setSnackbar({
        open: true,
        message: isFrozen ? "交易已冻结" : "交易已解冻",
        severity: "success",
      });
      fetchTransactions();
    } catch (error) {
      console.error("处理交易状态失败:", error);
      setSnackbar({
        open: true,
        message: "处理交易状态失败",
        severity: "error",
      });
    }
  };

  const fetchApplications = async () => {
    try {
      const response = await axios.get(
        "http://localhost:5000/api/seller-applications/pending"
      );
      setApplications(response.data.data);
    } catch (error) {
      setSnackbar({
        open: true,
        message: "获取申请列表失败",
        severity: "error",
      });
    }
  };

  const handleProcess = async (status) => {
    setLoading(true);
    try {
      await axios.put(
        `http://localhost:5000/api/seller-applications/${selectedApp.id}`,
        {
          status,
          reason,
          processedBy: localStorage.getItem("walletAddress"),
        }
      );

      // 使用ethers.js初始化合约
      const provider = new ethers.BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();
      const userAuthContract = new ethers.Contract(
        USER_AUTH_ADDRESS,
        UserAuthABI.abi,
        signer
      );

      // 调用智能合约处理申请
      await userAuthContract.processSellerApplication(
        selectedApp.wallet_address,
        status === "approved"
      );

      // 如果是批准申请，则创建seller记录
      if (status === "approved") {
        try {
          const sellerId = `SELLER_${Date.now()}_${Math.random()
            .toString(36)
            .substr(2, 9)}`;
          await axios.post("http://localhost:5000/api/sellers", {
            id: sellerId,
            wallet_address: selectedApp.wallet_address,
            name: selectedApp.username,
            created_at: new Date().toJSON().slice(0, 19).replace("T", " "),
            status: "active",
          });
        } catch (error) {
          console.error("创建卖家记录失败:", error);
          // 不影响整体流程，只记录错误
        }
      }

      setSnackbar({ open: true, message: "申请处理成功", severity: "success" });
      setModalVisible(false);
      fetchApplications();
    } catch (error) {
      console.error("处理申请失败:", error);
      setSnackbar({ open: true, message: "处理申请失败", severity: "error" });
    } finally {
      setLoading(false);
    }
  };

  const handleCloseSnackbar = () => {
    setSnackbar({ ...snackbar, open: false });
  };

  const [blockQuery, setBlockQuery] = useState("");
  const [blockInfo, setBlockInfo] = useState(null);
  const [blockInfoOpen, setBlockInfoOpen] = useState(false);

  const handleBlockQuery = async () => {
    try {
      if (!blockQuery) {
        setSnackbar({
          open: true,
          message: "请输入交易哈希",
          severity: "warning",
        });
        return;
      }

      const provider = new ethers.BrowserProvider(window.ethereum);
      const transaction = await provider.getTransaction(blockQuery);
      const receipt = await provider.getTransactionReceipt(blockQuery);

      if (!transaction || !receipt) {
        setSnackbar({
          open: true,
          message: "未找到该交易信息",
          severity: "error",
        });
        return;
      }

      setBlockInfo({
        blockNumber: transaction.blockNumber,
        from: transaction.from,
        to: transaction.to,
        value: transaction.value ? ethers.formatEther(transaction.value) : "0",
        gasUsed: receipt.gasUsed.toString(),
        effectiveGasPrice: receipt.effectiveGasPrice
          ? ethers.formatEther(receipt.effectiveGasPrice)
          : "0",
        status: receipt.status === 1 ? "成功" : "失败",
      });
      setBlockInfoOpen(true);
    } catch (error) {
      console.error("查询交易信息失败:", error);
      setSnackbar({
        open: true,
        message: "查询交易信息失败",
        severity: "error",
      });
    }
  };

  return (
    <Box sx={{ padding: "20px" }}>
      <Box
        sx={{ display: "flex", alignItems: "center", gap: 2, marginBottom: 3 }}
      >
        <Typography variant="h4" gutterBottom sx={{ marginBottom: 0 }}>
          管理员面板
        </Typography>
        <TextField
          size="small"
          placeholder="输入交易哈希查询区块信息"
          value={blockQuery}
          onChange={(e) => setBlockQuery(e.target.value)}
          sx={{ width: 300 }}
        />
        <Button
          variant="contained"
          onClick={handleBlockQuery}
          sx={{
            backgroundColor: "#1976d2",
            color: "white",
            "&:hover": {
              backgroundColor: "#1565c0",
            },
          }}
        >
          查询
        </Button>
      </Box>
      {/* 卖家申请部分 */}
      <Box sx={{ marginTop: "20px", marginBottom: "40px" }}>
        <Typography variant="h5" gutterBottom>
          待处理的卖家申请
        </Typography>
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>用户名</TableCell>
                <TableCell>钱包地址</TableCell>
                <TableCell>申请时间</TableCell>
                <TableCell>操作</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {applications.map((app) => (
                <TableRow key={app.id}>
                  <TableCell>{app.username}</TableCell>
                  <TableCell>{app.wallet_address}</TableCell>
                  <TableCell>
                    {new Date(app.created_at).toLocaleString()}
                  </TableCell>
                  <TableCell>
                    <Button
                      variant="contained"
                      color="primary"
                      onClick={() => {
                        setSelectedApp(app);
                        setModalVisible(true);
                      }}
                    >
                      处理
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </Box>

      {/* 交易审查部分 */}
      <Box sx={{ marginTop: "20px" }}>
        <Typography variant="h5" gutterBottom>
          交易记录审查
        </Typography>
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell sx={{ fontWeight: "bold", fontSize: "1.1rem" }}>
                  交易哈希
                </TableCell>
                <TableCell>商品名称</TableCell>
                <TableCell>买家地址</TableCell>
                <TableCell>卖家地址</TableCell>
                <TableCell>交易金额(ETH)</TableCell>
                <TableCell>交易时间</TableCell>
                <TableCell>状态</TableCell>
                <TableCell>操作</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {transactions.map((tx) => (
                <TableRow key={tx.id}>
                  <TableCell sx={{ color: "#1976d2", fontWeight: "500" }}>
                    {tx.transaction_hash}
                  </TableCell>
                  <TableCell>{tx.product_name}</TableCell>
                  <TableCell>
                    {tx.buyer_address
                      ? `${tx.buyer_address.slice(0, 10)}...`
                      : "地址不可用"}
                  </TableCell>
                  <TableCell>
                    {tx.seller_address
                      ? `${tx.seller_address.slice(0, 10)}...`
                      : "地址不可用"}
                  </TableCell>
                  <TableCell>{tx.amount}</TableCell>
                  <TableCell>
                    {new Date(tx.created_at).toLocaleString()}
                  </TableCell>
                  <TableCell>
                    {tx.is_frozen ? (
                      <Typography color="error">已冻结</Typography>
                    ) : (
                      <Typography color="success">正常</Typography>
                    )}
                  </TableCell>
                  <TableCell>
                    <Button
                      variant="contained"
                      color={tx.is_frozen ? "success" : "error"}
                      onClick={() =>
                        handleFreezeTransaction(tx.id, !tx.is_frozen)
                      }
                    >
                      {tx.is_frozen ? "解冻" : "冻结"}
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </Box>

      {/* 现有的对话框和Snackbar组件 */}
      <Dialog
        open={modalVisible}
        onClose={() => setModalVisible(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>处理申请</DialogTitle>
        <DialogContent>
          <Box sx={{ pt: 2 }}>
            <Typography variant="body1" gutterBottom>
              用户名：{selectedApp?.username}
            </Typography>
            <Typography variant="body1" gutterBottom>
              钱包地址：{selectedApp?.wallet_address}
            </Typography>
            <TextField
              label="处理原因"
              multiline
              rows={4}
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              fullWidth
              margin="normal"
              variant="outlined"
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button
            onClick={() => handleProcess("rejected")}
            color="error"
            variant="contained"
            disabled={loading}
          >
            {loading ? "处理中..." : "拒绝"}
          </Button>
          <Button
            onClick={() => handleProcess("approved")}
            color="primary"
            variant="contained"
            disabled={loading}
          >
            {loading ? "处理中..." : "批准"}
          </Button>
        </DialogActions>
      </Dialog>

      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: "top", horizontal: "center" }}
      >
        <Alert
          onClose={handleCloseSnackbar}
          severity={snackbar.severity}
          sx={{ width: "100%" }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>

      <Dialog
        open={blockInfoOpen}
        onClose={() => setBlockInfoOpen(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>交易详情</DialogTitle>
        <DialogContent>
          {blockInfo && (
            <Box sx={{ pt: 2 }}>
              <Typography variant="body1" gutterBottom>
                区块号：{blockInfo.blockNumber}
              </Typography>
              <Typography variant="body1" gutterBottom>
                发送方：{blockInfo.from}
              </Typography>
              <Typography variant="body1" gutterBottom>
                接收方：{blockInfo.to}
              </Typography>
              <Typography variant="body1" gutterBottom>
                交易金额：{blockInfo.value} ETH
              </Typography>
              <Typography variant="body1" gutterBottom>
                Gas 使用量：{blockInfo.gasUsed}
              </Typography>
              <Typography variant="body1" gutterBottom>
                实际 Gas 价格：{blockInfo.effectiveGasPrice} ETH
              </Typography>
              <Typography variant="body1" gutterBottom>
                交易状态：{blockInfo.status}
              </Typography>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setBlockInfoOpen(false)}>关闭</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default Admin;

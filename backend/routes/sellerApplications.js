const express = require('express');
const router = express.Router();
const Database = require('../database/db');

// 提交卖家申请
router.post('/', async (req, res) => {
    try {
        const { walletAddress, userName } = req.body;

        // 检查是否已有待处理的申请
        const existingApplication = await Database.findOne('seller_applications', {
            wallet_address: walletAddress,
            status: 'pending'
        });

        if (existingApplication) {
            return res.status(400).json({
                success: false,
                message: '已有待处理的申请'
            });
        }

    // 创建新申请
    const { v4: uuidv4 } = require("uuid");
    await Database.insert("seller_applications", {
      id: uuidv4(),
      wallet_address: walletAddress,
      username: userName,
      status: "pending",
      created_at: new Date(),
    });

        res.json({
            success: true,
            message: '申请已提交'
        });
    } catch (error) {
        console.error('提交卖家申请失败:', error);
        res.status(500).json({
            success: false,
            message: '服务器错误'
        });
    }
});

// 获取申请状态
router.get('/status/:walletAddress', async (req, res) => {
    try {
        const { walletAddress } = req.params;
        const application = await Database.findOne('seller_applications', 
            { wallet_address: walletAddress },
            { orderBy: 'created_at DESC' }
        );

        if (!application) {
            return res.status(404).json({
                success: false,
                message: '未找到申请记录'
            });
        }

        res.json({
            success: true,
            data: application
        });
    } catch (error) {
        console.error('获取申请状态失败:', error);
        res.status(500).json({
            success: false,
            message: '服务器错误'
        });
    }
});

// 管理员获取所有待处理的申请
router.get('/pending', async (req, res) => {
    try {
        const applications = await Database.findMany('seller_applications',
            { status: 'pending' },
            { orderBy: 'created_at ASC' }
        );

        res.json({
            success: true,
            data: applications
        });
    } catch (error) {
        console.error('获取待处理申请失败:', error);
        res.status(500).json({
            success: false,
            message: '服务器错误'
        });
    }
});

// 管理员处理申请
router.put('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const { status, reason, processedBy } = req.body;

        if (!['approved', 'rejected'].includes(status)) {
            return res.status(400).json({
                success: false,
                message: '无效的状态值'
            });
        }

        await Database.update('seller_applications',
            {
                status,
                reason,
                processed_by: processedBy,
                processed_at: new Date()
            },
            { id: id }
        );

        res.json({
            success: true,
            message: '申请已处理'
        });
    } catch (error) {
        console.error('处理申请失败:', error);
        res.status(500).json({
            success: false,
            message: '服务器错误'
        });
    }
});

module.exports = router;

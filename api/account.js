const express = require("express");
const authMiddleware = require("../middleware");
const router = express.Router();
const zod = require("zod");
const { account } = require("../db/Bank");
const { User } = require("../db/User");
const mongoose = require("mongoose");

router.get("/balance", authMiddleware, async (req, res) => {
    try {
        const user = await User.findOne({
            username: req.user.username
        });

        if (!user) {
            return res.status(404).json({
                message: "User not found"
            });
        }

        const userAccount = await account.findOne({
            userId: user._id
        });

        if (!userAccount) {
            return res.status(404).json({
                message: "Account not found for this user"
            });
        }

        res.json({
            balance: userAccount.balance
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({
            message: "Internal Server Error",
            error: error.message
        });
    }
});

router.post("/transfer", authMiddleware, async (req, res) => {
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
        const { from, to, amount } = req.body;

        const fromUser = await User.findOne({ username: from }).session(session);
        const toUser = await User.findOne({ username: to }).session(session);

        if (!fromUser || !toUser) {
            await session.abortTransaction();
            return res.status(400).json({
                message: "Invalid user(s)"
            });
        }

        const fromAccount = await account.findOne({ userId: fromUser._id }).session(session);

        if (!fromAccount || fromAccount.balance < amount) {
            await session.abortTransaction();
            return res.status(400).json({
                message: "Insufficient balance"
            });
        }

        const toAccount = await account.findOne({ userId: toUser._id }).session(session);

        if (!toAccount) {
            await session.abortTransaction();
            return res.status(400).json({
                message: "Invalid account"
            });
        }

        await account.updateOne({ userId: fromUser._id }, { $inc: { balance: -amount } }).session(session);
        await account.updateOne({ userId: toUser._id }, { $inc: { balance: amount } }).session(session);

        await session.commitTransaction();

        res.json({
            message: "Transfer successful"
        });
    } catch (error) {
        console.error(error);
        await session.abortTransaction();
        res.status(500).json({
            message: "Internal Server Error",
            error: error.message
        });
    } finally {
        session.endSession();
    }
});

module.exports = router;

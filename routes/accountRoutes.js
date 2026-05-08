const express = require("express");
const protect = require("../middleware/authMiddleware");
const { createAccount, depositMoney, withdrawMoney, transferMoney, getTransactions, getBalance } = require("../controllers/accountController");

const router = express.Router();

router.post("/create", protect, createAccount);
router.post("/deposit", protect, depositMoney);
router.post("/withdraw", protect, withdrawMoney);
router.post("/transfer", protect, transferMoney);
router.get("/transactions", protect, getTransactions);
router.get("/balance", protect, getBalance);

module.exports = router;
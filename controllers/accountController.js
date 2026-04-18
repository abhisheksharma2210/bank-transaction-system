const Account = require("../models/Account");
const generateAccountNumber = require("../utils/generateAccountNumber");

// Create a New Account for User Controller
const createAccount = async (req, res) => {
    try {
        const existingAccount = await Account.findOne({ user: req.user._id });

        if (existingAccount) {
            return res.status(400).json({ message: "Account already exists "});
        }

        const account = await Account.create({
            user: req.user._id,
            accountNumber: generateAccountNumber(),
            balance: 0,      
        });

        res.status(201).json(account);

    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Deposite Money to Account Controller 
const depositMoney = async (req, res) => {
    try {
        const { amount } = req.body;

        if (amount <= 0) {
            return res.status(400).json({ message: "Invalid amount "});
        }

        const account = await Account.findOne({ user: req.user._id })

        if (!account) {
            return res.status(404).json({ message: "Account not found "});
        }

        account.balance += amount;
        await account.save();

        res.status(200).json({
            message: "Deposit successful",
            balance: account.balance
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Withdraw Money from account Controller

const withdrawMoney = async (req, res) => {
    try {
        const  { amount } = req.body;

        if(amount <= 0) {
            return res.status(400).json({ message: "Invalid amount"});
        }

        const account = await Account.findOne({ user: req.user._id });

        if (!account) {
            return res.status(404).json({ message: "Account not found"});
        }

        account.balance -= amount;

        await account.save();

        res.status(200).json({
            message: "Withdrawal successful",
            balance: account.balance
        });

    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Transfer Money for another Account

const transferMoney = async (req, res) => {
  try {
    const { toAccountNumber, amount } = req.body;

    if (amount <= 0) {
      return res.status(400).json({ message: "Invalid amount" });
    }

    // Sender account
    const sender = await Account.findOne({ user: req.user._id });

    if (!sender) {
      return res.status(404).json({ message: "Sender account not found" });
    }

    // Receiver account
    const receiver = await Account.findOne({ accountNumber: toAccountNumber });

    if (!receiver) {
      return res.status(404).json({ message: "Receiver account not found" });
    }

    // Prevent self transfer
    if (sender.accountNumber === receiver.accountNumber) {
      return res.status(400).json({ message: "Cannot transfer to same account" });
    }

    // Balance check
    if (sender.balance < amount) {
      return res.status(400).json({ message: "Insufficient balance" });
    }

    // 🔥 Core logic
    sender.balance -= amount;
    receiver.balance += amount;

    await sender.save();
    await receiver.save();

    res.status(200).json({
      message: "Transfer successful",
      senderBalance: sender.balance
    });

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { createAccount, depositMoney, withdrawMoney, transferMoney  };
import Transaction from "../models/transaction.model.js";


export const getTransactions = async (req, res) => {
  try {
    const userId = req.user.id;
    const { role } = req.user;
    
    
    const targetUserId = req.query.userId;
    
    let filter = {};
    if (role === "viewer") {
      filter.userId = userId; 
    } else {
      
      if (targetUserId) {
        filter.userId = targetUserId;
      }
    }

    const { type, category, dateFrom, dateTo } = req.query;

    if (type) filter.type = type;
    if (category) filter.category = { $regex: category, $options: "i" };
    
    if (dateFrom || dateTo) {
      filter.date = {};
      if (dateFrom) filter.date.$gte = new Date(dateFrom);
      if (dateTo) {
        const endDate = new Date(dateTo);
        endDate.setUTCHours(23, 59, 59, 999);
        filter.date.$lte = endDate;
      }
    }

   
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const skip = (page - 1) * limit;

    const total = await Transaction.countDocuments(filter);
    const transactions = await Transaction.find(filter)
      .sort({ date: -1, createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .populate('userId', 'name email');

    res.status(200).json({
      success: true,
      count: transactions.length,
      total,
      page,
      pages: Math.ceil(total / limit),
      transactions
    });
  } catch (error) {
    console.error("Get transactions error:", error);
    res.status(500).json({ success: false, message: "Failed to fetch transactions" });
  }
};


export const createTransaction = async (req, res) => {
  try {
    const { amount, type, category, paymentMethod, date, notes } = req.body;
    let userId = req.user.id;

    
    if (req.user.role === 'admin' && req.body.userId) {
      userId = req.body.userId;
    }

    if (!amount || !type || !category || !date) {
      return res.status(400).json({ success: false, message: "Amount, type, category, and date are required" });
    }

    const transaction = await Transaction.create({
      userId,
      amount,
      type,
      category,
      paymentMethod,
      date,
      notes
    });

    res.status(201).json({ success: true, message: "Transaction created successfully", transaction });
  } catch (error) {
    console.error("Create transaction error:", error);
    res.status(500).json({ success: false, message: "Failed to create transaction" });
  }
};


export const updateTransaction = async (req, res) => {
  try {
    const transactionId = req.params.id;
    let transaction = await Transaction.findById(transactionId);
    
    if (!transaction) {
      return res.status(404).json({ success: false, message: "Transaction not found" });
    }

   
    if (req.user.role !== "admin" && transaction.userId.toString() !== req.user.id) {
       return res.status(403).json({ success: false, message: "Not authorized to update this transaction" });
    }

    transaction = await Transaction.findByIdAndUpdate(transactionId, req.body, { new: true, runValidators: true });

    res.status(200).json({ success: true, message: "Transaction updated", transaction });
  } catch (error) {
    res.status(500).json({ success: false, message: "Failed to update transaction" });
  }
};


export const deleteTransaction = async (req, res) => {
  try {
    const transactionId = req.params.id;
    const transaction = await Transaction.findById(transactionId);
    
    if (!transaction) {
       return res.status(404).json({ success: false, message: "Transaction not found" });
    }

    
    if (req.user.role !== "admin" && transaction.userId.toString() !== req.user.id) {
      return res.status(403).json({ success: false, message: "Not authorized to delete this transaction" });
    }

    await transaction.deleteOne();

    res.status(200).json({ success: true, message: "Transaction deleted" });
  } catch (error) {
    res.status(500).json({ success: false, message: "Failed to delete transaction" });
  }
};
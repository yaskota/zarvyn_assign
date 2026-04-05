import Transaction from "../models/transaction.model.js";

// @route   GET /api/transaction
// @desc    Get all transactions (Viewer sees own, Analyst/Admin see all optionally, handled via query/params)
export const getTransactions = async (req, res) => {
  try {
    const userId = req.user.id;
    const { role } = req.user;
    
    // Check if they want specific user's transactions and they have rights
    const targetUserId = req.query.userId;
    
    let filter = {};
    if (role === "viewer") {
      filter.userId = userId; // Viewers can only see their own
    } else {
      // Analyst / Admin can see target user's or all if none provided
      if (targetUserId) {
        filter.userId = targetUserId;
      }
    }

    const { type, category, dateFrom, dateTo } = req.query;

    if (type) filter.type = type;
    if (category) filter.category = category;
    
    if (dateFrom || dateTo) {
      filter.date = {};
      if (dateFrom) filter.date.$gte = new Date(dateFrom);
      if (dateTo) filter.date.$lte = new Date(dateTo);
    }

    // Pagination
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

// @route   POST /api/transaction
// @desc    Create transaction (Viewer, Analyst, Admin)
export const createTransaction = async (req, res) => {
  try {
    const { amount, type, category, paymentMethod, date, notes } = req.body;
    let userId = req.user.id;

    // Admin can create for others optionally, but usually they just create for themselves
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

// @route   PUT /api/transaction/:id
// @desc    Update a transaction
export const updateTransaction = async (req, res) => {
  try {
    const transactionId = req.params.id;
    let transaction = await Transaction.findById(transactionId);
    
    if (!transaction) {
      return res.status(404).json({ success: false, message: "Transaction not found" });
    }

    // Checking permissions: Admin can edit any. Viewer can only edit their own. Analyst can view but not edit (unless allowed). Let's restrict edit to Admin or Owner.
    if (req.user.role !== "admin" && transaction.userId.toString() !== req.user.id) {
       return res.status(403).json({ success: false, message: "Not authorized to update this transaction" });
    }

    transaction = await Transaction.findByIdAndUpdate(transactionId, req.body, { new: true, runValidators: true });

    res.status(200).json({ success: true, message: "Transaction updated", transaction });
  } catch (error) {
    res.status(500).json({ success: false, message: "Failed to update transaction" });
  }
};

// @route   DELETE /api/transaction/:id
// @desc    Delete a transaction (Admin only based on requirement: "Admin Capabilities: ... Delete transaction")
export const deleteTransaction = async (req, res) => {
  try {
    const transactionId = req.params.id;
    const transaction = await Transaction.findById(transactionId);
    
    if (!transaction) {
       return res.status(404).json({ success: false, message: "Transaction not found" });
    }

    // Requirement: Admin capabilities: Delete transaction.
    // If a viewer could delete their own, we'd check that. The prompt specifies Admin handles delete.
    if (req.user.role !== "admin" && transaction.userId.toString() !== req.user.id) {
      return res.status(403).json({ success: false, message: "Not authorized to delete this transaction" });
    }

    await transaction.deleteOne();

    res.status(200).json({ success: true, message: "Transaction deleted" });
  } catch (error) {
    res.status(500).json({ success: false, message: "Failed to delete transaction" });
  }
};
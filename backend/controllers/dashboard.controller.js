import Transaction from "../models/transaction.model.js";

// @route   GET /api/dashboard/summary
// @desc    Get dashboard summary (Viewer: own, Analyst/Admin: all or specific user)
export const getDashboardSummary = async (req, res) => {
  try {
    const { role } = req.user;
    const userId = req.user.id;
    const targetUserId = req.query.userId; // Optionally pass a userId for Analyst/Admin

    let matchStage = {};
    
    if (role === "viewer") {
      matchStage.userId = userId;
    } else {
      if (targetUserId) {
        matchStage.userId = targetUserId;
      }
    }

    // 1. Calculate stats: Income, Expense, Balance
    const stats = await Transaction.aggregate([
      { $match: matchStage },
      {
        $group: {
          _id: null,
          totalIncome: { $sum: { $cond: [{ $eq: ["$type", "income"] }, "$amount", 0] } },
          totalExpense: { $sum: { $cond: [{ $eq: ["$type", "expense"] }, "$amount", 0] } }
        }
      }
    ]);

    const totalIncome = stats.length > 0 ? stats[0].totalIncome : 0;
    const totalExpense = stats.length > 0 ? stats[0].totalExpense : 0;
    const balance = totalIncome - totalExpense;

    // 2. Recent 10 transactions
    const recentTransactions = await Transaction.find(matchStage)
      .sort({ date: -1, createdAt: -1 })
      .limit(10)
      .lean();

    res.status(200).json({
      success: true,
      data: {
        totalIncome,
        totalExpense,
        balance,
        recentTransactions
      }
    });

  } catch (error) {
    console.error("Dashboard summary error:", error);
    res.status(500).json({ success: false, message: "Failed to fetch dashboard summary" });
  }
};

// @route   GET /api/dashboard/analytics
// @desc    Get chart data (Analyst, Admin)
export const getAnalytics = async (req, res) => {
  try {
    const matchStage = {};
    if (req.query.userId) {
      matchStage.userId = req.query.userId;
    }

    // Category-wise analysis (Pie Chart)
    const categoryStats = await Transaction.aggregate([
      { $match: matchStage },
      { $group: { _id: "$category", total: { $sum: "$amount" } } }
    ]);

    // Monthly Trends (Bar Chart)
    const monthlyTrends = await Transaction.aggregate([
      { $match: matchStage },
      {
        $group: {
          _id: { $dateToString: { format: "%Y-%m", date: "$date" } },
          income: { $sum: { $cond: [{ $eq: ["$type", "income"] }, "$amount", 0] } },
          expense: { $sum: { $cond: [{ $eq: ["$type", "expense"] }, "$amount", 0] } }
        }
      },
      { $sort: { "_id": 1 } }
    ]);

    // Type distribution (Histogram/Pie)
    const typeDistribution = await Transaction.aggregate([
      { $match: matchStage },
      { $group: { _id: "$type", count: { $sum: 1 }, total: { $sum: "$amount" } } }
    ]);

    res.status(200).json({
      success: true,
      data: {
        categoryStats,
        monthlyTrends,
        typeDistribution
      }
    });

  } catch (error) {
    console.error("Analytics error:", error);
    res.status(500).json({ success: false, message: "Failed to fetch analytics" });
  }
};

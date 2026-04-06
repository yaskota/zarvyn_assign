import Transaction from "../models/transaction.model.js";
import mongoose from "mongoose";


export const getDashboardSummary = async (req, res) => {
  try {
    const { role } = req.user;
    const userId = req.user.id;
    const targetUserId = req.query.userId; 

    let matchStage = {};
    
    if (role === "viewer") {
      matchStage.userId = new mongoose.Types.ObjectId(userId);
    } else {
      if (targetUserId) {
        matchStage.userId = new mongoose.Types.ObjectId(targetUserId);
      }
    }

    
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


export const getAnalytics = async (req, res) => {
  try {
    const matchStage = {};
    if (req.query.userId) {
      matchStage.userId = new mongoose.Types.ObjectId(req.query.userId);
    }
    if (req.query.month && req.query.month !== "0" && req.query.year) {
      matchStage.$expr = {
        $and: [
          { $eq: [{ $month: "$date" }, parseInt(req.query.month)] },
          { $eq: [{ $year: "$date" }, parseInt(req.query.year)] }
        ]
      };
    } else if (req.query.year) {
      matchStage.$expr = {
        $eq: [{ $year: "$date" }, parseInt(req.query.year)]
      };
    }

    
    const categoryStats = await Transaction.aggregate([
      { $match: matchStage },
      { $group: { _id: "$category", total: { $sum: "$amount" } } }
    ]);

   
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

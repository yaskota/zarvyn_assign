import User from "../models/user.model.js";
import Transaction from "../models/transaction.model.js";

// @route   GET /api/users
// @desc    Get all users with their total balance (Analyst, Admin)
export const getAllUsers = async (req, res) => {
  try {
    const { search } = req.query;

    let filter = {};
    if (search) {
      filter = {
        $or: [
          { name: { $regex: search, $options: "i" } },
          { email: { $regex: search, $options: "i" } }
        ]
      };
    }

    const users = await User.find(filter).select("-password").lean();

    // Attach total balance, income, expense for each user
    // A bit intensive but fine for this scale, or we can use aggregation mapping
    const userIds = users.map(u => u._id);
    
    // Aggregate all transactions for these users
    const stats = await Transaction.aggregate([
      { $match: { userId: { $in: userIds } } },
      {
        $group: {
          _id: "$userId",
          income: {
            $sum: { $cond: [{ $eq: ["$type", "income"] }, "$amount", 0] }
          },
          expense: {
            $sum: { $cond: [{ $eq: ["$type", "expense"] }, "$amount", 0] }
          }
        }
      }
    ]);

    const statsMap = stats.reduce((acc, curr) => {
      acc[curr._id.toString()] = curr;
      return acc;
    }, {});

    const result = users.map(user => {
      const userStat = statsMap[user._id.toString()] || { income: 0, expense: 0 };
      const balance = userStat.income - userStat.expense;
      return {
        ...user,
        income: userStat.income,
        expense: userStat.expense,
        balance
      };
    });

    res.status(200).json({ success: true, count: result.length, users: result });
  } catch (error) {
    console.error("Get all users error:", error);
    res.status(500).json({ success: false, message: "Failed to fetch users" });
  }
};

// @route   GET /api/users/:id
// @desc    Get user details (Analyst, Admin)
export const getUserById = async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select("-password");
    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }
    res.status(200).json({ success: true, user });
  } catch (error) {
    res.status(500).json({ success: false, message: "Failed to fetch user" });
  }
};

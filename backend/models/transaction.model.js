import mongoose from "mongoose";

const transactionSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User"
  },
  amount: Number,
  type: {
    type: String,
    enum: ["income", "expense"]
  },
  category: String,
  paymentMethod: String,
  date: Date,
  notes: String
}, { timestamps: true });

export default mongoose.model("Transaction", transactionSchema);
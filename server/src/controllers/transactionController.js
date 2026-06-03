const prisma = require("../prismaClient.js");

const createTransaction = async (req, res) => {
  try {
    const { amount, type, categoryId, date, note } = req.body;
    const userId = req.user?.id;
    if (!amount || !type || !categoryId || !date) {
      return res.status(400).json({
        message:
          "Make sure you have include the mandatory field: amount, type, categoryId, date",
      });
    }
    if (type !== "income" && type !== "expense") {
      return res
        .status(400)
        .json({ message: `type can only be either 'income' or 'expense'` });
    }
    const requestCategory = await prisma.category.findUnique({
      where: { id: Number(categoryId) },
    });
    if (!requestCategory) {
      return res
        .status(400)
        .json({ message: `Category with id ${categoryId} cannot be found` });
    }
    const newTransaction = await prisma.transaction.create({
      data: {
        amount: parseFloat(amount),
        type,
        note,
        date: new Date(date),
        userId,
        categoryId,
      },
      include: {
        user: true,
        category: true,
      },
    });
    res.status(201).json({
      id: newTransaction.id,
      amount: newTransaction.amount,
      type: newTransaction.type,
      note: newTransaction.note,
      date: newTransaction.date,
      userId: newTransaction.userId,
      categoryId: newTransaction.categoryId,
      user: newTransaction.user.email,
      category: newTransaction.category.name,
    });
  } catch (error) {
    console.log(error);
    res
      .status(500)
      .json({ message: "Something went wrong in createTransaction" });
  }
};

const getTransactions = async (req, res) => {
  try {
    const userId = req.user?.id;
    const allTransactions = await prisma.transaction.findMany({
      where: {
        userId,
      },
    });
    res.status(200).json({ allTransactions });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Something went wrong in getTransaction" });
  }
};
const updateTransaction = async (req, res) => {
  try {
    const userId = req.user?.id;
    const { id } = req.params;
    if (!id) {
      return res.status(400).json({ message: "Provide transaction Id" });
    }
    const requestTransaction = await prisma.transaction.findUnique({
      where: { id: Number(id) },
    });
    if (!requestTransaction) {
      return res
        .status(400)
        .json({ message: `Transaction with id ${id} cannot be found` });
    }
    const updatedTransaction = await prisma.transaction.update({
      where: { id: Number(id), userId: Number(userId) },
      data: req.body,
    });
    res.status(200).json({ updatedTransaction });
  } catch (error) {
    console.log(error);
    res
      .status(500)
      .json({ message: "Something went wrong in udpateTransaction" });
  }
};

const deleteTransaction = async (req, res) => {
  try {
    const userId = req.user?.id;
    const { id } = req.params;
    const requestTransaction = await prisma.transaction.findUnique({
      where: { id: Number(id) },
    });
    if (!requestTransaction) {
      return res
        .status(400)
        .json({ message: `Transaction with id ${id} cannot be found` });
    }
    const deletedTransaction = await prisma.transaction.deleteMany({
      where: { id: Number(id), userId: Number(userId) },
    });
    if (deletedTransaction.count === 0) {
      return res
        .status(400)
        .json({ message: `No transaction found with Id: ${id}` });
    }
    res.status(200).json({ message: `Deleted transaction with Id: ${id}` });
  } catch (error) {
    console.log(error);
    res
      .status(500)
      .json({ message: "Something went wrong in deleteTransaction" });
  }
};

const getSummary = async (req, res) => {
  try {
    const userId = req.user?.id;
    const transactions = await prisma.transaction.findMany({
      where: {
        userId,
      },
    });
    const totalIncome = transactions
      .filter((transaction) => transaction.type === "income")
      .reduce((sum, transaction) => sum + transaction.amount, 0);
    const totalExpense = transactions
      .filter((transaction) => transaction.type === "expense")
      .reduce((sum, transaction) => sum + transaction.amount, 0);

    const balance = totalIncome - totalExpense;

    res.status(200).json({ totalIncome, totalExpense, balance });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Something went wrong in getSummary" });
  }
};

module.exports = {
  createTransaction,
  getTransactions,
  updateTransaction,
  deleteTransaction,
  getSummary,
};

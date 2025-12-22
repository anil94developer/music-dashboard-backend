const R = require("../utils/responseHelper");
const authModal = require("../models/authmodels");
const trans = require("../models/transaction");
const withdrawalModel = require("../models/withdrawalmodel");

wallet = {};

wallet.transactions = async (req, res, next) => {
  try {
    const data = req.body;
    data["userId"] = req.doc.userId;
    data["status"] = 'Pending';

    // console.log(data);
    if (!data) {
      return R(res, false, "Amount is required", "", 400);
    }
    const amount = await authModal.transaction(data);

    if (!amount) {
      return R(res, false, "Current withdrawal request is Pending, try to send next request after three month ", "", 400);
    }

    const withdrawal = await withdrawalModel.add(data);
    if (!withdrawal) {
      return R(res, false, "withdrawal not done", "", 404);
    }
    const transactions = await trans.add(data);
    if (!transactions) {
      return R(res, false, "transcation not done", "", 404);
    }

    return R(res, true, "transactions done Successfully", "", 200);
  } catch (err) {

    return R(res, false, err.message, "", 500);
  }
};

wallet.listTransactions = async (req, res, next) => {
  try {
    const userId = req.doc.userId;
    const transactions = await trans.list(userId);
    if (!transactions) {
      return R(res, false, "No transactions found", "", 404);
    }
    return R(res, true, "Transactions fetched successfully", transactions, 200);
  } catch (err) {
    // console.log(err);
    return R(res, false, err.message, "", 500);
  }
}
wallet.withdrowList = async (req, res, next) => {
  try {
    const transactions = await withdrawalModel.withdrawList();
    if (!transactions) {
      return R(res, false, "No transactions found", "", 404);
    }
    return R(res, true, "Transactions fetched successfully", transactions, 200);
  } catch (err) {
    // console.log(err);
    return R(res, false, err.message, "", 500);
  }
}

wallet.getWithdrawalbyId =async(req, res, next) => {
  try {
    const transactions = await withdrawalModel.getWithdrawalbyId(req.doc.userId);
    if (!transactions) {
      return R(res, false, "No transactions found", "", 404);
    }
    return R(res, true, "Transactions fetched successfully", transactions, 200);
  } catch (err) {
    // console.log(err);
    return R(res, false, err.message, "", 500);
  }
}


wallet.withdrawStatus = async (req, res, next) => {
  try {
    const { id, status } = req.body;
    // console.log(id, status);
    const update = await withdrawalModel.updateStatus(id, status);

    if (!update) {
      return R(res, false, "User not found", "", 404)
    }

    return R(res, true, "Status Update successfully", "", 200)

  } catch (error) {
    next(error)
  }
}

wallet.getTranscations = async (req, res, next) => {
  try {
    const transactions = await trans.getTranscations();
    if (!transactions) {
      return R(res, false, "No transactions found", "", 404);
    }
    return R(res, true, "Transactions fetched successfully", transactions, 200);
  } catch (err) {
    // console.log(err);
    return R(res, false, err.message, "", 500);
  }
}
module.exports = wallet;
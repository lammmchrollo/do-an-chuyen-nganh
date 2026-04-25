exports.processPayment = (req, res) => {
  const { orderId, amount } = req.body;

  // Simulate payment processing
  if (!orderId || !amount) {
    return res.status(400).json({ error: "Missing orderId or amount" });
  }

  res.json({
    message: "Payment successful",
    orderId,
    amount,
    status: "paid",
    paidAt: new Date(),
  });
};

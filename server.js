const express = require("express");
const cors = require("cors");
const app = express();
const PORT = 3000;

app.use(express.json());
app.use(cors());

let orders = [];
let currentId = 1;

// Create a new order
app.post("/order", (req, res) => {
    console.log("🟢 Request received at /order");
    console.log("📦 Request body:", req.body); // دي خطوة مهمة للـ debug

    const { tableNumber, order, orderType } = req.body;

    // التأكد من وجود البيانات الضرورية
    if (!tableNumber || !Array.isArray(order) || order.length === 0 || !orderType) {
        console.warn("⚠️ Missing fields in request:", { tableNumber, order, orderType });
        return res.status(400).json({ message: "Table number, order items, and order type are required." });
    }

    const newOrder = {
        id: currentId++,
        tableNumber,
        order,
        orderType,
        status: "Being Cooked",
        time: new Date().toISOString()
    };

    orders.push(newOrder);
    console.log("✅ New order added:", newOrder);

    res.status(201).json({ message: "Order received successfully!", order: newOrder });
});



// Get all orders
app.get("/orders", (req, res) => {
    res.json(orders);
});

// Update order status
app.put("/orders/:id", (req, res) => {
    const orderId = parseInt(req.params.id);
    const { status } = req.body;

    const order = orders.find(o => o.id === orderId);
    if (!order) {
        return res.status(404).json({ message: "Order not found." });
    }

    if (!status) {
        return res.status(400).json({ message: "New status is required." });
    }

    order.status = status;
    res.json({ message: "✅ Order status updated successfully", order });
});

// Delete a specific order
app.delete("/orders/:id", (req, res) => {
    const orderId = parseInt(req.params.id);
    const index = orders.findIndex(o => o.id === orderId);

    if (index === -1) {
        return res.status(404).json({ message: "Order not found." });
    }

    const deleted = orders.splice(index, 1)[0];
    res.json({ message: "🗑️ Order deleted successfully", order: deleted });
});

// Delete all orders
app.delete("/orders", (req, res) => {
    orders = [];
    res.json({ message: "All orders have been cleared successfully!" });
});

app.listen(PORT, () => console.log(`🚀 Server running on http://localhost:${PORT}`));

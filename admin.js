document.addEventListener("DOMContentLoaded", function () {
    const ordersTable = document.getElementById("ordersTable");

    function fetchOrders() {
        fetch("http://localhost:3000/orders")
            .then(response => response.json())
            .then(orders => {
                ordersTable.innerHTML = ""; // Clear table before filling

                if (!orders.length) {
                    ordersTable.innerHTML = `<tr><td colspan="5">❌ No orders available</td></tr>`;
                    return;
                }

                orders.forEach(order => {
                    const row = document.createElement("tr");

                    // Create status dropdown
                    const statusOptions = ["Being Cooked", "On The Way", "Done"];
                    const statusSelect = document.createElement("select");

                    statusOptions.forEach(status => {
                        const option = document.createElement("option");
                        option.value = status;
                        option.text = status;
                        if (order.status === status) option.selected = true;
                        statusSelect.appendChild(option);
                    });

                    statusSelect.addEventListener("change", () => {
                        fetch(`http://localhost:3000/orders/${order.id}`, {
                            method: "PUT",
                            headers: { "Content-Type": "application/json" },
                            body: JSON.stringify({ status: statusSelect.value })
                        })
                        .then(res => res.json())
                        .then(data => console.log("✅ Status updated:", data))
                        .catch(err => console.error("❌ Failed to update status:", err));
                    });

                    // Create delete button
                    const deleteBtn = document.createElement("button");
                    deleteBtn.textContent = "Delete";
                    deleteBtn.addEventListener("click", () => {
                        if (confirm("Are you sure you want to delete this order?")) {
                            fetch(`http://localhost:3000/orders/${order.id}`, {
                                method: "DELETE"
                            })
                            .then(() => {
                                fetchOrders(); // Refresh the table
                            })
                            .catch(err => console.error("❌ Failed to delete order:", err));
                        }
                    });
                    // Fill table row
                    row.innerHTML = `
                    <td>${order.tableNumber}</td>
                    <td>${order.order.map(i => `${i.item} (${i.price} EGP)`).join(", ")}</td>
                    <td>
                        ${order.orderType}
                        ${order.orderType === "Online Reservation" && order.reservationTime 
                            ? ` <span style="color: #888;">⏰ ${order.reservationTime}</span>` 
                            : ""}
                    </td>
                    <td>${order.status || "Not Set"}</td>
                    <td></td>
                `;
                
                
                
                    row.children[4].appendChild(statusSelect); // Append status dropdown
                    row.children[4].appendChild(deleteBtn);    // Append delete button

                    ordersTable.appendChild(row);
                });
            })
            .catch(error => console.error("❌ Error fetching orders:", error));
    }

    // Clear all orders
    document.getElementById("clearOrders").addEventListener("click", function () {
        if (confirm("Are you sure you want to clear all orders?")) {
            fetch("http://localhost:3000/orders", { method: "DELETE" })
                .then(response => response.json())
                .then(data => {
                    alert(data.message);
                    fetchOrders(); // Refresh the table
                })
                .catch(error => console.error("❌ Error clearing orders:", error));
        }
    });

    // Fetch orders on page load
    fetchOrders();
});

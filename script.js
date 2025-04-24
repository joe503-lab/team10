let selectedItems = JSON.parse(localStorage.getItem("selectedItems")) || [];
let chosenOrderType = null;

function showMenu() {
    document.getElementById("welcome-section").style.display = "none";
    document.getElementById("menu-section").style.display = "block";
}

function addItem(item, price) {
    selectedItems.push({ item, price });
    localStorage.setItem("selectedItems", JSON.stringify(selectedItems));

    const notification = document.getElementById("notification");

    // تحقق من وجود العنصر أولًا
    if (notification) {
        notification.textContent = `${item} was added to your order!`;
        notification.classList.add("show");

        setTimeout(() => notification.classList.remove("show"), 3000);
    } else {
        console.error("Notification element not found!");
    }
}


function showReview() {
    document.getElementById("menu-section").style.display = "none";
    document.getElementById("review-section").style.display = "block";

    let totalPrice = 0;
    const orderSummary = document.querySelector(".order-summary");
    orderSummary.innerHTML = "";

    selectedItems.forEach((item, index) => {
        totalPrice += item.price;
        orderSummary.innerHTML += `
            <div class="order-item">
                <span>${item.item} - ${item.price} EGP</span>
                <div>
                    <button class="delete-btn" onclick="removeItem(${index})">Remove</button>
                    <button class="add-btn" onclick="showMenu()">Add another item</button>
                </div>
            </div>
        `;
    });

    orderSummary.innerHTML += `<div class="total-price">Total Price: ${totalPrice} EGP</div>`;
}

function removeItem(index) {
    selectedItems.splice(index, 1);
    localStorage.setItem("selectedItems", JSON.stringify(selectedItems));
    showReview();
}

function submitOrder() {
    // 1. اجلب رقم الطاولة
    const tableNumberInput = document.getElementById("table-number");
    const tableNumber = tableNumberInput.value.trim();

    // 2. اجلب كل راديو بوتونز باسم orderType
    const orderTypeRadios = document.getElementsByName("orderType");
    let orderTypeValue;
    for (const radio of orderTypeRadios) {
        if (radio.checked) {
            orderTypeValue = radio.value;
            break;
        }
    }

    // 3. التحقق من صحة البيانات
    if (!tableNumber) {
        alert("Please enter your table number.");
        tableNumberInput.focus();
        return;
    }
    if (!orderTypeValue) {
        alert("Please select the order type.");
        return;
    }
    if (selectedItems.length === 0) {
        alert("Your order is empty!");
        return;
    }

    // 4. جهّز جسم الطلب
    const orderData = {
        tableNumber: Number(tableNumber),
        order: selectedItems,
        orderType: orderTypeValue
    };

    // 5. طباعة بيانات الطلب في الـ console للـ debugging
    console.log("🔍 Submitting Order:", orderData);

    // 6. أرسل الـ POST إلى السيرفر
    fetch("http://localhost:3000/order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(orderData)
    })
    .then(async response => {
        const payload = await response.json();
        if (!response.ok) throw new Error(payload.message);
        return payload;
    })
    .then(data => {
        alert(data.message);
        localStorage.clear();
        window.location.reload();
    })
    .catch(err => {
        console.error("❌ Submit failed:", err);
        alert(err.message || "Failed to submit the order. Please try again.");
    });
}

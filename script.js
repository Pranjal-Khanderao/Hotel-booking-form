const checkin = document.getElementById("checkin");
const checkout = document.getElementById("checkout");
const form = document.getElementById("bookingForm");
const errorMsg = document.getElementById("errorMsg");

// Prevent past dates
const today = new Date().toISOString().split("T")[0];
checkin.setAttribute("min", today);
checkout.setAttribute("min", today);

// Update checkout minimum date based on checkin
checkin.addEventListener("change", function() {
    checkout.value = "";
    checkout.setAttribute("min", checkin.value);
});

form.addEventListener("submit", function(e) {
    e.preventDefault();

    if (checkout.value <= checkin.value) {
        errorMsg.textContent = "Check-out date must be after check-in date.";
        return;
    }

    errorMsg.textContent = "";
    alert("Booking Successful!");
    form.reset();
});

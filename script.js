const form = document.getElementById("bookingForm");
const submitBtn = document.getElementById("submitBtn");
const successMsg = document.getElementById("successMsg");

const checkin = document.getElementById("checkin");
const checkout = document.getElementById("checkout");

// Prevent past dates
const today = new Date().toISOString().split("T")[0];
checkin.setAttribute("min", today);
checkout.setAttribute("min", today);

checkin.addEventListener("change", function () {
    checkout.value = "";
    checkout.setAttribute("min", checkin.value);
});

function clearErrors() {
    document.querySelectorAll(".field-error").forEach(el => el.textContent = "");
    document.querySelectorAll("input, select").forEach(el => el.classList.remove("input-error"));
    successMsg.textContent = "";
}

function setError(fieldId, message) {
    const input = document.getElementById(fieldId);
    const error = document.getElementById(fieldId + "Error");
    input.classList.add("input-error");
    error.textContent = message;
}

form.addEventListener("submit", function (e) {
    e.preventDefault();

    clearErrors();

    let hasError = false;

    const fullname = document.getElementById("fullname").value.trim();
    const email = document.getElementById("email").value.trim();
    const phone = document.getElementById("phone").value.trim();
    const room = document.getElementById("room").value;
    const guests = document.getElementById("guests").value;

    if (!fullname) {
        setError("fullname", "Full name is required.");
        hasError = true;
    }

    if (!email || !email.includes("@")) {
        setError("email", "Enter a valid email address.");
        hasError = true;
    }

    if (!phone || phone.length < 10 || isNaN(phone)) {
        setError("phone", "Enter a valid 10-digit phone number.");
        hasError = true;
    }

    if (!checkin.value) {
        setError("checkin", "Select check-in date.");
        hasError = true;
    }

    if (!checkout.value) {
        setError("checkout", "Select check-out date.");
        hasError = true;
    }

    if (checkin.value && checkout.value) {
        if (new Date(checkout.value) <= new Date(checkin.value)) {
            setError("checkout", "Check-out must be after check-in.");
            hasError = true;
        }
    }

    if (!room) {
        setError("room", "Please select a room type.");
        hasError = true;
    }

    if (!guests || guests < 1 || guests > 10) {
        setError("guests", "Guests must be between 1 and 10.");
        hasError = true;
    }

    if (hasError) return;

    // Loading state
    submitBtn.textContent = "Processing...";
    submitBtn.disabled = true;

    setTimeout(() => {
        successMsg.textContent = "Booking Successful! We will contact you soon.";
        form.reset();
        submitBtn.textContent = "Book Now";
        submitBtn.disabled = false;
    }, 1500);
});

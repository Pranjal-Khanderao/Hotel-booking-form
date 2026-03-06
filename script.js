// ─── State ───────────────────────────────────────────────────────────────────
let selectedRoom  = null;
let selectedPrice = 0;

// ─── Date Setup ──────────────────────────────────────────────────────────────
const today    = new Date().toISOString().split("T")[0];
const checkin  = document.getElementById("checkin");
const checkout = document.getElementById("checkout");

checkin.setAttribute("min", today);
checkout.setAttribute("min", today);

checkin.addEventListener("change", () => {
  checkout.value = "";
  checkout.setAttribute("min", checkin.value);
});

// ─── Room Selection ───────────────────────────────────────────────────────────
function selectRoom(radio) {
  selectedRoom  = radio.value;
  selectedPrice = parseInt(radio.dataset.price);
  document.getElementById("roomError").textContent = "";
}

// ─── Error Helpers ────────────────────────────────────────────────────────────
function clearErr(...ids) {
  ids.forEach(id => {
    const el = document.getElementById(id);
    if (el) el.classList.remove("input-error");
    const err = document.getElementById(id + "Error");
    if (err) err.textContent = "";
  });
}

function setErr(id, msg) {
  const el = document.getElementById(id);
  if (el) el.classList.add("input-error");
  const err = document.getElementById(id + "Error");
  if (err) err.textContent = msg;
  return true;
}

// ─── Validation ───────────────────────────────────────────────────────────────
function validate(step) {
  let bad = false;

  if (step === 1) {
    clearErr("fullname", "email", "phone");
    if (!document.getElementById("fullname").value.trim())
      bad = setErr("fullname", "Name is required.");
    const em = document.getElementById("email").value.trim();
    if (!em || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(em))
      bad = setErr("email", "Enter a valid email.");
    if (document.getElementById("phone").value.replace(/\D/g, "").length < 10)
      bad = setErr("phone", "Enter a valid 10-digit number.");
  }

  if (step === 2) {
    clearErr("checkin", "checkout", "guests");
    if (!selectedRoom) {
      document.getElementById("roomError").textContent = "Please select a room.";
      bad = true;
    }
    const ci = checkin.value, co = checkout.value;
    if (!ci) bad = setErr("checkin", "Select check-in date.");
    if (!co) bad = setErr("checkout", "Select check-out date.");
    if (ci && co && new Date(co) <= new Date(ci))
      bad = setErr("checkout", "Must be after check-in.");
    const g = document.getElementById("guests").value;
    if (!g || g < 1 || g > 10) bad = setErr("guests", "Between 1 and 10.");
  }

  return !bad;
}

// ─── Step Navigation ──────────────────────────────────────────────────────────
let current = 1;

function goTo(n) {
  document.querySelectorAll(".step").forEach(s => s.classList.remove("active"));
  document.getElementById("step" + n).classList.add("active");

  // Pills
  ["pill1","pill2","pill3"].forEach((id, i) => {
    const p = document.getElementById(id);
    p.classList.remove("active","done");
    if (i + 1 < n)       p.classList.add("done");
    else if (i + 1 === n) p.classList.add("active");
  });

  // Connectors
  document.querySelectorAll(".step-connector").forEach((c, i) => {
    c.classList.toggle("lit", i + 1 < n);
  });

  current = n;
}

function nextStep(from) {
  if (!validate(from)) return;
  if (from === 2) buildSummary();
  goTo(from + 1);
}

function prevStep(from) { goTo(from - 1); }

// ─── Utilities ────────────────────────────────────────────────────────────────
function fmt(d) {
  if (!d) return "—";
  return new Date(d + "T00:00:00").toLocaleDateString("en-IN", {
    day: "numeric", month: "short", year: "numeric"
  });
}

function nights() {
  const ci = checkin.value, co = checkout.value;
  if (!ci || !co) return 0;
  return Math.round((new Date(co) - new Date(ci)) / 86400000);
}

function genId() {
  return "SRN-" + Math.random().toString(36).substring(2,6).toUpperCase() + Date.now().toString().slice(-3);
}

// ─── Summary ─────────────────────────────────────────────────────────────────
function buildSummary() {
  const n = nights(), total = n * selectedPrice;
  const rows = [
    ["Guest",     document.getElementById("fullname").value.trim()],
    ["Email",     document.getElementById("email").value.trim()],
    ["Room",      selectedRoom + " Room"],
    ["Check-in",  fmt(checkin.value)],
    ["Check-out", fmt(checkout.value)],
    ["Duration",  n + " night" + (n !== 1 ? "s" : "")],
    ["Guests",    document.getElementById("guests").value],
  ];
  const req = document.getElementById("requests").value.trim();
  if (req) rows.push(["Requests", req]);

  document.getElementById("summaryBlock").innerHTML =
    rows.map(([k, v]) =>
      `<div class="s-row"><span class="k">${k}</span><span class="v">${v}</span></div>`
    ).join("") +
    `<div class="s-row total">
       <span class="k">Total Estimate</span>
       <span class="v">₹${total.toLocaleString("en-IN")}</span>
     </div>`;
}

// ─── Modal ───────────────────────────────────────────────────────────────────
function closeModal() {
  document.getElementById("modalBg").classList.remove("open");
  selectedRoom = null; selectedPrice = 0;
  document.querySelectorAll(".room-tile input").forEach(r => r.checked = false);
  goTo(1);
}

// ─── Submit ──────────────────────────────────────────────────────────────────
document.getElementById("bookingForm").addEventListener("submit", function(e) {
  e.preventDefault();
  const btn = document.getElementById("submitBtn");
  btn.querySelector("span").textContent = "Processing…";
  btn.disabled = true;

  setTimeout(() => {
    const n = nights(), total = n * selectedPrice;
    document.getElementById("bookingId").textContent = genId();
    document.getElementById("modalDetails").innerHTML = [
      ["Guest",    document.getElementById("fullname").value.trim()],
      ["Room",     selectedRoom + " Room"],
      ["Check-in", fmt(checkin.value)],
      ["Check-out",fmt(checkout.value)],
      ["Nights",   n + " night" + (n !== 1 ? "s" : "")],
      ["Total",    "₹" + total.toLocaleString("en-IN")],
    ].map(([k,v]) =>
      `<div class="md-row"><span class="k">${k}</span><span class="v">${v}</span></div>`
    ).join("");

    this.reset();
    btn.querySelector("span").textContent = "Confirm Booking";
    btn.disabled = false;
    document.getElementById("modalBg").classList.add("open");
  }, 1500);
});

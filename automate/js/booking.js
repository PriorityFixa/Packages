/* =========================================================
   MOCK AVAILABILITY DATA
   Replace with a real fetch to the booking endpoint once
   the backend calendar/availability logic exists.
========================================================= */

const AVAILABILITY = [
    {
        date: "2026-09-15",
        label: "Tue, 15 Sep",
        slots: ["9:00 AM", "11:00 AM", "2:00 PM", "4:00 PM"]
    },
    {
        date: "2026-09-16",
        label: "Wed, 16 Sep",
        slots: ["10:00 AM", "1:00 PM"]
    },
    {
        date: "2026-09-18",
        label: "Fri, 18 Sep",
        slots: ["9:00 AM", "9:30 AM", "3:00 PM"]
    }
];

let selectedSlot = null;


/* =========================
   RENDER AVAILABILITY
========================= */

function renderAvailability(targetId = "availability") {

    const container = document.getElementById(targetId);

    if (!container || typeof AVAILABILITY === "undefined") {
        return;
    }

    container.innerHTML = AVAILABILITY.map(day => `

        <div class="slot-day">
            <h3>${day.label}</h3>
            <div class="slot-row">
                ${day.slots.map(time => `
                    <button
                        type="button"
                        class="slot-btn"
                        data-date="${day.date}"
                        data-label="${day.label}"
                        data-time="${time}"
                    >${time}</button>
                `).join("")}
            </div>
        </div>

    `).join("");

    container.querySelectorAll(".slot-btn").forEach(button => {

        button.addEventListener("click", () => {

            container.querySelectorAll(".slot-btn").forEach(b => b.classList.remove("selected"));

            button.classList.add("selected");

            selectedSlot = {
                date: button.dataset.date,
                label: button.dataset.label,
                time: button.dataset.time
            };

            document.getElementById("booking-form-wrapper").hidden = false;

            document.getElementById("selected-slot-summary").textContent =
                `${selectedSlot.label} at ${selectedSlot.time}`;
        });
    });
}


/* =========================
   HANDLE BOOKING SUBMIT
========================= */

function initializeBookingForm() {

    const form = document.getElementById("booking-form");

    if (!form) {
        return;
    }

    form.addEventListener("submit", (event) => {

        event.preventDefault();

        if (!selectedSlot) {
            alert("Please choose a time slot first.");
            return;
        }

        // In production: POST to the booking endpoint, which creates the
        // appointment, marks the slot unavailable, and queues the
        // confirmation + reminder workflow (see Workflow settings below).
        document.getElementById("booking-confirmation").hidden = false;
        document.getElementById("booking-confirmation").scrollIntoView({ behavior: "smooth" });

        form.hidden = true;
    });
}


document.addEventListener("DOMContentLoaded", () => {

    if (document.getElementById("availability")) {
        renderAvailability("availability");
    }

    initializeBookingForm();
});

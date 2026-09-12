/* =========================================================
   MOCK EVENTS DATA
   Replace this with a fetch to the real API once it exists.
========================================================= */

const EVENTS = [

    {
        id: "evt-leadership-summit",
        title: "Leadership Summit 2026",
        description: "A half-day summit on leading through change, with panel discussions and a live Q&A.",
        date: "2026-10-14",
        time: "9:00 AM – 1:00 PM",
        venueName: "Sarit Centre, Nairobi",
        lat: -1.2606,
        lng: 36.8066,
        isOnline: false,
        price: 3500,
        image: "https://picsum.photos/seed/summit/600/400"
    },

    {
        id: "evt-voice-workshop",
        title: "Finding Your Voice — Speaking Workshop",
        description: "A practical evening workshop on public speaking fundamentals for first-time speakers.",
        date: "2026-11-02",
        time: "6:00 PM – 8:30 PM",
        venueName: "Online (Zoom)",
        lat: null,
        lng: null,
        isOnline: true,
        price: 0,
        image: "https://picsum.photos/seed/workshop/600/400"
    },

    {
        id: "evt-team-retreat",
        title: "Team Offsite: Building Trust",
        description: "A guided full-day retreat for leadership teams looking to reset and realign.",
        date: "2026-12-05",
        time: "8:30 AM – 4:00 PM",
        venueName: "Lake Naivasha Resort",
        lat: -0.7167,
        lng: 36.4333,
        isOnline: false,
        price: 12000,
        image: "https://picsum.photos/seed/retreat/600/400"
    }

];


/* =========================
   HELPERS
========================= */

function formatEventDate(dateStr) {

    const date = new Date(dateStr + "T00:00:00");

    return date.toLocaleDateString("en-KE", {
        day: "numeric",
        month: "short",
        year: "numeric"
    });
}

function getEventFromQuery() {

    const params = new URLSearchParams(window.location.search);

    const id = params.get("id");

    return EVENTS.find(event => event.id === id) || EVENTS[0];
}


/* =========================
   RENDER EVENT LIST
========================= */

function renderEventList(targetId = "events-list", limit = null) {

    const container = document.getElementById(targetId);

    if (!container || typeof EVENTS === "undefined") {
        return;
    }

    const upcoming = [...EVENTS].sort(
        (a, b) => new Date(a.date) - new Date(b.date)
    );

    const list = limit ? upcoming.slice(0, limit) : upcoming;

    container.innerHTML = list.map(event => `

        <article class="event-card">

            <img
                src="${event.image}"
                alt="${event.title}"
                class="event-image"
                loading="lazy"
            >

            <div class="event-body">

                <span class="event-date-badge">
                    ${formatEventDate(event.date)}
                </span>

                <h3>
                    <a href="event-detail.html?id=${event.id}">
                        ${event.title}
                    </a>
                </h3>

                <p class="event-venue">${event.venueName}</p>

                <div class="event-footer">

                    <span class="event-price">
                        ${event.price > 0 ? formatPrice(event.price) : "Free"}
                    </span>

                    <a class="btn btn-secondary" href="event-detail.html?id=${event.id}">
                        View details
                    </a>

                </div>

            </div>

        </article>

    `).join("");
}


/* =========================
   RENDER CALENDAR
========================= */

function renderEventCalendar(targetId = "events-calendar") {

    const container = document.getElementById(targetId);

    if (!container || typeof EVENTS === "undefined") {
        return;
    }

    const now = new Date();

    const year = now.getFullYear();
    const month = now.getMonth();

    const firstDay = new Date(year, month, 1);

    const startWeekday = firstDay.getDay();

    const daysInMonth = new Date(year, month + 1, 0).getDate();

    const eventDays = new Set(

        EVENTS
            .filter(event => {

                const eventDate = new Date(event.date + "T00:00:00");

                return eventDate.getFullYear() === year &&
                    eventDate.getMonth() === month;
            })
            .map(event => new Date(event.date + "T00:00:00").getDate())
    );

    const monthLabel = firstDay.toLocaleDateString("en-KE", {
        month: "long",
        year: "numeric"
    });

    let cells = "";

    for (let i = 0; i < startWeekday; i++) {
        cells += `<div class="calendar-cell calendar-cell-empty"></div>`;
    }

    for (let day = 1; day <= daysInMonth; day++) {

        const hasEvent = eventDays.has(day);

        cells += `
            <div class="calendar-cell${hasEvent ? " calendar-cell-event" : ""}">
                ${day}
                ${hasEvent ? '<span class="calendar-dot"></span>' : ""}
            </div>
        `;
    }

    container.innerHTML = `

        <div class="calendar-header">${monthLabel}</div>

        <div class="calendar-weekdays">
            <span>Sun</span><span>Mon</span><span>Tue</span>
            <span>Wed</span><span>Thu</span><span>Fri</span><span>Sat</span>
        </div>

        <div class="calendar-grid">${cells}</div>

    `;
}


/* =========================
   RENDER EVENT DETAIL
========================= */

function renderEventDetail() {

    const container = document.getElementById("event-detail");

    if (!container) {
        return;
    }

    const event = getEventFromQuery();

    if (typeof BUSINESS_CONFIG !== "undefined") {
        document.title = `${event.title} | ${BUSINESS_CONFIG.name}`;
    }

    const mapEmbed = (event.lat && event.lng)
        ? `
            <iframe
                class="event-map"
                loading="lazy"
                title="Venue map"
                src="https://www.openstreetmap.org/export/embed.html?bbox=${event.lng - 0.01}%2C${event.lat - 0.01}%2C${event.lng + 0.01}%2C${event.lat + 0.01}&marker=${event.lat}%2C${event.lng}"
            ></iframe>
        `
        : `
            <div class="event-online-note">
                This is an online event. The join link will be sent after registration.
            </div>
        `;

    container.innerHTML = `

        <img src="${event.image}" alt="${event.title}" class="event-detail-image">

        <span class="event-date-badge">
            ${formatEventDate(event.date)} · ${event.time}
        </span>

        <h1>${event.title}</h1>

        <p class="event-venue">${event.venueName}</p>

        <p>${event.description}</p>

        ${mapEmbed}

        <form class="event-register-form" id="event-register-form">

            <div class="form-group">
                <label for="reg-name">Full name</label>
                <input type="text" id="reg-name" required>
            </div>

            <div class="form-group">
                <label for="reg-phone">Phone number</label>
                <input type="tel" id="reg-phone" placeholder="07XXXXXXXX" required>
            </div>

            <div class="form-group">
                <label for="reg-email">Email address</label>
                <input type="email" id="reg-email">
            </div>

            <button type="submit" class="btn add-to-cart">
                ${event.price > 0 ? `Reserve seat — ${formatPrice(event.price)}` : "Reserve your free seat"}
            </button>

        </form>

    `;

    document.getElementById("event-register-form").addEventListener("submit", (submitEvent) => {

        submitEvent.preventDefault();

        // Registration capture: the seat becomes a cart line item so it
        // flows through the same order + M-Pesa checkout as products.
        addToCart({
            id: event.id,
            name: `Event seat — ${event.title}`,
            price: event.price,
            image: event.image
        }, 1);

        if (event.price > 0) {

            // Paid event: send them to checkout to complete payment.
            window.location.href = "checkout.html";

        } else {

            // Free event: registration is the whole transaction, so this
            // is where the "automated confirmation" message fires —
            // in production, trigger an SMS/email/WhatsApp send here.
            document.getElementById("event-detail").insertAdjacentHTML(
                "beforeend",
                `<div class="payment-status success" style="margin-top:1.5rem;">
                    <div class="payment-status-content">
                        <h3>✓ You're registered</h3>
                        <p>A confirmation has been sent to your phone and email.</p>
                    </div>
                </div>`
            );
        }
    });
}


/* =========================
   INITIALIZE
========================= */

document.addEventListener("DOMContentLoaded", () => {

    if (document.getElementById("events-list")) {
        renderEventList("events-list");
    }

    if (document.getElementById("featured-events-list")) {
        renderEventList("featured-events-list", 2);
    }

    if (document.getElementById("events-calendar")) {
        renderEventCalendar("events-calendar");
    }

    if (document.getElementById("event-detail")) {
        renderEventDetail();
    }
});

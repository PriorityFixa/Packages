/* =========================================================
   MOCK DASHBOARD DATA
   Replace with real reads from the orders/payments/bookings
   tables once the backend exists.
========================================================= */

const DASHBOARD_STATS = [
    { label: "Revenue this month", value: "KES 186,400" },
    { label: "Orders & registrations", value: "37" },
    { label: "Upcoming bookings", value: "9" },
    { label: "Open enquiries", value: "4" }
];

const RECENT_ACTIVITY = [
    { name: "Grace Mwangi", type: "Event seat — Leadership Summit 2026", amount: "KES 3,500", status: "paid" },
    { name: "Peter Otieno", type: "1:1 coaching session (60 min)", amount: "KES 4,500", status: "paid" },
    { name: "Achieng Odhiambo", type: "Booking — 18 Sep, 9:00 AM", amount: "—", status: "pending" },
    { name: "John Kiptoo", type: "Leadership masterclass (video course)", amount: "KES 6,000", status: "failed" },
    { name: "Wanjiku Ndegwa", type: "Team workshop (half-day)", amount: "KES 45,000", status: "paid" }
];

const WORKFLOWS = [
    {
        id: "wf-confirmation",
        title: "Instant confirmation",
        description: "Sent immediately after a successful payment or free registration.",
        channel: "WhatsApp + Email",
        enabled: true
    },
    {
        id: "wf-reminder",
        title: "Event/session reminder",
        description: "Sent 24 hours before a booked session or registered event.",
        channel: "SMS + WhatsApp",
        enabled: true
    },
    {
        id: "wf-followup",
        title: "Post-event follow-up",
        description: "Sent the day after an event, with a feedback link.",
        channel: "Email",
        enabled: false
    },
    {
        id: "wf-abandoned",
        title: "Abandoned cart nudge",
        description: "Sent if a cart is left for more than 2 hours without checkout.",
        channel: "WhatsApp",
        enabled: false
    }
];


/* =========================
   RENDER STAT CARDS
========================= */

function renderDashboardStats(targetId = "dashboard-stats") {

    const container = document.getElementById(targetId);

    if (!container) {
        return;
    }

    container.innerHTML = DASHBOARD_STATS.map(stat => `
        <div class="stat-card">
            <span>${stat.label}</span>
            <strong>${stat.value}</strong>
        </div>
    `).join("");
}


/* =========================
   RENDER ACTIVITY TABLE
========================= */

function renderRecentActivity(targetId = "dashboard-activity") {

    const container = document.getElementById(targetId);

    if (!container) {
        return;
    }

    const rows = RECENT_ACTIVITY.map(item => `
        <tr>
            <td>${item.name}</td>
            <td>${item.type}</td>
            <td>${item.amount}</td>
            <td><span class="status-pill ${item.status}">${item.status}</span></td>
        </tr>
    `).join("");

    container.innerHTML = `
        <table class="dashboard-table">
            <thead>
                <tr>
                    <th>Customer</th>
                    <th>Item</th>
                    <th>Amount</th>
                    <th>Status</th>
                </tr>
            </thead>
            <tbody>${rows}</tbody>
        </table>
    `;
}


/* =========================
   RENDER WORKFLOW TOGGLES
========================= */

function renderWorkflows(targetId = "dashboard-workflows") {

    const container = document.getElementById(targetId);

    if (!container) {
        return;
    }

    container.innerHTML = WORKFLOWS.map(workflow => `
        <div class="workflow-row">
            <div>
                <strong>${workflow.title}</strong>
                <p>${workflow.description} · ${workflow.channel}</p>
            </div>
            <label class="switch">
                <input type="checkbox" ${workflow.enabled ? "checked" : ""} data-workflow="${workflow.id}">
                <span class="switch-track"></span>
            </label>
        </div>
    `).join("");

    container.querySelectorAll('input[type="checkbox"]').forEach(input => {
        input.addEventListener("change", () => {
            // In production: PATCH /workflows/{id} to enable/disable the
            // scheduled job that actually sends the SMS/WhatsApp/email.
            console.log(`Workflow ${input.dataset.workflow} set to`, input.checked);
        });
    });
}


document.addEventListener("DOMContentLoaded", () => {

    renderDashboardStats();
    renderRecentActivity();
    renderWorkflows();
});

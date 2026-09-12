/* =========================================================
   DASHBOARD — LIVE ORDERS
   =========================================================
   Pulls real orders from the Worker API (GET /orders) instead
   of mock data. Bookings and enquiries have no backend yet, so
   those two stat cards stay as "—" until those exist.
   ========================================================= */

const API_URL =
    "https://priorityfixa-income-api.priorityfixa.workers.dev";


/* =========================
   WORKFLOW TOGGLES (still mock —
   no backend exists for these yet)
========================= */

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
   FETCH ORDERS
========================= */

async function fetchOrders() {

    const response = await fetch(`${API_URL}/orders`, {
        method: "GET",
        cache: "no-store"
    });

    const result = await response.json();

    if (!response.ok || !result.success) {
        throw new Error(result.error || "Could not load orders.");
    }

    return result.orders || [];
}


/* =========================
   STATUS HELPERS
========================= */

function orderStatusPill(order) {

    if (order.paymentStatus === "PAID") {
        return "paid";
    }

    if (order.paymentStatus === "FAILED") {
        return "failed";
    }

    return "pending";
}

function isThisMonth(isoDate) {

    const d = new Date(isoDate);
    const now = new Date();

    return (
        d.getFullYear() === now.getFullYear() &&
        d.getMonth() === now.getMonth()
    );
}

function describeItems(items) {

    if (!Array.isArray(items) || items.length === 0) {
        return "—";
    }

    if (items.length === 1) {
        return items[0].name;
    }

    return `${items[0].name} +${items.length - 1} more`;
}


/* =========================
   RENDER STAT CARDS
========================= */

function renderDashboardStats(orders, targetId = "dashboard-stats") {

    const container = document.getElementById(targetId);

    if (!container) {
        return;
    }

    const paidThisMonth = orders.filter(
        o => o.paymentStatus === "PAID" && isThisMonth(o.createdAt)
    );

    const revenueThisMonth = paidThisMonth.reduce(
        (sum, o) => sum + Number(o.total || 0),
        0
    );

    const stats = [
        {
            label: "Revenue this month",
            value: formatPrice(revenueThisMonth)
        },
        {
            label: "Orders & registrations",
            value: String(orders.length)
        },
        {
            label: "Upcoming bookings",
            value: "—"
        },
        {
            label: "Open enquiries",
            value: "—"
        }
    ];

    container.innerHTML = stats.map(stat => `
        <div class="stat-card">
            <span>${stat.label}</span>
            <strong>${stat.value}</strong>
        </div>
    `).join("");
}


/* =========================
   RENDER ACTIVITY TABLE
========================= */

function renderRecentActivity(orders, targetId = "dashboard-activity") {

    const container = document.getElementById(targetId);

    if (!container) {
        return;
    }

    if (orders.length === 0) {

        container.innerHTML = `
            <p class="dashboard-empty">No orders yet.</p>
        `;

        return;
    }

    const recent = orders.slice(0, 15);

    const rows = recent.map(order => {

        const status = orderStatusPill(order);

        const amount =
            status === "paid"
                ? formatPrice(order.total)
                : (status === "pending" ? formatPrice(order.total) : "—");

        return `
            <tr>
                <td>${order.customer?.name || "—"}</td>
                <td>${describeItems(order.items)}</td>
                <td>${amount}</td>
                <td><span class="status-pill ${status}">${status}</span></td>
            </tr>
        `;

    }).join("");

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


/* =========================
   INITIALIZE
========================= */

async function initializeDashboard() {

    renderWorkflows();

    const statsContainer = document.getElementById("dashboard-stats");
    const activityContainer = document.getElementById("dashboard-activity");

    try {

        const orders = await fetchOrders();

        renderDashboardStats(orders);
        renderRecentActivity(orders);

    } catch (error) {

        console.error("DASHBOARD_LOAD_ERROR", error);

        if (activityContainer) {

            activityContainer.innerHTML = `
                <p class="dashboard-empty">
                    Could not load orders: ${error.message}
                </p>
            `;
        }

        if (statsContainer) {

            statsContainer.innerHTML = "";
        }
    }
}


document.addEventListener("DOMContentLoaded", initializeDashboard);

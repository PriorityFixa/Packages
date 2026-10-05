/* =========================================================
   DASHBOARD — now behind admin auth, pulling real data
   from the Worker instead of mock arrays.
========================================================= */


/* =========================
   WORKFLOWS (still local config — not order data, so no
   backend call needed for these toggles yet)
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
   RENDER STAT CARDS (real data)
========================= */

function renderDashboardStats(stats) {
    const container = document.getElementById("dashboard-stats");
    if (!container) return;

    const cards = [
        { label: "Revenue (paid orders)", value: formatPrice(stats.totalRevenue) },
        { label: "Total orders", value: stats.totalOrders },
        { label: "Paid", value: stats.paidCount },
        { label: "Pending payment", value: stats.pendingCount }
    ];

    container.innerHTML = cards.map(stat => `
        <div class="stat-card">
            <span>${stat.label}</span>
            <strong>${stat.value}</strong>
        </div>
    `).join("");
}

function formatPrice(amount) {
    return `KES ${Number(amount || 0).toLocaleString()}`;
}


/* =========================
   RENDER ACTIVITY TABLE (real data)
========================= */

function renderRecentActivity(orders) {
    const container = document.getElementById("dashboard-activity");
    if (!container) return;

    if (orders.length === 0) {
        container.innerHTML = `<p style="color:var(--text-muted);">No orders yet.</p>`;
        return;
    }

    const statusClass = {
        PAID: "paid",
        PENDING: "pending",
        FAILED: "failed",
        UNPAID: "pending"
    };

    const rows = orders.slice(0, 10).map(order => {
        const itemSummary = (order.items || []).map(i => i.name).join(", ") || "—";
        const status = order.paymentStatus || "UNPAID";

        return `
            <tr>
                <td>${order.customer?.name || "—"}</td>
                <td>${itemSummary}</td>
                <td>${formatPrice(order.total)}</td>
                <td><span class="status-pill ${statusClass[status] || "pending"}">${status}</span></td>
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

function renderWorkflows() {
    const container = document.getElementById("dashboard-workflows");
    if (!container) return;

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
            console.log(`Workflow ${input.dataset.workflow} set to`, input.checked);
        });
    });
}


/* =========================
   LOAD REAL DATA
========================= */

async function loadDashboardData() {
    const container = document.getElementById("dashboard-stats");

    try {
        const [statsRes, ordersRes] = await Promise.all([
            authFetch("/admin/stats"),
            authFetch("/admin/orders")
        ]);

        const statsData = await statsRes.json();
        const ordersData = await ordersRes.json();

        if (!statsData.success) throw new Error(statsData.error || "Could not load stats.");
        if (!ordersData.success) throw new Error(ordersData.error || "Could not load orders.");

        renderDashboardStats(statsData.stats);
        renderRecentActivity(ordersData.orders);

    } catch (error) {
        console.error("Dashboard load error:", error);

        if (container) {
            container.innerHTML = `
                <p style="color: var(--danger);">
                    Could not load dashboard data: ${error.message}
                </p>
            `;
        }
    }
}


/* =========================
   INITIALIZE — gated by auth
========================= */

document.addEventListener("DOMContentLoaded", async () => {
    const isAuthed = await requireAdminAuth();
    if (!isAuthed) return; // requireAdminAuth already redirected to login

    renderWorkflows();
    loadDashboardData();
});

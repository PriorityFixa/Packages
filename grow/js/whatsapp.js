/* =========================================================
   PRIORITYFIXA COMMERCE — WHATSAPP
   =========================================================
   Single source of truth for the WhatsApp number, shared by
   every page (index, catalogue, cart, checkout, event-detail).

   Change the number in ONE place below and every wa.me link
   on every page updates automatically — no more hunting
   through each HTML file.
   ========================================================= */

const WHATSAPP_NUMBER = '254739685458';


/* =========================
   WIRE UP ALL WA.ME LINKS
   (nav "WhatsApp" button + the floating bubble, on whichever
   pages have them — selected by href prefix, not by class, so
   this never accidentally touches "Add to cart" buttons that
   happen to share a class name)
========================= */

function wireWhatsAppLinks() {

    document.querySelectorAll('a[href^="https://wa.me/"]').forEach(function (link) {

        link.href = `https://wa.me/${WHATSAPP_NUMBER}`;
    });
}


/* =========================
   HELPER
========================= */

function getFieldValue(id) {

    const el = document.getElementById(id);

    return el ? el.value.trim() : '';
}


/* =========================
   ENQUIRY FORM -> WHATSAPP
   (only present on index.html, but this checks for it so the
   same shared script can safely run on every page)
========================= */

function wireEnquiryForm() {

    const form = document.getElementById('enquiry-form');

    if (!form) {
        return;
    }

    form.addEventListener('submit', function (event) {

        event.preventDefault();

        const name = getFieldValue('enquiry-name');
        const phone = getFieldValue('enquiry-phone');
        const email = getFieldValue('enquiry-email');
        const message = getFieldValue('enquiry-message');

        let text = `Hi, my name is ${name} (${phone}).`;

        if (email) {
            text += `\nEmail: ${email}`;
        }

        text += `\n${message}`;

        window.open(
            `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(text)}`,
            '_blank'
        );

        form.reset();
    });
}


/* =========================
   INITIALIZE
========================= */

document.addEventListener('DOMContentLoaded', function () {

    wireWhatsAppLinks();
    wireEnquiryForm();
});
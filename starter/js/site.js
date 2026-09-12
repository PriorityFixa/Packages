/* =========================================================
   SITE-WIDE BEHAVIOR
========================================================= */

function loadSiteBusinessInfo() {

    if (typeof BUSINESS_CONFIG === "undefined") {
        console.error("BUSINESS_CONFIG is not loaded.");
        return;
    }

    const businessName = document.getElementById("business-name");

    const footerBusinessName = document.getElementById("footer-business-name");

    if (businessName) {
        businessName.textContent = BUSINESS_CONFIG.name;
    }

    if (footerBusinessName) {
        footerBusinessName.textContent = BUSINESS_CONFIG.name;
    }
}


document.addEventListener("DOMContentLoaded", loadSiteBusinessInfo);

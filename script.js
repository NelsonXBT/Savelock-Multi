// ====================
// Scroll Arrow for Vaults
// ====================
const scrollArrow = document.getElementById("scrollArrow");
const scrollContainer = document.getElementById("vaultScroll");

function checkScrollArrowVisibility() {
  const cardCount = scrollContainer?.querySelectorAll(".vault-card").length || 0;

  if (window.innerWidth < 768 && cardCount > 1) {
    scrollArrow.style.display = "block";
  } else if (window.innerWidth >= 768 && cardCount > 3) {
    scrollArrow.style.display = "block";
  } else {
    scrollArrow.style.display = "none";
  }
}

scrollArrow?.addEventListener("click", () => {
  scrollContainer.scrollBy({ left: 300, behavior: "smooth" });
});

window.addEventListener("load", checkScrollArrowVisibility);
window.addEventListener("resize", checkScrollArrowVisibility);

// ====================
// Expand / Collapse Tables (Both Main + Vault History)
// ====================
document.addEventListener("DOMContentLoaded", () => {
  // MAIN DASHBOARD TABLE
  const rowsMain = document.querySelectorAll(".history-row");
  const viewBtnMain = document.querySelector(".history-view-btn");
  const maxMain = 5;

  if (rowsMain.length && viewBtnMain) {
    rowsMain.forEach((row, index) => {
      if (index >= maxMain) row.style.display = "none";
    });

    viewBtnMain.addEventListener("click", () => {
      const isCollapsed = viewBtnMain.dataset.expanded !== "true";

      rowsMain.forEach((row, index) => {
        row.style.display = isCollapsed ? "table-row" : index < maxMain ? "table-row" : "none";
      });

      viewBtnMain.textContent = isCollapsed ? "View Less" : "View All";
      viewBtnMain.dataset.expanded = isCollapsed;
    });
  }

  // VAULT PAGE TABLE
  const rowsVault = document.querySelectorAll(".vault-history-row");
  const viewBtnVault = document.querySelector(".vault-history-view-btn");
  const maxVault = 5;

  if (rowsVault.length && viewBtnVault) {
    rowsVault.forEach((row, index) => {
      if (index >= maxVault) row.style.display = "none";
    });

    viewBtnVault.addEventListener("click", () => {
      const isCollapsed = viewBtnVault.dataset.expanded !== "true";

      rowsVault.forEach((row, index) => {
        row.style.display = isCollapsed ? "table-row" : index < maxVault ? "table-row" : "none";
      });

      viewBtnVault.textContent = isCollapsed ? "View Less" : "View All";
      viewBtnVault.dataset.expanded = isCollapsed;
    });
  }
});

// ====================
// Scroll Arrow for Vaults
// ====================
const scrollArrow = document.getElementById("scrollArrow");
const scrollContainer = document.getElementById("vaultScroll");

function checkScrollArrowVisibility() {
  const cardCount = scrollContainer.querySelectorAll(".vault-card").length;

  if (window.innerWidth < 768 && cardCount > 1) {
    scrollArrow.style.display = "block";
  } else if (window.innerWidth >= 768 && cardCount > 3) {
    scrollArrow.style.display = "block";
  } else {
    scrollArrow.style.display = "none";
  }
}

scrollArrow.addEventListener("click", () => {
  scrollContainer.scrollBy({ left: 300, behavior: "smooth" });
});

window.addEventListener("load", checkScrollArrowVisibility);
window.addEventListener("resize", checkScrollArrowVisibility);

// ====================
// History Table Expand Logic
// ====================
document.addEventListener("DOMContentLoaded", () => {
  const rows = document.querySelectorAll(".history-row");
  const viewBtn = document.querySelector(".history-view-btn");
  const maxVisible = 5;

  if (!rows || !viewBtn) return;

  // Hide rows beyond the first 5
  rows.forEach((row, index) => {
    if (index >= maxVisible) {
      row.style.display = "none";
    }
  });

  viewBtn.addEventListener("click", () => {
    const isCollapsed = viewBtn.dataset.expanded !== "true";

    rows.forEach((row, index) => {
      if (isCollapsed) {
        row.style.display = "table-row";
      } else {
        if (index >= maxVisible) {
          row.style.display = "none";
        }
      }
    });

    viewBtn.textContent = isCollapsed ? "View Less" : "View All";
    viewBtn.dataset.expanded = isCollapsed;
  });

  // ====================
  // OPTIONAL: Simulate dynamic rows (uncomment and replace with contract fetch later)
  // ====================
  /*
  const tbody = document.querySelector(".history-table tbody");

  const txs = [
    { type: "Deposit", amount: 0.4, date: "2025-07-18", hash: "0xabc1234567abcdef" },
    { type: "Withdraw", amount: 0.2, date: "2025-07-15", hash: "0xdef9876543cdefab" }
  ];

  txs.forEach(tx => {
    const row = document.createElement("tr");
    row.classList.add("history-row");

    row.innerHTML = `
      <td>${tx.type}</td>
      <td>${tx.amount} ETH</td>
      <td>${tx.date}</td>
      <td><a href="https://etherscan.io/tx/${tx.hash}" target="_blank">${tx.hash.slice(0, 6)}...${tx.hash.slice(-4)}</a></td>
    `;

    tbody.appendChild(row);
  });

  // Rerun visibility logic for new rows
  checkScrollArrowVisibility();
  */
});

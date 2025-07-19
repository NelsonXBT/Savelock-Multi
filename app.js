// === Savelock App.js ===

let provider, signer, contract, userAddress;

// === Config ===
const contractAddress = "0x318cAD266a35692f49d0e7B4E31C799c2cfc9Bb4";
const rpcUrl = "https://sepolia-rollup.arbitrum.io/rpc";
const chainId = 421614;

// === ABI ===
const abi = [
  { "inputs": [], "stateMutability": "nonpayable", "type": "constructor" },
  { "inputs": [{"internalType": "uint256", "name": "_lockDuration", "type": "uint256"}], "name": "deposit", "outputs": [], "stateMutability": "payable", "type": "function" },
  { "inputs": [{"internalType": "uint256", "name": "_lockDuration", "type": "uint256"}], "name": "claim", "outputs": [], "stateMutability": "nonpayable", "type": "function" },
  { "inputs": [{"internalType": "address", "name": "user", "type": "address"}], "name": "getUserVaultDurations", "outputs": [{"internalType": "uint256[]", "name": "", "type": "uint256[]"}], "stateMutability": "view", "type": "function" },
  { "inputs": [{"internalType": "address", "name": "user", "type": "address"}, {"internalType": "uint256", "name": "lockDuration", "type": "uint256"}], "name": "getVault", "outputs": [
    {"internalType": "uint256", "name": "totalAmount", "type": "uint256"},
    {"internalType": "uint256", "name": "unlockTime", "type": "uint256"},
    {"internalType": "uint256", "name": "depositCount", "type": "uint256"},
    {"internalType": "bool", "name": "claimed", "type": "bool"}
  ], "stateMutability": "view", "type": "function" },
  { "inputs": [{"internalType": "address", "name": "user", "type": "address"}, {"internalType": "uint256", "name": "lockDuration", "type": "uint256"}], "name": "getVaultRemainingTime", "outputs": [{"internalType": "uint256", "name": "secondsRemaining", "type": "uint256"}], "stateMutability": "view", "type": "function" },
  { "inputs": [{"internalType": "address", "name": "user", "type": "address"}, {"internalType": "uint256", "name": "lockDuration", "type": "uint256"}], "name": "getDepositHistory", "outputs": [{"components": [
    {"internalType": "uint256", "name": "amount", "type": "uint256"},
    {"internalType": "uint256", "name": "timestamp", "type": "uint256"}
  ], "internalType": "struct TimeLockVault.Deposit[]", "name": "", "type": "tuple[]"}], "stateMutability": "view", "type": "function" }
];

function showSection(id) {
  const sections = ["walletConnect", "savingPlan", "savingsPlanForm", "depositForm", "VaultPage", "dashboard"];
  sections.forEach(tag => {
    const el = document.querySelector(`#${tag}`);
    if (el) el.style.display = tag === id ? "block" : "none";
  });
}

function formatEth(wei) {
  return parseFloat(ethers.utils.formatEther(wei)).toFixed(4);
}

function formatCountdown(seconds) {
  const d = Math.floor(seconds / 86400);
  const h = Math.floor((seconds % 86400) / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = seconds % 60;
  return `${d}d ${h}h ${m}m ${s}s`;
}

async function initAppFlow() {
  showSection("savingPlan");
}

document.querySelector(".connect-wallet-btn")?.addEventListener("click", async () => {
  try {
    provider = new ethers.providers.Web3Provider(window.ethereum);
    const network = await provider.getNetwork();

    if (network.chainId !== chainId) {
      await window.ethereum.request({
        method: "wallet_switchEthereumChain",
        params: [{ chainId: "0x" + chainId.toString(16) }]
      });
    }

    await window.ethereum.request({ method: "eth_requestAccounts" });
    signer = provider.getSigner();
    userAddress = await signer.getAddress();
    contract = new ethers.Contract(contractAddress, abi, signer);

    await initAppFlow();
  } catch (err) {
    console.error("❌ Wallet connection error:", err);
    alert(`Wallet connection failed: ${err.message || err}`);
  }
});

document.querySelectorAll(".plan-btn").forEach((btn, i) => {
  const titles = ["trading-capital", "investment-capital", "normal-savings"];
  btn.addEventListener("click", () => {
    localStorage.setItem("selectedPlan", titles[i]);
    showSection("savingsPlanForm");
  });
});

document.getElementById("startSavingBtn")?.addEventListener("click", async () => {
  const amount = document.getElementById("initialAmount").value;
  const durationDays = document.getElementById("lockupPeriod").value;
  const duration = parseInt(durationDays) * 24 * 60 * 60;

  if (!amount || !duration) return alert("Fill all fields correctly");

  try {
    const tx = await contract.deposit(duration, {
      value: ethers.utils.parseEther(amount)
    });
    await tx.wait();

    const vaultName = localStorage.getItem("selectedPlan") || "vault";
    showSection("VaultPage");
    await loadVault(vaultName);
  } catch (err) {
    console.error(err);
    alert("Deposit failed");
  }
});

async function loadVault(vaultName) {
  const vaultMap = {
    "trading-capital": 30 * 24 * 60 * 60,
    "investment-capital": 90 * 24 * 60 * 60,
    "normal-savings": 180 * 24 * 60 * 60,
    "1yr-goal": 365 * 24 * 60 * 60,
    "6h-test": 6 * 60 * 60
  };
  const duration = vaultMap[vaultName];
  if (!duration) return alert("Invalid vault");

  const vaultTitle = document.getElementById("vaultTitle");
  const vaultBalance = document.getElementById("vaultBalance");
  const vaultCountdown = document.getElementById("vaultCountdown");
  const startDate = document.getElementById("startDate");
  const withdrawalDate = document.getElementById("withdrawalDate");
  const vaultHistoryBody = document.getElementById("vaultHistoryBody");

  try {
    const [vault, secondsRemaining, history] = await Promise.all([
      contract.getVault(userAddress, duration),
      contract.getVaultRemainingTime(userAddress, duration),
      contract.getDepositHistory(userAddress, duration)
    ]);

    vaultTitle.textContent = vaultName.replace(/-/g, ' ') + " Savings";
    vaultBalance.textContent = formatEth(vault.totalAmount) + " ETH";
    vaultCountdown.textContent = secondsRemaining > 0 ? formatCountdown(secondsRemaining) : "Unlocked!";
    withdrawalDate.textContent = vault.unlockTime ? new Date(vault.unlockTime * 1000).toLocaleString() : "-";
    startDate.textContent = history.length > 0 ? new Date(history[0].timestamp * 1000).toLocaleString() : "-";
    vaultHistoryBody.innerHTML = history.map(h => `
      <tr>
        <td>Deposit</td>
        <td>${formatEth(h.amount)} ETH</td>
        <td>${new Date(h.timestamp * 1000).toLocaleString()}</td>
        <td>-</td>
      </tr>
    `).join("");
  } catch (err) {
    console.error("Failed to load vault:", err);
  }
}
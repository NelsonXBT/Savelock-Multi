document.addEventListener("DOMContentLoaded", () => {
  // 🔗 Contract Configuration
  const contractAddress = "0x318cAD266a35692f49d0e7B4E31C799c2cfc9Bb4";
  const rpcUrl = "https://sepolia-rollup.arbitrum.io/rpc";
  const chainId = 421614;

  // 🔐 Web3 Global Variables
  let provider, signer, contract, userAddress;
  let activeVaultDuration = null;

  // 📦 ABI
  const abi = [ {
      "inputs": [],
      "stateMutability": "nonpayable",
      "type": "constructor"
    },
    {
      "inputs": [{ "internalType": "uint256", "name": "_lockDuration", "type": "uint256" }],
      "name": "deposit",
      "outputs": [],
      "stateMutability": "payable",
      "type": "function"
    },
    {
      "inputs": [{ "internalType": "uint256", "name": "_lockDuration", "type": "uint256" }],
      "name": "claim",
      "outputs": [],
      "stateMutability": "nonpayable",
      "type": "function"
    },
    {
      "inputs": [{ "internalType": "address", "name": "user", "type": "address" }],
      "name": "getUserVaultDurations",
      "outputs": [{ "internalType": "uint256[]", "name": "", "type": "uint256[]" }],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [
        { "internalType": "address", "name": "user", "type": "address" },
        { "internalType": "uint256", "name": "lockDuration", "type": "uint256" }
      ],
      "name": "getVault",
      "outputs": [
        { "internalType": "uint256", "name": "totalAmount", "type": "uint256" },
        { "internalType": "uint256", "name": "unlockTime", "type": "uint256" },
        { "internalType": "uint256", "name": "depositCount", "type": "uint256" },
        { "internalType": "bool", "name": "claimed", "type": "bool" }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [
        { "internalType": "address", "name": "user", "type": "address" },
        { "internalType": "uint256", "name": "lockDuration", "type": "uint256" }
      ],
      "name": "getVaultRemainingTime",
      "outputs": [{ "internalType": "uint256", "name": "secondsRemaining", "type": "uint256" }],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [
        { "internalType": "address", "name": "user", "type": "address" },
        { "internalType": "uint256", "name": "lockDuration", "type": "uint256" }
      ],
      "name": "getDepositHistory",
      "outputs": [{
        "components": [
          { "internalType": "uint256", "name": "amount", "type": "uint256" },
          { "internalType": "uint256", "name": "timestamp", "type": "uint256" }
        ],
        "internalType": "struct TimeLockVault.Deposit[]",
        "name": "",
        "type": "tuple[]"
      }],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [
        { "internalType": "address", "name": "", "type": "address" },
        { "internalType": "uint256", "name": "", "type": "uint256" }
      ],
      "name": "hasUsedDuration",
      "outputs": [{ "internalType": "bool", "name": "", "type": "bool" }],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [{ "internalType": "uint256", "name": "", "type": "uint256" }],
      "name": "isValidDuration",
      "outputs": [{ "internalType": "bool", "name": "", "type": "bool" }],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [
        { "internalType": "address", "name": "", "type": "address" },
        { "internalType": "uint256", "name": "", "type": "uint256" }
      ],
      "name": "userVaults",
      "outputs": [
        { "internalType": "uint256", "name": "totalAmount", "type": "uint256" },
        { "internalType": "uint256", "name": "unlockTime", "type": "uint256" },
        { "internalType": "uint256", "name": "depositCount", "type": "uint256" },
        { "internalType": "bool", "name": "claimed", "type": "bool" }
      ],
      "stateMutability": "view",
      "type": "function"
    } ];

  // 🌐 DOM References – All Sections

  const connectBtn = document.querySelector(".connect-wallet-btn");
  const walletConnectSection = document.getElementById("walletConnect");

  const dashboardSection = document.getElementById("dashboard");
  const totalBalance = document.getElementById("totalBalance");
  const userWallet = document.getElementById("userWallet");
  const vaultScroll = document.getElementById("vaultScroll");
  const scrollArrow = document.getElementById("scrollArrow");
  const dashboardHistoryBody = document.getElementById("dashboardHistoryBody");
  const viewAllHistoryBtn = document.getElementById("viewAllHistoryBtn");
  const startNewSavingsBtn = document.getElementById("startNewSavingsBtn");

  const vaultPage = document.getElementById("VaultPage");
  const vaultBackBtn = document.getElementById("vaultBackBtn");
  const vaultNewSavingsBtn = document.getElementById("vaultNewSavingsBtn");
  const vaultTitle = document.getElementById("vaultTitle");
  const vaultBalance = document.getElementById("vaultBalance");
  const progressFill = document.getElementById("progressFill");
  const progressPercent = document.getElementById("progressPercent");
  const vaultCountdown = document.getElementById("vaultCountdown");
  const topUpBtn = document.getElementById("topUpBtn");
  const withdrawBtn = document.getElementById("withdrawBtn");
  const startDate = document.getElementById("startDate");
  const withdrawalDate = document.getElementById("withdrawalDate");
  const frequencyText = document.getElementById("frequencyText");
  const savingsTarget = document.getElementById("savingsTarget");
  const vaultHistoryBody = document.getElementById("vaultHistoryBody");
  const vaultHistoryViewAll = document.getElementById("vaultHistoryViewAll");

  const savingPlanSection = document.getElementById("savingPlan");
  const planBackBtn = document.getElementById("planBackBtn");
  const planCardContainer = document.getElementById("planCardContainer");
  const planButtons = document.querySelectorAll(".plan-btn");

  const savingsPlanForm = document.getElementById("savingsPlanForm");
  const formBackBtn = document.getElementById("formBackBtn");
  const planForm = document.getElementById("planForm");
  const targetAmount = document.getElementById("targetAmount");
  const savingFrequency = document.getElementById("savingFrequency");
  const lockupPeriod = document.getElementById("lockupPeriod");
  const initialAmount = document.getElementById("initialAmount");
  const startSavingBtn = document.getElementById("startSavingBtn");

  const depositFormSection = document.getElementById("depositForm");
  const depositBackBtn = document.getElementById("depositBackBtn");
  const depositVaultTitle = document.getElementById("depositVaultTitle");
  const depositFormActual = document.getElementById("depositFormActual");
  const depositAmountInput = document.getElementById("depositAmountInput");
  const depositBtn = document.getElementById("depositBtn");

  // ✅ Toast popup for UX
  function showStatus(message, duration = 4000) {
    let statusBox = document.getElementById("statusMessage");
    if (!statusBox) {
      statusBox = document.createElement("div");
      statusBox.id = "statusMessage";
      statusBox.style.position = "fixed";
      statusBox.style.top = "20px";
      statusBox.style.right = "20px";
      statusBox.style.background = "#1a1a1a";
      statusBox.style.color = "#fff";
      statusBox.style.padding = "10px 18px";
      statusBox.style.borderRadius = "8px";
      statusBox.style.zIndex = "9999";
      statusBox.style.boxShadow = "0 4px 12px rgba(0,0,0,0.25)";
      document.body.appendChild(statusBox);
    }

    statusBox.textContent = message;
    statusBox.style.display = "block";
    setTimeout(() => {
      statusBox.style.display = "none";
    }, duration);
  }

  // ✅ Wallet Connect + Vault Check
  connectBtn.addEventListener("click", async () => {
    try {
      if (!window.ethereum) {
        alert("Please use a browser with MetaMask or another Web3 wallet.");
        return;
      }

      provider = new ethers.providers.Web3Provider(window.ethereum);
      const currentNetwork = await provider.getNetwork();

      if (currentNetwork.chainId !== chainId) {
        try {
          await window.ethereum.request({
            method: "wallet_switchEthereumChain",
            params: [{ chainId: "0x" + chainId.toString(16) }]
          });
          showStatus("✅ Switched to Arbitrum Sepolia. Please click Connect again.");
          return;
        } catch (err) {
          if (err.code === 4902) {
            await window.ethereum.request({
              method: "wallet_addEthereumChain",
              params: [{
                chainId: "0x" + chainId.toString(16),
                chainName: "Arbitrum Sepolia",
                rpcUrls: [rpcUrl],
                nativeCurrency: { name: "ETH", symbol: "ETH", decimals: 18 },
                blockExplorerUrls: ["https://sepolia.arbiscan.io"]
              }]
            });
            showStatus("✅ Network added. Please click Connect again.");
            return;
          } else {
            alert("Please switch to the Arbitrum Sepolia network.");
            return;
          }
        }
      }

      await provider.send("eth_requestAccounts", []);
      signer = provider.getSigner();
      userAddress = await signer.getAddress();
      contract = new ethers.Contract(contractAddress, abi, signer);

      userWallet.textContent = userAddress.slice(0, 6) + "..." + userAddress.slice(-4);
      walletConnectSection.style.display = "none";

      const readContract = new ethers.Contract(contractAddress, abi, provider);
      const userDurations = await readContract.getUserVaultDurations(userAddress);

      if (userDurations.length > 0) {
        dashboardSection.style.display = "block";
        showStatus("✅ Welcome back! Vault(s) found.");
      } else {
        savingPlanSection.style.display = "block";
        showStatus("🚀 Start your first crypto savings plan.");
      }

    } catch (err) {
      console.error("❌ Wallet connection failed:", err);
      showStatus("❌ Wallet connection failed.");
    }
  });


// ✅ Flow 2 — Plan → Form
planCardContainer.addEventListener("click", (e) => {
  if (e.target.classList.contains("plan-btn")) {
    console.log("✅ plan-btn clicked via delegation");
    savingPlanSection.style.display = "none";
    savingsPlanForm.style.display = "block";
  }
});


startSavingBtn.addEventListener("click", async (e) => {
  e.preventDefault();

  const target = parseFloat(targetAmount.value);
  const frequency = savingFrequency.value;
  const duration = parseInt(lockupPeriod.value);
  const firstAmount = parseFloat(initialAmount.value);

  // ✅ Validation
  if (isNaN(target) || isNaN(firstAmount) || !frequency || duration <= 0) {
    showStatus("❌ Please complete the form properly.");
    return;
  }

  // 💾 Save form data to localStorage
  const vaultKey = `vault_${duration}`;
  localStorage.setItem(vaultKey, JSON.stringify({
    target,
    frequency,
    purpose: localStorage.getItem("selectedPurpose") || "General"
  }));

  try {
    // 💸 Send deposit transaction
    const tx = await contract.deposit(duration, {
      value: ethers.utils.parseEther(firstAmount.toString())
    });

    showStatus("⏳ Confirming your first deposit...");
    await tx.wait();

    showStatus("✅ First deposit successful!");

    // 🎯 Set this as the current vault
    activeVaultDuration = duration;

    // Hide form, show vault page
    savingsPlanForm.style.display = "none";
    vaultPage.style.display = "block";

    // (Flow 3 will load full vault data here)

  } catch (err) {
    console.error("❌ Deposit failed:", err);
    showStatus("❌ Deposit failed or cancelled.");
  }
});




});

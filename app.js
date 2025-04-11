// app.js

// Kategóriák: alapértelmezettként objektumok név és ikon párossal
let categories = JSON.parse(localStorage.getItem("categories")) || [
  { name: "Étel", icon: "🍔" },
  { name: "Lakhatás", icon: "🏠" },
  { name: "Szórakozás", icon: "🎉" }
];

// Tranzakciók tárolása
let transactions = JSON.parse(localStorage.getItem("transactions")) || [];

// Frissíti a kategória legördülő menüt
function updateCategoryList() {
  const categorySelect = document.getElementById("category");
  // Alapértelmezett opciók
  categorySelect.innerHTML = `
    <option value="bevétel">💰 Bevétel</option>
    <option value="kiadás">🛒 Kiadás</option>
    <option value="megtakarítás">🏦 Megtakarítás</option>
  `;
  // Egyedi kategóriák hozzáadása
  categories.forEach(cat => {
    const option = document.createElement("option");
    option.value = cat.name;
    option.textContent = `${cat.icon} ${cat.name}`;
    categorySelect.appendChild(option);
  });
}

// Új kategória hozzáadása, egyedi ikon opcióval
function addCategory() {
  const newCategoryName = document.getElementById("newCategory").value.trim();
  let newCategoryIcon = document.getElementById("categoryIcon").value.trim();
  
  if (!newCategoryName) {
    alert("Kérlek add meg a kategória nevét!");
    return;
  }
  if (!newCategoryIcon) {
    newCategoryIcon = "📌"; // alapértelmezett ikon, ha nincs megadva
  }
  // Ellenőrizzük, hogy létezik-e már ugyanolyan kategória (kis-nagybetűk figyelmen kívül hagyásával)
  if (categories.some(cat => cat.name.toLowerCase() === newCategoryName.toLowerCase())) {
    alert("Ez a kategória már létezik!");
    return;
  }
  
  categories.push({ name: newCategoryName, icon: newCategoryIcon });
  localStorage.setItem("categories", JSON.stringify(categories));
  updateCategoryList();
  document.getElementById("newCategory").value = "";
  document.getElementById("categoryIcon").value = "";
}

// Tranzakció hozzáadása hibaellenőrzéssel és dátum mentéssel
function addTransaction() {
  const categorySelect = document.getElementById("category");
  const transactionAmount = document.getElementById("transactionAmount").value;
  const transactionDescription = document.getElementById("transactionDescription").value.trim();
  const errorMessage = document.getElementById("errorMessage");
  errorMessage.textContent = "";
  
  if (!transactionAmount || !transactionDescription) {
    errorMessage.textContent = "Minden mezőt tölts ki!";
    return;
  }
  
  const newTransaction = {
    id: Date.now(), // egyedi azonosító az időbélyeg alapján
    category: categorySelect.value,
    amount: parseFloat(transactionAmount),
    description: transactionDescription,
    date: new Date().toISOString() // ISO formátumú dátum
  };
  
  transactions.push(newTransaction);
  localStorage.setItem("transactions", JSON.stringify(transactions));
  document.getElementById("transactionAmount").value = "";
  document.getElementById("transactionDescription").value = "";
  updateTransactions();
}

// Frissíti a tranzakciók listáját, minden tételhez törlés gombbal
function updateTransactions() {
  const transactionsList = document.getElementById("transactionsList");
  transactionsList.innerHTML = "";
  transactions.forEach(tx => {
    const div = document.createElement("div");
    div.innerHTML = `
      <span>${new Date(tx.date).toLocaleString()} - ${tx.category}: ${tx.description} - ${tx.amount} Ft</span>
      <button onclick="deleteTransaction(${tx.id})">Törlés</button>
    `;
    transactionsList.appendChild(div);
  });
  updateBalances();
  updateChart();
}

// Törli a megadott azonosítójú tranzakciót
function deleteTransaction(id) {
  transactions = transactions.filter(tx => tx.id !== id);
  localStorage.setItem("transactions", JSON.stringify(transactions));
  updateTransactions();
}

// Frissíti az egyenleg és megtakarítás értékeket
function updateBalances() {
  let totalIncome = 0, totalExpense = 0, totalSavings = 0;
  
  transactions.forEach(tx => {
    if (tx.category === "bevétel") {
      totalIncome += tx.amount;
    }
    if (tx.category === "kiadás") {
      totalExpense += tx.amount;
    }
    if (tx.category === "megtakarítás") {
      totalSavings += tx.amount;
    }
  });
  
  document.getElementById("totalIncome").textContent = totalIncome;
  document.getElementById("totalExpense").textContent = totalExpense;
  document.getElementById("totalSavings").textContent = totalSavings;
}

// Grafikon frissítése Chart.js-szel, százalékos értékek megjelenítésével
let chart;
function updateChart() {
  let totalIncome = 0, totalExpense = 0, totalSavings = 0;
  
  transactions.forEach(tx => {
    if (tx.category === "bevétel") {
      totalIncome += tx.amount;
    }
    if (tx.category === "kiadás") {
      totalExpense += tx.amount;
    }
    if (tx.category === "megtakarítás") {
      totalSavings += tx.amount;
    }
  });
  
  let sum = totalIncome + totalExpense + totalSavings;
  const percentages = sum ? [
    (totalIncome / sum * 100).toFixed(1),
    (totalExpense / sum * 100).toFixed(1),
    (totalSavings / sum * 100).toFixed(1)
  ] : [0, 0, 0];
  
  const ctx = document.getElementById('transactionChart').getContext('2d');
  if (chart) {
    chart.destroy();
  }
  
  chart = new Chart(ctx, {
    type: 'pie',
    data: {
      labels: [
        `Bevétel (${percentages[0]}%)`,
        `Kiadás (${percentages[1]}%)`,
        `Megtakarítás (${percentages[2]}%)`
      ],
      datasets: [{
        data: [totalIncome, totalExpense, totalSavings],
        backgroundColor: ['green', 'red', 'blue']
      }]
    },
    options: {
      responsive: true,
      plugins: {
        tooltip: {
          callbacks: {
            label: function(context) {
              return context.label + ': ' + context.raw + ' Ft';
            }
          }
        }
      }
    }
  });
}

// Kezdeti frissítések betöltéskor
updateCategoryList();
updateTransactions();

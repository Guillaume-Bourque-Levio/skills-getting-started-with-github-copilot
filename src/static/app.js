document.addEventListener("DOMContentLoaded", () => {
  const form = document.getElementById("receipt-form");
  const list = document.getElementById("receipts-list");
  const filter = document.getElementById("category-filter");
  const message = document.getElementById("message");
  const euro = new Intl.NumberFormat("fr-FR", { style: "currency", currency: "EUR" });

  function showMessage(text, error = false) {
    message.textContent = text;
    message.className = `message ${error ? "error" : "success"}`;
    setTimeout(() => message.classList.add("hidden"), 3500);
  }

  async function loadReceipts() {
    const query = filter.value ? `?category=${encodeURIComponent(filter.value)}` : "";
    const response = await fetch(`/receipts${query}`);
    if (!response.ok) throw new Error("Impossible de charger les reçus");
    const receipts = await response.json();
    const allResponse = filter.value ? await fetch("/receipts") : null;
    const allReceipts = allResponse ? await allResponse.json() : receipts;
    document.getElementById("total-amount").textContent =
      euro.format(allReceipts.reduce((total, receipt) => total + receipt.amount, 0));
    document.getElementById("receipt-count").textContent =
      `${receipts.length} reçu${receipts.length === 1 ? "" : "s"}`;
    if (!receipts.length) {
      list.innerHTML = '<p class="empty">Aucun reçu pour le moment.</p>';
      return;
    }
    list.innerHTML = receipts.map((receipt) => `
      <article class="receipt">
        <div class="receipt-icon">€</div>
        <div class="receipt-info">
          <h3>${escapeHtml(receipt.merchant)}</h3>
          <p>${new Date(`${receipt.date}T00:00:00`).toLocaleDateString("fr-FR")} · ${escapeHtml(receipt.category)}</p>
          ${receipt.notes ? `<small>${escapeHtml(receipt.notes)}</small>` : ""}
        </div>
        <strong>${euro.format(receipt.amount)}</strong>
        <button class="delete" data-id="${receipt.id}" aria-label="Supprimer le reçu de ${escapeHtml(receipt.merchant)}">×</button>
      </article>
    `).join("");
    list.querySelectorAll(".delete").forEach((button) => button.addEventListener("click", () => deleteReceipt(button.dataset.id)));
  }

  async function deleteReceipt(id) {
    if (!window.confirm("Supprimer ce reçu ?")) return;
    const response = await fetch(`/receipts/${id}`, { method: "DELETE" });
    if (response.ok) {
      showMessage("Reçu supprimé.");
      await loadReceipts();
    }
  }

  function escapeHtml(value) {
    return value.replace(/[&<>"']/g, (character) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#039;" }[character]));
  }

  form.addEventListener("submit", async (event) => {
    event.preventDefault();
    const data = Object.fromEntries(new FormData(form));
    data.amount = Number(data.amount);
    const response = await fetch("/receipts", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    if (!response.ok) {
      showMessage("Vérifiez les informations saisies.", true);
      return;
    }
    form.reset();
    document.getElementById("date").valueAsDate = new Date();
    showMessage("Reçu enregistré.");
    await loadReceipts();
  });

  filter.addEventListener("change", loadReceipts);
  document.getElementById("date").valueAsDate = new Date();
  loadReceipts().catch(() => showMessage("Impossible de charger les reçus.", true));
});

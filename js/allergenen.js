(() => {
  const GVIZ_URL =
    "https://docs.google.com/spreadsheets/d/e/2PACX-1vTFHVIq4m5c0quhYDrSoDoYVxV-0LsN5h1ZSzv-hOBFIN6YRFZjkKB59JNWyeLoR7et0p6kHFPgoyxG/gviz/tq?gid=1971864328&tqx=out:json";

  const toCellText = (cell) => {
    if (!cell) return "";
    return String(cell.f ?? cell.v ?? "").trim();
  };

  const parseGvizResponse = (text) => {
    const start = text.indexOf("(");
    const end = text.lastIndexOf(")");

    if (start === -1 || end === -1 || end <= start + 1) {
      throw new Error("Invalid GViz response format");
    }

    const payload = JSON.parse(text.slice(start + 1, end));
    const cols = payload?.table?.cols ?? [];
    const rows = payload?.table?.rows ?? [];

    const headerRow = cols.map((col) => col.label || col.id || "");
    const dataRows = rows.map((row) => (row.c ?? []).map(toCellText));

    return [headerRow, ...dataRows].filter((row) =>
      row.some((value) => value !== "")
    );
  };

  const escapeHtml = (value) =>
    value
      .replaceAll("&", "&amp;")
      .replaceAll("<", "&lt;")
      .replaceAll(">", "&gt;")
      .replaceAll('"', "&quot;")
      .replaceAll("'", "&#39;");

  const renderTable = (rows) => {
    const head = document.getElementById("allergens-table-head");
    const body = document.getElementById("allergens-table-body");
    const status = document.getElementById("allergens-status");

    if (!head || !body || !status) return;

    if (rows.length === 0) {
      status.textContent = "Geen allergeneninformatie beschikbaar.";
      return;
    }

    const [headerRow, ...dataRows] = rows;

    head.innerHTML = `<tr>${headerRow
      .map((cell) => `<th scope="col">${escapeHtml(cell || "-")}</th>`)
      .join("")}</tr>`;

    body.innerHTML = dataRows
      .map(
        (row) =>
          `<tr>${headerRow
            .map((_, index) => `<td>${escapeHtml(row[index] || "-")}</td>`)
            .join("")}</tr>`
      )
      .join("");

    status.textContent = "";
  };

  const loadAllergens = async () => {
    const status = document.getElementById("allergens-status");

    try {
      const response = await fetch(GVIZ_URL, { cache: "no-store" });
      if (!response.ok) {
        throw new Error("Fetch failed");
      }

      const text = await response.text();
      const rows = parseGvizResponse(text);
      renderTable(rows);
    } catch (error) {
      if (status) {
        status.textContent =
          "Kon de allergenenlijst niet laden. Probeer later opnieuw.";
      }
    }
  };

  loadAllergens();
})();

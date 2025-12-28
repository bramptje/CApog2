const CSV_URL = "https://docs.google.com/spreadsheets/d/e/2PACX-1vTFHVIq4m5c0quhYDrSoDoYVxV-0LsN5h1ZSzv-hOBFIN6YRFZjkKB59JNWyeLoR7et0p6kHFPgoyxG/pub?gid=109840204&single=true&output=csv";

const tastesList = document.getElementById("tastes-list");

const setUnavailable = () => {
  if (!tastesList) {
    return;
  }
  tastesList.innerHTML = "";
  const item = document.createElement("li");
  item.textContent = "Smaken tijdelijk niet beschikbaar";
  tastesList.append(item);
};

const parseCsv = (text) => {
  const rows = [];
  let current = "";
  let row = [];
  let inQuotes = false;

  for (let i = 0; i < text.length; i += 1) {
    const char = text[i];
    if (char === '"') {
      const next = text[i + 1];
      if (inQuotes && next === '"') {
        current += '"';
        i += 1;
      } else {
        inQuotes = !inQuotes;
      }
    } else if (char === "," && !inQuotes) {
      row.push(current);
      current = "";
    } else if ((char === "\n" || char === "\r") && !inQuotes) {
      if (char === "\r" && text[i + 1] === "\n") {
        i += 1;
      }
      row.push(current);
      if (row.some((value) => value.trim() !== "")) {
        rows.push(row);
      }
      row = [];
      current = "";
    } else {
      current += char;
    }
  }

  row.push(current);
  if (row.some((value) => value.trim() !== "")) {
    rows.push(row);
  }

  return rows;
};

const extractTastes = (rows) => {
  if (rows.length === 0) {
    return [];
  }

  const headerRow = rows[0].map((value) => value.trim().toLowerCase());
  const nameIndex = headerRow.indexOf("name");
  const dataRows = nameIndex === -1 ? rows : rows.slice(1);
  const columnIndex = nameIndex === -1 ? 0 : nameIndex;
  const seen = new Set();

  return dataRows
    .map((row) => (row[columnIndex] ? row[columnIndex].trim() : ""))
    .filter((value) => value !== "")
    .filter((value) => {
      const key = value.toLowerCase();
      if (seen.has(key)) {
        return false;
      }
      seen.add(key);
      return true;
    });
};

const renderTastes = (tastes) => {
  if (!tastesList) {
    return;
  }
  tastesList.innerHTML = "";
  tastes.forEach((taste) => {
    const item = document.createElement("li");
    item.textContent = taste;
    tastesList.append(item);
  });
};

const loadTastes = async () => {
  if (!tastesList) {
    return;
  }

  try {
    const response = await fetch(CSV_URL, { cache: "no-store" });
    if (!response.ok) {
      throw new Error("Fetch failed");
    }
    const text = await response.text();
    const rows = parseCsv(text);
    const tastes = extractTastes(rows);
    if (tastes.length === 0) {
      throw new Error("No data");
    }
    renderTastes(tastes);
  } catch (error) {
    setUnavailable();
  }
};

loadTastes();

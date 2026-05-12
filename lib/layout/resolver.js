export function resolve(path, data) {
  if (!path) return "-";

  return path.split(".").reduce((acc, key) => {
    if (!acc) return "-";
    return acc[key] ?? "-";
  }, data);
}

export function money(v) {
  const n = Number(v);
  return isNaN(n) ? "0.00" : n.toFixed(2);
}

export function safe(v) {
  return v === undefined || v === null || v === "" ? "-" : String(v);
}

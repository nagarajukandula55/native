export function deepSanitize(input) {
  if (Array.isArray(input)) {
    return input.map(deepSanitize);
  }

  if (input && typeof input === "object") {
    const clean = {};

    for (const key in input) {
      const value = input[key];

      // ❌ BLOCK DANGEROUS / UNKNOWN KEYS HERE
      if (
        key.startsWith("$") ||
        key.includes(".")
      ) continue;

      clean[key] = deepSanitize(value);
    }

    return clean;
  }

  return input;
}

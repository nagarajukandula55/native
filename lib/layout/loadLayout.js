import fs from "fs";
import path from "path";

export function loadLayout(type, subtype = "b2b") {
  const filePath = path.join(
    process.cwd(),
    "layouts",
    type,
    `${subtype}.json`
  );

  if (!fs.existsSync(filePath)) {
    throw new Error(`Layout not found: ${type}/${subtype}`);
  }

  return JSON.parse(fs.readFileSync(filePath, "utf-8"));
}

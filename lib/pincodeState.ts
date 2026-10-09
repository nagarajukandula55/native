import fs from "fs";
import path from "path";

/**
 * Server-only pincode -> Indian state lookup, backed by the 2.3MB
 * pincodes.csv at the repo root (39k+ rows) -- never import this from a
 * client component, it'd blow up the bundle. The CSV predates the 2014
 * Andhra Pradesh/Telangana split (no "Telangana" rows exist), but that's
 * harmless here since both states map to the same language anyway. A
 * handful of rows have a city/district name in the State column instead
 * of the actual state (stale source data) -- STATE_ALIASES below corrects
 * the ones actually present rather than silently misrouting them.
 */

const STATE_ALIASES: Record<string, string> = {
  mumbai: "Maharashtra",
  thrissur: "Kerala",
  trivandrum: "Kerala",
  pathanamthitta: "Kerala",
  "cannanore (kannur)": "Kerala",
};

type Index = { exact: Map<string, string>; prefix: Map<string, string> };

let index: Index | null = null;

function loadIndex(): Index {
  if (index) return index;

  const csvPath = path.join(process.cwd(), "pincodes.csv");
  const exact = new Map<string, string>();
  // The dataset doesn't cover every pincode (newer areas like Hyderabad's
  // 500081 are missing entirely) -- but Indian pincode prefixes are
  // strongly regional, so a 3-digit-prefix majority vote is a solid
  // fallback for exact misses. Tally counts per prefix, keep the winner.
  const prefixCounts = new Map<string, Map<string, number>>();

  try {
    const raw = fs.readFileSync(csvPath, "utf-8");
    // The file has CRLF line endings -- splitting on "\n" alone leaves a
    // trailing \r on every line, which then blocks the trailing-quote
    // strip below (the regex requires the quote to be the literal last
    // character) and silently corrupted every state value with a stray
    // trailing `"`.
    const lines = raw.split(/\r?\n/);
    // Header: "PostOfficeName","Pincode","DistrictsName","City","State"
    for (let i = 1; i < lines.length; i++) {
      const line = lines[i];
      if (!line) continue;
      // Simple quoted-CSV split -- the source has no embedded commas
      // inside quoted fields that would need a real CSV parser.
      const cells = line.split('","').map((c) => c.replace(/^"|"$/g, "").trim());
      const pincode = cells[1];
      let state = cells[4];
      if (!pincode || !state || !/^\d{6}$/.test(pincode)) continue;
      const aliased = STATE_ALIASES[state.toLowerCase()];
      if (aliased) state = aliased;
      // Last write wins on duplicate pincodes -- fine, we only need "a"
      // state for a pincode, not the authoritative post-office record.
      exact.set(pincode, state);

      const prefix = pincode.slice(0, 3);
      if (!prefixCounts.has(prefix)) prefixCounts.set(prefix, new Map());
      const counts = prefixCounts.get(prefix)!;
      counts.set(state, (counts.get(state) || 0) + 1);
    }
  } catch (err) {
    console.error("pincodeState: failed to load pincodes.csv:", err);
  }

  const prefix = new Map<string, string>();
  for (const [p, counts] of prefixCounts) {
    let winner = "";
    let max = 0;
    for (const [state, count] of counts) {
      if (count > max) {
        max = count;
        winner = state;
      }
    }
    if (winner) prefix.set(p, winner);
  }

  index = { exact, prefix };
  return index;
}

export function resolveStateForPincode(pincode: string): string | null {
  if (!/^\d{6}$/.test(pincode)) return null;
  const { exact, prefix } = loadIndex();
  return exact.get(pincode) || prefix.get(pincode.slice(0, 3)) || null;
}

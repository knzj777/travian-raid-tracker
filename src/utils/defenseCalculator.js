// Calculates summed base defense vs infantry and cavalry for defender units
// reportData is expected to have shape with defenders: [{ units: [{ name, count, tribe? }] }]
// Uses base unit stats only (no wall/hero/smithy/oasis)

import { travianUnits } from "../data/travianUnits";

function findUnitByName(unitName) {
  if (!unitName) return null;
  const normalize = (s) =>
    String(s)
      .toLowerCase()
      .replace(/[^a-z0-9]/g, "");
  const needleNorm = normalize(unitName);

  // Search in all tribes against both key and pretty name
  for (const tribeKey in travianUnits) {
    const tribe = travianUnits[tribeKey];
    if (!tribe || !tribe.units) continue;
    for (const key in tribe.units) {
      const unit = tribe.units[key];
      const keyNorm = normalize(key);
      const prettyNorm = unit?.name ? normalize(unit.name) : "";

      const isExact = keyNorm === needleNorm || prettyNorm === needleNorm;
      const isFuzzy =
        keyNorm.includes(needleNorm) ||
        needleNorm.includes(keyNorm) ||
        (prettyNorm &&
          (prettyNorm.includes(needleNorm) || needleNorm.includes(prettyNorm)));

      if (isExact || isFuzzy) {
        return unit;
      }
    }
  }

  return null;
}

export function calculateDefenseTotals(reportData) {
  try {
    if (!reportData || !Array.isArray(reportData.defenders)) {
      return null; // Unknown
    }

    let infantry = 0;
    let cavalry = 0;
    let unknown = false;

    // Build a fast lookup of all known unit names to improve header detection
    const knownUnitNames = new Set();
    for (const tribeKey in travianUnits) {
      const tribe = travianUnits[tribeKey];
      if (!tribe?.units) continue;
      for (const name in tribe.units) {
        knownUnitNames.add(name.toLowerCase());
        const pretty = tribe.units[name]?.name;
        if (pretty) knownUnitNames.add(String(pretty).toLowerCase());
      }
    }

    // Recursively collect arrays found inside an object (for table-like data)
    const collectArrays = (obj, path = []) => {
      const out = [];
      if (!obj || typeof obj !== "object") return out;
      for (const [k, v] of Object.entries(obj)) {
        const p = path.concat(k);
        if (Array.isArray(v)) {
          out.push({ path: p.join("."), value: v });
        } else if (v && typeof v === "object") {
          out.push(...collectArrays(v, p));
        }
      }
      return out;
    };

    const isStringArray = (a) =>
      Array.isArray(a) && a.every((x) => typeof x === "string");
    const isNumberArray = (a) =>
      Array.isArray(a) &&
      a.every(
        (x) => (typeof x === "number" && isFinite(x)) || typeof x === "string"
      );
    const toNumberArray = (arr) =>
      Array.isArray(arr)
        ? arr.map((v) => {
            if (typeof v === "number" && isFinite(v)) return v;
            const n = parseInt(String(v).replace(/[^0-9-]/g, ""), 10);
            return isFinite(n) ? n : 0;
          })
        : null;

    const tryExtractUnitsFromAnyTable = (defender) => {
      const arrays = collectArrays(defender);

      // Candidate headers: arrays of strings with many known unit names
      const headerCandidates = arrays
        .filter((a) => isStringArray(a.value) && a.value.length >= 5)
        .map((a) => ({
          path: a.path,
          names: a.value.map((s) => String(s).trim()),
        }))
        .filter(
          (h) =>
            h.names.filter((n) => knownUnitNames.has(n.toLowerCase())).length >=
            2
        );

      // Candidate counts: arrays of numbers (or numeric strings) of a specific length
      const countCandidates = arrays
        .filter((a) => isNumberArray(a.value))
        .map((a) => ({ path: a.path, nums: toNumberArray(a.value) }));

      for (const header of headerCandidates) {
        const len = header.names.length;
        // Prefer counts with same length and in a path hinting at initial row
        let match = countCandidates.find(
          (c) =>
            c.nums &&
            c.nums.length === len &&
            /initial|row\.?0|rows\.0|unit-row-initial/i.test(c.path)
        );
        if (!match)
          match = countCandidates.find((c) => c.nums && c.nums.length === len);
        if (match) {
          return header.names.map((name, i) => ({
            name,
            count: match.nums[i] || 0,
          }));
        }
      }
      return null;
    };

    // Try to extract units when defenders are stored as a table-like structure
    const extractUnitsFromTable = (defender) => {
      const table =
        defender?.["unit-data"] ||
        defender?.unitData ||
        defender?.unitsTable ||
        defender?.table ||
        null;
      if (!table || typeof table !== "object") return null;

      // Header candidates: header-row, headerRow, headers
      let header =
        table?.["header-row"] || table?.headerRow || table?.headers || null;
      // Some implementations store header row as array of cells (objects) with data-tooltip/name
      if (Array.isArray(header)) {
        header = header.map((cell) => {
          if (cell == null) return "";
          if (typeof cell === "string") return cell;
          return (
            cell?.name ||
            cell?.title ||
            cell?.tooltip ||
            cell?.["data-tooltip"] ||
            cell?.text ||
            ""
          );
        });
      }

      // Rows: prefer unit-row-initial, then rows[0]
      let counts = table?.["unit-row-initial"] || table?.unitRowInitial || null;
      if (!counts && Array.isArray(table?.rows) && table.rows.length > 0) {
        counts = table.rows[0];
      }

      // Normalize counts: arrays of numbers or numeric strings
      const toNumberArray = (arr) =>
        Array.isArray(arr)
          ? arr.map((v) => {
              if (typeof v === "number" && isFinite(v)) return v;
              const n = parseInt(String(v).replace(/[^0-9-]/g, ""), 10);
              return isFinite(n) ? n : 0;
            })
          : null;

      const headerArr = Array.isArray(header)
        ? header.map((s) => String(s).trim())
        : null;
      const countsArr = toNumberArray(counts);

      if (headerArr && countsArr && headerArr.length === countsArr.length) {
        return headerArr.map((name, idx) => ({
          name,
          count: countsArr[idx] || 0,
        }));
      }

      // Fallback: try to scan nested objects for similar structure
      for (const key of Object.keys(table)) {
        const maybe = table[key];
        if (maybe && typeof maybe === "object" && maybe !== table) {
          const nested = extractUnitsFromTable({ "unit-data": maybe });
          if (nested) return nested;
        }
      }
      return null;
    };

    for (const defender of reportData.defenders) {
      let units = defender?.units || defender?.troops || [];

      // NEW: handle object-shaped units produced by parser (unitName -> { initial, lost, ... })
      if (!Array.isArray(units) && units && typeof units === "object") {
        const asList = [];
        for (const [unitName, unitObj] of Object.entries(units)) {
          if (unitName.startsWith("_")) continue; // skip meta fields like _hasHospitalData
          if (!unitObj || typeof unitObj !== "object") continue;
          const raw =
            unitObj.initial ?? unitObj.count ?? unitObj.remaining ?? 0;
          const countNum =
            typeof raw === "number" && isFinite(raw)
              ? raw
              : raw === "?"
              ? 0
              : parseInt(String(raw).replace(/[^0-9-]/g, ""), 10) || 0;
          asList.push({ name: unitName, count: countNum });
        }
        units = asList;
      }

      if (!Array.isArray(units)) {
        // Attempt extraction strategies
        let extracted = extractUnitsFromTable?.(defender); // previous heuristic (if defined in earlier version)
        if (!Array.isArray(extracted))
          extracted = tryExtractUnitsFromAnyTable(defender);
        if (Array.isArray(extracted)) {
          units = extracted;
        }
      }

      if (!Array.isArray(units)) {
        unknown = true;
        continue;
      }

      for (const u of units) {
        const name = u?.name ?? u?.unit ?? u?.type;
        const count = Number(u?.count ?? u?.qty ?? u?.amount ?? 0);
        if (!name || !Number.isFinite(count)) {
          unknown = true;
          continue;
        }
        const unitData = findUnitByName(name);
        if (!unitData) {
          unknown = true;
          continue;
        }
        const defInf = Number(
          // prefer nested stats from travianUnits
          unitData?.stats?.defenseInfantry ??
            unitData?.defenseInfantry ??
            unitData?.defInf ??
            unitData?.def_inf ??
            0
        );
        const defCav = Number(
          unitData?.stats?.defenseCavalry ??
            unitData?.defenseCavalry ??
            unitData?.defCav ??
            unitData?.def_cav ??
            0
        );
        infantry += defInf * count;
        cavalry += defCav * count;
      }
    }

    if (infantry === 0 && cavalry === 0 && unknown) {
      return null; // no reliable data
    }
    return { infantry, cavalry };
  } catch {
    return null;
  }
}

// Function to get standard units for each tribe
const getTribeUnits = (tribe) => {
  const tribeUnits = {
    gauls: [
      "Phalanx",
      "Swordsman",
      "Pathfinder",
      "Theutates Thunder",
      "Druidrider",
      "Haeduan",
      "Trebuchet",
      "Chieftain",
      "Hero",
    ],
    romans: [
      "Legionnaire",
      "Praetorian",
      "Imperian",
      "Equites Legati",
      "Equites Imperatoris",
      "Equites Caesaris",
      "Battering Ram",
      "Fire Catapult",
      "Senator",
      "Hero",
    ],
    teutons: [
      "Clubswinger",
      "Spearman",
      "Axeman",
      "Scout",
      "Paladin",
      "Teutonic Knight",
      "Hero",
    ],
    egyptians: [
      "Slave Militia",
      "Ash Warden",
      "Khopesh Warrior",
      "Sopdu Explorer",
      "Anhur Guard",
      "Resheph Chariot",
      "Stone Catapult",
      "Nomarch",
      "Hero",
    ],
    spartans: [
      "Hoplite",
      "Sentinel",
      "Shieldsman",
      "Twinsteel Therion",
      "Elpida Rider",
      "Corinthian Crusher",
      "Ram",
      "Ballista",
      "Ephor",
      "Hero",
    ],
    huns: [
      "Mercenary",
      "Bowman",
      "Spotter",
      "Steppe Rider",
      "Marauder",
      "Catapult",
      "Ram",
      "Settler",
      "Hero",
    ],
  };

  return tribeUnits[tribe] || null;
};

// Function to detect tribe from unit names
const detectTribeFromUnits = (units) => {
  if (!units) return null;

  const unitNames = Object.keys(units).filter((name) => !name.startsWith("_"));
  if (unitNames.length === 0) return null;

  // Define tribe-specific unit signatures
  const tribeSignatures = {
    gauls: [
      "Phalanx",
      "Swordsman",
      "Pathfinder",
      "Theutates Thunder",
      "Druidrider",
      "Haeduan",
      "Trebuchet",
      "Chieftain",
      "Hero",
    ],
    romans: [
      "Legionnaire",
      "Praetorian",
      "Imperian",
      "Equites Legati",
      "Equites Imperatoris",
      "Equites Caesaris",
      "Battering Ram",
      "Fire Catapult",
      "Senator",
      "Hero",
    ],
    teutons: [
      "Clubswinger",
      "Spearman",
      "Axeman",
      "Scout",
      "Paladin",
      "Teutonic Knight",
      "Hero",
    ],
    egyptians: [
      "Slave Militia",
      "Ash Warden",
      "Khopesh Warrior",
      "Sopdu Explorer",
      "Anhur Guard",
      "Resheph Chariot",
      "Stone Catapult",
      "Nomarch",
      "Hero",
    ],
    spartans: [
      "Hoplite",
      "Sentinel",
      "Shieldsman",
      "Twinsteel Therion",
      "Elpida Rider",
      "Corinthian Crusher",
      "Ballista",
      "Ephor",
      "Hero",
    ],
    huns: [
      "Mercenary",
      "Bowman",
      "Spotter",
      "Steppe Rider",
      "Marksman",
      "Marauder",
      "Logades",
      "Hero",
    ],
  };

  // Count matches for each tribe
  const tribeScores = {};
  for (const [tribe, signatureUnits] of Object.entries(tribeSignatures)) {
    tribeScores[tribe] = 0;
    for (const unitName of unitNames) {
      if (signatureUnits.includes(unitName)) {
        tribeScores[tribe]++;
      }
    }
  }

  // Find tribe with highest score
  let bestTribe = null;
  let bestScore = 0;
  for (const [tribe, score] of Object.entries(tribeScores)) {
    if (score > bestScore) {
      bestScore = score;
      bestTribe = tribe;
    }
  }

  // Debug logging for Hero detection
  if (unitNames.includes("Hero")) {
    console.log(`DEBUG: Hero detected in units: ${unitNames.join(", ")}`);
    console.log(`DEBUG: Tribe scores:`, tribeScores);
    console.log(`DEBUG: Best tribe: ${bestTribe} (score: ${bestScore})`);
  }

  // Only return tribe if we have a reasonable confidence (at least 2 matches, or 1 if it's Hero)
  const hasOnlyHero = unitNames.length === 1 && unitNames[0] === "Hero";
  return bestScore >= (hasOnlyHero ? 1 : 2) ? bestTribe : null;
};

// Validation function for attack reports
export function validateAttackReport(text) {
  console.log("=== VALIDATION DEBUG START ===");
  console.log("Text length:", text.length);

  if (!text || typeof text !== "string") {
    console.log("Validation failed: Invalid text input");
    return false;
  }

  // Check for basic report structure
  const hasReportTitle =
    text.includes(" attacks ") ||
    text.includes(" scouts ") ||
    text.includes(" raids ");
  const hasAttacker = text.includes("Attacker");
  const hasDefender = text.includes("Defender");

  console.log("hasReportTitle:", hasReportTitle);
  console.log("hasAttacker:", hasAttacker);
  console.log("hasDefender:", hasDefender);

  // For attack reports, check for Statistics
  // For scouting reports, check for Resources
  // For defensive scouting reports, check for unit data (no Statistics or Resources)
  const hasStatistics = text.includes("Statistics");
  const hasResources = text.includes("Resources");

  // Check if it's a defensive scouting report (has scouts in title but no Statistics/Resources)
  const isDefensiveScout =
    text.includes(" scouts ") && !hasStatistics && !hasResources;

  // Check if it's a dead troops report (has raids/attacks in title, Information section with dead troops message, but no Statistics)
  const isDeadTroopsReport =
    (text.includes(" raids ") || text.includes(" attacks ")) &&
    text.includes("Information") &&
    (text.includes("None of the attacker's troops have returned") ||
      text.includes("None of the attacker") ||
      text.includes("troops have returned")) &&
    !hasStatistics;

  console.log("hasStatistics:", hasStatistics);
  console.log("hasResources:", hasResources);
  console.log("isDefensiveScout:", isDefensiveScout);
  console.log("isDeadTroopsReport:", isDeadTroopsReport);

  const isValid =
    hasReportTitle &&
    hasAttacker &&
    hasDefender &&
    (hasStatistics || hasResources || isDefensiveScout || isDeadTroopsReport);

  console.log("=== VALIDATION RESULT:", isValid, "===");

  return isValid;
}

export function parseAttackReport(text) {
  try {
    console.log("=== PARSER DEBUG START ===");
    console.log("Parser function called with text length:", text.length);
    const lines = text
      .split("\n")
      .map((line) => line.trim())
      .filter((line) => line.length > 0);

    console.log("Total lines to process:", lines.length);
    console.log("First 10 lines:", lines.slice(0, 10));

    const report = {
      header: {},
      attacker: {
        player: "",
        village: "",
        tribe: "",
        alliance: "",
        units: {},
        allTroopsDead: false,
      },
      defenders: [],
      statistics: {},
      bounty: null,
      resources: null, // For scouting reports
    };

    let currentSection = null;
    let currentDefender = null;
    let unitHeaders = [];
    let unitData = [];

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      console.log(`DEBUG: Processing line ${i}: "${line}"`);

      // Skip empty lines
      if (!line) {
        console.log(`DEBUG: Skipping empty line ${i}`);
        continue;
      }

      // Parse attack/scout/raid title and date
      if (
        line.includes(" attacks ") ||
        line.includes(" scouts ") ||
        line.includes(" raids ")
      ) {
        console.log("DEBUG: Found report title:", line);

        // Store original title for display
        report.header.originalTitle = line;

        let parts;
        if (line.includes(" attacks ")) {
          parts = line.split(" attacks ");
        } else if (line.includes(" scouts ")) {
          parts = line.split(" scouts ");
        } else if (line.includes(" raids ")) {
          parts = line.split(" raids ");
        }

        if (parts.length === 2) {
          report.header.attackerVillage = parts[0].trim();
          report.header.defenderVillage = parts[1].trim();

          // Set report type - process raids as attacks but preserve original text
          if (line.includes(" scouts ")) {
            report.header.type = "scout";
          } else {
            report.header.type = "attack"; // Both attacks and raids are processed as attacks
          }

          console.log(
            "DEBUG: Parsed title - Type:",
            report.header.type,
            "Attacker:",
            report.header.attackerVillage,
            "Defender:",
            report.header.defenderVillage
          );
        }

        // Look for date/time on next line
        if (i + 1 < lines.length) {
          const nextLine = lines[i + 1];
          if (nextLine.match(/\d{2}\.\d{2}\.\d{2}, \d{2}:\d{2}:\d{2}/)) {
            report.header.dateTime = nextLine;
            i++; // Skip the date line
          }
        }
        continue;
      }

      // Parse attacker section
      if (line === "Attacker") {
        console.log("DEBUG: *** FOUND ATTACKER SECTION ***");
        currentSection = "attacker";
        unitHeaders = [];
        unitData = [];
        continue;
      }

      // Parse defender section
      if (line === "Defender") {
        currentSection = "defender";

        // Create new defender object
        currentDefender = {
          player: "",
          village: "",
          tribe: "",
          alliance: "",
          isReinforcement: false,
          units: {},
        };
        report.defenders.push(currentDefender);

        unitHeaders = [];
        unitData = [];
        continue;
      }

      // Check if we're leaving the defender section
      if (
        currentSection === "defender" &&
        (line === "Attacker" ||
          line === "Reinforcement" ||
          line === "Statistics" ||
          line === "Bounty" ||
          line === "Information" ||
          line === "Resources" ||
          line.includes("Population:") ||
          line.includes("Loyalty:") ||
          line.includes("Villages") ||
          line.includes("Village groups") ||
          line.includes("Task overview") ||
          line.includes("Homepage Discord") ||
          line.includes("© 2004 - 2025"))
      ) {
        currentSection = null;
        currentDefender = null;
        unitHeaders = [];
        unitData = [];
        continue;
      }

      // Parse reinforcement section
      if (line === "Reinforcement") {
        currentSection = "reinforcement";
        // Mark the current defender as reinforcement
        if (currentDefender) {
          currentDefender.isReinforcement = true;
        }
        unitHeaders = [];
        unitData = [];
        continue;
      }

      // Parse statistics section
      if (line === "Statistics") {
        currentSection = "statistics";
        continue;
      }

      // Parse bounty section
      if (line === "Bounty") {
        currentSection = "bounty";
        continue;
      }

      // Parse resources section (for scouting reports)
      if (line === "Resources") {
        currentSection = "resources";
        continue;
      }

      // Parse information section
      if (line === "Information") {
        console.log("DEBUG: Found Information section");
        currentSection = "information";
        continue;
      }

      // Parse "Resources lost" values and stop parsing
      if (line === "Resources lost") {
        console.log("Found Resources lost line!");
        // Look for the values on the next line
        if (i + 1 < lines.length) {
          const valuesLine = lines[i + 1];
          console.log("Next line:", valuesLine);
          if (valuesLine.match(/\d/)) {
            const parts = valuesLine.split("\t");
            console.log("Split parts:", parts);
            if (parts.length >= 2) {
              const attackerValue = parts[0].trim();
              const defenderValue = parts[1].trim();

              report.statistics["Resources lost"] = {
                attacker: parseInt(attackerValue.replace(/[^\d]/g, "")) || 0,
                defender: parseInt(defenderValue.replace(/[^\d]/g, "")) || 0,
              };
              console.log(
                "Added Resources lost:",
                report.statistics["Resources lost"]
              );
              i++; // Skip the values line
            } else if (parts.length === 1) {
              // Handle case where there's only one value on first line
              const attackerValue = parts[0].trim();
              const attackerNum =
                parseInt(attackerValue.replace(/[^\d]/g, "")) || 0;

              // Look for second value on the next line
              let defenderNum = 0;
              if (i + 2 < lines.length) {
                const secondLine = lines[i + 2];
                console.log("Second line for defender value:", secondLine);
                if (secondLine.match(/\d/)) {
                  defenderNum = parseInt(secondLine.replace(/[^\d]/g, "")) || 0;
                  i++; // Skip the second values line too
                }
              }

              report.statistics["Resources lost"] = {
                attacker: attackerNum,
                defender: defenderNum,
              };
              console.log(
                "Added Resources lost (two lines):",
                report.statistics["Resources lost"]
              );
              i++; // Skip the first values line
            }
          }
        }
        // Stop parsing here to avoid processing random content
        break;
      }

      // Alternative: Look for pattern of two large numbers (Resources lost values)
      if (line.match(/^\d{1,3}(,\d{3})*\t\d{1,3}(,\d{3})*$/)) {
        console.log("Found potential Resources lost values:", line);
        const parts = line.split("\t");
        if (parts.length === 2) {
          const attackerValue = parts[0].trim();
          const defenderValue = parts[1].trim();

          // Check if these are large numbers (likely Resources lost)
          const attackerNum =
            parseInt(attackerValue.replace(/[^\d]/g, "")) || 0;
          const defenderNum =
            parseInt(defenderValue.replace(/[^\d]/g, "")) || 0;

          if (attackerNum > 1000000 && defenderNum > 1000000) {
            report.statistics["Resources lost"] = {
              attacker: attackerNum,
              defender: defenderNum,
            };
            console.log(
              "Added Resources lost from pattern:",
              report.statistics["Resources lost"]
            );
            break; // Stop parsing after finding Resources lost
          }
        }
      }

      // Parse player info (tribe, player, village)
      if (
        line.startsWith("[") &&
        line.includes("]") &&
        line.includes(" from village ")
      ) {
        const tribeMatch = line.match(/\[([^\]]+)\]/);
        const playerMatch = line.match(/\] ([^f]+) from village/);
        const villageMatch = line.match(/from village (.+)$/);

        if (tribeMatch && playerMatch && villageMatch) {
          const tribe = tribeMatch[1];
          const player = playerMatch[1].trim();
          const village = villageMatch[1].trim();

          if (currentSection === "attacker") {
            // Store the original bracket content as alliance
            report.attacker.alliance = tribe;
            report.attacker.player = player;
            report.attacker.village = village;
            // Don't set tribe yet - it will be detected from units
          } else if (currentDefender) {
            // Store the original bracket content as alliance
            currentDefender.alliance = tribe;
            currentDefender.player = player;
            currentDefender.village = village;
            // Don't set tribe yet - it will be detected from units
          }
        }
        continue;
      }

      // Parse unit headers (tab-separated unit names)
      if (
        currentSection &&
        (currentSection === "attacker" ||
          currentSection === "defender" ||
          currentSection === "reinforcement")
      ) {
        // Check if this line contains unit names (no numbers, just text, and not all "?")
        if (
          !line.match(/\d/) &&
          line.includes("\t") &&
          !line.split("\t").every((val) => val.trim() === "?")
        ) {
          unitHeaders = line
            .split("\t")
            .map((name) => name.trim())
            .filter((name) => name);
          continue;
        }

        // Check if this line contains unit data (numbers or ?)
        if (
          (line.match(/\d/) || line.includes("?")) &&
          unitHeaders.length > 0
        ) {
          const numbers = line.split("\t").map((num) => {
            const trimmed = num.trim();
            if (trimmed === "" || trimmed === "?") {
              return "?";
            }
            return parseInt(trimmed) || 0;
          });

          unitData.push(numbers);

          // Process unit data when we have enough rows (at least 2 rows: initial and lost)
          // Also process if this is the last line of the section or we have 3+ rows
          // Special case: if all attacker troops are dead and we have a single row of "?", process it
          const isDeadTroopsRow =
            report.attacker.allTroopsDead &&
            unitData.length === 1 &&
            unitData[0].every((val) => val === "?");

          const shouldProcess =
            (unitData.length >= 2 || isDeadTroopsRow) &&
            (i === lines.length - 1 ||
              unitData.length >= 3 ||
              !lines[i + 1]?.match(/\d/) ||
              lines[i + 1] === "Statistics" ||
              lines[i + 1] === "Bounty" ||
              lines[i + 1] === "Information" ||
              lines[i + 1] === "Resources" ||
              lines[i + 1] === "Defender" ||
              lines[i + 1] === "Reinforcement" ||
              lines[i + 1] === "Attacker");

          if (shouldProcess) {
            const units = {};
            const currentUnitData = unitData; // Capture unitData to avoid closure issues
            let hasHospitalData = false;

            unitHeaders.forEach((unitName, index) => {
              if (unitName.trim()) {
                const unit = {
                  initial: currentUnitData[0]
                    ? currentUnitData[0][index] || 0
                    : "?",
                  lost: currentUnitData[1]
                    ? currentUnitData[1][index] || 0
                    : "?",
                  wounded: currentUnitData[2]
                    ? currentUnitData[2][index] || 0
                    : "?",
                  remaining: "?",
                };

                // Calculate remaining if we have both initial and lost as numbers
                if (
                  unit.initial !== "?" &&
                  unit.lost !== "?" &&
                  typeof unit.initial === "number" &&
                  typeof unit.lost === "number"
                ) {
                  unit.remaining = Math.max(0, unit.initial - unit.lost);
                }

                // Check if we have hospital data (wounded row exists and has actual data)
                if (
                  currentUnitData[2] &&
                  currentUnitData[2][index] !== undefined &&
                  currentUnitData[2][index] !== "?" &&
                  currentUnitData[2][index] !== 0
                ) {
                  hasHospitalData = true;
                }

                units[unitName.trim()] = unit;
              }
            });

            // Add hospital data flag to the units object
            units._hasHospitalData = hasHospitalData;

            if (currentSection === "attacker") {
              report.attacker.units = units;
              // Detect tribe from units and override the bracket tribe
              const detectedTribe = detectTribeFromUnits(units);
              if (detectedTribe) {
                report.attacker.tribe = detectedTribe;
              }
            } else if (currentSection === "defender" && currentDefender) {
              currentDefender.units = units;
              // Detect tribe from units and override the bracket tribe
              const detectedTribe = detectTribeFromUnits(units);
              if (detectedTribe) {
                currentDefender.tribe = detectedTribe;
              }
            }

            // Special handling: if all attacker troops are dead and we have defender unit headers but no data,
            // create defender units with "?" counts

            if (
              report.attacker.allTroopsDead &&
              currentDefender &&
              unitHeaders.length > 0 &&
              (unitData.length === 0 ||
                (unitData.length === 1 &&
                  unitData[0].every((val) => val === "?")))
            ) {
              const defenderUnits = {};
              unitHeaders.forEach((unitName, index) => {
                if (unitName.trim()) {
                  const trimmedName = unitName.trim();
                  defenderUnits[trimmedName] = {
                    initial: "?",
                    lost: "?",
                    wounded: "?",
                    remaining: "?",
                  };
                }
              });
              currentDefender.units = defenderUnits;
            }

            // Clear unitData after processing
            unitData.length = 0;
          }
          continue;
        }
      } else {
        console.log(
          `DEBUG: Not processing units - currentSection: ${currentSection}`
        );
      }

      // Parse bounty data
      if (currentSection === "bounty") {
        // Clean the line of Unicode characters that might interfere with parsing
        const cleanLine = line.replace(/[\u202C\u202D\u202E]/g, "").trim();
        console.log("DEBUG: Bounty line:", line, "cleaned:", cleanLine);

        if (cleanLine.match(/^\d+$/) && !cleanLine.includes("/")) {
          // This is a single resource value
          if (!report.bounty) {
            report.bounty = {
              resources: [],
              total: 0,
              capacity: 0,
            };
          }
          const resourceValue = parseInt(cleanLine) || 0;
          report.bounty.resources.push(resourceValue);
          console.log(
            "DEBUG: Added bounty resource:",
            resourceValue,
            "total resources:",
            report.bounty.resources.length
          );
        } else if (cleanLine.includes("/") && report.bounty) {
          // This is the total/capacity line
          const match = cleanLine.match(/(\d+)\/(\d+)/);
          if (match) {
            report.bounty.total = parseInt(match[1]) || 0;
            report.bounty.capacity = parseInt(match[2]) || 0;
            console.log(
              "DEBUG: Set bounty total/capacity:",
              report.bounty.total,
              "/",
              report.bounty.capacity,
              "from line:",
              cleanLine
            );
          } else {
            console.log(
              "DEBUG: Failed to parse bounty total/capacity from line:",
              cleanLine
            );
          }
        }
        continue;
      }

      // Parse resources data (for scouting reports)
      if (currentSection === "resources") {
        if (line.match(/^\d+$/)) {
          // This is a single resource value
          const value = parseInt(line) || 0;

          if (!report.resources) {
            report.resources = [];
          }
          report.resources.push(value);
          console.log(
            "Added resource value:",
            value,
            "total resources:",
            report.resources.length
          );
        }
        continue;
      }

      // Parse information data
      if (currentSection === "information") {
        if (line.trim() && !line.match(/^\d+$/) && line !== "Information") {
          // This is an information line (not a number and not the section header)
          if (!report.attacker.information) {
            report.attacker.information = [];
          }
          report.attacker.information.push(line.trim());

          // Check if all attacker troops are dead
          if (
            line.includes("None of the attacker's troops have returned") ||
            line.includes("None of the attacker") ||
            line.includes("troops have returned")
          ) {
            report.attacker.allTroopsDead = true;
            console.log("DEBUG: *** ALL ATTACKER TROOPS DEAD DETECTED ***");
            console.log("DEBUG: Information line:", line);
          }
        }
        continue;
      }

      // Parse statistics
      if (currentSection === "statistics") {
        console.log("Processing statistics line:", line);

        // Skip the "Attacker	Defender" header row
        if (line === "Attacker\tDefender" || line === "Attacker	Defender") {
          console.log("Skipping header row");
          continue;
        }

        // Check if this is a stat name (no numbers, just text)
        if (!line.match(/\d/) && line.trim()) {
          // This is a stat name, look for values on next lines
          const statName = line.trim();
          console.log("Found stat name:", statName);

          if (i + 2 < lines.length) {
            const attackerValue = lines[i + 1].trim();
            const defenderValue = lines[i + 2].trim();

            console.log("Attacker value:", attackerValue);
            console.log("Defender value:", defenderValue);

            if (attackerValue.match(/\d/) && defenderValue.match(/\d/)) {
              report.statistics[statName] = {
                attacker: parseInt(attackerValue.replace(/[^\d]/g, "")) || 0,
                defender: parseInt(defenderValue.replace(/[^\d]/g, "")) || 0,
              };
              console.log(
                "Added statistic:",
                statName,
                "attacker:",
                attackerValue,
                "defender:",
                defenderValue
              );
              i += 2; // Skip the next two lines (attacker and defender values)
            } else {
              console.log("Values don't match number pattern");
            }
          } else {
            console.log("Not enough lines remaining for values");
          }
        } else if (
          line.match(/\d/) &&
          (line.includes("\t") || line.match(/\s+\d/))
        ) {
          // Alternative format: stat name and values on same line separated by tabs or spaces
          let parts;
          if (line.includes("\t")) {
            parts = line.split("\t");
          } else {
            // Split by multiple spaces
            parts = line.split(/\s+/);
          }

          if (parts.length >= 3) {
            const statName = parts[0].trim();
            const attackerValue = parts[1].trim();
            const defenderValue = parts[2].trim();

            console.log(
              "Found separated stat:",
              statName,
              attackerValue,
              defenderValue
            );

            if (attackerValue.match(/\d/) && defenderValue.match(/\d/)) {
              report.statistics[statName] = {
                attacker: parseInt(attackerValue.replace(/[^\d]/g, "")) || 0,
                defender: parseInt(defenderValue.replace(/[^\d]/g, "")) || 0,
              };
              console.log("Added separated statistic:", statName);
            }
          }
        } else {
          console.log("Line doesn't match stat name pattern:", line);
        }
        continue;
      }
    }

    // Process any remaining unit data that wasn't processed during the loop
    if (unitData.length >= 2 && unitHeaders.length > 0) {
      console.log(
        `DEBUG: Processing remaining unit data with ${unitData.length} rows for section: ${currentSection}`
      );
      const units = {};
      const currentUnitData = unitData;
      let hasHospitalData = false;

      unitHeaders.forEach((unitName, index) => {
        if (unitName.trim()) {
          const unit = {
            initial: currentUnitData[0] ? currentUnitData[0][index] || 0 : "?",
            lost: currentUnitData[1] ? currentUnitData[1][index] || 0 : "?",
            wounded: currentUnitData[2] ? currentUnitData[2][index] || 0 : "?",
            remaining: "?",
          };

          // Calculate remaining if we have both initial and lost as numbers
          if (
            unit.initial !== "?" &&
            unit.lost !== "?" &&
            typeof unit.initial === "number" &&
            typeof unit.lost === "number"
          ) {
            unit.remaining = Math.max(0, unit.initial - unit.lost);
          }

          // Check if we have hospital data (wounded row exists and has actual data)
          if (
            currentUnitData[2] &&
            currentUnitData[2][index] !== undefined &&
            currentUnitData[2][index] !== "?" &&
            currentUnitData[2][index] !== 0
          ) {
            hasHospitalData = true;
          }

          units[unitName.trim()] = unit;
        }
      });

      // Add hospital data flag to the units object
      units._hasHospitalData = hasHospitalData;
      console.log(
        `DEBUG: Final hospital data detected: ${hasHospitalData} for ${currentSection}`
      );

      if (currentSection === "attacker") {
        report.attacker.units = units;
        // Detect tribe from units and override the bracket tribe
        const detectedTribe = detectTribeFromUnits(units);
        if (detectedTribe) {
          console.log(
            `DEBUG: Detected attacker tribe from units (final): ${detectedTribe} (was: ${report.attacker.tribe})`
          );
          report.attacker.tribe = detectedTribe;
        }
      } else if (currentDefender) {
        currentDefender.units = units;
        // Detect tribe from units and override the bracket tribe
        const detectedTribe = detectTribeFromUnits(units);
        if (detectedTribe) {
          console.log(
            `DEBUG: Detected defender tribe from units (final): ${detectedTribe} (was: ${currentDefender.tribe})`
          );
          currentDefender.tribe = detectedTribe;
        }
      }
    }

    // Set result based on statistics
    if (report.statistics["Combat strength"]) {
      const attackerStrength = report.statistics["Combat strength"].attacker;
      const defenderStrength = report.statistics["Combat strength"].defender;

      if (attackerStrength > defenderStrength) {
        report.header.result = "Victory";
      } else if (attackerStrength < defenderStrength) {
        report.header.result = "Defeat";
      } else {
        report.header.result = "Draw";
      }
    } else if (report.header.type === "scout") {
      // For scouting reports (including defensive scouting), set result as "Scout"
      report.header.result = "Scout";
    }

    // Final check: if all attacker troops are dead and we have defender unit headers but no units,
    // create defender units with "?" counts
    if (report.attacker.allTroopsDead && report.defenders.length > 0) {
      report.defenders.forEach((defender) => {
        if (!defender.units || Object.keys(defender.units).length === 0) {
          // Try to detect tribe and create units with "?" counts
          const tribeUnits = getTribeUnits(defender.tribe);
          if (tribeUnits) {
            const defenderUnits = {};
            tribeUnits.forEach((unitName) => {
              defenderUnits[unitName] = {
                initial: "?",
                lost: "?",
                wounded: "?",
                remaining: "?",
              };
            });
            defender.units = defenderUnits;
          }
        }
      });
    }

    console.log("Final report:", JSON.stringify(report, null, 2));
    return report;
  } catch (error) {
    console.error("=== PARSER ERROR ===");
    console.error("Error message:", error.message);
    console.error("Error stack:", error.stack);
    console.error("Text being parsed:", text);
    throw error;
  }
}

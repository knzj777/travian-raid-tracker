// Import travian units data
import { travianUnits, testHeroUnits } from "../data/travianUnits";

// Function to get unit image by name and tribe
export const getUnitImageByName = (unitName, tribe = null) => {
  // Special debug for Ram units
  if (unitName === "Ram" || unitName === "Battering Ram") {
    console.log(
      `🔍 DEBUG: Looking for Ram/Battering Ram unit, tribe: "${tribe}"`
    );
    console.log(`🔍 DEBUG: Available tribes:`, Object.keys(travianUnits));
    if (tribe && travianUnits[tribe]) {
      console.log(
        `🔍 DEBUG: ${tribe} units:`,
        Object.keys(travianUnits[tribe].units)
      );
    }
  }

  // Universal hero image
  if (unitName.toLowerCase() === "hero") {
    console.log(`🔍 Looking for Hero image, tribe: "${tribe}"`);

    // Test the Hero units function
    const heroes = testHeroUnits();
    console.log(`🔍 testHeroUnits() result:`, heroes);

    // Find hero in any tribe and return its image
    for (const tribeKey in travianUnits) {
      const tribe = travianUnits[tribeKey];
      for (const unitKey in tribe.units) {
        const unit = tribe.units[unitKey];
        if (unit.name === "Hero") {
          console.log(`✅ Found Hero in ${tribeKey}:`, unit.image);
          return unit.image;
        }
      }
    }
    console.log(`❌ Hero not found in any tribe`);
    return null;
  }

  // If tribe is specified, search only in that tribe first
  if (tribe) {
    console.log(`🔍 Searching in specific tribe: ${tribe}`);
    // Try exact match first
    if (travianUnits[tribe]) {
      const tribeData = travianUnits[tribe];
      console.log(`🔍 Found tribe data for ${tribe}, checking units...`);
      for (const unitKey in tribeData.units) {
        const unit = tribeData.units[unitKey];
        console.log(`🔍 Checking unit: ${unit.name} (key: ${unitKey})`);
        if (
          unit.name === unitName ||
          unit.name.toLowerCase() === unitName.toLowerCase()
        ) {
          console.log(
            `✅ Found match in ${tribe}: ${unitName} -> ${unit.image} (unit name: ${unit.name})`
          );
          if (
            unitName === "Ram" ||
            unitName === "Battering Ram" ||
            unitName.toLowerCase() === "battering ram"
          ) {
            console.log(`🔍 DEBUG: Ram/Battering Ram image found:`, unit.image);
          }
          return unit.image;
        }
      }
    }

    // Try lowercase match
    const lowerTribe = tribe.toLowerCase();
    console.log(`🔍 Trying lowercase tribe: ${lowerTribe}`);
    if (travianUnits[lowerTribe]) {
      const tribeData = travianUnits[lowerTribe];
      console.log(
        `🔍 Found lowercase tribe data for ${lowerTribe}, checking units...`
      );
      for (const unitKey in tribeData.units) {
        const unit = tribeData.units[unitKey];
        console.log(`🔍 Checking unit: ${unit.name} (key: ${unitKey})`);
        if (
          unit.name === unitName ||
          unit.name.toLowerCase() === unitName.toLowerCase()
        ) {
          console.log(
            `✅ Found lowercase match in ${lowerTribe}: ${unitName} -> ${unit.image} (unit name: ${unit.name})`
          );
          if (
            unitName === "Ram" ||
            unitName === "Battering Ram" ||
            unitName.toLowerCase() === "battering ram"
          ) {
            console.log(
              `🔍 DEBUG: Ram/Battering Ram image found (lowercase):`,
              unit.image
            );
          }
          return unit.image;
        }
      }
    }
  }

  // Search through all tribes to find the unit
  console.log(`🔍 Searching through all tribes for: ${unitName}`);
  for (const tribeKey in travianUnits) {
    const tribe = travianUnits[tribeKey];
    console.log(`🔍 Checking tribe: ${tribeKey} (${tribe.name})`);
    for (const unitKey in tribe.units) {
      const unit = tribe.units[unitKey];
      console.log(`🔍 Checking unit: ${unit.name} (key: ${unitKey})`);
      if (
        unit.name === unitName ||
        unit.name.toLowerCase() === unitName.toLowerCase()
      ) {
        console.log(
          `✅ Found unit in ${tribeKey}: ${unitName} -> ${unit.image} (unit name: ${unit.name})`
        );
        if (
          unitName === "Ram" ||
          unitName === "Battering Ram" ||
          unitName.toLowerCase() === "battering ram"
        ) {
          console.log(
            `🔍 DEBUG: Ram/Battering Ram image found (global):`,
            unit.image
          );
        }
        return unit.image; // Return the actual image object
      }
    }
  }

  // Fallback - return null if not found
  console.log(`❌ Unit not found: ${unitName}`);
  return null;
};

// Function to find unit data by name
export const getUnitDataByName = (unitName, tribe = null) => {
  const normalizedName = unitName.trim().toLowerCase();

  // If tribe is specified, search in that tribe first
  if (tribe) {
    const tribeKey = tribe.toLowerCase();
    if (travianUnits[tribeKey]) {
      const tribeData = travianUnits[tribeKey];
      for (const unitKey in tribeData.units) {
        const unit = tribeData.units[unitKey];
        const normalizedUnitName = unit.name.trim().toLowerCase();

        if (normalizedUnitName === normalizedName) {
          return {
            ...unit,
            tribe: tribeKey,
            tribeName: tribeData.name,
          };
        }
      }
    }
  }

  // Search through all tribes if not found in specific tribe
  for (const tribeKey in travianUnits) {
    const tribe = travianUnits[tribeKey];
    for (const unitKey in tribe.units) {
      const unit = tribe.units[unitKey];
      const normalizedUnitName = unit.name.trim().toLowerCase();

      if (normalizedUnitName === normalizedName) {
        return {
          ...unit,
          tribe: tribeKey,
          tribeName: tribe.name,
        };
      }
    }
  }

  return null;
};

// Function to find unit by name and get its icon
export const getUnitIconByName = (unitName) => {
  // Since we're using image files, just return null
  return null;
};

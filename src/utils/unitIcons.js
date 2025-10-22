// Import travian units data
import { travianUnits, testHeroUnits } from "../data/travianUnits";

// Function to get unit image by name and tribe
export const getUnitImageByName = (unitName, tribe = null) => {
  // Special handling for Ram units
  if (unitName === "Ram" || unitName === "Battering Ram") {
    if (tribe && travianUnits[tribe]) {
      // Intentionally left empty
    }
  }

  // Universal hero image
  if (unitName.toLowerCase() === "hero") {
    // Test the Hero units function
    testHeroUnits();

    // Find hero in any tribe and return its image
    for (const tribeKey in travianUnits) {
      const tribe = travianUnits[tribeKey];
      for (const unitKey in tribe.units) {
        const unit = tribe.units[unitKey];
        if (unit.name === "Hero") {
          return unit.image;
        }
      }
    }
    return null;
  }

  // If tribe is specified, search only in that tribe first
  if (tribe) {
    // Try exact match first
    if (travianUnits[tribe]) {
      const tribeData = travianUnits[tribe];
      for (const unitKey in tribeData.units) {
        const unit = tribeData.units[unitKey];
        if (
          unit.name === unitName ||
          unit.name.toLowerCase() === unitName.toLowerCase()
        ) {
          if (
            unitName === "Ram" ||
            unitName === "Battering Ram" ||
            unitName.toLowerCase() === "battering ram"
          ) {
            // Ram handling
          }
          return unit.image;
        }
      }
    }

    // Try lowercase match
    const lowerTribe = tribe.toLowerCase();
    if (travianUnits[lowerTribe]) {
      const tribeData = travianUnits[lowerTribe];
      for (const unitKey in tribeData.units) {
        const unit = tribeData.units[unitKey];
        if (
          unit.name === unitName ||
          unit.name.toLowerCase() === unitName.toLowerCase()
        ) {
          if (
            unitName === "Ram" ||
            unitName === "Battering Ram" ||
            unitName.toLowerCase() === "battering ram"
          ) {
            // Ram handling
          }
          return unit.image;
        }
      }
    }
  }

  // Search through all tribes to find the unit
  for (const tribeKey in travianUnits) {
    const tribe = travianUnits[tribeKey];
    for (const unitKey in tribe.units) {
      const unit = tribe.units[unitKey];
      if (
        unit.name === unitName ||
        unit.name.toLowerCase() === unitName.toLowerCase()
      ) {
        if (
          unitName === "Ram" ||
          unitName === "Battering Ram" ||
          unitName.toLowerCase() === "battering ram"
        ) {
          // Ram handling
        }
        return unit.image; // Return the actual image object
      }
    }
  }

  // Fallback - return null if not found
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

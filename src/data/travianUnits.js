// Import all unit images
import phalanxImage from "../images/units-icons/phalanx.png";
import swordsmanImage from "../images/units-icons/swordsman.png";
import pathfinderImage from "../images/units-icons/pathfinder.png";
import theutatesThunderImage from "../images/units-icons/theutates-thunder.png";
import druidriderImage from "../images/units-icons/druidrider.png";
import haeduanImage from "../images/units-icons/haeduan.png";
import trebuchetImage from "../images/units-icons/trebuchet.png";
import chieftainImage from "../images/units-icons/chieftain.png";
import ramGaulsImage from "../images/units-icons/ram-gauls.png";
import settlerGaulsImage from "../images/units-icons/settler-gauls.png";

import legionnaireImage from "../images/units-icons/legionnaire.png";
import praetorianImage from "../images/units-icons/praetorian.png";
import imperianImage from "../images/units-icons/imperian.png";
import equitesLegatiImage from "../images/units-icons/equites-legati.png";
import equitesImperatorisImage from "../images/units-icons/equites-imperatoris.png";
import equitesCaesarisImage from "../images/units-icons/equites-caesaris.png";
import ramRomansImage from "../images/units-icons/ram-romans.png";
import fireCatapultImage from "../images/units-icons/fire-catapult.png";
import senatorImage from "../images/units-icons/senator.png";
import settlerRomansImage from "../images/units-icons/settler-romans.png";

import clubswingerImage from "../images/units-icons/clubswinger.png";
import spearmanImage from "../images/units-icons/spearman.png";
import axemanImage from "../images/units-icons/axeman.png";
import scoutImage from "../images/units-icons/scout.png";
import paladinImage from "../images/units-icons/paladin.png";
import teutonicKnightImage from "../images/units-icons/teutonic-knight.png";
import ramTeutonsImage from "../images/units-icons/ram-teutons.png";
import catapultTeutonsImage from "../images/units-icons/catapult-teutons.png";
import chiefImage from "../images/units-icons/chief.png";
import settlerTeutonsImage from "../images/units-icons/settler-teutons.png";

import slaveMilitiaImage from "../images/units-icons/slave-militia.png";
import ashWardenImage from "../images/units-icons/ash-warden.png";
import khopeshWarriorImage from "../images/units-icons/khopesh-warrior.png";
import sopduExplorerImage from "../images/units-icons/sopdu-explorer.png";
import anhurGuardImage from "../images/units-icons/anhur-guard.png";
import reshephChariotImage from "../images/units-icons/resheph-chariot.png";
import ramEgyptiansImage from "../images/units-icons/ram-egyptians.png";
import stoneCatapultImage from "../images/units-icons/stone-catapult.png";
import nomarchImage from "../images/units-icons/nomarch.png";
import settlerEgyptiansImage from "../images/units-icons/settler-egyptians.png";

import hopliteImage from "../images/units-icons/hoplite.png";
import sentinelImage from "../images/units-icons/sentinel.png";
import shieldsmanImage from "../images/units-icons/shieldsman.png";
import twinsteelTherionImage from "../images/units-icons/twinsteel-therion.png";
import elpidaRiderImage from "../images/units-icons/elpida-rider.png";
import corinthianCrusherImage from "../images/units-icons/corinthian-crusher.png";
import ramSpartansImage from "../images/units-icons/ram-spartans.png";
import ballistaImage from "../images/units-icons/ballista.png";
import ephorImage from "../images/units-icons/ephor.png";
import settlerSpartansImage from "../images/units-icons/settler-spartans.png";

import mercenaryImage from "../images/units-icons/mercenary.png";
import bowmanImage from "../images/units-icons/bowman.png";
import spotterImage from "../images/units-icons/spotter.png";
import steppeRiderImage from "../images/units-icons/steppe-rider.png";
import marksmanImage from "../images/units-icons/marksman.png";
import marauderImage from "../images/units-icons/marauder.png";
import ramHunsImage from "../images/units-icons/ram-hun.png";
import catapultHunsImage from "../images/units-icons/catapult-hun.png";
import logadesImage from "../images/units-icons/logades.png";
import settlerHunsImage from "../images/units-icons/settler-hun.png";
import heroImage from "../images/units-icons/hero.png";

// Travian Units Database - All 6 Tribes with Complete Stats
// Updated with Hero units for all tribes
// Test export to verify Hero units are included
export const testHeroUnits = () => {
  const heroes = [];
  for (const tribeKey in travianUnits) {
    const tribe = travianUnits[tribeKey];
    for (const unitKey in tribe.units) {
      const unit = tribe.units[unitKey];
      if (unit.name === "Hero") {
        heroes.push({ tribe: tribeKey, unit: unitKey, hero: unit });
      }
    }
  }
  return heroes;
};

export const travianUnits = {
  gauls: {
    name: "Gauls",
    description: "Defensive tribe with strong infantry and cavalry",
    units: {
      phalanx: {
        name: "Phalanx",
        type: "infantry",
        icon: "shield-spear",
        image: phalanxImage,
        cost: {
          lumber: 100,
          clay: 130,
          iron: 55,
          crop: 20,
        },
        stats: {
          attack: 15,
          defenseInfantry: 40,
          defenseCavalry: 50,
          velocity: 14, // fields/hour
          carryCapacity: 35,
          upkeep: 1, // crop
          trainingTime: "0:05:47", // hours:minutes:seconds
        },
      },
      swordsman: {
        name: "Swordsman",
        type: "infantry",
        icon: "sword-cross",
        image: swordsmanImage,
        cost: {
          lumber: 140,
          clay: 150,
          iron: 185,
          crop: 60,
        },
        stats: {
          attack: 65,
          defenseInfantry: 35,
          defenseCavalry: 20,
          velocity: 12,
          carryCapacity: 45,
          upkeep: 1,
          trainingTime: "0:08:00",
        },
      },
      pathfinder: {
        name: "Pathfinder",
        type: "infantry",
        icon: "pathfinder-eye",
        image: pathfinderImage,
        cost: {
          lumber: 170,
          clay: 150,
          iron: 20,
          crop: 40,
        },
        stats: {
          attack: 0,
          defenseInfantry: 20,
          defenseCavalry: 10,
          velocity: 34,
          carryCapacity: 0,
          upkeep: 2,
          trainingTime: "0:07:33",
        },
      },
      theutatesThunder: {
        name: "Theutates Thunder",
        type: "cavalry",
        icon: "thunder-horse",
        image: theutatesThunderImage,
        cost: {
          lumber: 350,
          clay: 450,
          iron: 230,
          crop: 60,
        },
        stats: {
          attack: 100,
          defenseInfantry: 25,
          defenseCavalry: 40,
          velocity: 38,
          carryCapacity: 75,
          upkeep: 2,
          trainingTime: "0:13:47",
        },
      },
      druidrider: {
        name: "Druidrider",
        type: "cavalry",
        image: druidriderImage,
        cost: {
          lumber: 360,
          clay: 330,
          iron: 280,
          crop: 120,
        },
        stats: {
          attack: 45,
          defenseInfantry: 115,
          defenseCavalry: 55,
          velocity: 32,
          carryCapacity: 35,
          upkeep: 2,
          trainingTime: "0:14:13",
        },
      },
      haeduan: {
        name: "Haeduan",
        type: "cavalry",
        image: haeduanImage,
        cost: {
          lumber: 500,
          clay: 620,
          iron: 675,
          crop: 170,
        },
        stats: {
          attack: 140,
          defenseInfantry: 60,
          defenseCavalry: 165,
          velocity: 26,
          carryCapacity: 65,
          upkeep: 3,
          trainingTime: "0:17:20",
        },
      },
      ram: {
        name: "Ram",
        type: "siege",
        icon: "ram-battering",
        image: ramGaulsImage,
        cost: {
          lumber: 950,
          clay: 555,
          iron: 330,
          crop: 75,
        },
        stats: {
          attack: 50,
          defenseInfantry: 30,
          defenseCavalry: 105,
          velocity: 8,
          carryCapacity: 0,
          upkeep: 3,
          trainingTime: "0:27:47",
        },
      },
      trebuchet: {
        name: "Trebuchet",
        type: "siege",
        image: trebuchetImage,
        cost: {
          lumber: 960,
          clay: 1450,
          iron: 630,
          crop: 90,
        },
        stats: {
          attack: 70,
          defenseInfantry: 45,
          defenseCavalry: 10,
          velocity: 6,
          carryCapacity: 0,
          upkeep: 6,
          trainingTime: "0:50:00",
        },
      },
      chieftain: {
        name: "Chieftain",
        type: "special",
        image: chieftainImage,
        cost: {
          lumber: 30750,
          clay: 45400,
          iron: 31000,
          crop: 37500,
        },
        stats: {
          attack: 40,
          defenseInfantry: 50,
          defenseCavalry: 50,
          velocity: 10,
          carryCapacity: 0,
          upkeep: 4,
          trainingTime: "08:23:53",
        },
      },
      settlerGauls: {
        name: "Settler",
        type: "special",
        image: settlerGaulsImage,
        cost: {
          lumber: 4400,
          clay: 5600,
          iron: 4200,
          crop: 3900,
        },
        stats: {
          attack: 0,
          defenseInfantry: 80,
          defenseCavalry: 80,
          velocity: 10,
          carryCapacity: 3000,
          upkeep: 1,
          trainingTime: "02:06:07",
        },
      },
      hero: {
        name: "Hero",
        type: "special",
        image: heroImage,
        cost: {
          lumber: 0,
          clay: 0,
          iron: 0,
          crop: 0,
        },
        stats: {
          attack: 0,
          defenseInfantry: 0,
          defenseCavalry: 0,
          velocity: 0,
          carryCapacity: 0,
          upkeep: 0,
          trainingTime: "0:00:00",
        },
      },
    },
  },

  teutons: {
    name: "Teutons",
    description: "Offensive tribe with powerful infantry",
    units: {
      clubswinger: {
        name: "Clubswinger",
        type: "infantry",
        image: clubswingerImage,
        cost: {
          lumber: 95,
          clay: 75,
          iron: 40,
          crop: 40,
        },
        stats: {
          attack: 40,
          defenseInfantry: 20,
          defenseCavalry: 5,
          velocity: 14,
          carryCapacity: 60,
          upkeep: 1,
          trainingTime: "0:04:00",
        },
      },
      spearman: {
        name: "Spearman",
        type: "infantry",
        image: spearmanImage,
        cost: {
          lumber: 145,
          clay: 70,
          iron: 85,
          crop: 40,
        },
        stats: {
          attack: 10,
          defenseInfantry: 35,
          defenseCavalry: 60,
          velocity: 14,
          carryCapacity: 40,
          upkeep: 1,
          trainingTime: "0:06:13",
        },
      },
      axeman: {
        name: "Axeman",
        type: "infantry",
        image: axemanImage,
        cost: {
          lumber: 130,
          clay: 120,
          iron: 170,
          crop: 70,
        },
        stats: {
          attack: 60,
          defenseInfantry: 30,
          defenseCavalry: 30,
          velocity: 12,
          carryCapacity: 50,
          upkeep: 1,
          trainingTime: "0:06:40",
        },
      },
      scout: {
        name: "Scout",
        type: "infantry",
        image: scoutImage,
        cost: {
          lumber: 160,
          clay: 100,
          iron: 50,
          crop: 50,
        },
        stats: {
          attack: 0,
          defenseInfantry: 10,
          defenseCavalry: 5,
          velocity: 18,
          carryCapacity: 0,
          upkeep: 1,
          trainingTime: "0:06:13",
        },
      },
      paladin: {
        name: "Paladin",
        type: "cavalry",
        image: paladinImage,
        cost: {
          lumber: 370,
          clay: 270,
          iron: 290,
          crop: 75,
        },
        stats: {
          attack: 55,
          defenseInfantry: 100,
          defenseCavalry: 40,
          velocity: 20,
          carryCapacity: 110,
          upkeep: 2,
          trainingTime: "0:13:20",
        },
      },
      teutonicKnight: {
        name: "Teutonic Knight",
        type: "cavalry",
        image: teutonicKnightImage,
        cost: {
          lumber: 450,
          clay: 515,
          iron: 480,
          crop: 80,
        },
        stats: {
          attack: 150,
          defenseInfantry: 50,
          defenseCavalry: 75,
          velocity: 18,
          carryCapacity: 80,
          upkeep: 3,
          trainingTime: "0:16:27",
        },
      },
      ram: {
        name: "Ram",
        type: "siege",
        image: ramTeutonsImage,
        cost: {
          lumber: 1000,
          clay: 300,
          iron: 350,
          crop: 70,
        },
        stats: {
          attack: 65,
          defenseInfantry: 30,
          defenseCavalry: 80,
          velocity: 8,
          carryCapacity: 0,
          upkeep: 3,
          trainingTime: "0:23:20",
        },
      },
      catapult: {
        name: "Catapult",
        type: "siege",
        image: catapultTeutonsImage,
        cost: {
          lumber: 900,
          clay: 1200,
          iron: 600,
          crop: 60,
        },
        stats: {
          attack: 50,
          defenseInfantry: 60,
          defenseCavalry: 10,
          velocity: 6,
          carryCapacity: 0,
          upkeep: 6,
          trainingTime: "0:50:00",
        },
      },
      chief: {
        name: "Chief",
        type: "special",
        image: chiefImage,
        cost: {
          lumber: 35550,
          clay: 26600,
          iron: 25000,
          crop: 27200,
        },
        stats: {
          attack: 40,
          defenseInfantry: 60,
          defenseCavalry: 40,
          velocity: 8,
          carryCapacity: 0,
          upkeep: 4,
          trainingTime: "6:31:40",
        },
      },
      settlerTeutons: {
        name: "Settler",
        type: "special",
        image: settlerTeutonsImage,
        cost: {
          lumber: 5800,
          clay: 4400,
          iron: 4600,
          crop: 5200,
        },
        stats: {
          attack: 0,
          defenseInfantry: 80,
          defenseCavalry: 80,
          velocity: 10,
          carryCapacity: 3000,
          upkeep: 1,
          trainingTime: "02:52:13",
        },
      },
      hero: {
        name: "Hero",
        type: "special",
        image: heroImage,
        cost: {
          lumber: 0,
          clay: 0,
          iron: 0,
          crop: 0,
        },
        stats: {
          attack: 0,
          defenseInfantry: 0,
          defenseCavalry: 0,
          velocity: 0,
          carryCapacity: 0,
          upkeep: 0,
          trainingTime: "0:00:00",
        },
      },
    },
  },

  romans: {
    name: "Romans",
    description: "Balanced tribe with versatile units",
    units: {
      legionnaire: {
        name: "Legionnaire",
        type: "infantry",
        image: legionnaireImage,
        cost: {
          lumber: 120,
          clay: 100,
          iron: 150,
          crop: 30,
        },
        stats: {
          attack: 40,
          defenseInfantry: 35,
          defenseCavalry: 50,
          velocity: 12,
          carryCapacity: 50,
          upkeep: 1,
          trainingTime: "0:08:53",
        },
      },
      praetorian: {
        name: "Praetorian",
        type: "infantry",
        image: praetorianImage,
        cost: {
          lumber: 100,
          clay: 130,
          iron: 160,
          crop: 70,
        },
        stats: {
          attack: 30,
          defenseInfantry: 65,
          defenseCavalry: 35,
          velocity: 10,
          carryCapacity: 20,
          upkeep: 1,
          trainingTime: "0:09:47",
        },
      },
      imperian: {
        name: "Imperian",
        type: "infantry",
        image: imperianImage,
        cost: {
          lumber: 150,
          clay: 160,
          iron: 210,
          crop: 80,
        },
        stats: {
          attack: 70,
          defenseInfantry: 40,
          defenseCavalry: 25,
          velocity: 14,
          carryCapacity: 50,
          upkeep: 1,
          trainingTime: "0:10:40",
        },
      },
      equitesLegati: {
        name: "Equites Legati",
        type: "cavalry",
        image: equitesLegatiImage,
        cost: {
          lumber: 140,
          clay: 160,
          iron: 20,
          crop: 40,
        },
        stats: {
          attack: 0,
          defenseInfantry: 20,
          defenseCavalry: 10,
          velocity: 32,
          carryCapacity: 0,
          upkeep: 2,
          trainingTime: "0:07:33",
        },
      },
      equitesImperatoris: {
        name: "Equites Imperatoris",
        type: "cavalry",
        image: equitesImperatorisImage,
        cost: {
          lumber: 550,
          clay: 440,
          iron: 320,
          crop: 100,
        },
        stats: {
          attack: 120,
          defenseInfantry: 65,
          defenseCavalry: 50,
          velocity: 28,
          carryCapacity: 100,
          upkeep: 3,
          trainingTime: "0:14:40",
        },
      },
      equitesCaesaris: {
        name: "Equites Caesaris",
        type: "cavalry",
        image: equitesCaesarisImage,
        cost: {
          lumber: 550,
          clay: 640,
          iron: 800,
          crop: 180,
        },
        stats: {
          attack: 180,
          defenseInfantry: 80,
          defenseCavalry: 105,
          velocity: 20,
          carryCapacity: 70,
          upkeep: 4,
          trainingTime: "0:19:33",
        },
      },
      ram: {
        name: "Battering Ram",
        type: "siege",
        image: ramRomansImage,
        cost: {
          lumber: 900,
          clay: 360,
          iron: 500,
          crop: 70,
        },
        stats: {
          attack: 60,
          defenseInfantry: 30,
          defenseCavalry: 75,
          velocity: 8,
          carryCapacity: 0,
          upkeep: 3,
          trainingTime: "0:25:33",
        },
      },
      fireCatapult: {
        name: "Fire Catapult",
        type: "siege",
        image: fireCatapultImage,
        cost: {
          lumber: 950,
          clay: 1350,
          iron: 600,
          crop: 90,
        },
        stats: {
          attack: 75,
          defenseInfantry: 60,
          defenseCavalry: 10,
          velocity: 6,
          carryCapacity: 0,
          upkeep: 6,
          trainingTime: "0:50:00",
        },
      },
      senator: {
        name: "Senator",
        type: "special",
        image: senatorImage,
        cost: {
          lumber: 30750,
          clay: 27200,
          iron: 45000,
          crop: 37500,
        },
        stats: {
          attack: 50,
          defenseInfantry: 40,
          defenseCavalry: 30,
          velocity: 8,
          carryCapacity: 0,
          upkeep: 5,
          trainingTime: "08:23:53",
        },
      },
      settlerRomans: {
        name: "Settler",
        type: "special",
        image: settlerRomansImage,
        cost: {
          lumber: 4600,
          clay: 4200,
          iron: 5800,
          crop: 4400,
        },
        stats: {
          attack: 0,
          defenseInfantry: 80,
          defenseCavalry: 80,
          velocity: 10,
          carryCapacity: 3000,
          upkeep: 1,
          trainingTime: "02:29:27",
        },
      },
      hero: {
        name: "Hero",
        type: "special",
        image: heroImage,
        cost: {
          lumber: 0,
          clay: 0,
          iron: 0,
          crop: 0,
        },
        stats: {
          attack: 0,
          defenseInfantry: 0,
          defenseCavalry: 0,
          velocity: 0,
          carryCapacity: 0,
          upkeep: 0,
          trainingTime: "0:00:00",
        },
      },
    },
  },

  huns: {
    name: "Huns",
    description: "Fast cavalry-focused tribe",
    units: {
      mercenary: {
        name: "Mercenary",
        type: "infantry",
        image: mercenaryImage,
        cost: {
          lumber: 130,
          clay: 80,
          iron: 40,
          crop: 40,
        },
        stats: {
          attack: 35,
          defenseInfantry: 40,
          defenseCavalry: 30,
          velocity: 12,
          carryCapacity: 50,
          upkeep: 1,
          trainingTime: "0:04:30",
        },
      },
      bowman: {
        name: "Bowman",
        type: "infantry",
        image: bowmanImage,
        cost: {
          lumber: 140,
          clay: 110,
          iron: 60,
          crop: 60,
        },
        stats: {
          attack: 50,
          defenseInfantry: 30,
          defenseCavalry: 10,
          velocity: 12,
          carryCapacity: 30,
          upkeep: 1,
          trainingTime: "0:06:13",
        },
      },
      spotter: {
        name: "Spotter",
        type: "scout",
        image: spotterImage,
        cost: {
          lumber: 170,
          clay: 150,
          iron: 20,
          crop: 40,
        },
        stats: {
          attack: 0,
          defenseInfantry: 20,
          defenseCavalry: 10,
          velocity: 38,
          carryCapacity: 0,
          upkeep: 1,
          trainingTime: "0:07:33",
        },
      },
      steppeRider: {
        name: "Steppe Rider",
        type: "cavalry",
        icon: "horse-archer",
        image: steppeRiderImage,
        cost: {
          lumber: 290,
          clay: 370,
          iron: 190,
          crop: 45,
        },
        stats: {
          attack: 120,
          defenseInfantry: 30,
          defenseCavalry: 15,
          velocity: 32,
          carryCapacity: 75,
          upkeep: 2,
          trainingTime: "0:13:20",
        },
      },
      marksman: {
        name: "Marksman",
        type: "cavalry",
        image: marksmanImage,
        cost: {
          lumber: 320,
          clay: 350,
          iron: 330,
          crop: 50,
        },
        stats: {
          attack: 110,
          defenseInfantry: 80,
          defenseCavalry: 70,
          velocity: 30,
          carryCapacity: 105,
          upkeep: 2,
          trainingTime: "0:13:47",
        },
      },
      marauder: {
        name: "Marauder",
        type: "cavalry",
        image: marauderImage,
        cost: {
          lumber: 450,
          clay: 560,
          iron: 610,
          crop: 140,
        },
        stats: {
          attack: 180,
          defenseInfantry: 60,
          defenseCavalry: 40,
          velocity: 28,
          carryCapacity: 80,
          upkeep: 3,
          trainingTime: "0:16:37",
        },
      },
      ram: {
        name: "Ram",
        type: "siege",
        image: ramHunsImage,
        cost: {
          lumber: 1060,
          clay: 330,
          iron: 360,
          crop: 70,
        },
        stats: {
          attack: 65,
          defenseInfantry: 30,
          defenseCavalry: 90,
          velocity: 8,
          carryCapacity: 0,
          upkeep: 3,
          trainingTime: "0:24:27",
        },
      },
      catapult: {
        name: "Catapult",
        type: "siege",
        image: catapultHunsImage,
        cost: {
          lumber: 950,
          clay: 1280,
          iron: 620,
          crop: 60,
        },
        stats: {
          attack: 45,
          defenseInfantry: 55,
          defenseCavalry: 10,
          velocity: 6,
          carryCapacity: 0,
          upkeep: 6,
          trainingTime: "0:50:00",
        },
      },
      logades: {
        name: "Logades",
        type: "special",
        image: logadesImage,
        cost: {
          lumber: 37200,
          clay: 27600,
          iron: 25200,
          crop: 27600,
        },
        stats: {
          attack: 50,
          defenseInfantry: 40,
          defenseCavalry: 30,
          velocity: 10,
          carryCapacity: 0,
          upkeep: 4,
          trainingTime: "08:23:53",
        },
      },
      settlerHuns: {
        name: "Settler",
        type: "special",
        image: settlerHunsImage,
        cost: {
          lumber: 6100,
          clay: 4600,
          iron: 4800,
          crop: 5400,
        },
        stats: {
          attack: 10,
          defenseInfantry: 80,
          defenseCavalry: 80,
          velocity: 10,
          carryCapacity: 3000,
          upkeep: 1,
          trainingTime: "02:40:50",
        },
      },
      hero: {
        name: "Hero",
        type: "special",
        image: heroImage,
        cost: {
          lumber: 0,
          clay: 0,
          iron: 0,
          crop: 0,
        },
        stats: {
          attack: 0,
          defenseInfantry: 0,
          defenseCavalry: 0,
          velocity: 0,
          carryCapacity: 0,
          upkeep: 0,
          trainingTime: "0:00:00",
        },
      },
    },
  },

  egyptians: {
    name: "Egyptians",
    description: "Defensive tribe with strong ranged units",
    units: {
      slaveMilitia: {
        name: "Slave Militia",
        type: "infantry",
        image: slaveMilitiaImage,
        cost: {
          lumber: 45,
          clay: 60,
          iron: 30,
          crop: 15,
        },
        stats: {
          attack: 10,
          defenseInfantry: 30,
          defenseCavalry: 20,
          velocity: 14,
          carryCapacity: 15,
          upkeep: 1,
          trainingTime: "0:02:57",
        },
      },
      ashWarden: {
        name: "Ash Warden",
        type: "infantry",
        image: ashWardenImage,
        cost: {
          lumber: 115,
          clay: 100,
          iron: 145,
          crop: 60,
        },
        stats: {
          attack: 30,
          defenseInfantry: 55,
          defenseCavalry: 40,
          velocity: 12,
          carryCapacity: 50,
          upkeep: 2,
          trainingTime: "0:07:40",
        },
      },
      khopeshWarrior: {
        name: "Khopesh Warrior",
        type: "infantry",
        image: khopeshWarriorImage,
        cost: {
          lumber: 170,
          clay: 1800,
          iron: 220,
          crop: 80,
        },
        stats: {
          attack: 65,
          defenseInfantry: 50,
          defenseCavalry: 20,
          velocity: 14,
          carryCapacity: 45,
          upkeep: 2,
          trainingTime: "0:08:00",
        },
      },
      spoduExplorer: {
        name: "Sopdu Explorer",
        type: "scout",
        image: sopduExplorerImage,
        cost: {
          lumber: 170,
          clay: 150,
          iron: 20,
          crop: 40,
        },
        stats: {
          attack: 50,
          defenseInfantry: 50,
          defenseCavalry: 50,
          velocity: 5,
          carryCapacity: 0,
          upkeep: 2,
          trainingTime: "0:00:30",
        },
      },
      anhurGuard: {
        name: "Anhur Guard",
        type: "cavalry",
        image: anhurGuardImage,
        cost: {
          lumber: 360,
          clay: 330,
          iron: 280,
          crop: 120,
        },
        stats: {
          attack: 50,
          defenseInfantry: 110,
          defenseCavalry: 50,
          velocity: 30,
          carryCapacity: 50,
          upkeep: 2,
          trainingTime: "0:14:13",
        },
      },
      reshephChariot: {
        name: "Resheph Chariot",
        type: "cavalry",
        image: reshephChariotImage,
        cost: {
          lumber: 450,
          clay: 560,
          iron: 610,
          crop: 180,
        },
        stats: {
          attack: 110,
          defenseInfantry: 120,
          defenseCavalry: 150,
          velocity: 20,
          carryCapacity: 70,
          upkeep: 3,
          trainingTime: "0:18:00",
        },
      },
      ram: {
        name: "Ram",
        type: "siege",
        image: ramEgyptiansImage,
        cost: {
          lumber: 995,
          clay: 575,
          iron: 340,
          crop: 80,
        },
        stats: {
          attack: 55,
          defenseInfantry: 30,
          defenseCavalry: 95,
          velocity: 8,
          carryCapacity: 0,
          upkeep: 3,
          trainingTime: "0:26:40",
        },
      },
      stoneCatapult: {
        name: "Stone Catapult",
        type: "siege",
        image: stoneCatapultImage,
        cost: {
          lumber: 980,
          clay: 1510,
          iron: 660,
          crop: 100,
        },
        stats: {
          attack: 65,
          defenseInfantry: 55,
          defenseCavalry: 10,
          velocity: 6,
          carryCapacity: 0,
          upkeep: 6,
          trainingTime: "0:50:00",
        },
      },
      nomarch: {
        name: "Nomarch",
        type: "special",
        image: nomarchImage,
        cost: {
          lumber: 34000,
          clay: 50000,
          iron: 34000,
          crop: 42000,
        },
        stats: {
          attack: 40,
          defenseInfantry: 50,
          defenseCavalry: 50,
          velocity: 8,
          carryCapacity: 0,
          upkeep: 4,
          trainingTime: "08:23:53",
        },
      },
      settlerEgyptians: {
        name: "Settler",
        type: "special",
        image: settlerEgyptiansImage,
        cost: {
          lumber: 5040,
          clay: 6510,
          iron: 4830,
          crop: 4620,
        },
        stats: {
          attack: 0,
          defenseInfantry: 80,
          defenseCavalry: 80,
          velocity: 10,
          carryCapacity: 3000,
          upkeep: 1,
          trainingTime: "02:17:47",
        },
      },
      hero: {
        name: "Hero",
        type: "special",
        image: heroImage,
        cost: {
          lumber: 0,
          clay: 0,
          iron: 0,
          crop: 0,
        },
        stats: {
          attack: 0,
          defenseInfantry: 0,
          defenseCavalry: 0,
          velocity: 0,
          carryCapacity: 0,
          upkeep: 0,
          trainingTime: "0:00:00",
        },
      },
    },
  },

  spartans: {
    name: "Spartans",
    description: "Elite defensive tribe with powerful infantry",
    units: {
      hoplite: {
        name: "Hoplite",
        type: "infantry",
        image: hopliteImage,
        cost: {
          lumber: 110,
          clay: 185,
          iron: 110,
          crop: 35,
        },
        stats: {
          attack: 50,
          defenseInfantry: 35,
          defenseCavalry: 30,
          velocity: 12,
          carryCapacity: 60,
          upkeep: 1,
          trainingTime: "0:09:27",
        },
      },
      sentinel: {
        name: "Sentinel",
        type: "scout",
        image: sentinelImage,
        cost: {
          lumber: 185,
          clay: 150,
          iron: 35,
          crop: 75,
        },
        stats: {
          attack: 0,
          defenseInfantry: 40,
          defenseCavalry: 22,
          velocity: 18,
          carryCapacity: 0,
          upkeep: 1,
          trainingTime: "0:06:51",
        },
      },
      shieldsman: {
        name: "Shieldsman",
        type: "infantry",
        image: shieldsmanImage,
        cost: {
          lumber: 145,
          clay: 95,
          iron: 245,
          crop: 45,
        },
        stats: {
          attack: 40,
          defenseInfantry: 85,
          defenseCavalry: 45,
          velocity: 16,
          carryCapacity: 40,
          upkeep: 1,
          trainingTime: "0:10:45",
        },
      },
      twinsteelTherion: {
        name: "Twinsteel Therion",
        type: "infantry",
        image: twinsteelTherionImage,
        cost: {
          lumber: 130,
          clay: 200,
          iron: 400,
          crop: 65,
        },
        stats: {
          attack: 90,
          defenseInfantry: 55,
          defenseCavalry: 40,
          velocity: 12,
          carryCapacity: 50,
          upkeep: 1,
          trainingTime: "0:11:54",
        },
      },
      elpidaRider: {
        name: "Elpida Rider",
        type: "cavalry",
        image: elpidaRiderImage,
        cost: {
          lumber: 555,
          clay: 445,
          iron: 330,
          crop: 110,
        },
        stats: {
          attack: 55,
          defenseInfantry: 120,
          defenseCavalry: 90,
          velocity: 32,
          carryCapacity: 110,
          upkeep: 2,
          trainingTime: "0:15:39",
        },
      },
      corinthianCrusher: {
        name: "Corinthian Crusher",
        type: "cavalry",
        image: corinthianCrusherImage,
        cost: {
          lumber: 660,
          clay: 495,
          iron: 995,
          crop: 165,
        },
        stats: {
          attack: 195,
          defenseInfantry: 80,
          defenseCavalry: 75,
          velocity: 18,
          carryCapacity: 80,
          upkeep: 3,
          trainingTime: "0:19:04",
        },
      },
      ram: {
        name: "Ram",
        type: "siege",
        image: ramSpartansImage,
        cost: {
          lumber: 525,
          clay: 360,
          iron: 790,
          crop: 130,
        },
        stats: {
          attack: 65,
          defenseInfantry: 30,
          defenseCavalry: 80,
          velocity: 8,
          carryCapacity: 0,
          upkeep: 3,
          trainingTime: "0:25:40",
        },
      },
      ballista: {
        name: "Ballista",
        type: "siege",
        image: ballistaImage,
        cost: {
          lumber: 550,
          clay: 1240,
          iron: 825,
          crop: 135,
        },
        stats: {
          attack: 50,
          defenseInfantry: 60,
          defenseCavalry: 10,
          velocity: 6,
          carryCapacity: 0,
          upkeep: 6,
          trainingTime: "0:50:00",
        },
      },
      ephor: {
        name: "Ephor",
        type: "special",
        image: ephorImage,
        cost: {
          lumber: 33450,
          clay: 30665,
          iron: 36240,
          crop: 13935,
        },
        stats: {
          attack: 40,
          defenseInfantry: 60,
          defenseCavalry: 40,
          velocity: 8,
          carryCapacity: 0,
          upkeep: 4,
          trainingTime: "07:10:50",
        },
      },
      settlerSpartans: {
        name: "Settler",
        type: "special",
        image: settlerSpartansImage,
        cost: {
          lumber: 5115,
          clay: 5580,
          iron: 6045,
          crop: 3255,
        },
        stats: {
          attack: 10,
          defenseInfantry: 80,
          defenseCavalry: 80,
          velocity: 10,
          carryCapacity: 3000,
          upkeep: 1,
          trainingTime: "03:09:27",
        },
      },
      hero: {
        name: "Hero",
        type: "special",
        image: heroImage,
        cost: {
          lumber: 0,
          clay: 0,
          iron: 0,
          crop: 0,
        },
        stats: {
          attack: 0,
          defenseInfantry: 0,
          defenseCavalry: 0,
          velocity: 0,
          carryCapacity: 0,
          upkeep: 0,
          trainingTime: "0:00:00",
        },
      },
    },
  },
};

// Helper functions for working with units data
export const getTribeNames = () => Object.keys(travianUnits);
export const getTribeUnits = (tribeName) =>
  travianUnits[tribeName]?.units || {};
export const getUnitData = (tribeName, unitName) =>
  travianUnits[tribeName]?.units?.[unitName] || null;
export const getAllUnits = () => {
  const allUnits = [];
  Object.entries(travianUnits).forEach(([tribeName, tribeData]) => {
    Object.entries(tribeData.units).forEach(([unitName, unitData]) => {
      allUnits.push({
        tribe: tribeName,
        tribeName: tribeData.name,
        unit: unitName,
        ...unitData,
      });
    });
  });
  return allUnits;
};

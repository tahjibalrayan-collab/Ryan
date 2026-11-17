export type ElementCategory =
  | 'nonmetal'
  | 'noble-gas'
  | 'alkali-metal'
  | 'alkaline-earth'
  | 'metalloid'
  | 'halogen'
  | 'transition-metal'
  | 'post-transition'
  | 'lanthanide'
  | 'actinide';

export interface ChemicalElement {
  z: number;
  symbol: string;
  name: string;
  mass: string;
  category: ElementCategory;
  period: number;
  group: number; // 1..18 (f-block positioned cleanly in period 8/9 display row)
  gridRow: number; // 1..9
  gridCol: number; // 1..18
  state: 'Gas' | 'Liquid' | 'Solid' | 'Synthetic';
  config: string;
  eneg: string;
  oxidation: string;
  uses: string;
}

export interface ChemicalCompound {
  formula: string;
  name: string;
  molarMass: string;
  type: 'Acid' | 'Base' | 'Oxidizer / Salt' | 'Organic Reagent' | 'Solvent / Gas';
  properties: string;
  uses: string;
}

export interface ChemicalReaction {
  name: string;
  type: string;
  equation: string;
  conditions: string;
  observation: string;
}

export const ELEMENT_CATEGORY_LABELS: Record<ElementCategory, string> = {
  nonmetal: 'Reactive Nonmetal',
  'noble-gas': 'Noble Gas',
  'alkali-metal': 'Alkali Metal',
  'alkaline-earth': 'Alkaline Earth Metal',
  metalloid: 'Metalloid',
  halogen: 'Halogen',
  'transition-metal': 'Transition Metal',
  'post-transition': 'Post-Transition Metal',
  lanthanide: 'Lanthanide',
  actinide: 'Actinide',
};

// Compact tuples expanded into full ChemicalElement objects:
// [z, symbol, name, mass, category, period, group, gridRow, gridCol, state, config, eneg, oxidation, uses]
type RawEl = [
  number,
  string,
  string,
  string,
  ElementCategory,
  number,
  number,
  number,
  number,
  'Gas' | 'Liquid' | 'Solid' | 'Synthetic',
  string,
  string,
  string,
  string,
];

const RAW_118: RawEl[] = [
  [1, 'H', 'Hydrogen', '1.008', 'nonmetal', 1, 1, 1, 1, 'Gas', '1s1', '2.20', '-1, +1', 'Ammonia synthesis, fuel cells, hydrogenation'],
  [2, 'He', 'Helium', '4.0026', 'noble-gas', 1, 18, 1, 18, 'Gas', '1s2', '—', '0', 'Cryogenics, MRI magnets, shielding gas'],
  [3, 'Li', 'Lithium', '6.94', 'alkali-metal', 2, 1, 2, 1, 'Solid', '[He] 2s1', '0.98', '+1', 'Li-ion batteries, alloys, organolithium reagents'],
  [4, 'Be', 'Beryllium', '9.0122', 'alkaline-earth', 2, 2, 2, 2, 'Solid', '[He] 2s2', '1.57', '+2', 'Aerospace alloys, X-ray windows'],
  [5, 'B', 'Boron', '10.81', 'metalloid', 2, 13, 2, 13, 'Solid', '[He] 2s2 2p1', '2.04', '+3', 'Borosilicate glass, semiconductors, boranes'],
  [6, 'C', 'Carbon', '12.011', 'nonmetal', 2, 14, 2, 14, 'Solid', '[He] 2s2 2p2', '2.55', '-4 to +4', 'Organic chemistry backbone, graphene, steel'],
  [7, 'N', 'Nitrogen', '14.007', 'nonmetal', 2, 15, 2, 15, 'Gas', '[He] 2s2 2p3', '3.04', '-3 to +5', 'Fertilizers, nitric acid, inert atmosphere'],
  [8, 'O', 'Oxygen', '15.999', 'nonmetal', 2, 16, 2, 16, 'Gas', '[He] 2s2 2p4', '3.44', '-2, -1', 'Respiration, combustion, steelmaking'],
  [9, 'F', 'Fluorine', '18.998', 'halogen', 2, 17, 2, 17, 'Gas', '[He] 2s2 2p5', '3.98', '-1', 'PTFE, fluoridated pharmaceuticals, UF6'],
  [10, 'Ne', 'Neon', '20.180', 'noble-gas', 2, 18, 2, 18, 'Gas', '[He] 2s2 2p6', '—', '0', 'High-voltage indicators, helium-neon lasers'],
  [11, 'Na', 'Sodium', '22.990', 'alkali-metal', 3, 1, 3, 1, 'Solid', '[Ne] 3s1', '0.93', '+1', 'NaCl, NaOH, Birch reduction, heat transfer'],
  [12, 'Mg', 'Magnesium', '24.305', 'alkaline-earth', 3, 2, 3, 2, 'Solid', '[Ne] 3s2', '1.31', '+2', 'Grignard reagents, lightweight alloys, chlorophyll'],
  [13, 'Al', 'Aluminium', '26.982', 'post-transition', 3, 13, 3, 13, 'Solid', '[Ne] 3s2 3p1', '1.61', '+3', 'Aircraft alloys, LiAlH4 hydride, packaging'],
  [14, 'Si', 'Silicon', '28.085', 'metalloid', 3, 14, 3, 14, 'Solid', '[Ne] 3s2 3p2', '1.90', '-4, +4', 'Semiconductors, solar cells, silicates'],
  [15, 'P', 'Phosphorus', '30.974', 'nonmetal', 3, 15, 3, 15, 'Solid', '[Ne] 3s2 3p3', '2.19', '-3, +3, +5', 'ATP/DNA backbone, fertilizers, PCl5/POCl3'],
  [16, 'S', 'Sulfur', '32.06', 'nonmetal', 3, 16, 3, 16, 'Solid', '[Ne] 3s2 3p4', '2.58', '-2, +4, +6', 'Sulfuric acid, vulcanization, thiols'],
  [17, 'Cl', 'Chlorine', '35.45', 'halogen', 3, 17, 3, 17, 'Gas', '[Ne] 3s2 3p5', '3.16', '-1, +1, +5, +7', 'PVC, water disinfection, acyl chlorides'],
  [18, 'Ar', 'Argon', '39.948', 'noble-gas', 3, 18, 3, 18, 'Gas', '[Ne] 3s2 3p6', '—', '0', 'Inert Schlenk line atmosphere, arc welding'],
  [19, 'K', 'Potassium', '39.098', 'alkali-metal', 4, 1, 4, 1, 'Solid', '[Ar] 4s1', '0.82', '+1', 'KMnO4, KOH, fertilizers, nerve signaling'],
  [20, 'Ca', 'Calcium', '40.078', 'alkaline-earth', 4, 2, 4, 2, 'Solid', '[Ar] 4s2', '1.00', '+2', 'Cement, CaCO3, bones, drying agent CaCl2'],
  [21, 'Sc', 'Scandium', '44.956', 'transition-metal', 4, 3, 4, 3, 'Solid', '[Ar] 3d1 4s2', '1.36', '+3', 'Aerospace Al-Sc alloys, Lewis acid Sc(OTf)3'],
  [22, 'Ti', 'Titanium', '47.867', 'transition-metal', 4, 4, 4, 4, 'Solid', '[Ar] 3d2 4s2', '1.54', '+2, +3, +4', 'Implants, aerospace, TiO2 pigment, Ziegler-Natta'],
  [23, 'V', 'Vanadium', '50.942', 'transition-metal', 4, 5, 4, 5, 'Solid', '[Ar] 3d3 4s2', '1.63', '+2 to +5', 'V2O5 Contact Process catalyst, tool steel'],
  [24, 'Cr', 'Chromium', '51.996', 'transition-metal', 4, 6, 4, 6, 'Solid', '[Ar] 3d5 4s1', '1.66', '+2, +3, +6', 'Stainless steel, K2Cr2O7 / PCC oxidations'],
  [25, 'Mn', 'Manganese', '54.938', 'transition-metal', 4, 7, 4, 7, 'Solid', '[Ar] 3d5 4s2', '1.55', '+2, +4, +7', 'Steel production, KMnO4 oxidizer, batteries'],
  [26, 'Fe', 'Iron', '55.845', 'transition-metal', 4, 8, 4, 8, 'Solid', '[Ar] 3d6 4s2', '1.83', '+2, +3', 'Steel, hemoglobin, Haber-Bosch catalyst'],
  [27, 'Co', 'Cobalt', '58.933', 'transition-metal', 4, 9, 4, 9, 'Solid', '[Ar] 3d7 4s2', '1.88', '+2, +3', 'Li-ion cathodes, superalloys, Vitamin B12'],
  [28, 'Ni', 'Nickel', '58.693', 'transition-metal', 4, 10, 4, 10, 'Solid', '[Ar] 3d8 4s2', '1.91', '+2', 'Raney Ni hydrogenation catalyst, stainless steel'],
  [29, 'Cu', 'Copper', '63.546', 'transition-metal', 4, 11, 4, 11, 'Solid', '[Ar] 3d10 4s1', '1.90', '+1, +2', 'Electrical wiring, Fehling/Benedict reagents'],
  [30, 'Zn', 'Zinc', '65.38', 'transition-metal', 4, 12, 4, 12, 'Solid', '[Ar] 3d10 4s2', '1.65', '+2', 'Galvanization, Clemmensen reduction, brass'],
  [31, 'Ga', 'Gallium', '69.723', 'post-transition', 4, 13, 4, 13, 'Solid', '[Ar] 3d10 4s2 4p1', '1.81', '+3', 'GaAs LEDs, wide-bandgap semiconductors'],
  [32, 'Ge', 'Germanium', '72.630', 'metalloid', 4, 14, 4, 14, 'Solid', '[Ar] 3d10 4s2 4p2', '2.01', '+2, +4', 'Fiber optics, infrared optics, transistors'],
  [33, 'As', 'Arsenic', '74.922', 'metalloid', 4, 15, 4, 15, 'Solid', '[Ar] 3d10 4s2 4p3', '2.18', '-3, +3, +5', 'GaAs wafers, wood preservatives'],
  [34, 'Se', 'Selenium', '78.971', 'nonmetal', 4, 16, 4, 16, 'Solid', '[Ar] 3d10 4s2 4p4', '2.55', '-2, +4, +6', 'Photovoltaics, SeO2 allylic oxidation'],
  [35, 'Br', 'Bromine', '79.904', 'halogen', 4, 17, 4, 17, 'Liquid', '[Ar] 3d10 4s2 4p5', '2.96', '-1, +1, +5', 'Alkene test (Br2/CCl4), NBS bromination'],
  [36, 'Kr', 'Krypton', '83.798', 'noble-gas', 4, 18, 4, 18, 'Gas', '[Ar] 3d10 4s2 4p6', '3.00', '0, +2', 'High-speed photography flash, KrF lasers'],
  [37, 'Rb', 'Rubidium', '85.468', 'alkali-metal', 5, 1, 5, 1, 'Solid', '[Kr] 5s1', '0.82', '+1', 'Atomic clocks, laser cooling physics'],
  [38, 'Sr', 'Strontium', '87.62', 'alkaline-earth', 5, 2, 5, 2, 'Solid', '[Kr] 5s2', '0.95', '+2', 'Crimson pyrotechnics, optical lattice clocks'],
  [39, 'Y', 'Yttrium', '88.906', 'transition-metal', 5, 3, 5, 3, 'Solid', '[Kr] 4d1 5s2', '1.22', '+3', 'YAG lasers, YBCO high-Tc superconductors'],
  [40, 'Zr', 'Zirconium', '91.224', 'transition-metal', 5, 4, 5, 4, 'Solid', '[Kr] 4d2 5s2', '1.33', '+4', 'Nuclear cladding, ceramic ZrO2, Schwartz reagent'],
  [41, 'Nb', 'Niobium', '92.906', 'transition-metal', 5, 5, 5, 5, 'Solid', '[Kr] 4d4 5s1', '1.60', '+5', 'Superconducting MRI magnets, HSLA steel'],
  [42, 'Mo', 'Molybdenum', '95.95', 'transition-metal', 5, 6, 5, 6, 'Solid', '[Kr] 4d5 5s1', '2.16', '+4, +6', 'High-strength alloys, nitrogenase cofactor'],
  [43, 'Tc', 'Technetium', '98', 'transition-metal', 5, 7, 5, 7, 'Synthetic', '[Kr] 4d5 5s2', '1.90', '+4, +7', 'Tc-99m nuclear medicine imaging'],
  [44, 'Ru', 'Ruthenium', '101.07', 'transition-metal', 5, 8, 5, 8, 'Solid', '[Kr] 4d7 5s1', '2.20', '+2, +3, +4, +8', 'Grubbs olefin metathesis, solar dyes'],
  [45, 'Rh', 'Rhodium', '102.91', 'transition-metal', 5, 9, 5, 9, 'Solid', '[Kr] 4d8 5s1', '2.28', '+1, +3', 'Catalytic converters, Wilkinson hydrogenation'],
  [46, 'Pd', 'Palladium', '106.42', 'transition-metal', 5, 10, 5, 10, 'Solid', '[Kr] 4d10', '2.20', '0, +2', 'Suzuki/Heck cross-coupling, Lindlar catalyst'],
  [47, 'Ag', 'Silver', '107.87', 'transition-metal', 5, 11, 5, 11, 'Solid', '[Kr] 4d10 5s1', '1.93', '+1', 'Tollens reagent, AgNO3 halide test, electronics'],
  [48, 'Cd', 'Cadmium', '112.41', 'transition-metal', 5, 12, 5, 12, 'Solid', '[Kr] 4d10 5s2', '1.69', '+2', 'CdTe solar panels, quantum dots'],
  [49, 'In', 'Indium', '114.82', 'post-transition', 5, 13, 5, 13, 'Solid', '[Kr] 4d10 5s2 5p1', '1.78', '+3', 'ITO touchscreens, low-melting solders'],
  [50, 'Sn', 'Tin', '118.71', 'post-transition', 5, 14, 5, 14, 'Solid', '[Kr] 4d10 5s2 5p2', '1.96', '+2, +4', 'Lead-free solder, Stille coupling, bronze'],
  [51, 'Sb', 'Antimony', '121.76', 'metalloid', 5, 15, 5, 15, 'Solid', '[Kr] 4d10 5s2 5p3', '2.05', '-3, +3, +5', 'Flame retardants, SbF5 superacid component'],
  [52, 'Te', 'Tellurium', '127.60', 'metalloid', 5, 16, 5, 16, 'Solid', '[Kr] 4d10 5s2 5p4', '2.10', '-2, +4, +6', 'CdTe solar cells, thermoelectric coolers'],
  [53, 'I', 'Iodine', '126.90', 'halogen', 5, 17, 5, 17, 'Solid', '[Kr] 4d10 5s2 5p5', '2.66', '-1, +1, +5, +7', 'Starch test, iodometry titration, Dess-Martin'],
  [54, 'Xe', 'Xenon', '131.29', 'noble-gas', 5, 18, 5, 18, 'Gas', '[Kr] 4d10 5s2 5p6', '2.60', '0, +2, +4, +6', 'Ion thrusters, XeF4 chemistry, anesthesia'],
  [55, 'Cs', 'Cesium', '132.91', 'alkali-metal', 6, 1, 6, 1, 'Solid', '[Xe] 6s1', '0.79', '+1', 'Cs-133 SI second atomic clock, Cs2CO3 base'],
  [56, 'Ba', 'Barium', '137.33', 'alkaline-earth', 6, 2, 6, 2, 'Solid', '[Xe] 6s2', '0.89', '+2', 'BaSO4 medical contrast, sulfate test reagent'],
  [57, 'La', 'Lanthanum', '138.91', 'lanthanide', 6, 3, 8, 4, 'Solid', '[Xe] 5d1 6s2', '1.10', '+3', 'Camera glass lenses, NiMH batteries, FCC catalysts'],
  [58, 'Ce', 'Cerium', '140.12', 'lanthanide', 6, 3, 8, 5, 'Solid', '[Xe] 4f1 5d1 6s2', '1.12', '+3, +4', 'CAN oxidizer, catalytic converters, glass polish'],
  [59, 'Pr', 'Praseodymium', '140.91', 'lanthanide', 6, 3, 8, 6, 'Solid', '[Xe] 4f3 6s2', '1.13', '+3', 'Didymium welders goggles, high-strength magnets'],
  [60, 'Nd', 'Neodymium', '144.24', 'lanthanide', 6, 3, 8, 7, 'Solid', '[Xe] 4f4 6s2', '1.14', '+3', 'Nd2Fe14B strongest permanent magnets, Nd:YAG'],
  [61, 'Pm', 'Promethium', '145', 'lanthanide', 6, 3, 8, 8, 'Synthetic', '[Xe] 4f5 6s2', '1.13', '+3', 'Nuclear betavoltaic micro-batteries'],
  [62, 'Sm', 'Samarium', '150.36', 'lanthanide', 6, 3, 8, 9, 'Solid', '[Xe] 4f6 6s2', '1.17', '+2, +3', 'SmI2 Kagan single-electron reductant, SmCo magnets'],
  [63, 'Eu', 'Europium', '151.96', 'lanthanide', 6, 3, 8, 10, 'Solid', '[Xe] 4f7 6s2', '1.20', '+2, +3', 'LED phosphors, Euro banknote anti-counterfeit'],
  [64, 'Gd', 'Gadolinium', '157.25', 'lanthanide', 6, 3, 8, 11, 'Solid', '[Xe] 4f7 5d1 6s2', '1.20', '+3', 'MRI paramagnetic contrast, neutron shielding'],
  [65, 'Tb', 'Terbium', '158.93', 'lanthanide', 6, 3, 8, 12, 'Solid', '[Xe] 4f9 6s2', '1.20', '+3', 'Green phosphors, Terfenol-D actuators'],
  [66, 'Dy', 'Dysprosium', '162.50', 'lanthanide', 6, 3, 8, 13, 'Solid', '[Xe] 4f10 6s2', '1.22', '+3', 'EV traction motors, wind turbine magnets'],
  [67, 'Ho', 'Holmium', '164.93', 'lanthanide', 6, 3, 8, 14, 'Solid', '[Xe] 4f11 6s2', '1.23', '+3', 'Ho:YAG surgical lasers, pole pieces'],
  [68, 'Er', 'Erbium', '167.26', 'lanthanide', 6, 3, 8, 15, 'Solid', '[Xe] 4f12 6s2', '1.24', '+3', 'EDFA fiber-optic internet amplifiers'],
  [69, 'Tm', 'Thulium', '168.93', 'lanthanide', 6, 3, 8, 16, 'Solid', '[Xe] 4f13 6s2', '1.25', '+3', 'Portable medical X-ray sources, Tm lasers'],
  [70, 'Yb', 'Ytterbium', '173.05', 'lanthanide', 6, 3, 8, 17, 'Solid', '[Xe] 4f14 6s2', '1.10', '+2, +3', 'Optical atomic clocks, fiber lasers'],
  [71, 'Lu', 'Lutetium', '174.97', 'lanthanide', 6, 3, 8, 18, 'Solid', '[Xe] 4f14 5d1 6s2', '1.27', '+3', 'PET scan LSO scintillators, petroleum cracking'],
  [72, 'Hf', 'Hafnium', '178.49', 'transition-metal', 6, 4, 6, 4, 'Solid', '[Xe] 4f14 5d2 6s2', '1.30', '+4', 'High-k gate dielectric HfO2 in CPUs'],
  [73, 'Ta', 'Tantalum', '180.95', 'transition-metal', 6, 5, 6, 5, 'Solid', '[Xe] 4f14 5d3 6s2', '1.50', '+5', 'High-reliability capacitors, surgical implants'],
  [74, 'W', 'Tungsten', '183.84', 'transition-metal', 6, 6, 6, 6, 'Solid', '[Xe] 4f14 5d4 6s2', '2.36', '+4, +6', 'Highest melting point metal (3422°C), WC tooling'],
  [75, 'Re', 'Rhenium', '186.21', 'transition-metal', 6, 7, 6, 7, 'Solid', '[Xe] 4f14 5d5 6s2', '1.90', '+4, +7', 'Jet turbine single-crystal superalloys'],
  [76, 'Os', 'Osmium', '190.23', 'transition-metal', 6, 8, 6, 8, 'Solid', '[Xe] 4f14 5d6 6s2', '2.20', '+4, +8', 'Densest natural element, OsO4 dihydroxylation'],
  [77, 'Ir', 'Iridium', '192.22', 'transition-metal', 6, 9, 6, 9, 'Solid', '[Xe] 4f14 5d7 6s2', '2.20', '+1, +3, +4', 'OLED phosphors, photoredox catalysts, spark plugs'],
  [78, 'Pt', 'Platinum', '195.08', 'transition-metal', 6, 10, 6, 10, 'Solid', '[Xe] 4f14 5d9 6s1', '2.28', '+2, +4', 'Fuel cells, cisplatin, Adams PtO2 hydrogenation'],
  [79, 'Au', 'Gold', '196.97', 'transition-metal', 6, 11, 6, 11, 'Solid', '[Xe] 4f14 5d10 6s1', '2.54', '+1, +3', 'Microchip bonding, nanoparticles, aqua regia test'],
  [80, 'Hg', 'Mercury', '200.59', 'transition-metal', 6, 12, 6, 12, 'Liquid', '[Xe] 4f14 5d10 6s2', '2.00', '+1, +2', 'Calomel electrodes, Hg(OAc)2 oxymercuration'],
  [81, 'Tl', 'Thallium', '204.38', 'post-transition', 6, 13, 6, 13, 'Solid', '[Xe] 4f14 5d10 6s2 6p1', '1.62', '+1, +3', 'Infrared optics, cardiac stress imaging Tl-201'],
  [82, 'Pb', 'Lead', '207.2', 'post-transition', 6, 14, 6, 14, 'Solid', '[Xe] 4f14 5d10 6s2 6p2', '2.33', '+2, +4', 'Lead-acid batteries, radiation shielding'],
  [83, 'Bi', 'Bismuth', '208.98', 'post-transition', 6, 15, 6, 15, 'Solid', '[Xe] 4f14 5d10 6s2 6p3', '2.02', '+3, +5', 'Pepto-Bismol (bismuth subsalicylate), fusible alloys'],
  [84, 'Po', 'Polonium', '209', 'post-transition', 6, 16, 6, 16, 'Solid', '[Xe] 4f14 5d10 6s2 6p4', '2.00', '+2, +4', 'Anti-static brushes, RTG alpha heat sources'],
  [85, 'At', 'Astatine', '210', 'halogen', 6, 17, 6, 17, 'Synthetic', '[Xe] 4f14 5d10 6s2 6p5', '2.20', '-1, +1', 'At-211 targeted alpha cancer therapy research'],
  [86, 'Rn', 'Radon', '222', 'noble-gas', 6, 18, 6, 18, 'Gas', '[Xe] 4f14 5d10 6s2 6p6', '2.20', '0, +2', 'Hydrological & seismic tracer research'],
  [87, 'Fr', 'Francium', '223', 'alkali-metal', 7, 1, 7, 1, 'Synthetic', '[Rn] 7s1', '0.70', '+1', 'Parity-violation atomic physics studies'],
  [88, 'Ra', 'Radium', '226', 'alkaline-earth', 7, 2, 7, 2, 'Solid', '[Rn] 7s2', '0.90', '+2', 'Ra-223 bone metastasis radiotherapy'],
  [89, 'Ac', 'Actinium', '227', 'actinide', 7, 3, 9, 4, 'Solid', '[Rn] 6d1 7s2', '1.10', '+3', 'Ac-225 targeted alpha therapy, neutron sources'],
  [90, 'Th', 'Thorium', '232.04', 'actinide', 7, 3, 9, 5, 'Solid', '[Rn] 6d2 7s2', '1.30', '+4', 'Molten-salt thorium nuclear fuel cycles'],
  [91, 'Pa', 'Protactinium', '231.04', 'actinide', 7, 3, 9, 6, 'Solid', '[Rn] 5f2 6d1 7s2', '1.50', '+5', 'Marine sediment radiometric dating'],
  [92, 'U', 'Uranium', '238.03', 'actinide', 7, 3, 9, 7, 'Solid', '[Rn] 5f3 6d1 7s2', '1.38', '+4, +6', 'U-235 nuclear fission fuel, radiometric dating'],
  [93, 'Np', 'Neptunium', '237', 'actinide', 7, 3, 9, 8, 'Synthetic', '[Rn] 5f4 6d1 7s2', '1.36', '+3 to +7', 'Precursor to Pu-238 spacecraft batteries'],
  [94, 'Pu', 'Plutonium', '244', 'actinide', 7, 3, 9, 9, 'Synthetic', '[Rn] 5f6 7s2', '1.28', '+3 to +6', 'Pu-238 Voyager/Perseverance RTG power'],
  [95, 'Am', 'Americium', '243', 'actinide', 7, 3, 9, 10, 'Synthetic', '[Rn] 5f7 7s2', '1.13', '+3', 'Am-241 household ionization smoke detectors'],
  [96, 'Cm', 'Curium', '247', 'actinide', 7, 3, 9, 11, 'Synthetic', '[Rn] 5f7 6d1 7s2', '1.28', '+3', 'Mars rover APXS alpha particle spectrometer'],
  [97, 'Bk', 'Berkelium', '247', 'actinide', 7, 3, 9, 12, 'Synthetic', '[Rn] 5f9 7s2', '1.30', '+3, +4', 'Target for synthesizing Tennessine (Z=117)'],
  [98, 'Cf', 'Californium', '251', 'actinide', 7, 3, 9, 13, 'Synthetic', '[Rn] 5f10 7s2', '1.30', '+3', 'Cf-252 reactor startup neutron source'],
  [99, 'Es', 'Einsteinium', '252', 'actinide', 7, 3, 9, 14, 'Synthetic', '[Rn] 5f11 7s2', '1.30', '+3', 'Heavy-element target synthesis & actinide study'],
  [100, 'Fm', 'Fermium', '257', 'actinide', 7, 3, 9, 15, 'Synthetic', '[Rn] 5f12 7s2', '1.30', '+3', 'Heaviest element made via neutron capture'],
  [101, 'Md', 'Mendelevium', '258', 'actinide', 7, 3, 9, 16, 'Synthetic', '[Rn] 5f13 7s2', '1.30', '+2, +3', 'One-atom-at-a-time chemical studies'],
  [102, 'No', 'Nobelium', '259', 'actinide', 7, 3, 9, 17, 'Synthetic', '[Rn] 5f14 7s2', '1.30', '+2, +3', 'Experimental divalent actinide stability research'],
  [103, 'Lr', 'Lawrencium', '266', 'actinide', 7, 3, 9, 18, 'Synthetic', '[Rn] 5f14 7s2 7p1', '1.30', '+3', 'Final actinide; relativistic ionization studies'],
  [104, 'Rf', 'Rutherfordium', '267', 'transition-metal', 7, 4, 7, 4, 'Synthetic', '[Rn] 5f14 6d2 7s2', '—', '+4', 'Superheavy transactinide research'],
  [105, 'Db', 'Dubnium', '268', 'transition-metal', 7, 5, 7, 5, 'Synthetic', '[Rn] 5f14 6d3 7s2', '—', '+5', 'Nuclear chemistry & Group 5 homology studies'],
  [106, 'Sg', 'Seaborgium', '269', 'transition-metal', 7, 6, 7, 6, 'Synthetic', '[Rn] 5f14 6d4 7s2', '—', '+6', 'Gas-phase Sg(CO)6 carbonyl studies'],
  [107, 'Bh', 'Bohrium', '270', 'transition-metal', 7, 7, 7, 7, 'Synthetic', '[Rn] 5f14 6d5 7s2', '—', '+7', 'Superheavy oxychloride BhO3Cl studies'],
  [108, 'Hs', 'Hassium', '277', 'transition-metal', 7, 8, 7, 8, 'Synthetic', '[Rn] 5f14 6d6 7s2', '—', '+8', 'Volatile HsO4 oxide studies'],
  [109, 'Mt', 'Meitnerium', '278', 'transition-metal', 7, 9, 7, 9, 'Synthetic', '[Rn] 5f14 6d7 7s2', '—', '+3', 'Nuclear physics superheavy synthesis'],
  [110, 'Ds', 'Darmstadtium', '281', 'transition-metal', 7, 10, 7, 10, 'Synthetic', '[Rn] 5f14 6d8 7s2', '—', '+2, +4', 'Superheavy relativistic shell studies'],
  [111, 'Rg', 'Roentgenium', '282', 'transition-metal', 7, 11, 7, 11, 'Synthetic', '[Rn] 5f14 6d9 7s2', '—', '+3', 'Group 11 coinage homology research'],
  [112, 'Cn', 'Copernicium', '285', 'transition-metal', 7, 12, 7, 12, 'Synthetic', '[Rn] 5f14 6d10 7s2', '—', '+2', 'Closed-shell noble-liquid behavior studies'],
  [113, 'Nh', 'Nihonium', '286', 'post-transition', 7, 13, 7, 13, 'Synthetic', '[Rn] 5f14 6d10 7s2 7p1', '—', '+1', 'First element discovered in Asia (RIKEN)'],
  [114, 'Fl', 'Flerovium', '289', 'post-transition', 7, 14, 7, 14, 'Synthetic', '[Rn] 5f14 6d10 7s2 7p2', '—', '+2', 'Island-of-stability relativistic physics'],
  [115, 'Mc', 'Moscovium', '290', 'post-transition', 7, 15, 7, 15, 'Synthetic', '[Rn] 5f14 6d10 7s2 7p3', '—', '+1, +3', 'Superheavy decay chain studies'],
  [116, 'Lv', 'Livermorium', '293', 'post-transition', 7, 16, 7, 16, 'Synthetic', '[Rn] 5f14 6d10 7s2 7p4', '—', '+2', 'Heavy chalcogen synthesis research'],
  [117, 'Ts', 'Tennessine', '294', 'halogen', 7, 17, 7, 17, 'Synthetic', '[Rn] 5f14 6d10 7s2 7p5', '—', '+1, +3', 'Semi-metallic superheavy halogen'],
  [118, 'Og', 'Oganesson', '294', 'noble-gas', 7, 18, 7, 18, 'Synthetic', '[Rn] 5f14 6d10 7s2 7p6', '—', '0, +2', 'Heaviest known element; spin-orbit effects'],
];

export const ELEMENTS_118: ChemicalElement[] = RAW_118.map((r) => ({
  z: r[0],
  symbol: r[1],
  name: r[2],
  mass: r[3],
  category: r[4],
  period: r[5],
  group: r[6],
  gridRow: r[7],
  gridCol: r[8],
  state: r[9],
  config: r[10],
  eneg: r[11],
  oxidation: r[12],
  uses: r[13],
}));

export const CHEMICAL_COMPOUNDS: ChemicalCompound[] = [
  { formula: 'H₂SO₄', name: 'Sulfuric Acid', molarMass: '98.08 g/mol', type: 'Acid', properties: 'Strong diprotic acid, powerful dehydrating & sulfonating agent (98% conc = 18.4 M)', uses: 'Dehydration, nitration catalyst (with HNO₃), acid-base titration' },
  { formula: 'HCl', name: 'Hydrochloric Acid', molarMass: '36.46 g/mol', type: 'Acid', properties: 'Strong monoprotic mineral acid (37% conc = 12.1 M)', uses: 'Chloride salts, Sandmeyer/Lucas test (with ZnCl₂), pH adjustment' },
  { formula: 'HNO₃', name: 'Nitric Acid', molarMass: '63.01 g/mol', type: 'Acid', properties: 'Strong acid & oxidizing agent (68% conc = 15.8 M)', uses: 'Aromatic nitration, metal dissolution, Aqua Regia (1:3 with HCl)' },
  { formula: 'NaOH', name: 'Sodium Hydroxide', molarMass: '40.00 g/mol', type: 'Base', properties: 'Strong alkali base, hygroscopic white pellets', uses: 'Saponification, Cannizzaro & Aldol reactions, CO₂ scrubbing' },
  { formula: 'NH₄OH / NH₃(aq)', name: 'Aqueous Ammonia', molarMass: '35.05 g/mol', type: 'Base', properties: 'Weak base (Kb = 1.8×10⁻⁵), forms deep blue [Cu(NH₃)₄]²⁺ complex', uses: 'Cation group analysis, Tollens preparation, Hofmann ammonolysis' },
  { formula: 'KMnO₄', name: 'Potassium Permanganate', molarMass: '158.03 g/mol', type: 'Oxidizer / Salt', properties: 'Deep purple strong oxidizer (Mn⁺⁷ → Mn²⁺ in acid; MnO₂ in neutral)', uses: 'Baeyer alkene test, redox titration, alkylbenzene → benzoic acid' },
  { formula: 'K₂Cr₂O₇', name: 'Potassium Dichromate', molarMass: '294.18 g/mol', type: 'Oxidizer / Salt', properties: 'Orange crystals; reduces to green Cr³⁺ upon oxidizing 1°/2° alcohols', uses: 'Aldehyde/alcohol oxidation, breathalyzer redox standard' },
  { formula: 'LiAlH₄', name: 'Lithium Aluminium Hydride', molarMass: '37.95 g/mol', type: 'Organic Reagent', properties: 'Powerful non-selective nucleophilic hydride donor; reacts violently with water', uses: 'Reduces esters, carboxylic acids, amides, aldehydes, ketones in dry ether' },
  { formula: 'NaBH₄', name: 'Sodium Borohydride', molarMass: '37.83 g/mol', type: 'Organic Reagent', properties: 'Mild chemoselective hydride donor usable in MeOH/EtOH', uses: 'Selectively reduces aldehydes & ketones without touching esters/acids' },
  { formula: 'RMgX', name: 'Grignard Reagent', molarMass: 'Variable', type: 'Organic Reagent', properties: 'Strong nucleophile & strong base; requires strictly anhydrous ether/THF', uses: 'C–C bond formation with carbonyls, CO₂ → carboxylic acid, epoxide opening' },
  { formula: '[Ag(NH₃)₂]⁺OH⁻', name: 'Tollens Reagent', molarMass: 'Ammoniacal AgNO₃', type: 'Oxidizer / Salt', properties: 'Mild oxidant selective for aldehydes (gives metallic silver mirror)', uses: 'Distinguishes aldehydes from ketones; reducing sugar test' },
  { formula: 'CuSO₄·5H₂O + Tartrate', name: 'Fehling Solution A & B', molarMass: 'Cu(II) complex', type: 'Oxidizer / Salt', properties: 'Deep blue alkaline Cu²⁺ complex; yields brick-red Cu₂O precipitate', uses: 'Distinguishes aliphatic aldehydes & reducing sugars from ketones' },
  { formula: 'CH₃COONa + CaO', name: 'Soda Lime', molarMass: 'Mixture', type: 'Base', properties: 'Decarboxylating solid alkali mixture under strong heating', uses: 'Removes -COONa to shorten alkane chain by 1 carbon' },
  { formula: 'CHCl₃ + KOH', name: 'Carbylamine Reagent', molarMass: '119.38 + 56.11', type: 'Organic Reagent', properties: 'Generates dichlorocarbene (:CCl₂) reactive intermediate', uses: 'Isocyanide test exclusively for 1° amines (foul odor)' },
];

export const CHEMICAL_REACTIONS: ChemicalReaction[] = [
  { name: 'Aldol Condensation', type: 'C–C Bond Formation', equation: '2 CH₃CHO  ──(dil. NaOH, Δ)──▶  CH₃-CH=CH-CHO + H₂O', conditions: 'Dilute NaOH, α-hydrogen required, heat for dehydration', observation: 'Forms β-hydroxy aldehyde, then α,β-unsaturated aldehyde' },
  { name: 'Cannizzaro Reaction', type: 'Disproportionation', equation: '2 HCHO + conc. NaOH  ──▶  CH₃OH + HCOONa', conditions: 'Aldehydes WITHOUT α-H (HCHO, PhCHO), 50% conc. alkali', observation: 'One molecule oxidized to carboxylate, one reduced to alcohol' },
  { name: 'Friedel-Crafts Acylation', type: 'Electrophilic Aromatic Substitution', equation: 'C₆H₆ + RCOCl  ──(anhyd. AlCl₃)──▶  C₆H₅COR + HCl', conditions: 'Anhydrous AlCl₃ Lewis acid catalyst', observation: 'Produces aryl ketone without carbocation rearrangement' },
  { name: 'Wurtz Reaction', type: 'Alkane Coupling', equation: '2 R–X + 2 Na  ──(dry ether)──▶  R–R + 2 NaX', conditions: 'Dry ether solvent (no moisture)', observation: 'Doubles symmetrical alkyl chains cleanly' },
  { name: 'Ozonolysis (Reductive)', type: 'Alkene Cleavage', equation: 'R₁CH=CHR₂  ──(1. O₃  2. Zn/H₂O)──▶  R₁CHO + R₂CHO', conditions: 'O₃ at -78°C followed by Zn/H₂O or Me₂S', observation: 'Locates C=C double bond positions inside unknowns' },
  { name: 'Hofmann Bromamide Degradation', type: 'Step-Down Amine Synthesis', equation: 'R-CONH₂ + Br₂ + 4 KOH  ──▶  R-NH₂ + K₂CO₃ + 2 KBr + 2 H₂O', conditions: 'Br₂ in excess aqueous/alcoholic KOH', observation: 'Produces primary amine with 1 fewer carbon than starting amide' },
  { name: 'Haber-Bosch Process', type: 'Industrial Equilibrium', equation: 'N₂(g) + 3 H₂(g)  ⇌  2 NH₃(g)   (ΔH = -92.4 kJ/mol)', conditions: 'Fe catalyst + K₂O/Al₂O₃ promoter, 450°C, 200 atm', observation: 'Exothermic; high pressure shifts equilibrium toward NH₃' },
  { name: 'Reimer-Tiemann Reaction', type: 'Formylation', equation: 'C₆H₅OH + CHCl₃ + 3 KOH  ──▶  o-OH-C₆H₄-CHO (Salicylaldehyde)', conditions: 'Chloroform + aqueous KOH at 60–70°C', observation: 'Introduces -CHO ortho to phenolic -OH via :CCl₂ carbene' },
];

export const CHEMISTRY_CONSTANTS = [
  { symbol: 'R', name: 'Universal Gas Constant', value: '8.314 J/(mol·K) = 0.0821 L·atm/(mol·K)' },
  { symbol: 'Nₐ', name: 'Avogadro Constant', value: '6.02214 × 10²³ mol⁻¹' },
  { symbol: 'F', name: 'Faraday Constant', value: '96,485 C/mol e⁻' },
  { symbol: 'h', name: 'Planck Constant', value: '6.626 × 10⁻³⁴ J·s' },
  { symbol: 'Vₘ (STP)', name: 'Ideal Gas Molar Volume (0°C, 1 atm)', value: '22.414 L/mol (24.79 L/mol at 1 bar)' },
  { symbol: 'Kw (25°C)', name: 'Water Auto-ionization', value: '1.0 × 10⁻¹⁴  (pH + pOH = 14)' },
  { symbol: 'M', name: 'Molarity Formula', value: 'M = n / V(L) = (10 × %w/w × d) / Molar Mass' },
  { symbol: 'ΔG°', name: 'Gibbs Free Energy', value: 'ΔG° = ΔH° - TΔS° = -RT ln K = -nFE°' },
];

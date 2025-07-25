// Colorado 14ers with their coordinates and elevations
// This list includes all 58 peaks over 14,000 feet (including those with <300ft prominence)
// Colorado 14ers with their coordinates and elevations
// This list includes all 60 peaks over 14,000 feet (including those with <300ft prominence)
const coloradoFourteeners = [
  { name: "Mount Elbert", elevation: 14440, lat: 39.1178, lon: -106.4453 },
  { name: "Mount Massive", elevation: 14428, lat: 39.1875, lon: -106.4757 },
  { name: "Mount Harvard", elevation: 14421, lat: 38.9244, lon: -106.3207 },
  { name: "Blanca Peak", elevation: 14351, lat: 37.5775, lon: -105.4856 },
  { name: "La Plata Peak", elevation: 14343, lat: 39.0294, lon: -106.4729 },
  { name: "Uncompahgre Peak", elevation: 14321, lat: 38.0717, lon: -107.4624 },
  { name: "Crestone Peak", elevation: 14300, lat: 37.9669, lon: -105.585 },
  { name: "Mount Lincoln", elevation: 14293, lat: 39.3515, lon: -106.1065 },
  { name: "Castle Peak", elevation: 14279, lat: 39.0097, lon: -106.8616 },
  { name: "Grays Peak", elevation: 14278, lat: 39.6342, lon: -105.8176 },
  { name: "Mount Antero", elevation: 14276, lat: 38.6739, lon: -106.2458 },
  { name: "Torreys Peak", elevation: 14275, lat: 39.6428, lon: -105.8212 },
  { name: "Quandary Peak", elevation: 14271, lat: 39.3975, lon: -106.1066 },
  { name: "Mount Blue Sky", elevation: 14271, lat: 39.5883, lon: -105.6438 },
  { name: "Longs Peak", elevation: 14259, lat: 40.2549, lon: -105.6151 },
  { name: "Mount Wilson", elevation: 14252, lat: 37.8391, lon: -107.9918 },
  { name: "Mount Cameron", elevation: 14238, lat: 39.3471, lon: -106.1188 },
  { name: "Mount Shavano", elevation: 14231, lat: 38.6194, lon: -106.2392 },
  { name: "Mount Belford", elevation: 14203, lat: 38.9606, lon: -106.3608 },
  { name: "Crestone Needle", elevation: 14203, lat: 37.9647, lon: -105.5767 },
  { name: "Mount Princeton", elevation: 14204, lat: 38.7492, lon: -106.2425 },
  { name: "Mount Yale", elevation: 14196, lat: 38.8442, lon: -106.3142 },
  { name: "Mount Bross", elevation: 14178, lat: 39.3348, lon: -106.1079 },
  {
    name: "Kit Carson Mountain",
    elevation: 14165,
    lat: 37.9795,
    lon: -105.6024,
  },
  { name: "Maroon Peak", elevation: 14163, lat: 39.0708, lon: -106.989 },
  { name: "Tabeguache Peak", elevation: 14162, lat: 38.6256, lon: -106.2506 },
  { name: "Mount Oxford", elevation: 14160, lat: 38.9648, lon: -106.3381 },
  { name: "Mount Sneffels", elevation: 14158, lat: 38.0038, lon: -107.7923 },
  { name: "Mount Democrat", elevation: 14155, lat: 39.3397, lon: -106.1397 },
  { name: "Capitol Peak", elevation: 14137, lat: 39.1503, lon: -107.0831 },
  { name: "Pikes Peak", elevation: 14115, lat: 38.8405, lon: -105.0442 },
  { name: "Snowmass Mountain", elevation: 14099, lat: 39.1186, lon: -107.0665 },
  { name: "Mount Eolus", elevation: 14090, lat: 37.6217, lon: -107.6224 },
  { name: "Windom Peak", elevation: 14087, lat: 37.6211, lon: -107.5917 },
  { name: "Challenger Point", elevation: 14081, lat: 37.9803, lon: -105.6068 },
  { name: "Mount Columbia", elevation: 14077, lat: 38.9039, lon: -106.2975 },
  { name: "Missouri Mountain", elevation: 14074, lat: 38.9475, lon: -106.3781 },
  { name: "Humboldt Peak", elevation: 14070, lat: 37.9761, lon: -105.5553 },
  { name: "Mount Bierstadt", elevation: 14065, lat: 39.5828, lon: -105.6686 },
  { name: "Sunlight Peak", elevation: 14059, lat: 37.6267, lon: -107.595 },
  { name: "Handies Peak", elevation: 14053, lat: 38.0578, lon: -107.5044 },
  { name: "Culebra Peak", elevation: 14053, lat: 37.1218, lon: -105.1856 },
  { name: "Mount Lindsey", elevation: 14042, lat: 37.5833, lon: -105.4439 },
  { name: "Ellingwood Point", elevation: 14042, lat: 37.5828, lon: -105.4928 },
  { name: "Mount Sherman", elevation: 14043, lat: 39.225, lon: -106.17 },
  { name: "Redcloud Peak", elevation: 14037, lat: 38.0369, lon: -107.4219 },
  { name: "Pyramid Peak", elevation: 14025, lat: 39.0717, lon: -106.9503 },
  { name: "Wilson Peak", elevation: 14023, lat: 37.8603, lon: -107.9845 },
  { name: "Wetterhorn Peak", elevation: 14021, lat: 38.0608, lon: -107.5108 },
  { name: "North Maroon Peak", elevation: 14019, lat: 39.0767, lon: -106.9833 },
  { name: "San Luis Peak", elevation: 14014, lat: 37.9867, lon: -106.9314 },
  {
    name: "Mount of the Holy Cross",
    elevation: 14009,
    lat: 39.4669,
    lon: -106.4819,
  },
  { name: "Huron Peak", elevation: 14003, lat: 38.9453, lon: -106.4378 },
  { name: "Sunshine Peak", elevation: 14001, lat: 38.0597, lon: -107.4256 },
  { name: "Mount Audubon", elevation: 13223, lat: 40.0458, lon: -105.543 },
  { name: "Mount Meeker", elevation: 13911, lat: 40.2408, lon: -105.6169 },
  {
    name: "Mount Lady Washington",
    elevation: 13281,
    lat: 40.2456,
    lon: -105.6322,
  },
  { name: "Mount Spalding", elevation: 13842, lat: 39.5842, lon: -105.6272 },
  { name: "Mount Rosa", elevation: 11499, lat: 38.8347, lon: -105.0419 },
  { name: "Mount Tyndall", elevation: 13370, lat: 38.8461, lon: -105.0822 },
];

// Create alias for backward compatibility
const fourteeners = coloradoFourteeners;

// Export for use in other modules
if (typeof module !== "undefined" && module.exports) {
  module.exports = coloradoFourteeners;
}

// 28 whole-hour UTC offsets from UTC-12 to UTC+14 with a representative city
// cityPath corresponds to the path segment used by time.is, e.g., https://time.is/New_York
// Use actual city names that time.is recognizes, with underscores replacing spaces

const timezoneCities = [
  {
    label: "UTC -12 — Baker Island",
    cityPath: "Baker_Island",
    iana: "Etc/GMT+12",
    idSuffix: "z101",
  },
  {
    label: "UTC -11 — Pago Pago",
    cityPath: "Pago_Pago",
    iana: "Pacific/Pago_Pago",
    idSuffix: "z102",
  },
  {
    label: "UTC -10 — Honolulu",
    cityPath: "Honolulu",
    iana: "Pacific/Honolulu",
    idSuffix: "z103",
  },
  {
    label: "UTC -9 — Anchorage",
    cityPath: "Anchorage",
    iana: "America/Anchorage",
    idSuffix: "z104",
  },
  {
    label: "UTC -8 — Los Angeles",
    cityPath: "Los_Angeles",
    iana: "America/Los_Angeles",
    idSuffix: "z105",
  },
  {
    label: "UTC -7 — Denver",
    cityPath: "Denver",
    iana: "America/Denver",
    idSuffix: "z106",
  },
  {
    label: "UTC -6 — Mexico City",
    cityPath: "Mexico_City",
    iana: "America/Mexico_City",
    idSuffix: "z107",
  },
  {
    label: "UTC -5 — New York",
    cityPath: "New_York",
    iana: "America/New_York",
    idSuffix: "z108",
  },
  {
    label: "UTC -4 — Caracas",
    cityPath: "Caracas",
    iana: "America/Caracas",
    idSuffix: "z109",
  },
  {
    label: "UTC -3 — Buenos Aires",
    cityPath: "Buenos_Aires",
    iana: "America/Argentina/Buenos_Aires",
    idSuffix: "z110",
  },
  {
    label: "UTC -2 — Fernando de Noronha",
    cityPath: "Fernando_de_Noronha",
    iana: "America/Noronha",
    idSuffix: "z111",
  },
  {
    label: "UTC -1 — Azores",
    cityPath: "Azores",
    iana: "Atlantic/Azores",
    idSuffix: "z112",
  },
  {
    label: "UTC +0 — London",
    cityPath: "London",
    iana: "Europe/London",
    idSuffix: "z113",
  },
  {
    label: "UTC +1 — Paris",
    cityPath: "Paris",
    iana: "Europe/Paris",
    idSuffix: "z114",
  },
  {
    label: "UTC +2 — Cairo",
    cityPath: "Cairo",
    iana: "Africa/Cairo",
    idSuffix: "z115",
  },
  {
    label: "UTC +3 — Moscow",
    cityPath: "Moscow",
    iana: "Europe/Moscow",
    idSuffix: "z116",
  },
  {
    label: "UTC +4 — Dubai",
    cityPath: "Dubai",
    iana: "Asia/Dubai",
    idSuffix: "z117",
  },
  {
    label: "UTC +5 — Karachi",
    cityPath: "Karachi",
    iana: "Asia/Karachi",
    idSuffix: "z118",
  },
  {
    label: "UTC +6 — Dhaka",
    cityPath: "Dhaka",
    iana: "Asia/Dhaka",
    idSuffix: "z119",
  },
  {
    label: "UTC +7 — Bangkok",
    cityPath: "Bangkok",
    iana: "Asia/Bangkok",
    idSuffix: "z120",
  },
  {
    label: "UTC +8 — Beijing",
    cityPath: "Beijing",
    iana: "Asia/Shanghai",
    idSuffix: "z121",
  },
  {
    label: "UTC +9 — Tokyo",
    cityPath: "Tokyo",
    iana: "Asia/Tokyo",
    idSuffix: "z122",
  },
  {
    label: "UTC +10 — Sydney",
    cityPath: "Sydney",
    iana: "Australia/Sydney",
    idSuffix: "z123",
  },
  {
    label: "UTC +11 — Honiara",
    cityPath: "Honiara",
    iana: "Pacific/Guadalcanal",
    idSuffix: "z124",
  },
  {
    label: "UTC +12 — Auckland",
    cityPath: "Auckland",
    iana: "Pacific/Auckland",
    idSuffix: "z125",
  },
  {
    label: "UTC +13 — Nuku'alofa",
    cityPath: "Nuku'alofa",
    iana: "Pacific/Tongatapu",
    idSuffix: "z126",
  },
  {
    label: "UTC +14 — Kiritimati",
    cityPath: "Kiritimati",
    iana: "Pacific/Kiritimati",
    idSuffix: "z127",
  },
];

export default timezoneCities;

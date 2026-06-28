/**
 * Play Now — fast-start room/session helpers (pure, no Firebase).
 * Curated name lists and bounded robot count for one-tap table setup.
 */

export const PLAY_NOW_BUY_IN = 1000;
export const PLAY_NOW_ANTE = 50;

/** Top vacation destinations for auto-generated room names (150). */
export const VACATION_DESTINATIONS = [
  "Bali", "Paris", "Santorini", "London", "Dubai", "Kyoto", "Maui", "Rome", "Maldives", "Barcelona",
  "Amalfi Coast", "Seychelles", "Queenstown", "Reykjavik", "Cape Town", "Marrakech", "Phuket", "Hanoi",
  "Singapore", "Tokyo", "Seoul", "Sydney", "Melbourne", "Auckland", "Fiji", "Bora Bora", "Tahiti",
  "Honolulu", "Miami", "Cancun", "Tulum", "Lisbon", "Porto", "Madrid", "Seville", "Florence", "Venice",
  "Milan", "Lake Como", "Zurich", "Geneva", "Vienna", "Prague", "Budapest", "Athens", "Mykonos",
  "Crete", "Istanbul", "Cappadocia", "Petra", "Tel Aviv", "Doha", "Abu Dhabi", "Muscat", "Jaipur",
  "Goa", "Kerala", "Sri Lanka", "Kathmandu", "Bhutan", "Malibu", "Napa Valley", "Aspen", "Banff",
  "Vancouver", "Whistler", "New York", "San Francisco", "Las Vegas", "Chicago", "Nashville", "Charleston",
  "Savannah", "Orlando", "Key West", "Sedona", "Scottsdale", "Park City", "Lake Tahoe", "Monterey",
  "Cabo San Lucas", "Puerto Vallarta", "Cartagena", "Buenos Aires", "Patagonia", "Rio de Janeiro",
  "Lima", "Cusco", "Galapagos", "Santiago", "Medellin", "Bogota", "Edinburgh", "Dublin", "Galway",
  "Amsterdam", "Bruges", "Copenhagen", "Stockholm", "Oslo", "Bergen", "Helsinki", "Tallinn", "Riga",
  "Krakow", "Warsaw", "Dubrovnik", "Split", "Hvar", "Nice", "Monaco", "Provence", "Corsica", "Sardinia",
  "Sicily", "Tuscany", "Chamonix", "Interlaken", "Salzburg", "Innsbruck", "Bruges", "Brussels",
  "Luxembourg", "Lake Bled", "Zagreb", "Santander", "Ibiza", "Majorca", "Granada", "Valencia",
  "Biarritz", "St. Moritz", "Zermatt", "Lucerne", "Rotorua", "Christchurch", "Gold Coast", "Perth",
  "Boracay", "Palawan", "Langkawi", "Penang", "Hoi An", "Da Nang", "Luang Prabang", "Siem Reap",
  "Chiang Mai", "Koh Samui", "Krabi", "Lombok", "Ubud", "Nusa Dua", "Gili Islands", "Komodo",
  "Zanzibar", "Mauritius", "Madagascar", "Victoria Falls", "Serengeti", "Masai Mara", "Kruger",
  "Namibia", "Rwanda", "Tanzania", "Kenya", "Egypt", "Luxor", "Cairo", "Jordan", "Lebanon",
];

/** Curated top boy names (100). */
export const BOY_NAMES = [
  "Liam", "Noah", "Oliver", "James", "Elijah", "Mateo", "Lucas", "William", "Benjamin", "Henry",
  "Theodore", "Jack", "Levi", "Alexander", "Jackson", "Sebastian", "Daniel", "Michael", "Ethan", "Logan",
  "Owen", "Samuel", "Jacob", "Asher", "Aiden", "John", "Joseph", "Wyatt", "David", "Leo",
  "Luke", "Julian", "Gabriel", "Grayson", "Matthew", "Maverick", "Elian", "Mason", "Elias", "Josiah",
  "Carter", "Ezra", "Thomas", "Charles", "Christopher", "Isaiah", "Andrew", "Joshua", "Nathan", "Ryan",
  "Adrian", "Christian", "Nolan", "Aaron", "Caleb", "Angel", "Cooper", "Waylon", "Easton", "Roman",
  "Robert", "Jameson", "Nicholas", "Ezekiel", "Colton", "Brooks", "Ian", "Carson", "Axel", "Jaxon",
  "Dominic", "Leonardo", "Luca", "Austin", "Jordan", "Adam", "Xavier", "Jose", "Jace", "Everett",
  "Declan", "Evan", "Kayden", "Parker", "Wesley", "Silas", "Bennett", "George", "Beau", "Damian",
  "Emiliano", "Braxton", "Amir", "Gael", "Rowan", "Harrison", "Bryson", "Santiago", "Diego", "Carlos",
];

/** Curated top girl names (100). */
export const GIRL_NAMES = [
  "Olivia", "Emma", "Amelia", "Sophia", "Charlotte", "Mia", "Ava", "Evelyn", "Luna", "Harper",
  "Camila", "Gianna", "Elizabeth", "Eleanor", "Ella", "Abigail", "Sofia", "Avery", "Scarlett", "Emily",
  "Aria", "Penelope", "Chloe", "Layla", "Mila", "Nora", "Hazel", "Madison", "Ellie", "Lily",
  "Nova", "Isla", "Grace", "Violet", "Aurora", "Riley", "Zoey", "Willow", "Emilia", "Stella",
  "Zoe", "Victoria", "Hannah", "Addison", "Leah", "Lucy", "Eliana", "Natalie", "Daisy", "Naomi",
  "Maria", "Elena", "Ivy", "Lillian", "Paisley", "Ruby", "Claire", "Audrey", "Bella", "Skylar",
  "Jade", "Alice", "Madelyn", "Cora", "Kennedy", "Kinsley", "Savannah", "Genesis", "Aaliyah", "Valentina",
  "Sophie", "Sadie", "Nevaeh", "Eva", "Serenity", "Autumn", "Adeline", "Hailey", "Gemma", "Vivian",
  "Isabelle", "Piper", "Lydia", "Jasmine", "Peyton", "Anna", "Delilah", "Clara", "Maya", "Rose",
  "Ariana", "Melody", "Iris", "Juliana", "Faith", "Margaret", "Nicole", "Rachel", "Brooke", "Sienna",
];

/**
 * Random int in [min, max] inclusive.
 * @param {() => number} rng
 */
export function randomInt(min, max, rng = Math.random) {
  const lo = Math.min(min, max);
  const hi = Math.max(min, max);
  return lo + Math.floor(rng() * (hi - lo + 1));
}

/**
 * Robot count for Play Now: random integer from 1 to (available seats − 1).
 * @param {number} maxTablePlayers — table seat cap (e.g. 8)
 * @param {number} occupiedSeats — players already seated (host = 1)
 * @param {() => number} [rng]
 */
export function pickPlayNowRobotCount(maxTablePlayers, occupiedSeats, rng = Math.random) {
  const cap = Math.max(1, Number(maxTablePlayers) || 8);
  const occupied = Math.max(0, Number(occupiedSeats) || 0);
  const available = Math.max(0, cap - occupied);
  if (available <= 1) return 0;
  return randomInt(1, available - 1, rng);
}

/**
 * Pick a vacation-style room name; lightweight suffix if taken.
 * @param {string[]} takenNames
 * @param {() => number} [rng]
 */
export function pickVacationRoomName(takenNames = [], rng = Math.random) {
  const taken = new Set(
    (takenNames || []).map((n) => String(n || "").trim().toLowerCase()).filter(Boolean),
  );
  for (let attempt = 0; attempt < 400; attempt += 1) {
    const dest =
      VACATION_DESTINATIONS[Math.floor(rng() * VACATION_DESTINATIONS.length)] ?? "Bali";
    const candidates = [dest, `${dest} Room`, `${dest} Table`];
    for (const candidate of candidates) {
      if (!taken.has(candidate.toLowerCase())) return candidate;
    }
  }
  const dest = VACATION_DESTINATIONS[Math.floor(rng() * VACATION_DESTINATIONS.length)] ?? "Bali";
  let n = 2;
  while (taken.has(`${dest} ${n}`.toLowerCase())) n += 1;
  return `${dest} ${n}`;
}

const ROBOT_NAME_POOL = [...BOY_NAMES, ...GIRL_NAMES];

/**
 * Human-style unique robot names for one session.
 * @param {number} count
 * @param {string[]} takenNames — host + existing roster
 * @param {() => number} [rng]
 */
export function pickUniqueRobotNames(count, takenNames = [], rng = Math.random) {
  const n = Math.max(0, Number(count) || 0);
  const taken = new Set(
    (takenNames || []).map((name) => String(name || "").trim().toLowerCase()).filter(Boolean),
  );
  const result = [];
  for (let i = 0; i < n; i += 1) {
    let chosen = null;
    for (let attempt = 0; attempt < 300; attempt += 1) {
      const candidate = ROBOT_NAME_POOL[Math.floor(rng() * ROBOT_NAME_POOL.length)];
      const key = candidate.toLowerCase();
      if (!taken.has(key)) {
        chosen = candidate;
        taken.add(key);
        break;
      }
    }
    if (!chosen) {
      const base = ROBOT_NAME_POOL[Math.floor(rng() * ROBOT_NAME_POOL.length)] ?? "Alex";
      let suffix = 2;
      while (taken.has(`${base} ${suffix}`.toLowerCase())) suffix += 1;
      chosen = `${base} ${suffix}`;
      taken.add(chosen.toLowerCase());
    }
    result.push(chosen);
  }
  return result;
}

/** Bourré settings object for Play Now room create. */
export function playNowBourreSettings() {
  return {
    buyInAmount: PLAY_NOW_BUY_IN,
    anteAmount: PLAY_NOW_ANTE,
    limEnabled: false,
    rebuyEnabled: false,
  };
}

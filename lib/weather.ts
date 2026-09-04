/**
 * Hyperlocal weather for a farmer's GPS point.
 *
 * We do not train a weather model. Open-Meteo already interpolates national
 * weather-service grids (~9 km). The precision win is querying that model at
 * the farm's lat/lng — not a district name — then scoring harvest / White Store
 * logistics risk for the current Indian crop season.
 */

export type Season = "Kharif" | "Rabi" | "Zaid";
export type RiskLevel = "LOW" | "MODERATE" | "HIGH";

export type Copy = { en: string; kn: string };

export type WeatherDay = {
  date: string;
  weatherCode: number;
  tempMax: number;
  tempMin: number;
  rainMm: number;
  rainChance: number | null;
};

export type FarmWeather = {
  lat: number;
  lng: number;
  placeLabel: string;
  season: Season;
  currentTemp: number;
  currentCode: number;
  currentLabel: Copy;
  humidity: number | null;
  days: WeatherDay[];
  rainNext48hMm: number;
  rainNext3DaysMm: number;
  risk: {
    level: RiskLevel;
    message: Copy;
    actions: Copy[];
  };
  avgSeasonalRainfallMm: number | null;
  yearsUsed: number;
};

type ForecastJson = {
  current?: {
    temperature_2m?: number;
    weather_code?: number;
    relative_humidity_2m?: number;
  };
  daily?: {
    time?: string[];
    weather_code?: number[];
    temperature_2m_max?: number[];
    temperature_2m_min?: number[];
    precipitation_sum?: number[];
    precipitation_probability_max?: number[];
  };
};

type ArchiveJson = {
  daily?: {
    time?: string[];
    precipitation_sum?: (number | null)[];
  };
};

type GeocodeJson = {
  results?: {
    name: string;
    latitude: number;
    longitude: number;
    admin1?: string;
    admin2?: string;
    population?: number;
  }[];
};

function fetchInit(timeoutMs: number): RequestInit {
  return {
    cache: "force-cache",
    next: { revalidate: 1800 },
    signal: AbortSignal.timeout(timeoutMs),
  } as RequestInit;
}

export function roundCoord(n: number, decimals = 3): number {
  const f = 10 ** decimals;
  return Math.round(n * f) / f;
}

function indiaParts(now = new Date()) {
  const fmt = new Intl.DateTimeFormat("en-GB", {
    timeZone: "Asia/Kolkata",
    year: "numeric",
    month: "numeric",
    day: "numeric",
  });
  const parts = fmt.formatToParts(now);
  const num = (type: Intl.DateTimeFormatPartTypes) =>
    Number(parts.find((p) => p.type === type)?.value ?? 0);
  return { year: num("year"), month: num("month"), day: num("day") };
}

export function currentSeason(now = new Date()): Season {
  const { month } = indiaParts(now);
  if (month === 4 || month === 5) return "Zaid";
  if (month >= 6 && month <= 10) return "Kharif";
  return "Rabi";
}

export function wmoLabel(code: number): Copy {
  if (code === 0) return { en: "Clear", kn: "ಸ್ಪಷ್ಟ" };
  if (code <= 3) return { en: "Partly cloudy", kn: "ಭಾಗಶಃ ಮೋಡ" };
  if (code === 45 || code === 48) return { en: "Fog", kn: "ಮಂಜು" };
  if (code <= 57) return { en: "Drizzle", kn: "ತುಂತುರು" };
  if (code <= 67) return { en: "Rain", kn: "ಮಳೆ" };
  if (code <= 77) return { en: "Snow", kn: "ಹಿಮ" };
  if (code <= 82) return { en: "Showers", kn: "ಸಿಡಿಮಳೆ" };
  if (code <= 86) return { en: "Snow showers", kn: "ಹಿಮದ ಸಿಡಿತ" };
  if (code >= 95) return { en: "Thunderstorm", kn: "ಗುಡುಗು ಸಿಡಿಲು" };
  return { en: "Cloudy", kn: "ಮೋಡ" };
}

function lastCompletedSeasonYears(season: Season, now = new Date()): number[] {
  const { year, month } = indiaParts(now);
  let last: number;
  if (season === "Kharif") last = month >= 11 ? year : year - 1;
  else if (season === "Zaid") last = month >= 6 ? year : year - 1;
  else last = month >= 4 ? year : year - 1;
  return [last, last - 1, last - 2];
}

function isoDate(year: number, month: number, day: number): string {
  return `${year}-${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
}

function seasonBucket(dateIso: string, season: Season): number | null {
  const [ys, ms] = dateIso.split("-").map(Number);
  const month = ms;
  if (season === "Kharif") {
    if (month < 6 || month > 10) return null;
    return ys;
  }
  if (season === "Zaid") {
    if (month !== 4 && month !== 5) return null;
    return ys;
  }
  // Rabi: Nov 1 (year-1) → Mar 31 (year). Bucket = the March-ending year.
  if (month >= 11) return ys + 1;
  if (month <= 3) return ys;
  return null;
}

export function computeRisk(
  days: WeatherDay[],
  season: Season,
  crops: string[]
): FarmWeather["risk"] {
  const next3 = days.slice(0, 3);
  const rain3 = next3.reduce((s, d) => s + d.rainMm, 0);
  const rain48 = days.slice(0, 2).reduce((s, d) => s + d.rainMm, 0);
  const minTemp = Math.min(...next3.map((d) => d.tempMin), 99);
  const maxTemp = Math.max(...next3.map((d) => d.tempMax), -99);

  let level: RiskLevel = "LOW";
  if (rain3 > 50) level = "HIGH";
  else if (rain3 > 15) level = "MODERATE";

  const frost = season === "Rabi" && minTemp < 4;
  const heat = season === "Zaid" && maxTemp > 42;
  if ((frost || heat) && level === "LOW") level = "MODERATE";

  const rain3Label = Math.round(rain3);
  let message: Copy;
  if (frost && rain3 <= 15) {
    message = {
      en: `Rabi frost risk: nights near ${Math.round(minTemp)}°C. Standing crop and stored lots can take cold damage.`,
      kn: `ರಬಿ ಹಿಮ ಅಪಾಯ: ರಾತ್ರಿ ಸುಮಾರು ${Math.round(minTemp)}°C. ನಿಂತ ಬೆಳೆ ಮತ್ತು ಸಂಗ್ರಹಿತ ಉತ್ಪನ್ನಕ್ಕೆ ತೊಂದರೆ.`,
    };
  } else if (heat && rain3 <= 15) {
    message = {
      en: `Zaid heat stress: days above ${Math.round(maxTemp)}°C. Harvest early and keep crates off hot ground.`,
      kn: `ಝಾಯ್ದ್ ಶಾಖ: ಗರಿಷ್ಠ ${Math.round(maxTemp)}°C. ಬೆಳಿಗ್ಗೆ ಕೊಯ್ಲು ಮಾಡಿ, ಪೆಟ್ಟಿಗೆಗಳನ್ನು ಬಿಸಿಲಿನಲ್ಲಿ ಬಿಡಬೇಡಿ.`,
    };
  } else if (level === "HIGH") {
    message = {
      en: `Heavy ${season} rain over the next 3 days (${rain3Label} mm). Harvest and White Store drop-off are at risk.`,
      kn: `ಮುಂದಿನ 3 ದಿನ ${season} ಭಾರೀ ಮಳೆ (${rain3Label} ಮಿಮೀ). ಕೊಯ್ಲು ಮತ್ತು ವೈಟ್ ಸ್ಟೋರ್ ಸಾಗಣೆಗೆ ಅಪಾಯ.`,
    };
  } else if (level === "MODERATE") {
    message = {
      en: `${season} showers likely (${rain3Label} mm over 3 days). Time harvest and drop-off around the rain.`,
      kn: `${season} ಮಳೆ ಸಾಧ್ಯತೆ (3 ದಿನಕ್ಕೆ ${rain3Label} ಮಿಮೀ). ಕೊಯ್ಲು ಮತ್ತು ಸಾಗಣೆಯನ್ನು ಮಳೆಗೆ ತಕ್ಕಂತೆ ಯೋಜಿಸಿ.`,
    };
  } else {
    message = {
      en: `${season} outlook is clear for harvest and White Store logistics.`,
      kn: `${season} ಕೊಯ್ಲು ಮತ್ತು ವೈಟ್ ಸ್ಟೋರ್ ಸಾಗಣೆಗೆ ಅನುಕೂಲ.`,
    };
  }

  const actions: Copy[] = [];
  const cropHint = perishableHint(crops);

  if (rain48 > 10) {
    actions.push({
      en: cropHint
        ? `Delay ${cropHint} harvest for 48 hours so fruit is not wet at the counter.`
        : "Delay harvest for 48 hours so produce is not wet at the White Store counter.",
      kn: cropHint
        ? `48 ಗಂಟೆ ${cropHint} ಕೊಯ್ಲು ತಡೆಯಿರಿ — ತೇವವಾದ ಉತ್ಪನ್ನವನ್ನು ಕೌಂಟರ್‌ಗೆ ತರಬೇಡಿ.`
        : "48 ಗಂಟೆ ಕೊಯ್ಲು ತಡೆಯಿರಿ — ತೇವವಾದ ಉತ್ಪನ್ನವನ್ನು ವೈಟ್ ಸ್ಟೋರ್‌ಗೆ ತರಬೇಡಿ.",
    });
  }
  if (rain3 > 15) {
    actions.push({
      en: "Wait to bring lots to the White Store until roads and crates stay dry.",
      kn: "ರಸ್ತೆ ಮತ್ತು ಪೆಟ್ಟಿಗೆಗಳು ಒಣಗುವವರೆಗೆ ವೈಟ್ ಸ್ಟೋರ್‌ಗೆ ತರುವುದನ್ನು ತಡೆಯಿರಿ.",
    });
  }
  if (level === "HIGH") {
    actions.push({
      en: "Cover stored produce and ask the store to delay dispatch if a buyer pickup is booked.",
      kn: "ಸಂಗ್ರಹಿತ ಉತ್ಪನ್ನವನ್ನು ಮುಚ್ಚಿರಿ. ಖರೀದಿದಾರರ ಪಿಕಪ್ ಇದ್ದರೆ ಸ್ಟೋರ್‌ಗೆ ವಿಲಂಬಿಸಲು ಹೇಳಿ.",
    });
  }
  if (frost) {
    actions.push({
      en: "Protect standing crop overnight; keep stored lots off cold floors.",
      kn: "ರಾತ್ರಿ ನಿಂತ ಬೆಳೆಯನ್ನು ರಕ್ಷಿಸಿ; ಸಂಗ್ರಹಿತ ಉತ್ಪನ್ನವನ್ನು ತಣ್ಣನೆಯ ನೆಲದಿಂದ ಮೇಲೆ ಇರಿಸಿ.",
    });
  }
  if (heat) {
    actions.push({
      en: "Harvest at dawn. Do not leave crates in the sun at the store gate.",
      kn: "ಬೆಳಗಿನ ಜಾವ ಕೊಯ್ಲು ಮಾಡಿ. ಸ್ಟೋರ್ ಬಾಗಿಲಲ್ಲಿ ಪೆಟ್ಟಿಗೆಗಳನ್ನು ಬಿಸಿಲಿನಲ್ಲಿ ಬಿಡಬೇಡಿ.",
    });
  }
  if (actions.length === 0) {
    actions.push({
      en: "Good window to harvest and drop off at the White Store.",
      kn: "ಕೊಯ್ಲು ಮಾಡಿ ವೈಟ್ ಸ್ಟೋರ್‌ಗೆ ತಂದು ಬಿಡಲು ಒಳ್ಳೆಯ ಸಮಯ.",
    });
  }

  return { level, message, actions };
}

function perishableHint(crops: string[]): string | null {
  const names = crops.map((c) => c.toLowerCase());
  const hits: string[] = [];
  if (names.some((c) => c.includes("tomato"))) hits.push("tomato");
  if (names.some((c) => c.includes("onion"))) hits.push("onion");
  if (names.some((c) => c.includes("chilli") || c.includes("chili"))) hits.push("chilli");
  if (names.some((c) => c.includes("brinjal"))) hits.push("brinjal");
  return hits.length ? hits.join(" / ") : null;
}

export async function geocodeIndia(query: string): Promise<{
  lat: number;
  lng: number;
  name: string;
  region: string | null;
} | null> {
  const url = new URL("https://geocoding-api.open-meteo.com/v1/search");
  url.searchParams.set("name", query.trim());
  url.searchParams.set("count", "8");
  url.searchParams.set("language", "en");
  url.searchParams.set("format", "json");
  url.searchParams.set("countryCode", "IN");

  const res = await fetch(url, fetchInit(8_000));
  if (!res.ok) return null;
  const json = (await res.json()) as GeocodeJson;
  const results = json.results ?? [];
  if (!results.length) return null;
  const best = [...results].sort((a, b) => (b.population ?? 0) - (a.population ?? 0))[0];
  return {
    lat: roundCoord(best.latitude),
    lng: roundCoord(best.longitude),
    name: best.name,
    region: best.admin1 ?? best.admin2 ?? null,
  };
}

async function fetchForecast(lat: number, lng: number): Promise<ForecastJson> {
  const url = new URL("https://api.open-meteo.com/v1/forecast");
  url.searchParams.set("latitude", String(lat));
  url.searchParams.set("longitude", String(lng));
  url.searchParams.set("current", "temperature_2m,weather_code,relative_humidity_2m");
  url.searchParams.set(
    "daily",
    "weather_code,temperature_2m_max,temperature_2m_min,precipitation_sum,precipitation_probability_max"
  );
  url.searchParams.set("forecast_days", "7");
  url.searchParams.set("timezone", "Asia/Kolkata");

  const res = await fetch(url, fetchInit(20_000));
  if (!res.ok) throw new Error(`Forecast ${res.status}`);
  return (await res.json()) as ForecastJson;
}

async function fetchSeasonalHistory(
  lat: number,
  lng: number,
  season: Season
): Promise<{ avg: number; years: number } | null> {
  const years = lastCompletedSeasonYears(season);
  const oldest = years[years.length - 1];
  const newest = years[0];
  const start =
    season === "Rabi" ? isoDate(oldest - 1, 11, 1) : isoDate(oldest, season === "Zaid" ? 4 : 6, 1);
  const end =
    season === "Kharif"
      ? isoDate(newest, 10, 31)
      : season === "Zaid"
        ? isoDate(newest, 5, 31)
        : isoDate(newest, 3, 31);

  const url = new URL("https://archive-api.open-meteo.com/v1/archive");
  url.searchParams.set("latitude", String(lat));
  url.searchParams.set("longitude", String(lng));
  url.searchParams.set("start_date", start);
  url.searchParams.set("end_date", end);
  url.searchParams.set("daily", "precipitation_sum");
  url.searchParams.set("timezone", "Asia/Kolkata");

  const res = await fetch(url, fetchInit(8_000));
  if (!res.ok) return null;
  const json = (await res.json()) as ArchiveJson;
  const times = json.daily?.time ?? [];
  const rain = json.daily?.precipitation_sum ?? [];
  const totals = new Map<number, number>();
  for (let i = 0; i < times.length; i++) {
    const bucket = seasonBucket(times[i], season);
    if (bucket == null || !years.includes(bucket)) continue;
    const mm = rain[i];
    if (mm == null || Number.isNaN(mm)) continue;
    totals.set(bucket, (totals.get(bucket) ?? 0) + mm);
  }
  const used = [...totals.values()].filter((v) => v > 0);
  if (!used.length) return null;
  const avg = used.reduce((s, v) => s + v, 0) / used.length;
  return { avg: Math.round(avg), years: used.length };
}

export async function fetchFarmWeather(opts: {
  lat: number;
  lng: number;
  placeLabel: string;
  crops?: string[];
}): Promise<FarmWeather | null> {
  const lat = roundCoord(opts.lat);
  const lng = roundCoord(opts.lng);
  const season = currentSeason();

  try {
    const [forecast, history] = await Promise.all([
      fetchForecast(lat, lng),
      fetchSeasonalHistory(lat, lng, season).catch(() => null),
    ]);

    const times = forecast.daily?.time ?? [];
    const days: WeatherDay[] = times.slice(0, 7).map((date, i) => ({
      date,
      weatherCode: forecast.daily?.weather_code?.[i] ?? 1,
      tempMax: forecast.daily?.temperature_2m_max?.[i] ?? 0,
      tempMin: forecast.daily?.temperature_2m_min?.[i] ?? 0,
      rainMm: forecast.daily?.precipitation_sum?.[i] ?? 0,
      rainChance: forecast.daily?.precipitation_probability_max?.[i] ?? null,
    }));
    if (!days.length) return null;

    const currentCode = forecast.current?.weather_code ?? days[0].weatherCode;
    const rainNext48hMm = days.slice(0, 2).reduce((s, d) => s + d.rainMm, 0);
    const rainNext3DaysMm = days.slice(0, 3).reduce((s, d) => s + d.rainMm, 0);

    return {
      lat,
      lng,
      placeLabel: opts.placeLabel,
      season,
      currentTemp: Math.round(forecast.current?.temperature_2m ?? days[0].tempMax),
      currentCode,
      currentLabel: wmoLabel(currentCode),
      humidity: forecast.current?.relative_humidity_2m ?? null,
      days,
      rainNext48hMm,
      rainNext3DaysMm,
      risk: computeRisk(days, season, opts.crops ?? []),
      avgSeasonalRainfallMm: history?.avg ?? null,
      yearsUsed: history?.years ?? 0,
    };
  } catch {
    return null;
  }
}

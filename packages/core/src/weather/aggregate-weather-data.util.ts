export type WeatherDataItem = {
  temperature?: { N: string };
  humidity?: { N: string };
  uv?: { N: string };
  wind_kph?: { N: string };
  pressure_mb?: { N: string };
  precip_mm?: { N: string };
  condition?: { S: string };
}

export type AggregatedWeatherData = {
  date: string;
  summary: {
    minTemp: number;
    maxTemp: number;
    avgTemp: number;
    condition: string;
  };
  details: {
    humidity: {
      min: number;
      max: number;
      avg: number;
    };
    wind: {
      max: number;
      avg: number;
    };
    pressure: {
      min: number;
      max: number;
      avg: number;
    };
    uv: {
      max: number;
      avg: number;
    };
    totalPrecipitation: number;
  };
  meta: {
    dataPoints: string;
  };
}

export module WeatherUtils {
  export function aggregateWeatherData(items: WeatherDataItem[], dateString: string): AggregatedWeatherData {
    if (items.length === 0) {
      throw new Error(`No weather data found for ${dateString}`);
    }

    const temperatures = items.map((item) => parseFloat(item.temperature?.N || "0"));
    const humidities = items.map((item) => parseFloat(item.humidity?.N || "0"));
    const uvValues = items.map((item) => parseFloat(item.uv?.N || "0"));
    const windSpeeds = items.map((item) => parseFloat(item.wind_kph?.N || "0"));
    const pressures = items.map((item) => parseFloat(item.pressure_mb?.N || "0"));
    const precipitations = items.map((item) => parseFloat(item.precip_mm?.N || "0"));

    const conditions = items.map((item) => item.condition?.S || "Unknown");
    const conditionCounts = conditions.reduce(
      (acc, condition) => {
        acc[condition] = (acc[condition] || 0) + 1;
        return acc;
      },
      {} as Record<string, number>
    );
    
    const mostCommonCondition = Object.entries(conditionCounts).sort(
      ([, a], [, b]) => b - a
    )[0][0];

    return {
      date: dateString,
      summary: {
        minTemp: Math.round(Math.min(...temperatures) * 10) / 10,
        maxTemp: Math.round(Math.max(...temperatures) * 10) / 10,
        avgTemp:
          Math.round(
            (temperatures.reduce((a, b) => a + b, 0) / temperatures.length) * 10
          ) / 10,
        condition: mostCommonCondition,
      },
      details: {
        humidity: {
          min: Math.round(Math.min(...humidities)),
          max: Math.round(Math.max(...humidities)),
          avg: Math.round(
            humidities.reduce((a, b) => a + b, 0) / humidities.length
          ),
        },
        wind: {
          max: Math.round(Math.max(...windSpeeds) * 10) / 10,
          avg:
            Math.round(
              (windSpeeds.reduce((a, b) => a + b, 0) / windSpeeds.length) * 10
            ) / 10,
        },
        pressure: {
          min: Math.round(Math.min(...pressures)),
          max: Math.round(Math.max(...pressures)),
          avg: Math.round(
            pressures.reduce((a, b) => a + b, 0) / pressures.length
          ),
        },
        uv: {
          max: Math.round(Math.max(...uvValues) * 10) / 10,
          avg:
            Math.round(
              (uvValues.reduce((a, b) => a + b, 0) / uvValues.length) * 10
            ) / 10,
        },
        totalPrecipitation:
          Math.round(precipitations.reduce((a, b) => a + b, 0) * 10) / 10,
      },
      meta: {
        dataPoints: `${items.length} readings throughout the day`,
      },
    };
  }
}
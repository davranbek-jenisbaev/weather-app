import { Handler } from "aws-lambda";
import { Resource } from "sst";
import { DynamoDBClient, PutItemCommand } from "@aws-sdk/client-dynamodb";

export type WeatherApiResponse = {
  location: {
    name: string;
    region: string;
    country: string;
    lat: number;
    lon: number;
    tz_id: string;
    localtime_epoch: number;
    localtime: string;
  };
  current: {
    last_updated: string;
    temp_c: number;
    condition: {
      text: string;
    };
    wind_kph: number;
    pressure_mb: number;
    precip_mm: number;
    humidity: number;
    feelslike_c: number;
    uv: number;
    air_quality?: {
      co: number;
      no2: number;
      o3: number;
      so2: number;
      pm2_5: number;
      pm10: number;
      "us-epa-index": number;
      "gb-defra-index": number;
    };
  };
};

export const handler: Handler = async (_event) => {
  const dynamoDBClient = new DynamoDBClient();
  const url = `http://api.weatherapi.com/v1/current.json?key=${Resource.WeatherAppApiKey.value}&q=Tashkent&aqi=yes`;
  const response = await fetch(url, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
    },
  });

  if (!response.ok) {
    throw new Error(
      `Failed to fetch weather data: ${response.status} ${response.statusText}`,
    );
  }

  const data = (await response.json()) as WeatherApiResponse;

  await dynamoDBClient.send(
    new PutItemCommand({
      TableName: Resource.WeatherAppTable.tableName,
      Item: {
        PK: { S: "WEATHER" },
        SK: { S: `TS#${data.current.last_updated}` },
        temperature: { N: data.current.temp_c.toString() },
        humidity: { N: data.current.humidity.toString() },
        condition: { S: data.current.condition.text },
        feelslike: { N: data.current.feelslike_c.toString() },
        wind_kph: { N: data.current.wind_kph.toString() },
        pressure_mb: { N: data.current.pressure_mb.toString() },
        precip_mm: { N: data.current.precip_mm.toString() },
        uv: { N: data.current.uv.toString() },
        ...(data.current.air_quality && {
          co: { N: data.current.air_quality.co.toString() },
          no2: { N: data.current.air_quality.no2.toString() },
          o3: { N: data.current.air_quality.o3.toString() },
          so2: { N: data.current.air_quality.so2.toString() },
          pm2_5: { N: data.current.air_quality.pm2_5.toString() },
          pm10: { N: data.current.air_quality.pm10.toString() },
          us_epa_index: {
            N: data.current.air_quality["us-epa-index"].toString(),
          },
          gb_defra_index: {
            N: data.current.air_quality["gb-defra-index"].toString(),
          },
        }),
      },
    }),
  );
};

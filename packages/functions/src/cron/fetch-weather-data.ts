import { Handler } from "aws-lambda";
import { Resource } from "sst";
import { DynamoDBClient, PutItemCommand } from "@aws-sdk/client-dynamodb";

type WeatherApiResponse = {
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
  try {
    console.log("Starting weather data fetch process");
    const dynamoDBClient = new DynamoDBClient();
    const url = `http://api.weatherapi.com/v1/current.json?key=${Resource.WeatherAppApiKey.value}&q=Tashkent&aqi=yes`;
    console.log(`Fetching weather data from API`);
    
    const response = await fetch(url, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    }).catch(error => {
      console.error(`API request failed: ${error.message}`);
      throw error;
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`Weather API returned error: ${response.status} ${response.statusText} - ${errorText}`);
      throw new Error(
        `Failed to fetch weather data: ${response.status} ${response.statusText}`,
      );
    }

    console.log("Weather API request successful");
    
    let data: WeatherApiResponse;
    try {
      data = await response.json() as WeatherApiResponse;
      console.log(`Weather data received for ${data.location.name} at ${data.current.last_updated}`);
    } catch (parseError) {
      console.error(`Failed to parse API response: ${parseError}`);
      throw parseError;
    }

    console.log(`Saving weather data to DynamoDB`);
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
    ).catch(error => {
      console.error(`Failed to save weather data to DynamoDB: ${error.message}`);
      throw error;
    });
    
    console.log("Weather data saved successfully");
  } catch (error) {
    console.error(`Error in fetch weather data process: ${error}`);
    throw error;
  }
};

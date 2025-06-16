import { Handler } from "aws-lambda";
import { DynamoDBClient, QueryCommand } from "@aws-sdk/client-dynamodb";
import { Resource } from "sst";

export const handler: Handler = async (event) => {
  try {
    const dynamoDBClient = new DynamoDBClient();

    const result = await dynamoDBClient.send(
      new QueryCommand({
        TableName: Resource.WeatherAppTable.tableName,
        KeyConditionExpression: "PK = :pk",
        ExpressionAttributeValues: {
          ":pk": { S: "WEATHER" },
        },
        ScanIndexForward: false,
        Limit: 1,
      }),
    );

    if (!result.Items || result.Items.length === 0) {
      return {
        statusCode: 404,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          error: "No weather data found",
        }),
      };
    }

    const item = result.Items[0];

    const weatherData = {
      timestamp: item.SK.S?.replace("TS#", ""),
      temperature: parseFloat(item.temperature.N || "0"),
      humidity: parseInt(item.humidity.N || "0"),
      condition: item.condition.S,
      feelslike: parseFloat(item.feelslike.N || "0"),
      wind_kph: parseFloat(item.wind_kph.N || "0"),
      pressure_mb: parseFloat(item.pressure_mb.N || "0"),
      precip_mm: parseFloat(item.precip_mm.N || "0"),
      uv: parseFloat(item.uv.N || "0"),
      ...(item.co && {
        air_quality: {
          co: parseFloat(item.co.N || "0"),
          no2: parseFloat(item.no2.N || "0"),
          o3: parseFloat(item.o3.N || "0"),
          so2: parseFloat(item.so2.N || "0"),
          pm2_5: parseFloat(item.pm2_5.N || "0"),
          pm10: parseFloat(item.pm10.N || "0"),
          us_epa_index: parseInt(item.us_epa_index.N || "0"),
          gb_defra_index: parseInt(item.gb_defra_index.N || "0"),
        },
      }),
    };

    return {
      statusCode: 200,
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        success: true,
        data: weatherData,
      }),
    };
  } catch (error) {
    console.error("Error fetching weather data:", error);

    return {
      statusCode: 500,
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        error: "Internal server error",
      }),
    };
  }
};

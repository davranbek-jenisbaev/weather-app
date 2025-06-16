import { Handler } from "aws-lambda";
import { DynamoDBClient, QueryCommand } from "@aws-sdk/client-dynamodb";
import { SQSClient, SendMessageCommand } from "@aws-sdk/client-sqs";
import { Resource } from "sst";
import { WeatherUtils } from "@weather-app/core/weather";

export const handler: Handler = async (_event) => {
  try {
    console.log("Starting weather data aggregation");
    const dynamoDBClient = new DynamoDBClient();
    const sqsClient = new SQSClient();

    const todayDateString = new Date().toLocaleDateString("en-CA", {
      timeZone: "Asia/Tashkent",
    });
    console.log(`Getting weather data for date: ${todayDateString}`);

    const queryResult = await dynamoDBClient.send(
      new QueryCommand({
        TableName: Resource.WeatherAppTable.tableName,
        KeyConditionExpression: "PK = :pk AND begins_with(SK, :datePrefix)",
        ExpressionAttributeValues: {
          ":pk": { S: "WEATHER" },
          ":datePrefix": { S: `TS#${todayDateString}` },
        },
      }),
    ).catch(error => {
      console.error(`DynamoDB query failed: ${error.message}`);
      throw error;
    });

    const items = queryResult.Items || [];
    console.log(`Found ${items.length} weather data points`);

    if (items.length === 0) {
      console.log(`No weather data found for ${todayDateString}`);
      return;
    }

    const aggregatedData = WeatherUtils.aggregateWeatherData(items, todayDateString);
    console.log(`Weather data successfully aggregated for ${todayDateString}`);

    await sqsClient.send(
      new SendMessageCommand({
        QueueUrl: Resource.EmailQueue.url,
        MessageBody: JSON.stringify(aggregatedData),
      }),
    ).catch(error => {
      console.error(`Failed to send message to SQS: ${error.message}`);
      throw error;
    });

    console.log("Weather summary sent to email queue successfully");
  } catch (error) {
    console.error(`Error in weather aggregation: ${error}`);
    throw error;
  }
};

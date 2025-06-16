import { Handler } from "aws-lambda";
import { DynamoDBClient, QueryCommand } from "@aws-sdk/client-dynamodb";
import { SQSClient, SendMessageCommand } from "@aws-sdk/client-sqs";
import { Resource } from "sst";
import { WeatherUtils } from "@weather-app/core/weather";

export const handler: Handler = async (_event) => {
  const dynamoDBClient = new DynamoDBClient();
  const sqsClient = new SQSClient();

  const todayDateString = new Date().toLocaleDateString("en-CA", {
    timeZone: "Asia/Tashkent",
  });

  const queryResult = await dynamoDBClient.send(
    new QueryCommand({
      TableName: Resource.WeatherAppTable.tableName,
      KeyConditionExpression: "PK = :pk AND begins_with(SK, :datePrefix)",
      ExpressionAttributeValues: {
        ":pk": { S: "WEATHER" },
        ":datePrefix": { S: `TS#${todayDateString}` },
      },
    }),
  );

  const items = queryResult.Items || [];

  if (items.length === 0) {
    console.log(`No weather data found for ${todayDateString}`);
    return;
  }

  const aggregatedData = WeatherUtils.aggregateWeatherData(items, todayDateString);

  await sqsClient.send(
    new SendMessageCommand({
      QueueUrl: Resource.EmailQueue.url,
      MessageBody: JSON.stringify(aggregatedData),
    }),
  );

  console.log("Weather summary sent to email queue:", aggregatedData);
};

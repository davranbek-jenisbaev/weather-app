import { Handler } from "aws-lambda";
import { DynamoDBClient, PutItemCommand } from "@aws-sdk/client-dynamodb";
import { Resource } from "sst";
import { z } from "zod";
import { JsonUtil } from "@weather-app/core/shared";

const subscribeSchema = z.object({
  email: z.string().email("Invalid email format").trim(),
});

export const handler: Handler = async (event) => {
  try {
    const body = JsonUtil.safeParse(event.body);
    const { email } = subscribeSchema.parse(body);

    const dynamoDBClient = new DynamoDBClient();

    await dynamoDBClient.send(
      new PutItemCommand({
        TableName: Resource.WeatherAppTable.tableName,
        Item: {
          PK: { S: `EMAIL#${email}` },
          SK: { S: "SUB" },
          email: { S: email },
          subscribedAt: { S: new Date().toISOString() },
          status: { S: "active" },
        },
        ConditionExpression: "attribute_not_exists(PK)",
      }),
    );

    console.log(`New subscription created for: ${email}`);

    return {
      statusCode: 201,
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        message: "Subscription created successfully",
        email: email,
      }),
    };
  } catch (error) {
    console.error("Error creating subscription:", error);

    if (error instanceof z.ZodError) {
      return {
        statusCode: 400,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          error: error.errors[0].message,
        }),
      };
    }

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

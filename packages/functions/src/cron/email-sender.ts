import { DynamoDBClient, ScanCommand } from "@aws-sdk/client-dynamodb";
import { Handler, SQSEvent, SQSRecord } from "aws-lambda";
import { Resource } from "sst";
import { EmailTemplateUtils } from "@weather-app/core/weather";

const apiKey = Resource.ResendApiKey.value;
const domain = Resource.ResendDomain.value;

export const handler: Handler = async (event: SQSEvent) => {
  const dynamoDBClient = new DynamoDBClient();
  const failedMessageIds: string[] = [];

  try {
    const subscribers = await dynamoDBClient
      .send(
        new ScanCommand({
          TableName: Resource.WeatherAppTable.tableName,
          FilterExpression: "begins_with(PK, :pk) AND SK = :sk",
          ExpressionAttributeValues: {
            ":pk": { S: "EMAIL#" },
            ":sk": { S: "SUB" },
          },
        }),
      )
      .catch((error) => {
        console.error("Failed to fetch subscribers:", error);
        throw new Error("Database error: Unable to retrieve subscribers");
      });

    const subscriberEmails =
      (subscribers.Items?.map((item) => item.email.S).filter(
        Boolean,
      ) as string[]) || [];

    console.log("Sending emails to subscribers:", subscriberEmails);

    if (subscriberEmails.length === 0) {
      console.warn("No subscribers found. No emails will be sent.");
    }

    for (const record of event.Records) {
      await processRecord(record, subscriberEmails).catch((error) => {
        console.error(`Failed to process message ${record.messageId}:`, error);
        failedMessageIds.push(record.messageId);
      });
    }

    if (failedMessageIds.length > 0) {
      console.error(
        `Failed to process ${failedMessageIds.length} messages:`,
        failedMessageIds,
      );
      if (failedMessageIds.length === event.Records.length) {
        throw new Error("All messages failed to process");
      }
    } else {
      console.log(`Successfully processed ${event.Records.length} messages`);
    }
  } catch (error) {
    console.error("Fatal error in email sender:", error);
    throw error;
  }
};

async function processRecord(
  record: SQSRecord,
  subscriberEmails: string[],
): Promise<void> {
  try {
    const weatherData = JSON.parse(record.body);

    const emailHtml = EmailTemplateUtils.buildWeatherEmail(weatherData);
    const emailSubject = EmailTemplateUtils.getEmailSubject(weatherData);

    const response = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        from: `Weather Updates <no-reply@${domain}>`,
        to: subscriberEmails,
        subject: emailSubject,
        html: emailHtml,
      }),
    });

    if (!response.ok) {
      const errorData = await response.text();
      throw new Error(`Resend API error: ${response.status} - ${errorData}`);
    }

    console.log(`Email sent successfully for message ${record.messageId}`);
  } catch (error) {
    if (error instanceof SyntaxError) {
      console.error("Failed to parse SQS message body:", error);
    }
    throw error;
  }
}

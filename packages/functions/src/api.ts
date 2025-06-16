import { Resource } from "sst";
import { Handler } from "aws-lambda";
import { Example } from "@weather-app/core/example";

export const handler: Handler = async (_event) => {
  return {
    statusCode: 200,
    body: `${Example.hello()} Linked to ${Resource.MyBucket.name} and also linked to the dynamodb table btw (${Resource.WeatherApp.tableName}).`,
  };
};

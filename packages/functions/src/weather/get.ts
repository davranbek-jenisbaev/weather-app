import { Handler } from "aws-lambda";

export const handler: Handler = async (event) => {
  // fetch data from DynamoDB

  return {
    statusCode: 200,
    body: "got weather by location = " + event?.pathParameters?.location,
  };
};

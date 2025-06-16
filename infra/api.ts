import { weatherAppTable } from "./db";

const api = new sst.aws.ApiGatewayV2("WeatherAppApi", {
  link: [weatherAppTable],
});

api.route("GET /weather", "packages/functions/src/weather/get.handler");

api.route(
  "POST /subscriptions",
  "packages/functions/src/subscriptions/create.handler",
);

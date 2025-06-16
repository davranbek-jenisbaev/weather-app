import { weatherAppTable } from "./db";
import { emailQueue } from "./queue";
import { weatherAppApiKeySecret } from "./secrets";

new sst.aws.Cron("WeatherDataFetcherCron", {
  schedule: "rate(15 minutes)",
  function: {
    handler: "packages/functions/src/cron/fetch-weather-data.handler",
    link: [weatherAppTable, weatherAppApiKeySecret],
  },
});

new sst.aws.Cron("AggregateAndSendEmailCron", {
  schedule: "cron(0 16 * * ? *)",
  function: {
    handler: "packages/functions/src/cron/aggregate-weather-data.handler",
    link: [weatherAppTable, emailQueue],
  },
});

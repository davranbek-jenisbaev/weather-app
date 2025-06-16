/// <reference path="./.sst/platform/config.d.ts" />

export default $config({
  app(input) {
    return {
      name: "weather-app",
      removal: input?.stage === "production" ? "retain" : "remove",
      protect: ["production"].includes(input?.stage),
      home: "aws",
    };
  },
  async run() {
    new sst.Secret("WeatherAppApiKey");

    const db = await import("./infra/db");
    await import("./infra/api");
    await import("./infra/cron");
    await import("./infra/queue");

    return {
      WeatherAppTable: db.weatherAppTable.name,
    };
  },
});

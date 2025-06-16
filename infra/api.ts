import { weatherAppTable } from "./db";
import { bucket } from "./storage";

export const myApi = new sst.aws.Function("MyApi", {
  url: true,
  link: [bucket, weatherAppTable],
  handler: "packages/functions/src/api.handler",
});

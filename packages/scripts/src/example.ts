import { Resource } from "sst";
import { Example } from "@weather-app/core/example";

console.log(`${Example.hello()} Linked to ${Resource.MyBucket.name}.`);

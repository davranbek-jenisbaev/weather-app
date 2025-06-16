/*
 *
// Raw weather fetch
PK: "WEATHER"
SK: "TS#2024-06-21T14:30:00Z"
temperature: 25.5
humidity: 68
condition: "Partly Cloudy"  
data: { ... full API response ... }

// User subscription
PK: "EMAIL#john@example.com"
SK: "SUB"
*
*/

sst.Linkable.wrap(aws.dynamodb.Table, (table) => ({
  properties: { tableName: table.name },
  include: [
    sst.aws.permission({
      actions: ["dynamodb:*"],
      resources: [table.arn],
    }),
  ],
}));

export const weatherAppTable = new aws.dynamodb.Table("WeatherAppTable", {
  attributes: [
    { name: "PK", type: "S" },
    { name: "SK", type: "S" },
  ],
  hashKey: "PK",
  rangeKey: "SK",

  billingMode: "PROVISIONED",
  readCapacity: 25,
  writeCapacity: 25,
});

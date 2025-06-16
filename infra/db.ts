sst.Linkable.wrap(aws.dynamodb.Table, (table) => ({
  properties: { tableName: table.name },
  include: [
    sst.aws.permission({
      actions: ["dynamodb:*"],
      resources: [table.arn],
    }),
  ],
}));

export const weatherAppTable = new aws.dynamodb.Table("WeatherApp", {
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

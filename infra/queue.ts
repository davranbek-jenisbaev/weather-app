export const emailQueue = new sst.aws.Queue("EmailQueue");

emailQueue.subscribe("packages/functions/src/cron/email-sender.handler");

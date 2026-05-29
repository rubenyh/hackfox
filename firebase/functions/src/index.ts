import { setGlobalOptions } from "firebase-functions";
import * as logger from "firebase-functions/logger";
import { onRequest } from "firebase-functions/v2/https";

setGlobalOptions({ maxInstances: 10 });

export const healthCheck = onRequest((request, response) => {
  logger.info("Health check endpoint.");
  response.send("OK");
});

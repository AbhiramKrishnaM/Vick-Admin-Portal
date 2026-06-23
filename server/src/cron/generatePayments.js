import cron from "node-cron";
import { generateInternetPayments } from "../services/internetPayment.service.js";
import { generateCablePayments } from "../services/cablePayment.service.js";

async function runGeneration(fastify) {
  try {
    let total = 0;
    let generated;
    do {
      const [internet, cable] = await Promise.all([
        generateInternetPayments(fastify),
        generateCablePayments(fastify),
      ]);
      generated = internet + cable;
      total += generated;
    } while (generated > 0);

    if (total > 0) {
      fastify.log.info(`Payment cron: generated ${total} new payment record(s)`);
    }
  } catch (err) {
    fastify.log.error({ err }, "Payment cron failed");
  }
}

export function startPaymentCron(fastify) {
  // Run once on startup to catch any missed periods
  runGeneration(fastify);

  // Then fire every day at midnight
  cron.schedule("0 0 * * *", () => runGeneration(fastify));
}

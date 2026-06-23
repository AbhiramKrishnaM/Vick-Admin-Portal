import { generateInternetPayments } from "../services/internetPayment.service.js";
import { generateCablePayments } from "../services/cablePayment.service.js";

async function runGeneration(fastify) {
  try {
    let total = 0;
    let generated;
    // Loop to catch up if multiple periods were missed (e.g. server was down)
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
  runGeneration(fastify);
  setInterval(() => runGeneration(fastify), 24 * 60 * 60 * 1000);
}

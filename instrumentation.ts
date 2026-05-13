
export async function register() {
  if (process.env.NEXT_RUNTIME === 'nodejs') {

    const cron = await import('node-cron');
    const { evaluateReorderingRules } = await import('./actions/scheduled/evaluateReorderingRules');

    cron.schedule('0 6 * * *', async () => {
      await evaluateReorderingRules();
    });
  }
}

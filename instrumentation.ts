
export async function register() {
  if (process.env.NEXT_RUNTIME === 'nodejs') {

    const cron = await import('node-cron');

    /*
    cron.schedule('* * * * *', async () => {

      await completePurchaseOrders()
    });
    */
  }
}

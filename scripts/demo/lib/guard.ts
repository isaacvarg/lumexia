// guard so demo data can never be seeded into a production instance by accident
// DEMO_SEED env var must be explicitly set to true
export const assertDemoEnv = (): void => {
  if (process.env.DEMO_SEED !== 'true') {
    console.error(
      '\n😭 Hold up!: DEMO_SEED must be set to "true".\n' +
      '   This guard prevents demo data from being seeded into a real instance.\n' +
      '   Set DEMO_SEED=true in the demo deployment\'s .env to proceed.\n',
    );
    process.exit(1);
  }
};

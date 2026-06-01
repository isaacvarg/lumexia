import Link from 'next/link';

export default function HomePage() {
  return (
    <div className="flex flex-col justify-center text-center flex-1 gap-4">
      <h1 className="text-2xl font-bold">Lumexia Documentation</h1>
      <p className="text-fd-muted-foreground">
        The wiki for the Lumexia manufacturing &amp; inventory ERP.
      </p>
      <p>
        Head to the{' '}
        <Link href="/docs" className="font-medium underline">
          documentation
        </Link>{' '}
        to get started.
      </p>
    </div>
  );
}

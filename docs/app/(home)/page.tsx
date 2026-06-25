import Image from 'next/image';
import Link from 'next/link';
import {
  ArrowRight,
  Boxes,
  Calculator,
  ClipboardCheck,
  ExternalLink,
  FlaskConical,
  PackageOpen,
  ShoppingCart,
  Truck,
} from 'lucide-react';
import { gitConfig } from '@/lib/shared';

// Live demo URL — replace with the real demo link when available.
const DEMO_URL = '#';

const githubUrl = `https://github.com/${gitConfig.user}/${gitConfig.repo}`;

function GithubIcon({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="currentColor"
      aria-hidden="true"
      className={className}
    >
      <path d="M12 .5C5.37.5 0 5.87 0 12.5c0 5.3 3.44 9.8 8.21 11.39.6.11.82-.26.82-.58 0-.29-.01-1.05-.02-2.06-3.34.73-4.04-1.61-4.04-1.61-.55-1.39-1.34-1.76-1.34-1.76-1.09-.75.08-.73.08-.73 1.21.09 1.84 1.24 1.84 1.24 1.07 1.84 2.81 1.31 3.5 1 .11-.78.42-1.31.76-1.61-2.67-.3-5.47-1.34-5.47-5.95 0-1.31.47-2.39 1.24-3.23-.13-.31-.54-1.53.12-3.19 0 0 1.01-.32 3.3 1.23a11.5 11.5 0 0 1 6 0c2.29-1.55 3.3-1.23 3.3-1.23.66 1.66.25 2.88.12 3.19.77.84 1.24 1.92 1.24 3.23 0 4.62-2.81 5.64-5.49 5.94.43.37.81 1.1.81 2.22 0 1.6-.01 2.89-.01 3.29 0 .32.21.7.83.58A12.01 12.01 0 0 0 24 12.5C24 5.87 18.63.5 12 .5z" />
    </svg>
  );
}

const features = [
  {
    title: 'Inventory',
    href: '/docs/inventory',
    description:
      'On-hand, allocated, and available quantities, QR labels, audits, and trends.',
    icon: Boxes,
  },
  {
    title: 'Purchasing',
    href: '/docs/purchasing',
    description: 'Procurement requests, purchase orders, and supplier management.',
    icon: ShoppingCart,
  },
  {
    title: 'Receiving',
    href: '/docs/receiving',
    description: 'Partial PO and line-item receiving.',
    icon: Truck,
  },
  {
    title: 'Production',
    href: '/docs/production',
    description: 'Master batch records and batch production records with lot tracing.',
    icon: PackageOpen,
  },
  {
    title: 'Quality',
    href: '/docs/quality',
    description: 'Parameters, specifications, and quality examinations.',
    icon: ClipboardCheck,
  },
  {
    title: 'Accounting',
    href: '/docs/accounting',
    description: 'Purchase-order matching and related accounting workflows.',
    icon: Calculator,
  },
  {
    title: 'Research & Development',
    href: '/docs/research',
    description: 'Experiments, methods, costs, and parameter measurements.',
    icon: FlaskConical,
  },
];

const techStack = [
  'Next.js',
  'TypeScript',
  'PostgreSQL',
  'Prisma',
  'RustFS',
  'Docker',
];

export default function HomePage() {
  return (
    <main className="flex flex-1 flex-col">
      {/* Hero */}
      <section className="mx-auto flex w-full max-w-5xl flex-col items-center px-4 pt-16 pb-10 text-center sm:pt-24">
        <h1 className="text-4xl font-bold tracking-tight sm:text-5xl">
          Manufacturing, quality &amp; inventory, end to end
        </h1>
        <p className="mt-4 max-w-2xl text-lg text-fd-muted-foreground">
          Lumexia brings procurement, inventory, production, quality, pricing, and
          research &amp; development into one place so your business stays organized,
          traceable, and in control.
        </p>
        <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
          <Link
            href="/docs"
            className="inline-flex items-center gap-2 rounded-lg bg-fd-primary px-5 py-2.5 text-sm font-medium text-fd-primary-foreground transition-opacity hover:opacity-90"
          >
            Get Started
            <ArrowRight className="size-4" />
          </Link>
          <Link
            href={DEMO_URL}
            className="inline-flex items-center gap-2 rounded-lg border border-fd-border bg-fd-card px-5 py-2.5 text-sm font-medium transition-colors hover:bg-fd-accent"
          >
            Live Demo
            <ExternalLink className="size-4" />
          </Link>
          <a
            href={githubUrl}
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-2 rounded-lg border border-fd-border bg-fd-card px-5 py-2.5 text-sm font-medium transition-colors hover:bg-fd-accent"
          >
            <GithubIcon className="size-4" />
            GitHub
          </a>
        </div>
      </section>

      {/* Screenshot */}
      <section className="mx-auto w-full max-w-6xl px-4 pb-16">
        <div className="overflow-hidden rounded-lg border border-fd-border shadow-lg">
          <Image
            src="/screenshot.png"
            alt="Lumexia application screenshot"
            width={2560}
            height={1440}
            priority
            className="h-auto w-full"
          />
        </div>
      </section>

      {/* Feature cards */}
      <section className="mx-auto w-full max-w-6xl px-4 pb-16">
        <h2 className="mb-6 text-center text-2xl font-semibold">Modules</h2>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {features.map((feature) => {
            const Icon = feature.icon;
            return (
              <Link
                key={feature.href}
                href={feature.href}
                className="group flex flex-col rounded-lg border border-fd-border bg-fd-card p-5 transition-colors hover:bg-fd-accent"
              >
                <Icon className="size-6 text-fd-primary" />
                <h3 className="mt-3 font-semibold">{feature.title}</h3>
                <p className="mt-1 text-sm text-fd-muted-foreground">
                  {feature.description}
                </p>
              </Link>
            );
          })}
        </div>
      </section>

      {/* Tech stack */}
      <section className="mx-auto w-full max-w-5xl px-4 pb-16">
        <div className="flex flex-wrap items-center justify-center gap-2">
          {techStack.map((tech) => (
            <span
              key={tech}
              className="rounded-full border border-fd-border bg-fd-card px-3 py-1 text-sm text-fd-muted-foreground"
            >
              {tech}
            </span>
          ))}
        </div>
      </section>

      {/* Footer */}
      <footer className="mt-auto border-t border-fd-border">
        <div className="mx-auto flex w-full max-w-6xl flex-col items-center justify-between gap-3 px-4 py-6 text-sm text-fd-muted-foreground sm:flex-row">
          <span>© {new Date().getFullYear()} Isaac Vargas</span>
          <a
            href={githubUrl}
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-2 transition-colors hover:text-fd-foreground"
          >
            <GithubIcon className="size-4" />
            GitHub
          </a>
        </div>
      </footer>
    </main>
  );
}

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
import { GithubIcon, githubUrl, Hero } from './hero';
import {
  FeatureSection,
  PrimaryLink,
  SecondaryLink,
} from './feature-section';

// Live demo URL — replace with the real demo link when available.
const DEMO_URL = '#';

// Placeholder image reused across highlight sections — swap per section later.
const DEMO_IMAGE = {
  src: '/demo.png',
  alt: 'Lumexia application screenshot',
  width: 2560,
  height: 1440,
} as const;

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
      <Hero />

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

      {/* Feature highlights */}
      <FeatureSection
        layout="center"
        title="See everything in one place"
        description="A single, traceable source of truth across procurement, inventory, production, and quality — so nothing slips through the cracks."
        image={DEMO_IMAGE}
      >
        <PrimaryLink href="/docs">
          Get Started
          <ArrowRight className="size-4" />
        </PrimaryLink>
        <SecondaryLink href={DEMO_URL} external>
          Live Demo
          <ExternalLink className="size-4" />
        </SecondaryLink>
      </FeatureSection>

      <FeatureSection
        layout="image-right"
        title="Inventory you can trust"
        description="Track on-hand, allocated, and available quantities in real time, with QR labels, audits, and trend reporting to keep counts accurate."
        image={DEMO_IMAGE}
      >
        <PrimaryLink href="/docs/inventory">
          Explore Inventory
          <ArrowRight className="size-4" />
        </PrimaryLink>
      </FeatureSection>

      <FeatureSection
        layout="image-left"
        title="Production and quality, connected"
        description="Master and batch production records with full lot tracing, tied directly to parameters, specifications, and quality examinations."
        image={DEMO_IMAGE}
      >
        <PrimaryLink href="/docs/production">
          Explore Production
          <ArrowRight className="size-4" />
        </PrimaryLink>
        <SecondaryLink href="/docs/quality">
          Quality
          <ArrowRight className="size-4" />
        </SecondaryLink>
      </FeatureSection>

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

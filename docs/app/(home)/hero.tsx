'use client';

import Image from 'next/image';
import Link from 'next/link';
import { ArrowRight, ExternalLink } from 'lucide-react';
import { motion, useReducedMotion, type Variants } from 'motion/react';
import { gitConfig } from '@/lib/shared';

const DEMO_URL = '#';

export const githubUrl = `https://github.com/${gitConfig.user}/${gitConfig.repo}`;

export function GithubIcon({ className }: { className?: string }) {
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

const HEADER = 'Manufacturing, quality & inventory, end to end';
const WORDS = HEADER.split(' ');

const WORD_STAGGER = 0.05;
const HEADER_DURATION = WORDS.length * WORD_STAGGER;

const headerContainer: Variants = {
  hidden: {},
  visible: {
    transition: { staggerChildren: WORD_STAGGER },
  },
};

const wordVariant: Variants = {
  hidden: { opacity: 0, y: 8 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.3, ease: 'easeOut' },
  },
};

function fadeUp(delay: number, duration = 0.4): Variants {
  return {
    hidden: { opacity: 0, y: 12 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { delay, duration, ease: 'easeOut' },
    },
  };
}

export function Hero() {
  const reduceMotion = useReducedMotion();

  const initial = reduceMotion ? false : 'hidden';

  return (
    <>
      {/* Hero */}
      <section className="mx-auto flex w-full max-w-5xl flex-col items-center px-4 pt-16 pb-10 text-center sm:pt-24">
        <motion.h1
          className="text-4xl font-bold tracking-tight sm:text-5xl"
          variants={headerContainer}
          initial={initial}
          animate="visible"
        >
          {WORDS.map((word, i) => (
            <motion.span
              key={`${word}-${i}`}
              className="inline-block"
              variants={reduceMotion ? undefined : wordVariant}
            >
              {word}
              {i < WORDS.length - 1 ? ' ' : ''}
            </motion.span>
          ))}
        </motion.h1>

        <motion.p
          className="mt-4 max-w-2xl text-lg text-fd-muted-foreground"
          variants={fadeUp(HEADER_DURATION)}
          initial={initial}
          animate="visible"
        >
          Lumexia brings procurement, inventory, production, quality, pricing, and
          research &amp; development into one place so your business stays organized,
          traceable, and in control.
        </motion.p>

        <motion.div
          className="mt-8 flex flex-wrap items-center justify-center gap-3"
          variants={fadeUp(HEADER_DURATION + 0.15)}
          initial={initial}
          animate="visible"
        >
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
        </motion.div>
      </section>

      {/* Screenshot */}
      <section className="mx-auto w-full max-w-6xl px-4 pb-16">
        <motion.div
          className="overflow-hidden rounded-lg border border-fd-border shadow-lg"
          variants={fadeUp(HEADER_DURATION + 0.3, 0.5)}
          initial={initial}
          animate="visible"
        >
          <Image
            src="/demo.png"
            alt="Lumexia application screenshot"
            width={2560}
            height={1440}
            priority
            className="h-auto w-full"
          />
        </motion.div>
      </section>
    </>
  );
}

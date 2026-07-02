'use client';

import type { ReactNode } from 'react';
import Link from 'next/link';
import { motion, useReducedMotion, type Variants } from 'motion/react';
import { ImageZoom } from '@/components/image-zoom';

type Layout = 'center' | 'image-left' | 'image-right';

interface FeatureImage {
  src: string;
  alt: string;
  width: number;
  height: number;
}

interface FeatureSectionProps {
  layout: Layout;
  title: string;
  description: ReactNode;
  image: FeatureImage;
  children?: ReactNode;
}

const container: Variants = {
  hidden: {},
  visible: {
    transition: { staggerChildren: 0.12 },
  },
};

const fadeUp: Variants = {
  hidden: { opacity: 0, y: 16 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, ease: 'easeOut' },
  },
};

function imageSlide(offset: number): Variants {
  return {
    hidden: { opacity: 0, x: offset },
    visible: {
      opacity: 1,
      x: 0,
      transition: { duration: 0.5, ease: 'easeOut' },
    },
  };
}

const frameClass =
  'overflow-hidden rounded-lg border border-fd-border shadow-lg';

function FramedImage({
  image,
  variants,
}: {
  image: FeatureImage;
  variants: Variants;
}) {
  return (
    <motion.div className={frameClass} variants={variants}>
      <ImageZoom
        src={image.src}
        alt={image.alt}
        width={image.width}
        height={image.height}
        className="!my-0 h-auto w-full"
      />
    </motion.div>
  );
}

export function FeatureSection({
  layout,
  title,
  description,
  image,
  children,
}: FeatureSectionProps) {
  const reduceMotion = useReducedMotion();
  const initial = reduceMotion ? false : 'hidden';

  const viewport = { once: true, amount: 0.3 } as const;

  if (layout === 'center') {
    return (
      <motion.section
        className="mx-auto flex w-full max-w-5xl flex-col items-center px-4 py-16 text-center sm:py-24"
        variants={container}
        initial={initial}
        whileInView="visible"
        viewport={viewport}
      >
        <FramedImage image={image} variants={fadeUp} />
        <motion.h2
          className="mt-8 text-3xl font-bold tracking-tight sm:text-4xl"
          variants={fadeUp}
        >
          {title}
        </motion.h2>
        <motion.p
          className="mt-4 max-w-2xl text-lg text-fd-muted-foreground"
          variants={fadeUp}
        >
          {description}
        </motion.p>
        {children ? (
          <motion.div
            className="mt-8 flex flex-wrap items-center justify-center gap-3"
            variants={fadeUp}
          >
            {children}
          </motion.div>
        ) : null}
      </motion.section>
    );
  }

  const imageLeft = layout === 'image-left';

  return (
    <motion.section
      className="mx-auto grid w-full max-w-6xl grid-cols-1 items-center gap-8 px-4 py-16 lg:grid-cols-2 lg:gap-12 lg:py-24"
      variants={container}
      initial={initial}
      whileInView="visible"
      viewport={viewport}
    >
      <div className={imageLeft ? 'lg:order-1' : 'lg:order-2'}>
        <FramedImage
          image={image}
          variants={imageSlide(imageLeft ? -32 : 32)}
        />
      </div>
      <div
        className={`flex flex-col items-start ${
          imageLeft ? 'lg:order-2' : 'lg:order-1'
        }`}
      >
        <motion.h2
          className="text-3xl font-bold tracking-tight sm:text-4xl"
          variants={fadeUp}
        >
          {title}
        </motion.h2>
        <motion.p
          className="mt-4 text-lg text-fd-muted-foreground"
          variants={fadeUp}
        >
          {description}
        </motion.p>
        {children ? (
          <motion.div
            className="mt-8 flex flex-wrap items-center gap-3"
            variants={fadeUp}
          >
            {children}
          </motion.div>
        ) : null}
      </div>
    </motion.section>
  );
}

const primaryClass =
  'inline-flex items-center gap-2 rounded-lg bg-fd-primary px-5 py-2.5 text-sm font-medium text-fd-primary-foreground transition-opacity hover:opacity-90';

const secondaryClass =
  'inline-flex items-center gap-2 rounded-lg border border-fd-border bg-fd-card px-5 py-2.5 text-sm font-medium transition-colors hover:bg-fd-accent';

interface CtaProps {
  href: string;
  external?: boolean;
  children: ReactNode;
}

function Cta({ href, external, children, className }: CtaProps & { className: string }) {
  if (external) {
    return (
      <a href={href} target="_blank" rel="noreferrer" className={className}>
        {children}
      </a>
    );
  }
  return (
    <Link href={href} className={className}>
      {children}
    </Link>
  );
}

export function PrimaryLink(props: CtaProps) {
  return <Cta {...props} className={primaryClass} />;
}

export function SecondaryLink(props: CtaProps) {
  return <Cta {...props} className={secondaryClass} />;
}

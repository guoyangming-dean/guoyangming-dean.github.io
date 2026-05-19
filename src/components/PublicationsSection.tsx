import React from "react";
import MotionWrapper from "./MotionWrapper";
import { GlassCard } from "./ui/glass-card";
import { motion } from "framer-motion";
import type { PublicationsMineEntry } from "@/lib/publications-mine";

interface PublicationsSectionProps {
  publications: PublicationsMineEntry[];
}

function renderAuthors(authors: string) {
  const authorName = "Yangming Guo";
  const parts = authors.split(authorName);

  if (parts.length === 1) {
    return authors;
  }

  return parts.map((part, index) => (
    <React.Fragment key={`${part}-${index}`}>
      {part}
      {index < parts.length - 1 && (
        <strong className="font-semibold text-foreground">
          {authorName}
        </strong>
      )}
    </React.Fragment>
  ));
}

export default function PublicationsSection({ publications }: PublicationsSectionProps) {
  return (
    <section id="publications" className="py-10 md:py-12">
      <div className="container max-w-3xl mx-auto px-6 md:px-4">
        <MotionWrapper>
          <h2 className="section-heading font-bold mb-8 text-center md:text-left">
            Publications
          </h2>
        </MotionWrapper>

        {publications.length === 0 ? (
          <div className="rounded-md border border-border/50 bg-background/80 backdrop-blur-md px-3 py-2 text-muted-foreground">
            No publications yet.
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4">
            {publications.map((publication, index) => (
              <MotionWrapper key={publication.name} delay={index * 0.1}>
                <GlassCard
                  hoverEffect={false}
                  className="overflow-hidden dark:border-purple-500/10 origin-left transition-all duration-300 ease-in-out hover:scale-[1.012] hover:shadow-md hover:bg-background/60 hover:ring-1 hover:ring-purple-500/20 dark:hover:bg-card/20"
                >
                  <motion.a
                    href={publication.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block p-4 text-inherit no-underline"
                    whileTap={{ scale: 0.99 }}
                  >
                    <h3 className="font-medium leading-snug">
                      {publication.title}
                    </h3>
                    <p className="mt-2 text-xs leading-relaxed text-muted-foreground">
                      {renderAuthors(publication.authors)}
                    </p>
                    <div className="mt-3 flex flex-wrap gap-2">
                      <span className="text-xs text-muted-foreground bg-background/50 px-2 py-1 rounded-md">
                        {publication.year}
                      </span>
                      <span className="text-xs px-2 py-1 bg-purple-500/10 rounded-md">
                        {publication.venue}
                      </span>
                    </div>
                  </motion.a>
                </GlassCard>
              </MotionWrapper>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}

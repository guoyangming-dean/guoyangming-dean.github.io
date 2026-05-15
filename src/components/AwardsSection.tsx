import React from "react";
import { awards } from "@/lib/data";
import MotionWrapper from "./MotionWrapper";
import { GlassCard } from "./ui/glass-card";
import { motion } from "framer-motion";

export default function AwardsSection() {
  return (
    <section
      id="publications"
      className="py-10 md:py-12"
    >
      <div className="container max-w-3xl mx-auto px-6 md:px-4">
        <MotionWrapper>
          <h2 className="section-heading font-bold mb-8 text-center md:text-left">
            Publications & Patents
          </h2>
        </MotionWrapper>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
          {awards.map((award, index) => (
            <MotionWrapper key={award.name + award.date} delay={index * 0.1}>
              <GlassCard className="p-4 dark:border-purple-500/10 hover:border-purple-500/30 transition-all duration-300 flex flex-col h-full">
                <div className="flex items-center mb-2">
                  <h3 className="font-medium">{award.name}</h3>
                </div>
                <p className="text-xs text-muted-foreground mb-1">
                  {award.issuer}
                </p>
                <div className="flex flex-col space-y-2 mt-auto">
                  <div className="flex justify-between items-center">
                    <span className="text-xs text-muted-foreground bg-background/50 px-2 py-1 rounded-md">
                      {award.date}
                    </span>
                    <motion.span
                      className="text-xs px-2 py-1 bg-purple-500/10 rounded-full"
                      whileHover={{ scale: 1.05 }}
                    >
                      {award.position}
                    </motion.span>
                  </div>
                  <motion.span
                    className="text-xs text-muted-foreground/80 bg-background/50 px-2 py-1 rounded-md w-fit"
                    whileHover={{ scale: 1.05 }}
                  >
                    {award.type}
                  </motion.span>
                </div>
              </GlassCard>
            </MotionWrapper>
          ))}
        </div>
      </div>
    </section>
  );
}

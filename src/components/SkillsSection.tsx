import React from "react";
import { skills } from "@/lib/data";
import { motion } from "framer-motion";
import MotionWrapper from "./MotionWrapper";
import { GlassCard } from "./ui/glass-card";

function SkillTag({ skill }: { skill: string }) {
  return (
    <motion.div
      whileHover={{ scale: 1.05, y: -2 }}
      className="px-3 py-1 bg-muted/80 backdrop-blur-sm rounded-md text-sm border border-purple-500/10 shadow-sm"
    >
      {skill}
    </motion.div>
  );
}

export default function SkillsSection() {
  return (
    <section
      id="skills"
      className="py-12 bg-gradient-to-b from-background to-muted/20"
    >
      <div className="container max-w-3xl mx-auto px-6 md:px-4">
        <MotionWrapper>
          <h2 className="section-heading font-bold mb-8 text-center md:text-left">
            Skills
          </h2>
        </MotionWrapper>

        <div className="space-y-6">
          <div>
            <GlassCard className="p-4">
              <h3 className="text-lg font-medium mb-3 text-center md:text-left flex items-center">
                Programming Languages
              </h3>
              <div className="flex flex-wrap gap-2 justify-center md:justify-start">
                {skills.programmingLanguages.map((skill) => (
                  <SkillTag key={skill} skill={skill} />
                ))}
              </div>
            </GlassCard>
          </div>

          <div>
            <GlassCard className="p-4">
              <h3 className="text-lg font-medium mb-3 text-center md:text-left flex items-center">
                Frontend Development
              </h3>
              <div className="flex flex-wrap gap-2 justify-center md:justify-start">
                {skills.frontendDevelopment.map((skill) => (
                  <SkillTag key={skill} skill={skill} />
                ))}
              </div>
            </GlassCard>
          </div>

          <div>
            <GlassCard className="p-4">
              <h3 className="text-lg font-medium mb-3 text-center md:text-left flex items-center">
                Backend Development
              </h3>
              <div className="flex flex-wrap gap-2 justify-center md:justify-start">
                {skills.backendDevelopment.map((skill) => (
                  <SkillTag key={skill} skill={skill} />
                ))}
              </div>
            </GlassCard>
          </div>

          <div>
            <GlassCard className="p-4">
              <h3 className="text-lg font-medium mb-3 text-center md:text-left flex items-center">
                Database & Storage
              </h3>
              <div className="flex flex-wrap gap-2 justify-center md:justify-start">
                {skills.databaseAndStorage.map((skill) => (
                  <SkillTag key={skill} skill={skill} />
                ))}
              </div>
            </GlassCard>
          </div>

          <div>
            <GlassCard className="p-4">
              <h3 className="text-lg font-medium mb-3 text-center md:text-left flex items-center">
                Cloud & DevOps
              </h3>
              <div className="flex flex-wrap gap-2 justify-center md:justify-start">
                {skills.cloudAndDevOps.map((skill) => (
                  <SkillTag key={skill} skill={skill} />
                ))}
              </div>
            </GlassCard>
          </div>

          <div>
            <GlassCard className="p-4">
              <h3 className="text-lg font-medium mb-3 text-center md:text-left flex items-center">
                Tools & Services
              </h3>
              <div className="flex flex-wrap gap-2 justify-center md:justify-start">
                {skills.toolsAndServices.map((skill) => (
                  <SkillTag key={skill} skill={skill} />
                ))}
              </div>
            </GlassCard>
          </div>
        </div>
      </div>
    </section>
  );
}

import React from "react";
import { projects } from "@/lib/data";
import { CardContent, CardHeader, CardTitle } from "./ui/card";
import { GlassCard } from "./ui/glass-card";
import MotionWrapper from "./MotionWrapper";

export default function ProjectsSection() {
  return (
    <section id="projects" className="py-10 md:py-12 relative">
      <div className="container max-w-3xl mx-auto px-6 md:px-4">
        <MotionWrapper>
          <h2 className="section-heading font-bold mb-8 text-center md:text-left">
            Projects
          </h2>
        </MotionWrapper>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {projects.map((project) => (
            <MotionWrapper key={project.title}>
              <GlassCard className="group overflow-hidden dark:border-purple-500/10 h-full flex flex-col">
                <CardHeader className="h-24 justify-center border-b border-border/30 bg-gradient-to-r from-purple-500/5 to-pink-500/5">
                  <CardTitle className="text-center md:text-left leading-tight group-hover:text-purple-500 transition-colors duration-300">
                    {project.title}
                  </CardTitle>
                </CardHeader>
                <CardContent className="flex-grow">
                  <ul className="list-disc ml-4 space-y-2 text-sm">
                    {project.description.map((desc, i) => (
                      <li key={i} className="text-muted-foreground">
                        {desc}
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </GlassCard>
            </MotionWrapper>
          ))}
        </div>
      </div>
    </section>
  );
}

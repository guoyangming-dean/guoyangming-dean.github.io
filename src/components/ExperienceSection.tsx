import { workExperience } from "@/lib/data";
import TimelineItem from "./TimelineItem";
import { Briefcase } from "lucide-react";
import MotionWrapper from "./MotionWrapper";

export default function ExperienceSection() {
  return (
    <section
      id="experience"
      className="py-12 bg-gradient-to-b from-muted/20 to-background"
    >
      <div className="container max-w-4xl mx-auto px-6 md:px-4">
        <MotionWrapper>
          <h2 className="section-heading font-bold mb-8 text-center md:text-left flex items-center md:inline-block">
            <span className="inline-block mr-2">💼</span>{" "}
            Work Experience
          </h2>
        </MotionWrapper>
        <div className="mb-8">
          {workExperience.map((job, index) => (
            <TimelineItem
              key={job.company + job.period}
              title={`👨‍💻 ${job.position} | ${job.company}`}
              subtitle={`🌍 ${job.location}`}
              date={`📅 ${job.period}`}
              isLast={index === workExperience.length - 1}
            >
              <div className="mt-3 p-4 bg-background/80 backdrop-blur-sm backdrop-filter rounded-lg border border-purple-500/20 dark:bg-card/10 dark:border-purple-500/10 shadow-sm">
                <div className="flex items-center mb-3">
                  <div className="h-6 w-6 flex items-center justify-center rounded-full bg-purple-500/10 mr-2">
                    <Briefcase className="h-4 w-4 text-purple-500" />
                  </div>
                  <h4 className="text-sm font-medium">Key Achievements</h4>
                </div>
                <ul className="list-none ml-4 space-y-2 text-sm">
                  {job.achievements.map((achievement, i) => (
                    <li
                      key={i}
                      className="text-muted-foreground relative pl-6"
                    >
                      {achievement}
                    </li>
                  ))}
                </ul>
              </div>
            </TimelineItem>
          ))}
        </div>
      </div>
    </section>
  );
}

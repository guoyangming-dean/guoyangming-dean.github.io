import { workExperience } from "@/lib/data";
import TimelineItem from "./TimelineItem";
import MotionWrapper from "./MotionWrapper";

export default function ExperienceSection() {
  return (
    <section
      id="experience"
      className="pt-6 pb-10 md:pt-8 md:pb-12"
    >
      <div className="container max-w-3xl mx-auto px-6 md:px-4">
        <MotionWrapper>
          <h2 className="section-heading font-bold mb-8 text-center md:text-left flex items-center md:inline-block">
            Work Experience
          </h2>
        </MotionWrapper>
        <div className="mb-8">
          {workExperience.map((job, index) => (
            <TimelineItem
              key={job.company + job.period}
              title={`${job.position} | ${job.company}`}
              subtitle={job.location}
              date={job.period}
              isLast={index === workExperience.length - 1}
            >
              {job.achievements.length > 0 && (
                <div className="mt-3 p-4 bg-background/80 backdrop-blur-sm backdrop-filter rounded-lg border border-purple-500/20 dark:bg-card/10 dark:border-purple-500/10 shadow-sm">
                  <div className="flex items-center mb-3">
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
              )}
            </TimelineItem>
          ))}
        </div>
      </div>
    </section>
  );
}

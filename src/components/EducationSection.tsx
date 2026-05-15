import { education } from "@/lib/data";
import TimelineItem from "./TimelineItem";
import MotionWrapper from "./MotionWrapper";

export default function EducationSection() {
  return (
    <section
      id="education"
      className="py-10 md:py-12"
    >
      <div className="container max-w-3xl mx-auto px-6 md:px-4">
        <MotionWrapper>
          <h2 className="section-heading font-bold mb-8 text-center md:text-left">
            Education
          </h2>
        </MotionWrapper>

        <div className="mb-8">
          {education.map((edu, index) => (
            <TimelineItem
              key={edu.institution}
              title={edu.degree}
              subtitle={edu.institution}
              date={edu.period}
              isLast={index === education.length - 1}
            >
              <p className="text-sm text-muted-foreground mb-3">
                {edu.location}
              </p>

              {edu.achievements && edu.achievements.length > 0 && (
                <div className="mt-3 p-4 bg-background/80 backdrop-blur-sm backdrop-filter rounded-lg border border-purple-500/20 dark:bg-card/10 dark:border-purple-500/10 shadow-sm">
                  <div className="flex items-center mb-3">
                    <h4 className="text-sm font-medium">
                      Achievements & Activities
                    </h4>
                  </div>
                  <ul className="list-none ml-4 space-y-2 text-sm">
                    {edu.achievements.map((achievement, i) => (
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

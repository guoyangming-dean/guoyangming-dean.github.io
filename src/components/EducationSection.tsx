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
              aside={
                <a
                  href={edu.website}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={`Visit ${edu.institution} website`}
                  title={`Visit ${edu.institution} website`}
                  className="block rounded-full opacity-80 transition-opacity hover:opacity-100 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-purple-500"
                >
                  <img
                    src={edu.logo}
                    alt={`${edu.institution} emblem`}
                    width="64"
                    height="64"
                    loading="lazy"
                    decoding="async"
                    className="h-12 w-12 rounded-full object-contain md:h-16 md:w-16"
                  />
                </a>
              }
            >
              <p className="text-sm text-muted-foreground mb-3">
                {edu.location}
              </p>
              <p className="text-sm text-muted-foreground">
                Advisor:{" "}
                <a
                  href={edu.advisor.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-foreground/80 underline underline-offset-4 transition-colors hover:text-foreground"
                >
                  {edu.advisor.name}
                </a>
              </p>
            </TimelineItem>
          ))}
        </div>
      </div>
    </section>
  );
}

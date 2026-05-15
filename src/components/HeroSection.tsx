import { personalInfo } from "@/lib/data";
import { motion } from "framer-motion";
import MotionWrapper from "./MotionWrapper";

export default function HeroSection() {
  return (
    <section className="pt-16 pb-6 md:pt-24 md:pb-8 relative overflow-hidden">
      <div className="container max-w-3xl mx-auto px-6 md:px-4 relative z-10">
        <motion.div className="flex flex-col md:flex-row md:items-center justify-between mb-8">
          <div className="text-center md:text-left">
            <motion.h1 className="text-3xl font-bold mb-2">
              {personalInfo.name}
            </motion.h1>

            <motion.p className="text-lg text-muted-foreground mb-6">
              {personalInfo.title}
            </motion.p>

            <motion.div className="flex flex-col gap-2 items-center md:items-start">
              <motion.div
                className="flex items-center text-sm text-muted-foreground"
                whileHover={{ scale: 1.05, color: "#4b5563" }}
              >
                <span className="font-medium text-foreground/70 mr-2">Location</span>
                {personalInfo.location}
              </motion.div>

              <motion.a
                href={`mailto:${personalInfo.email}`}
                className="flex items-center text-sm text-muted-foreground hover:text-foreground transition-colors"
                whileHover={{ scale: 1.05, color: "#4b5563" }}
              >
                <span className="font-medium text-foreground/70 mr-2">Email</span>
                {personalInfo.email}
              </motion.a>

              {personalInfo.github && (
                <motion.a
                  href={personalInfo.github}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center text-sm text-muted-foreground hover:text-foreground transition-colors"
                  whileHover={{ scale: 1.05, color: "#4b5563" }}
                >
                  GitHub
                </motion.a>
              )}

              {personalInfo.linkedin && (
                <motion.a
                  href={personalInfo.linkedin}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center text-sm text-muted-foreground hover:text-foreground transition-colors"
                  whileHover={{ scale: 1.05, color: "#4b5563" }}
                >
                  LinkedIn
                </motion.a>
              )}

              {personalInfo.cv && (
                <motion.a
                  href={personalInfo.cv}
                  className="flex items-center text-sm text-muted-foreground hover:text-foreground transition-colors"
                  whileHover={{ scale: 1.05, color: "#4b5563" }}
                >
                  Download CV
                </motion.a>
              )}
            </motion.div>
          </div>

          <motion.div
            className="mt-6 md:mt-0 flex justify-center"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <div className="relative">
              <div className="absolute -inset-1 bg-gradient-to-r from-pink-500 to-purple-500 rounded-lg blur opacity-30 transition duration-1000"></div>
              <img
                src={personalInfo.profilePicture}
                alt="Profile"
                className="w-36 md:w-44 h-auto rounded-lg relative ring-2 ring-purple-500/50"
              />
            </div>
          </motion.div>
        </motion.div>

        <MotionWrapper>
          <div className="bg-gradient-to-r from-purple-500/10 to-pink-500/10 backdrop-blur-sm backdrop-filter p-4 rounded-lg border border-purple-500/20 dark:border-purple-500/10 shadow-sm transition-all duration-300 ease-in-out hover:scale-[1.012] hover:shadow-md hover:border-purple-500/30">
            <p className="text-muted-foreground pl-4 py-2 relative">
              <span className="absolute left-0 top-0 h-full w-1 bg-gradient-to-b from-purple-500 to-pink-500 rounded-full"></span>
              {personalInfo.heroDescription}
            </p>
          </div>
        </MotionWrapper>
      </div>
    </section>
  );
}

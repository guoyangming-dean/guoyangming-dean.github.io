import React from "react";

interface MotionWrapperProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  delay?: number;
}

export default function MotionWrapper({
  children,
  delay: _delay,
  ...props
}: MotionWrapperProps) {
  void _delay;
  return <div {...props}>{children}</div>;
}

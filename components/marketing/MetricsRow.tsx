"use client";

import { motion, useInView } from "framer-motion";
import { useRef, useEffect, useState } from "react";

const metrics = [
  { label: "API Response Time", value: 180, unit: "ms", suffix: "" },
  { label: "Minutes Saved per Patient", value: 12, unit: "", suffix: "min" },
  { label: "Net Promoter Score", value: 89, unit: "", suffix: "/100" },
];

function AnimatedNumber({ value, duration = 2 }: { value: number; duration?: number }) {
  const [count, setCount] = useState(0);
  const ref = useRef<HTMLSpanElement>(null);
  const isInView = useInView(ref, { once: true });

  useEffect(() => {
    if (!isInView) return;

    let startTime: number | null = null;
    const animate = (currentTime: number) => {
      if (startTime === null) startTime = currentTime;
      const progress = Math.min((currentTime - startTime) / (duration * 1000), 1);
      
      setCount(Math.floor(progress * value));
      
      if (progress < 1) {
        requestAnimationFrame(animate);
      }
    };
    
    requestAnimationFrame(animate);
  }, [isInView, value, duration]);

  return <span ref={ref}>{count}</span>;
}

export default function MetricsRow() {
  return (
    <section className="py-20 bg-brand-600 text-white">
      <div className="container">
        <div className="grid md:grid-cols-3 gap-8 md:gap-12">
          {metrics.map((metric, index) => (
            <motion.div
              key={metric.label}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className="text-center"
            >
              <div className="font-display font-black text-4xl md:text-5xl mb-2">
                {metric.unit && <span className="text-3xl mr-1">&lt;</span>}
                <AnimatedNumber value={metric.value} />
                {metric.suffix}
              </div>
              <div className="text-brand-100 font-medium">
                {metric.label}
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

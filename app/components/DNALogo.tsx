import { motion } from 'framer-motion';

interface DNALogoProps {
  size?: number;
  animate?: boolean;
}

export function DNALogo({ size = 40, animate = true }: DNALogoProps) {
  const colors = ['#22c55e', '#3b82f6', '#f59e0b', '#ef4444'];
  
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 100 100"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <motion.g
        animate={animate ? { rotateY: [0, 360] } : {}}
        transition={{ duration: 20, repeat: Infinity, ease: 'linear' }}
        style={{ transformOrigin: 'center' }}
      >
        {/* DNA Double Helix */}
        {[0, 1, 2, 3, 4].map((i) => (
          <g key={i}>
            {/* Left strand */}
            <motion.circle
              cx={30 + i * 2}
              cy={20 + i * 15}
              r={6}
              fill={colors[i % 4]}
              initial={animate ? { opacity: 0.7 } : {}}
              animate={animate ? { 
                opacity: [0.7, 1, 0.7],
                scale: [1, 1.1, 1]
              } : {}}
              transition={{ 
                duration: 2, 
                repeat: Infinity, 
                delay: i * 0.2,
                ease: 'easeInOut'
              }}
            />
            {/* Right strand */}
            <motion.circle
              cx={70 - i * 2}
              cy={20 + i * 15}
              r={6}
              fill={colors[(i + 2) % 4]}
              initial={animate ? { opacity: 0.7 } : {}}
              animate={animate ? { 
                opacity: [0.7, 1, 0.7],
                scale: [1, 1.1, 1]
              } : {}}
              transition={{ 
                duration: 2, 
                repeat: Infinity, 
                delay: i * 0.2 + 1,
                ease: 'easeInOut'
              }}
            />
            {/* Connection */}
            <motion.line
              x1={30 + i * 2}
              y1={20 + i * 15}
              x2={70 - i * 2}
              y2={20 + i * 15}
              stroke="rgba(148, 163, 184, 0.3)"
              strokeWidth={2}
              initial={animate ? { pathLength: 0 } : {}}
              animate={animate ? { pathLength: 1 } : {}}
              transition={{ duration: 1, delay: i * 0.1 }}
            />
          </g>
        ))}
      </motion.g>
    </svg>
  );
}

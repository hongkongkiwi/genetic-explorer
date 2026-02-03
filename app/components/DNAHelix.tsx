import { useEffect, useRef } from 'react';

/**
 * Animated DNA Double Helix Component
 * Creates a visually stunning rotating DNA helix animation
 */
export function DNAHelixAnimation({
  className = '',
  height = 400,
  showParticles = true,
  glowIntensity = 0.5,
}: {
  className?: string;
  height?: number;
  showParticles?: boolean;
  glowIntensity?: number;
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationRef = useRef<number>();

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // High DPI support
    const dpr = window.devicePixelRatio || 1;
    const rect = canvas.getBoundingClientRect();
    canvas.width = rect.width * dpr;
    canvas.height = rect.height * dpr;
    ctx.scale(dpr, dpr);

    // Animation state
    let time = 0;

    // DNA Helix parameters
    const numStrands = 2;
    const numBasePairs = 24;
    const strandRadius = 80;
    const verticalSpacing = 12;
    const rotationSpeed = 0.02;

    // Particle system
    const particles: Particle[] = [];
    const numParticles = showParticles ? 50 : 0;

    // Initialize particles
    for (let i = 0; i < numParticles; i++) {
      particles.push(createParticle(canvas.width / dpr, canvas.height / dpr));
    }

    function createParticle(w: number, h: number): Particle {
      return {
        x: Math.random() * w,
        y: Math.random() * h,
        size: Math.random() * 2 + 1,
        speedY: Math.random() * 0.5 + 0.2,
        opacity: Math.random() * 0.5 + 0.2,
      };
    }

    // Draw base pair connections
    function drawBasePair(
      ctx: CanvasRenderingContext2D,
      x: number,
      y: number,
      angle: number,
      progress: number,
      strandIndex: number
    ) {
      const strandX = x + Math.cos(angle + (strandIndex === 0 ? 0 : Math.PI)) * strandRadius;
      const strandY = y - verticalSpacing * progress + (height / 2 - verticalSpacing * (numBasePairs / 2));

      return { x: strandX, y: strandY };
    }

    // Draw nucleotide base
    function drawNucleotide(
      ctx: CanvasRenderingContext2D,
      x: number,
      y: number,
      color: string,
      angle: number,
      isTop: boolean
    ) {
      ctx.save();
      ctx.translate(x, y);
      ctx.rotate(angle);

      // Glow effect
      ctx.shadowColor = color;
      ctx.shadowBlur = 15 * glowIntensity;

      // Nucleotide body
      ctx.fillStyle = color;
      ctx.beginPath();
      ctx.ellipse(0, isTop ? -8 : 8, 8, 12, 0, 0, Math.PI * 2);
      ctx.fill();

      // Inner glow
      const gradient = ctx.createRadialGradient(0, isTop ? -8 : 8, 0, 0, isTop ? -8 : 8, 12);
      gradient.addColorStop(0, `${color}80`);
      gradient.addColorStop(1, `${color}00`);
      ctx.fillStyle = gradient;
      ctx.beginPath();
      ctx.ellipse(0, isTop ? -8 : 8, 12, 18, 0, 0, Math.PI * 2);
      ctx.fill();

      ctx.restore();
    }

    // Draw connection line between strands
    function drawConnection(ctx: CanvasRenderingContext2D, x1: number, y1: number, x2: number, y2: number) {
      const gradient = ctx.createLinearGradient(x1, y1, x2, y2);
      gradient.addColorStop(0, '#6366f1');
      gradient.addColorStop(0.5, '#8b5cf6');
      gradient.addColorStop(1, '#d946ef');

      ctx.strokeStyle = gradient;
      ctx.lineWidth = 2;
      ctx.globalAlpha = 0.6;
      ctx.beginPath();
      ctx.moveTo(x1, y1);
      ctx.lineTo(x2, y2);
      ctx.stroke();
      ctx.globalAlpha = 1;
    }

    function animate() {
      const width = rect.width;
      const centerX = width / 2;

      ctx.clearRect(0, 0, width, rect.height);

      // Draw background particles
      if (showParticles) {
        ctx.fillStyle = '#6366f120';
        particles.forEach((particle) => {
          particle.y -= particle.speedY;
          if (particle.y < 0) {
            particle.y = rect.height;
            particle.x = Math.random() * width;
          }
          ctx.globalAlpha = particle.opacity;
          ctx.beginPath();
          ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
          ctx.fill();
        });
        ctx.globalAlpha = 1;
      }

      // Draw DNA helix
      for (let i = 0; i < numBasePairs; i++) {
        const progress = i;
        const angle = time + (progress * 0.3);

        // Calculate strand positions
        const strand1 = drawBasePair(ctx, centerX, 0, angle, progress, 0);
        const strand2 = drawBasePair(ctx, centerX, 0, angle, progress, 1);

        // Draw connection
        drawConnection(ctx, strand1.x, strand1.y, strand2.x, strand2.y);

        // Draw nucleotides with colors based on position
        const hue = (progress / numBasePairs) * 60 + 220; // Blue to purple range
        const color1 = `hsl(${hue}, 70%, 60%)`;
        const color2 = `hsl(${hue + 30}, 70%, 55%)`;

        drawNucleotide(ctx, strand1.x, strand1.y, color1, angle, true);
        drawNucleotide(ctx, strand2.x, strand2.y, color2, angle, false);
      }

      // Draw center glow
      const centerGradient = ctx.createRadialGradient(centerX, rect.height / 2, 0, centerX, rect.height / 2, 200);
      centerGradient.addColorStop(0, '#6366f130');
      centerGradient.addColorStop(1, 'transparent');
      ctx.fillStyle = centerGradient;
      ctx.fillRect(0, 0, width, rect.height);

      time += rotationSpeed;
      animationRef.current = requestAnimationFrame(animate);
    }

    animate();

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [height, showParticles, glowIntensity]);

  return (
    <canvas
      ref={canvasRef}
      className={`w-full ${className}`}
      style={{ height: `${height}px` }}
    />
  );
}

interface Particle {
  x: number;
  y: number;
  size: number;
  speedY: number;
  opacity: number;
}

export default DNAHelixAnimation;

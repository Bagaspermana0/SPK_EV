import React, { useEffect, useRef } from 'react';

const LightningCanvas = ({ active }) => {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    let animationFrameId;

    // Resize handler
    const resizeCanvas = () => {
      const rect = canvas.parentElement.getBoundingClientRect();
      canvas.width = rect.width;
      canvas.height = rect.height;
    };
    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);

    let bolts = [];
    let particles = [];

    // Helper to generate a lightning path
    const createBolt = (x1, y1, x2, y2) => {
      const path = [[x1, y1]];
      const dx = x2 - x1;
      const dy = y2 - y1;
      const dist = Math.sqrt(dx * dx + dy * dy);
      const steps = Math.floor(dist / 12);
      
      let cx = x1;
      let cy = y1;
      
      for (let i = 1; i < steps; i++) {
        const t = i / steps;
        const lx = x1 + dx * t;
        const ly = y1 + dy * t;
        
        const angle = Math.atan2(dy, dx);
        const offsetAngle = angle + Math.PI / 2;
        // Jitter / Jagged factor
        const offsetMag = (Math.random() - 0.5) * 30 * (1 - Math.abs(t - 0.5) * 0.8);
        
        cx = lx + Math.cos(offsetAngle) * offsetMag;
        cy = ly + Math.sin(offsetAngle) * offsetMag;
        
        path.push([cx, cy]);
      }
      
      path.push([x2, y2]);
      return {
        path,
        life: 1.0,
        decay: 0.08 + Math.random() * 0.08,
        color: Math.random() > 0.5 ? '#00D97E' : '#3B82F6'
      };
    };

    // Helper to create impact sparks
    const spawnSparks = (x, y, color) => {
      const count = 8 + Math.floor(Math.random() * 8);
      for (let i = 0; i < count; i++) {
        const angle = Math.random() * Math.PI * 2;
        const speed = 1 + Math.random() * 4;
        particles.push({
          x,
          y,
          vx: Math.cos(angle) * speed,
          vy: Math.sin(angle) * speed - 0.5, // slight upward drift
          life: 1.0,
          decay: 0.02 + Math.random() * 0.03,
          color,
          size: 1 + Math.random() * 2
        });
      }
    };

    // Main Loop
    const loop = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      if (!active) {
        bolts = [];
        particles = [];
        animationFrameId = requestAnimationFrame(loop);
        return;
      }

      // 1. Spawn bolts striking both the text area (left/top) and phone mockup area (right/bottom)
      if (Math.random() < 0.04 && bolts.length < 4) {
        const isMobile = canvas.width < 968;
        const strikeLeft = Math.random() > 0.55; // Slightly favor text strikes for the visual effect on title
        
        let x1, y1, x2, y2;
        
        if (strikeLeft) {
          // Target: Hero text area (left side of desktop, top on mobile)
          x2 = isMobile ? canvas.width * 0.5 + (Math.random() - 0.5) * 200 : canvas.width * 0.3 + (Math.random() - 0.5) * 200;
          y2 = isMobile ? canvas.height * 0.25 + (Math.random() - 0.5) * 100 : canvas.height * 0.35 + (Math.random() - 0.5) * 120;
          
          // Strike from the edges
          x1 = x2 + (Math.random() - 0.5) * 150;
          y1 = 0;
        } else {
          // Target: Phone mockup area (right side of desktop, bottom on mobile)
          x2 = isMobile ? canvas.width * 0.5 + (Math.random() - 0.5) * 150 : canvas.width * 0.75 + (Math.random() - 0.5) * 120;
          y2 = isMobile ? canvas.height * 0.7 + (Math.random() - 0.5) * 120 : canvas.height * 0.5 + (Math.random() - 0.5) * 180;
          
          x1 = x2 + (Math.random() - 0.5) * 200;
          y1 = 0;
        }
        
        const newBolt = createBolt(x1, y1, x2, y2);
        bolts.push(newBolt);
        
        // Spawn sparks on impact
        spawnSparks(x2, y2, newBolt.color);
      }

      // 2. Draw & Update Bolts
      for (let i = bolts.length - 1; i >= 0; i--) {
        const bolt = bolts[i];
        
        ctx.save();
        ctx.shadowBlur = 15;
        ctx.shadowColor = bolt.color;
        ctx.strokeStyle = bolt.color;
        ctx.globalAlpha = bolt.life;
        ctx.lineWidth = 2.5;
        
        ctx.beginPath();
        ctx.moveTo(bolt.path[0][0], bolt.path[0][1]);
        for (let j = 1; j < bolt.path.length; j++) {
          ctx.lineTo(bolt.path[j][0], bolt.path[j][1]);
        }
        ctx.stroke();

        // White core
        ctx.shadowBlur = 4;
        ctx.shadowColor = '#ffffff';
        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = 1.2;
        ctx.stroke();
        ctx.restore();

        // Update life
        bolt.life -= bolt.decay;
        if (bolt.life <= 0) {
          bolts.splice(i, 1);
        }
      }

      // 3. Draw & Update Particles (Sparks)
      for (let i = particles.length - 1; i >= 0; i--) {
        const p = particles[i];
        
        ctx.save();
        ctx.shadowBlur = 8;
        ctx.shadowColor = p.color;
        ctx.fillStyle = p.color;
        ctx.globalAlpha = p.life;
        
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();

        // Physics update
        p.x += p.vx;
        p.y += p.vy;
        p.vy += 0.05; // gravity gravity
        p.life -= p.decay;

        if (p.life <= 0) {
          particles.splice(i, 1);
        }
      }

      animationFrameId = requestAnimationFrame(loop);
    };

    loop();

    return () => {
      window.removeEventListener('resize', resizeCanvas);
      cancelAnimationFrame(animationFrameId);
    };
  }, [active]);

  return (
    <canvas
      ref={canvasRef}
      style={{
        position: 'absolute',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        pointerEvents: 'none',
        zIndex: 0
      }}
    />
  );
};

export default LightningCanvas;

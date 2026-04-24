import { useEffect, useRef } from 'react';

function sampleImagePoints(img, maxPoints, canvasW, canvasH) {
  const off = document.createElement('canvas');
  const scale = Math.min(canvasW / img.naturalWidth, canvasH / img.naturalHeight) * 0.7;
  off.width  = Math.floor(img.naturalWidth  * scale);
  off.height = Math.floor(img.naturalHeight * scale);

  const octx = off.getContext('2d');
  octx.drawImage(img, 0, 0, off.width, off.height);

  const { data } = octx.getImageData(0, 0, off.width, off.height);
  const raw = [];

  for (let y = 0; y < off.height; y++) {
    for (let x = 0; x < off.width; x++) {
      const i = (y * off.width + x) * 4;
      const a = data[i + 3];
      if (a > 60) {
        const brightness = (data[i] + data[i + 1] + data[i + 2]) / 3;
        if (brightness > 30 || a > 120) raw.push({ x, y });
      }
    }
  }

  const step = Math.max(1, Math.ceil(raw.length / maxPoints));
  const reduced = raw.filter((_, i) => i % step === 0);

  const offsetX = (canvasW - off.width)  / 2;
  const offsetY = (canvasH - off.height) / 2;

  return reduced.map(p => ({ x: p.x + offsetX, y: p.y + offsetY }));
}

export default function ParticleBackground({ imageSrc = '/bg.png' }) {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let animId;
    const mouse = { x: -9999, y: -9999 };
    let particles = [];
    let imageTargets = [];
    let imageLoaded = false;
    let morphProgress = 0;
    let morphDir = 1;
    const MAX_PARTICLES = 8000;

    canvas.width  = window.innerWidth;
    canvas.height = window.innerHeight;

    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => {
      imageTargets = sampleImagePoints(img, MAX_PARTICLES, canvas.width, canvas.height);
      imageLoaded = true;
      initParticles();
      setInterval(() => { morphDir = morphDir === 1 ? -1 : 1; }, 4000);
    };
    img.onerror = () => {
      imageLoaded = false;
      initParticles();
    };
    img.src = imageSrc;

    const initParticles = () => {
      const count = imageLoaded
        ? Math.min(imageTargets.length, MAX_PARTICLES)
        : Math.floor((canvas.width * canvas.height) / 7000);

      particles = Array.from({ length: count }, (_, i) => {
        const target = imageTargets[i] || null;
        return {
          x:  Math.random() * canvas.width,
          y:  Math.random() * canvas.height,
          vx: (Math.random() - 0.5) * 0.3,
          vy: (Math.random() - 0.5) * 0.3,
          tx: target ? target.x : Math.random() * canvas.width,
          ty: target ? target.y : Math.random() * canvas.height,
          size:       Math.random() * 1.4 + 0.4,
          opacity:    Math.random() * 0.5 + 0.15,
          pulse:      Math.random() * Math.PI * 2,
          pulseSpeed: 0.007 + Math.random() * 0.013,
        };
      });
    };

    const drawConnections = () => {
      for (let i = 0; i < particles.length; i++) {
        for (let j = i + 1; j < particles.length; j++) {
          const dx = particles[i].x - particles[j].x;
          const dy = particles[i].y - particles[j].y;
          const d  = Math.sqrt(dx * dx + dy * dy);
          if (d < 90) {
            const alpha = (1 - d / 90) * 0.1 * (1 - morphProgress * 0.7);
            ctx.beginPath();
            ctx.strokeStyle = `rgba(220,38,38,${alpha})`;
            ctx.lineWidth = 0.5;
            ctx.moveTo(particles[i].x, particles[i].y);
            ctx.lineTo(particles[j].x, particles[j].y);
            ctx.stroke();
          }
        }
      }
    };

    const easeInOut = (t) => t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t;

    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      const bg = ctx.createRadialGradient(
        canvas.width / 2, canvas.height / 2, 0,
        canvas.width / 2, canvas.height / 2, Math.max(canvas.width, canvas.height)
      );
      bg.addColorStop(0, '#140303');
      bg.addColorStop(1, '#080101');
      ctx.fillStyle = bg;
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      if (imageLoaded) {
        morphProgress = Math.max(0, Math.min(1, morphProgress + morphDir * 0.004));
      }
      const ease = easeInOut(morphProgress);

      particles.forEach(p => {
        p.pulse += p.pulseSpeed;
        const pf = 0.75 + 0.25 * Math.sin(p.pulse);

        if (morphProgress < 0.95) {
          const mdx = p.x - mouse.x;
          const mdy = p.y - mouse.y;
          const md  = Math.sqrt(mdx * mdx + mdy * mdy);
          if (md < 100 && md > 0) {
            const f = (100 - md) / 100 * (1 - ease);
            p.vx += (mdx / md) * f * 0.5;
            p.vy += (mdy / md) * f * 0.5;
          }
          p.vx *= 0.983;
          p.vy *= 0.983;
        }

        if (ease > 0.01) {
          const pull = ease * 0.12;
          p.vx += (p.tx - p.x) * pull;
          p.vy += (p.ty - p.y) * pull;
        }

        p.x += p.vx;
        p.y += p.vy;

        if (ease < 0.3) {
          if (p.x < 0)             p.x = canvas.width;
          if (p.x > canvas.width)  p.x = 0;
          if (p.y < 0)             p.y = canvas.height;
          if (p.y > canvas.height) p.y = 0;
        }

        const sizeScale = 1 + ease * (-0.5);
        const opacScale = 1 + ease * 1.2;

        const grd = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, p.size * 5 * pf * sizeScale);
        grd.addColorStop(0, `rgba(220,38,38,${p.opacity * pf * opacScale * 0.55})`);
        grd.addColorStop(1, 'rgba(220,38,38,0)');
        ctx.fillStyle = grd;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size * 5 * pf * sizeScale, 0, Math.PI * 2);
        ctx.fill();

        ctx.fillStyle = `rgba(255,180,180,${p.opacity * pf * opacScale * 1.6})`;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size * pf * sizeScale, 0, Math.PI * 2);
        ctx.fill();
      });

      drawConnections();
      animId = requestAnimationFrame(animate);
    };

    const handleMouseMove = (e) => {
      mouse.x = e.clientX;
      mouse.y = e.clientY;
    };

    window.addEventListener('mousemove', handleMouseMove);
    animate();

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener('mousemove', handleMouseMove);
    };
  }, [imageSrc]);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 w-full h-full pointer-events-none -z-10"
    />
  );
}
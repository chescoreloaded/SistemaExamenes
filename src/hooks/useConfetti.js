import { useCallback, useEffect, useRef } from 'react';

const CONFETTI_COLORS = [
  '#26ccff', '#a25afd', '#ff5e7e', '#88ff5a', '#fcff42', '#ffa62d', '#ff36ff'
];

export function useConfettiPro() {
  const canvasRef = useRef(null);
  const animationRef = useRef(null);
  const particlesRef = useRef([]);

  // --- Lógica de la Partícula Física ---
  const createParticle = (x, y) => {
    // Velocidad inicial "explosiva"
    const speed = Math.random() * 15 + 10; // Velocidad de explosión
    const angle = Math.random() * Math.PI * 2; // Dirección aleatoria

    // Física avanzada
    const wobble = Math.random() * 10;
    const wobbleSpeed = Math.min(0.1, Math.random() * 0.1 + 0.05);

    const tiltAngle = Math.random() * Math.PI;
    const tiltAngleIncrement = Math.random() * 0.1 + 0.05;

    return {
      x: x,
      y: y,
      // Velocidad inicial (explosión hacia afuera y un poco hacia arriba)
      vx: Math.cos(angle) * speed,
      vy: Math.sin(angle) * speed - 5, // Bias hacia arriba
      gravity: 0.25, // Gravedad constante
      drag: 0.96, // Resistencia del aire (hace que la explosión se frene suavemente)
      
      // Propiedades visuales
      color: CONFETTI_COLORS[Math.floor(Math.random() * CONFETTI_COLORS.length)],
      size: Math.random() * 10 + 6,
      
      // Propiedades de física 3D simulada
      wobble: wobble,
      wobbleSpeed: wobbleSpeed,
      tiltAngle: tiltAngle,
      tiltAngleIncrement: tiltAngleIncrement,
      tilt: Math.sin(tiltAngle) * 12, // Factor de "aplastamiento" 3D
      
      life: 100, // Vida útil para el fade-out
      opacity: 1
    };
  };

  const updateParticle = (p, ctx) => {
    // 1. Física básica
    p.vy += p.gravity;
    p.vx *= p.drag; // Aplicar resistencia del aire
    p.vy *= p.drag;
    p.x += p.vx;
    p.y += p.vy;

    // 2. Física de "Aleteo" (Wobble - movimiento lateral)
    p.wobble += p.wobbleSpeed;
    p.x += Math.sin(p.wobble) * 1.5;

    // 3. Física de Rotación 3D simulada (Tilt)
    p.tiltAngle += p.tiltAngleIncrement;
    // El 'tilt' varía sinusoidalmente para simular que gira sobre su eje
    p.tilt = Math.sin(p.tiltAngle) * 12; 

    // 4. Ciclo de vida y Fade out
    p.life--;
    if (p.life < 30) { // Empieza a desvanecerse en los últimos 30 frames
         p.opacity = p.life / 30;
    }

    // 5. DIBUJADO AVANZADO (Truco 3D)
    // Dibujamos un paralelogramo que cambia de forma según el 'tilt'
    const x1 = p.x + p.tilt;
    const y1 = p.y + p.tilt;
    const x2 = p.x - p.tilt;
    const y2 = p.y;
    
    ctx.beginPath();
    // Usamos el color con la opacidad actual
    ctx.fillStyle = p.color;
    ctx.globalAlpha = p.opacity;
    
    // Dibujar forma "aplastada"
    ctx.moveTo(p.x, p.y);
    ctx.lineTo(x1, y1);
    ctx.lineTo(x2 + p.size, y2 + p.size);
    ctx.lineTo(x2, y2);
    ctx.closePath();
    ctx.fill();
    ctx.globalAlpha = 1; // Resetear opacidad global
  };

  const animate = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    
    // Limpiar canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Filtrar partículas muertas y actualizar vivas
    particlesRef.current = particlesRef.current.filter(p => {
        if (p.life <= 0 || p.y > canvas.height + 50) return false;
        updateParticle(p, ctx);
        return true;
    });

    if (particlesRef.current.length > 0) {
      animationRef.current = requestAnimationFrame(animate);
    } else {
        // Limpieza final cuando termina la animación
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        animationRef.current = null;
    }
  }, []);

  // Función para disparar el confetti
  const fireConfetti = useCallback((originX, originY, particleCount = 100) => {
    // Usar centro de pantalla si no se proveen coordenadas
    const x = originX ?? window.innerWidth / 2;
    const y = originY ?? window.innerHeight / 2.5;

    // Crear múltiples partículas en el origen
    for (let i = 0; i < particleCount; i++) {
      particlesRef.current.push(createParticle(x, y));
    }

    // Iniciar loop si no está corriendo
    if (!animationRef.current) {
      animate();
    }
  }, [animate]);

  // Setup del canvas
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const handleResize = () => {
        // Aumentar la resolución interna para pantallas retina/high-DPI
        const dpr = window.devicePixelRatio || 1;
        canvas.width = window.innerWidth * dpr;
        canvas.height = window.innerHeight * dpr;
        const ctx = canvas.getContext('2d');
        ctx.scale(dpr, dpr); // Escalar el contexto para que coincida
    };

    handleResize();
    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      if (animationRef.current) cancelAnimationFrame(animationRef.current);
    };
  }, []);

  return { 
    canvasRef, 
    // Renombramos para que sea más descriptivo
    fireConfetti 
  };
}
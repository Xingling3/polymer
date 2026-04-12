import { useEffect, useRef } from "react"

export default function MoleculeBackground() {
    const canvasRef = useRef<HTMLCanvasElement>(null)

    useEffect(() => {
        const canvas = canvasRef.current!
        const ctx = canvas.getContext("2d")!

        let w = canvas.width = window.innerWidth
        let h = canvas.height = window.innerHeight

        const particles = Array.from({ length: 80 }, () => ({
            x: Math.random() * w,
            y: Math.random() * h,
            vx: (Math.random() - 0.5) * 0.5,
            vy: (Math.random() - 0.5) * 0.5,
        }))

        function resize() {
            w = canvas.width = window.innerWidth
            h = canvas.height = window.innerHeight
        }

        window.addEventListener("resize", resize)

        function draw() {
            ctx.clearRect(0, 0, w, h)

            for (let i = 0; i < particles.length; i++) {
                const p = particles[i]
                p.x += p.vx
                p.y += p.vy

                if (p.x < 0 || p.x > w) p.vx *= -1
                if (p.y < 0 || p.y > h) p.vy *= -1

                ctx.beginPath()
                ctx.arc(p.x, p.y, 2, 0, Math.PI * 2)
                ctx.fillStyle = "rgba(100, 150, 255, 0.6)"
                ctx.fill()

                for (let j = i + 1; j < particles.length; j++) {
                    const q = particles[j]
                    const dx = p.x - q.x
                    const dy = p.y - q.y
                    const dist = Math.sqrt(dx * dx + dy * dy)

                    if (dist < 120) {
                        ctx.beginPath()
                        ctx.moveTo(p.x, p.y)
                        ctx.lineTo(q.x, q.y)
                        ctx.strokeStyle = `rgba(100,150,255,${1 - dist / 120})`
                        ctx.stroke()
                    }
                }
            }

            requestAnimationFrame(draw)
        }

        draw()

        return () => {
            window.removeEventListener("resize", resize)
        }
    }, [])

    return (
        <canvas
            ref={canvasRef}
            className="fixed inset-0 -z-10"
        />
    )
}

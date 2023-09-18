import {useRef} from "react"
import {Canvas, useFrame} from '@react-three/fiber'
import {Sphere, useTexture} from "@react-three/drei"
import {Mesh} from "three"

interface Props {
    className?: string
}

export default function RotatingGlobe({ className }: Props) {
    // TODO determine FOV based on window width and height?
    return (
        <Canvas
            camera={{
                position: [0, 0.4, 2.6],
                rotation: [0.4, 0, 0],
                fov: 40,
            }}
            className={className}
        >
            <ambientLight />
            <GlobeModel />
        </Canvas>
    )
}

function GlobeModel() {
    const textureProps = useTexture({map: "/earth.jpg"})

    const sphereRef = useRef<Mesh>(null!)

    useFrame((state, delta) => (sphereRef.current.rotation.y += delta * 0.05))

    return (
        <Sphere
            args={[1, 64, 64]}
            ref={sphereRef}
            rotation={[Math.PI, 0, Math.PI]}
        >
            <meshStandardMaterial
                {...textureProps}
            />
        </Sphere>
    )
}

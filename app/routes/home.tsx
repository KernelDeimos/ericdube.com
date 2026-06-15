import type { Route } from "./+types/home";
import { Welcome } from "../welcome/welcome";
import ParticleSimulator from "../components/ParticleSimulator";
import Container from "../components/Container";
import { useState } from "react";

export function meta({}: Route.MetaArgs) {
  return [
    { title: "New React Router App" },
    { name: "description", content: "Welcome to React Router!" },
  ];
}

export default function Home() {
  const [count, setCount] = useState(0);

  const something = 1;
  return (
    <>
      <div style={{ position: 'relative' }}>
        <ParticleSimulator style={{ position: 'absolute', inset: 0, width: '100%', height: '100%' }} />
        <Container style={{ position: 'relative' }}>
          <div style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'flex-start',
          }}>
            <div style={{
              backdropFilter: 'blur(8px)',
              backgroundColor: 'rgba(0,0,0,0.45)',
              padding: '0.5rem 2rem',
            }}>
              <h1 style={{ fontSize: 'clamp(2rem, 6vw, 5rem)', margin: 0 }}>EricDubé.com</h1>
            </div>
            <div style={{
              alignSelf: 'stretch',
              backdropFilter: 'blur(12px)',
              backgroundColor: 'rgba(255,255,255,0.08)',
              padding: '0.5rem 2rem',
              display: 'flex',
              alignItems: 'center',
              gap: '2rem',
            }}>
              <a href="#">Work</a>
              <a href="#">About</a>
              <a href="#">Contact</a>
            </div>
          </div>
        </Container>
      </div>
      <Container>
        <button onClick={() => {
          setCount(count + 1);
        }}>Make it {count + 1}</button>
        <div>something {(() => {
          if ( something === 1 ) {
            return (<h2>{count}</h2>)
          } else {
            return (<h3>pickle</h3>)
          }
        })()}</div>
      </Container>
    </>
  )
}

import type { Route } from "./+types/home";
import Container from "../components/Container";

export function meta({}: Route.MetaArgs) {
  return [
    { title: "EricDubé.com" },
    { name: "description", content: "Welcome to EricDubé.com" },
  ];
}

export default function Home() {
  return (
    <Container style={{ paddingTop: '3rem' }}>
      <p>Home page content goes here.</p>
    </Container>
  );
}

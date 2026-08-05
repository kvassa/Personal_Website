import { PageLayout } from '../components/PageLayout';

export function About() {
  return (
    <PageLayout title="More about me">
      <section className="card">
        <h2>Hi, I'm Kaavya!</h2>
        <p>
          Placeholder — a short, friendly introduction: who Kaavya is, what she loves, and what
          this website is all about.
        </p>
      </section>
      <section className="card">
        <h2>Fun facts</h2>
        <ul>
          <li>Placeholder — a hobby or favorite thing</li>
          <li>Placeholder — something surprising</li>
          <li>Placeholder — a goal or dream</li>
        </ul>
      </section>
      <section className="card">
        <h2>Say hello</h2>
        <p>Placeholder — email or social links go here.</p>
      </section>
    </PageLayout>
  );
}

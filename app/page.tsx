import Link from "next/link";
import { BrandLogo } from "@/components/brand-logo";
import { LandingHero } from "@/components/landing-hero";

const STEPS = [
  { icon: "🧑‍🌾", title: "Farmer lists produce", text: "The farmer picks the nearest White Store — suggested automatically — and lists what they're bringing." },
  { icon: "⚖️", title: "Weighed, graded, paid", text: "Store staff weigh the produce, assign a quality grade, and pay the farmer on the spot." },
  { icon: "🏷️", title: "QR-coded batch", text: "Every accepted lot becomes a unique batch with a QR code carrying its quality and tracking details." },
  { icon: "🏢", title: "Buyers browse & order", text: "Bulk buyers filter and rank batches by price, grade, quantity and distance — and order directly." },
  { icon: "🚚", title: "Delivered & verified", text: "Logistics delivers; the buyer scans the QR to verify origin and quality before confirming receipt." },
];

const ROLES = [
  { icon: "🧑‍🌾", name: "Farmer", text: "List produce, get paid immediately at the counter, and declare next season's crops." },
  { icon: "🏪", name: "White Store", text: "Manager dashboard for sales, purchases, inventory, farmer records and cash in/out." },
  { icon: "🧑‍💼", name: "Store Employee", text: "Register farmers, weigh and grade produce, pay farmers, create QR batches, manage orders." },
  { icon: "🏢", name: "Bulk Buyer", text: "Browse scored batches, filter by quality and distance, order directly, verify by QR." },
];

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-white">
      <LandingHero />

      <div className="relative z-10 bg-white">
      <header className="border-b border-hairline bg-white">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4">
          <Link href="/" className="flex items-center">
            <BrandLogo size={48} />
          </Link>
          <div className="flex items-center gap-3">
            <Link href="/login" className="rounded-xl px-4 py-2 text-sm font-semibold text-green-primary transition hover:bg-green-light">
              Sign in
            </Link>
            <Link href="/register" className="rounded-xl bg-green-primary px-4 py-2 text-sm font-semibold text-white transition hover:bg-green-dark">
              Get started
            </Link>
          </div>
        </div>
      </header>

      <section className="bg-gradient-to-b from-green-light/70 to-white">
        <div className="mx-auto max-w-4xl px-4 py-16 text-center">
          <p className="mb-4 inline-block rounded-full bg-green-light px-4 py-1 text-xs font-semibold uppercase tracking-wide text-green-dark">
            Smart India Hackathon
          </p>
          <h2 className="text-3xl font-extrabold leading-tight text-text-primary sm:text-4xl">
            Don&apos;t make the farmer search for the market.
            <span className="block text-green-primary">Organize the market around the farmer.</span>
          </h2>
          <p className="mx-auto mt-6 max-w-2xl text-lg text-text-secondary">
            Agri Setu is the bridge between farmers, White Store collection centers and bulk
            buyers: instant payment at the counter, quality-graded batches, QR-verified
            traceability, and direct buyer ordering — all in one system.
          </p>
        </div>
      </section>

      {/* Problem */}
      <section className="mx-auto max-w-6xl px-4 py-16">
        <div className="grid gap-8 md:grid-cols-2">
          <div>
            <h2 className="text-2xl font-bold text-text-primary">The fragmented supply chain</h2>
            <p className="mt-3 text-text-secondary">
              Small and marginal farmers depend on layers of intermediaries because supply and
              demand are both fragmented. Small quantities aren&apos;t attractive to bulk buyers,
              quality is unverifiable, payment is slow, and prices stay opaque.
            </p>
            <div className="mt-5 rounded-2xl bg-error-light p-4 text-sm font-medium text-error">
              Many farmers → multiple intermediaries → vendors and buyers
            </div>
          </div>
          <div>
            <h2 className="text-2xl font-bold text-text-primary">The Agri Setu model</h2>
            <p className="mt-3 text-text-secondary">
              Farmers bring produce to a nearby White Store, where it is weighed, quality-graded
              and paid for immediately. Each lot becomes a QR-coded batch that buyers can browse,
              score, order and verify — end to end.
            </p>
            <div className="mt-5 rounded-2xl bg-green-light p-4 text-sm font-medium text-green-dark">
              Farmers → White Store (grade · pay · QR batch) → bulk buyers, with logistics built in
            </div>
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="bg-off-white py-16">
        <div className="mx-auto max-w-6xl px-4">
          <h2 className="text-center text-2xl font-bold text-text-primary">
            One complete transaction, end to end
          </h2>
          <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-5">
            {STEPS.map((step, i) => (
              <div key={step.title} className="rounded-2xl border border-hairline bg-white p-5 shadow-sm">
                <div className="mb-3 flex items-center gap-2">
                  <span className="text-2xl">{step.icon}</span>
                  <span className="flex h-6 w-6 items-center justify-center rounded-full bg-green-light text-xs font-bold text-green-dark">
                    {i + 1}
                  </span>
                </div>
                <h3 className="text-sm font-semibold text-text-primary">{step.title}</h3>
                <p className="mt-1 text-xs leading-relaxed text-text-muted">{step.text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Roles */}
      <section className="mx-auto max-w-6xl px-4 py-16">
        <h2 className="text-center text-2xl font-bold text-text-primary">Built for every stakeholder</h2>
        <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {ROLES.map((role) => (
            <div key={role.name} className="rounded-2xl border border-hairline p-5">
              <span className="text-3xl">{role.icon}</span>
              <h3 className="mt-3 font-semibold text-text-primary">{role.name}</h3>
              <p className="mt-1 text-sm text-text-muted">{role.text}</p>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="bg-green-primary py-16 text-center">
        <div className="mx-auto max-w-2xl px-4">
          <h2 className="text-2xl font-bold text-white">
            Aggregation turns 20 kg into a market position.
          </h2>
          <p className="mt-3 text-white/80">
            Farmer A has 20 kg, Farmer B has 30 kg, Farmer C has 50 kg. Alone, invisible to bulk
            buyers. Together at a White Store: 100 kg of graded, QR-verified, sellable supply.
          </p>
          <Link
            href="/register"
            className="mt-6 inline-block rounded-xl bg-white px-6 py-3 text-sm font-semibold text-green-primary transition hover:bg-green-light"
          >
            Get started with Agri Setu
          </Link>
        </div>
      </section>

      <footer className="border-t border-hairline py-6 text-center text-xs text-text-muted">
        Agri Setu — Smart India Hackathon prototype
      </footer>
      </div>
    </div>
  );
}

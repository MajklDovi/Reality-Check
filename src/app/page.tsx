import Link from "next/link";
import {
  Badge,
  Button,
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui";

const features = [
  {
    title: "Vše na jednom místě",
    description:
      "Přidejte odkazy na nabídky ze Sreality, Bezrealitky a dalších portálů a spravujte je v jediném přehledu.",
  },
  {
    title: "AI hodnocení shody",
    description:
      "Umělá inteligence porovná každou nemovitost s vaším profilem — finance, dispozice, lokalita i dojíždění.",
  },
  {
    title: "Analýza ceny",
    description:
      "Zjistěte, zda je cena férová, jak se vyvíjela v čase a kolik zaplatíte celkově včetně vedlejších nákladů.",
  },
  {
    title: "Odhalení rizik",
    description:
      "Upozorníme na potenciální rizika — družstevní vlastnictví, stáří stavby, chybějící informace v inzerátu.",
  },
  {
    title: "Porovnání nabídek",
    description:
      "Postavte nabídky vedle sebe a porovnejte je podle parametrů, které jsou důležité právě pro vás.",
  },
  {
    title: "Respekt ke zdrojům",
    description:
      "Nezveřejňujeme cizí inzeráty. Zobrazujeme základní údaje, vlastní analýzy a odkazy na původní nabídky.",
  },
];

const steps = [
  {
    step: "1",
    title: "Vytvořte si profil",
    description: "Zadejte své finanční možnosti, preference a požadavky na bydlení.",
  },
  {
    step: "2",
    title: "Přidejte nabídky",
    description: "Vložte odkazy na nemovitosti, které vás zaujaly na realitních portálech.",
  },
  {
    step: "3",
    title: "Získejte AI hodnocení",
    description: "Porovnejte nabídky a nechte AI zhodnotit shodu, cenu, lokalitu i rizika.",
  },
];

export default function HomePage() {
  return (
    <div>
      {/* Hero */}
      <section className="mx-auto max-w-6xl px-4 py-20 text-center sm:px-6 sm:py-28">
        <Badge variant="info" className="mb-6">
          Heureka pro nemovitosti
        </Badge>
        <h1 className="mx-auto max-w-3xl text-4xl font-bold tracking-tight text-zinc-900 sm:text-5xl dark:text-zinc-50">
          Najděte nemovitost, která vám opravdu sedí
        </h1>
        <p className="mx-auto mt-6 max-w-2xl text-lg text-zinc-600 dark:text-zinc-400">
          Reality Check porovnává realitní nabídky z českých portálů a pomocí AI hodnotí, jak
          odpovídají vašim možnostem a preferencím — od ceny přes lokalitu až po skrytá rizika.
        </p>
        <div className="mt-10 flex flex-col items-center justify-center gap-3 sm:flex-row">
          <Link href="/register">
            <Button size="lg">Začít zdarma</Button>
          </Link>
          <Link href="/login">
            <Button variant="outline" size="lg">
              Přihlásit se
            </Button>
          </Link>
        </div>
      </section>

      {/* Features */}
      <section
        id="funkce"
        className="border-t border-zinc-200 bg-white py-20 dark:border-zinc-800 dark:bg-zinc-900/50"
      >
        <div className="mx-auto max-w-6xl px-4 sm:px-6">
          <h2 className="text-center text-3xl font-bold text-zinc-900 dark:text-zinc-50">
            Co Reality Check umí
          </h2>
          <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {features.map((feature) => (
              <Card key={feature.title}>
                <CardHeader>
                  <CardTitle>{feature.title}</CardTitle>
                  <CardDescription>{feature.description}</CardDescription>
                </CardHeader>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* How it works */}
      <section id="jak-to-funguje" className="py-20">
        <div className="mx-auto max-w-6xl px-4 sm:px-6">
          <h2 className="text-center text-3xl font-bold text-zinc-900 dark:text-zinc-50">
            Jak to funguje
          </h2>
          <div className="mt-12 grid gap-6 md:grid-cols-3">
            {steps.map((item) => (
              <Card key={item.step}>
                <CardHeader>
                  <span className="mb-2 flex size-10 items-center justify-center rounded-full bg-indigo-600 text-lg font-bold text-white">
                    {item.step}
                  </span>
                  <CardTitle>{item.title}</CardTitle>
                  <CardDescription>{item.description}</CardDescription>
                </CardHeader>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="border-t border-zinc-200 bg-white py-20 dark:border-zinc-800 dark:bg-zinc-900/50">
        <div className="mx-auto max-w-6xl px-4 text-center sm:px-6">
          <Card className="mx-auto max-w-3xl border-indigo-600 bg-indigo-600 text-white dark:border-indigo-700 dark:bg-indigo-700">
            <CardContent className="p-10">
              <h2 className="text-2xl font-bold sm:text-3xl">
                Přestaňte hádat, začněte porovnávat
              </h2>
              <p className="mt-3 text-indigo-100">
                Vytvořte si účet zdarma a získejte objektivní pohled na nabídky nemovitostí.
              </p>
              <Link href="/register" className="mt-6 inline-block">
                <Button variant="secondary" size="lg">
                  Vytvořit účet
                </Button>
              </Link>
            </CardContent>
          </Card>
        </div>
      </section>
    </div>
  );
}

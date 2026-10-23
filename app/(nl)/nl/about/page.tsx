import type { Metadata } from "next";
import { ContactForm } from "@/components/ContactForm";
import { ogLocale } from "@/lib/i18n";
import {
  JsonLd,
  absoluteUrl,
  breadcrumbSchema,
  localeRobots,
  localizedAlternates,
  personSchema,
  profilePageSchema,
} from "@/lib/seo";
import { siteConfig } from "@/lib/site-config";

const TITLE = "Over mij";
const DESCRIPTION =
  "Roman Prokashev bouwt marketingfuncties die omzet opleveren voor technische bedrijven: groeistrategie, operating model, demand generation en meten.";

export const metadata: Metadata = {
  title: TITLE,
  description: DESCRIPTION,
  alternates: localizedAlternates("/about", "nl"),
  robots: localeRobots("nl"),
  openGraph: {
    type: "profile",
    siteName: siteConfig.name,
    locale: ogLocale.nl,
    title: `${TITLE} — ${siteConfig.name}`,
    description: DESCRIPTION,
    url: absoluteUrl("/nl/about"),
  },
  twitter: {
    card: "summary_large_image",
    title: `${TITLE} — ${siteConfig.name}`,
    description: DESCRIPTION,
  },
};

export default function AboutPage() {
  return (
    <div className="mx-auto max-w-2xl space-y-16">
      <JsonLd
        schemas={[
          profilePageSchema("nl"),
          personSchema(),
          breadcrumbSchema([
            { name: "Home", path: "/nl" },
            { name: "Over mij", path: "/nl/about" },
          ]),
        ]}
      />
      <section>
        <p className="eyebrow">Over mij</p>
        <h1 className="mt-3 font-display text-4xl font-semibold tracking-tightish text-ink">
          Roman Prokashev
        </h1>
        <p className="mt-5 text-lg leading-relaxed text-ink-muted">
          Ik help technische bedrijven marketingfuncties op te bouwen die meetbare groei, een
          sterkere marktpositie en betere omzetresultaten opleveren.
        </p>
        <div className="mt-5 space-y-5 text-ink-muted">
          <p>
            Mijn werk ligt op het snijvlak van strategie, uitvoering en organisatieontwerp. Ik
            bepaal waar marketing bedrijfsimpact moet maken, bouw de systemen die dat mogelijk
            maken, en breng teams, kanalen, data, workflows en besluitvorming samen rond heldere
            commerciële doelen.
          </p>
          <p>
            Ik ben vooral nuttig voor bedrijven met sterke producten, technische doelgroepen en
            toenemende complexiteit: daar waar marketing meer moet worden dan losse campagnes,
            kanalen of tactieken.
          </p>
        </div>
      </section>

      <section aria-labelledby="what-i-build">
        <p className="eyebrow">Diensten</p>
        <h2
          id="what-i-build"
          className="mt-3 font-display text-2xl font-semibold tracking-tightish text-ink"
        >
          Wat ik bouw
        </h2>
        <div className="mt-8 space-y-10">
          <div>
            <h3 className="font-display text-xl font-semibold tracking-tightish text-ink">
              Marketingfuncties die omzet opleveren
            </h3>
            <div className="mt-2 space-y-3 text-ink-muted">
              <p>
                Ik ontwerp marketingsystemen die doelgroepstrategie, positionering, demand
                generation, websitegroei, lifecycle, analytics en afstemming met sales samenbrengen
                in één operating model.
              </p>
              <p>
                Het doel is niet méér marketingactiviteit. Het doel is een functie die weet waar
                groei vandaan komt, hoe je investeringen prioriteert, hoe je kwaliteit meet en hoe je
                opschaalt wat werkt.
              </p>
            </div>
          </div>

          <div>
            <h3 className="font-display text-xl font-semibold tracking-tightish text-ink">
              Groeistrategie en operating model
            </h3>
            <div className="mt-2 space-y-3 text-ink-muted">
              <p>
                Ik help bedrijven helderheid te krijgen over doelgroepen, de rol van elk kanaal, de
                logica achter het budget, prioriteiten in de funnel, beslissingsprincipes en de
                verantwoordelijkheden van teams.
              </p>
              <p>
                Daar hoort bij: bepalen wat marketing moet oppakken, waar het mee moet stoppen, waar
                het in moet investeren en hoe het moet samenwerken met product, sales, analytics,
                engineering, design en directie.
              </p>
            </div>
          </div>

          <div>
            <h3 className="font-display text-xl font-semibold tracking-tightish text-ink">
              Demand generation en pipelinegroei
            </h3>
            <div className="mt-2 space-y-3 text-ink-muted">
              <p>
                Ik bouw B2B-demand-generation-systemen rond duidelijke behoeften van de doelgroep,
                sterke content, betaalde en organische distributie, lifecycle-flows en meten dat op
                de pipeline is gericht.
              </p>
              <p>
                Leadvolume op zichzelf interesseert me minder; wat telt is of marketing
                gekwalificeerde vraag, zinvolle salesgesprekken en meetbare bedrijfswaarde creëert.
              </p>
            </div>
          </div>

          <div>
            <h3 className="font-display text-xl font-semibold tracking-tightish text-ink">
              Website, conversie en digitale groei
            </h3>
            <div className="mt-2 space-y-3 text-ink-muted">
              <p>
                Ik behandel websites als groeisystemen, niet als statische merkpagina’s.
              </p>
              <p>
                Dat betekent: betere navigatie, een doordachte homepagestrategie, landingspagina’s,
                productflows, experimenten, conversiediagnose en de koppeling tussen gedrag van
                gebruikers en commerciële resultaten.
              </p>
            </div>
          </div>

          <div>
            <h3 className="font-display text-xl font-semibold tracking-tightish text-ink">
              Meten en betere besluitvorming
            </h3>
            <div className="mt-2 space-y-3 text-ink-muted">
              <p>
                Ik bouw marketingmeting die verder gaat dan verkeer, clicks en oppervlakkige
                conversies.
              </p>
              <p>
                Het doel is marketingdata te verbinden met CRM, product, sales, finance en interne
                systemen, zodat teams kwaliteit en omzetbijdrage kunnen begrijpen en zien waar
                betere beslissingen te halen zijn.
              </p>
            </div>
          </div>

          <div>
            <h3 className="font-display text-xl font-semibold tracking-tightish text-ink">
              AI-operations, automatisering en workflows
            </h3>
            <div className="mt-2 space-y-3 text-ink-muted">
              <p>
                Ik ontwerp ook praktische systemen die marketingteams sneller en effectiever maken.
              </p>
              <p>
                Dat kan gaan om door AI ondersteunde workflows, automatiseringen op maat,
                rapportagetools, systemen voor contentproductie, campagne-operations, verbeteringen
                in leadrouting en lichte interne tooling, telkens toegesneden op een concreet
                bedrijfsprobleem.
              </p>
              <p>
                Ik zie automatisering niet als vervanging van marketingstrategie. Ik zie het als
                onderdeel van het bouwen van een sterkere marketingfunctie: minder handwerk, snellere
                beslissingen, betere datastromen en uitvoering die beter meeschaalt.
              </p>
            </div>
          </div>

          <div>
            <h3 className="font-display text-xl font-semibold tracking-tightish text-ink">
              Organische groei en technische doelgroepen bereiken
            </h3>
            <div className="mt-2 space-y-3 text-ink-muted">
              <p>
                Ik werk aan organische groeisystemen voor technische bedrijven, waaronder SEO,
                content-operations, thematische autoriteit en het bereiken van technische
                doelgroepen.
              </p>
              <p>
                Voor developer tools, SaaS en deep tech is organische zichtbaarheid niet zomaar een
                contentkanaal. Het is een strategische groeilaag die merk, vraag, vertrouwen en
                marktpositie op de lange termijn draagt.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section aria-labelledby="how-i-work">
        <p className="eyebrow">Aanpak</p>
        <h2
          id="how-i-work"
          className="mt-3 font-display text-2xl font-semibold tracking-tightish text-ink"
        >
          Hoe ik werk
        </h2>
        <p className="mt-4 text-lg leading-relaxed text-ink-muted">
          Ik neem verantwoordelijkheid voor resultaten, niet voor taken.
        </p>
        <div className="mt-5 space-y-5 text-ink-muted">
          <p>
            Ik combineer strategisch oordeel met genoeg diepgang in de uitvoering om te weten wat
            echt is, wat ruis is en wat het bedrijf daadwerkelijk vooruithelpt.
          </p>
          <p>
            Ik werk goed samen met directies omdat ik marketing kan vertalen naar
            bedrijfsbeslissingen: impact, risico, investering, snelheid en organisatorische
            complexiteit. Ik werk ook goed samen met specialisten, omdat ik het operationele detail
            eronder begrijp: kanalen, analytics, content, productflows, experimenten, workflows en
            de beperkingen van de uitvoering.
          </p>
          <p>
            Mijn standaardmodus is heldere prioriteiten, snelle beslissingen, meetbaar leren en hoge
            standaarden. Ik geef de voorkeur aan praktische strategie boven abstracte presentaties,
            en aan gerichte uitvoering boven losse activiteit.
          </p>
        </div>
      </section>

      <section aria-labelledby="fit">
        <p className="eyebrow">Match</p>
        <h2
          id="fit"
          className="mt-3 font-display text-2xl font-semibold tracking-tightish text-ink"
        >
          Waar ik het meest van waarde ben
        </h2>
        <p className="mt-4 text-ink-muted">
          Ik ben het meest van waarde voor technische bedrijven die:
        </p>
        <ul className="mt-5 list-disc space-y-2 pl-6 text-ink-muted marker:text-ink-soft">
          <li>een marketingfunctie willen opbouwen of opnieuw inrichten</li>
          <li>merk, vraag, productgroei en omzet met elkaar willen verbinden</li>
          <li>de geloofwaardigheid van marketing bij directie en sales willen vergroten</li>
          <li>
            zich richten op developers, engineers, technische kopers of softwaredoelgroepen
          </li>
          <li>van losse kanaaluitvoering naar geïntegreerde groeisystemen willen</li>
          <li>
            marketing-operations, automatisering, workflows en besluitvorming willen verbeteren
          </li>
          <li>beter willen meten en meer zicht op omzet willen krijgen</li>
          <li>marketing willen opschalen zonder de strategische focus te verliezen</li>
        </ul>
      </section>

      <section id="contact" aria-labelledby="contact-heading">
        <p className="eyebrow">Contact</p>
        <h2
          id="contact-heading"
          className="mt-3 font-display text-2xl font-semibold tracking-tightish text-ink"
        >
          Neem contact op
        </h2>
        <div className="mt-4 space-y-4 text-ink-muted">
          <p>
            Ik werk selectief met bedrijven waar marketing de potentie heeft om een echte
            groeifunctie te worden, en niet alleen een ondersteunend team.
          </p>
          <p>
            Herken je dat? Stuur me dan een kort bericht over het bedrijf, de fase waarin het zit en
            het marketingprobleem dat je probeert op te lossen.
          </p>
        </div>
        <div className="mt-6">
          <ContactForm locale="nl" />
        </div>
      </section>
    </div>
  );
}

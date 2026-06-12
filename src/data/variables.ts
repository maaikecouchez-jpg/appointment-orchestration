// ──────────────────────────────────────────────────────────────────────────
// Dynamic content for the prototype. Change values here to re-skin the flow.
// ──────────────────────────────────────────────────────────────────────────
import type { MomentMeta } from "../lib/types";

export const config = {
  /** The key dynamic value — shown on the intro & confirm screens. */
  address: "Borsbeeksesteenweg 234, 2000 Antwerpen",

  /** Placeholder customer (config-driven; editable pencil deep-links in UI). */
  customer: {
    name: "Isa Van den Bossche",
    phone: "+32 478 12 34 56",
  },

  service: {
    title: "Maak een afspraak voor je buiteninstallatie",
    subtitle: "Laat ons weten welk moment het beste voor je uitkomt.",
    durationLabel: "De installatie duurt maximaal 2u.",
    /** Bullets in the "Wat gaan we doen" block on the intro screen. */
    whatWeDo: [
      "De technieker komt langs om de glasvezelkabel tot in je woning te brengen. Een boring in je gevel is mogelijk.",
      "De technieker kijkt je aansluiting grondig na en zorgt ervoor dat alles correct werkt.",
      "We zorgen ervoor dat je zo weinig mogelijk hinder ondervindt van de ingreep.",
    ],
  },

  notice:
    "1 dag op voorhand sturen we je een bericht met een concreet tijdstip wanneer onze technieker langskomt.",

  /** Window (used as a fallback label; the real "today" comes from the data). */
  firstAvailableWindowLabel: "Tussen 8u – 17u",

  /** "Mijn afspraken" landing page. */
  landing: {
    title: "Mijn afspraken",
    productTitle: "Outdoor fiber installatie",
    productSubtitle: "We brengen fiber tot aan je woning.",
    ctaLabel: "Maak je afspraak",
    bookedSectionTitle: "Lopende afspraken",
    bookedTitle: "Outdoor Fiber installatie",
    faqTitle: "Frequently asked questions",
    faqLinks: [
      "Alles over je Telenet modem",
      "Probleem met je wifi thuis?",
      "Problem with your home wifi",
    ],
  },

  /** Booked-overview details. */
  appointment: {
    overviewTitle: "Outdoor fiber installatie",
    referenceNr: "TF-8218.08",
    cutoffLabel: "Kan tot 24 uur op voorhand",
  },

  /** "Goed om te weten" rows on the overview. */
  goodToKnow: [
    "We sturen je 24u op voorhand een bericht met een concreet tijdstip.",
    "De installatie duurt maximaal 2u.",
  ],

  /** FAQ accordion on the overview. */
  faq: [
    {
      q: "Moet ik thuis zijn tijdens de installatie?",
      a: "Ja, er moet iemand van minstens 18 jaar aanwezig zijn om de technieker binnen te laten en de installatie te bespreken.",
    },
    {
      q: "Kan ik mijn afspraak nog wijzigen?",
      a: "Je kan je afspraak tot 24 uur op voorhand kosteloos wijzigen of annuleren via deze pagina.",
    },
    {
      q: "Hoe lang duurt de installatie?",
      a: "De buiteninstallatie duurt maximaal 2 uur, afhankelijk van je woning en aansluiting.",
    },
  ],

  /** "Meer info" explainer modal on the intro screen. */
  infoModal: {
    title: "Outdoor fiber installatie",
    body: "Onze technieker zorgt ervoor dat je woning op het fiber netwerk aangesloten wordt. Hij brengt de glasvezelkabel tot in je woning — een boring in je gevel is mogelijk. Daarna controleert hij je aansluiting grondig zodat alles correct werkt.",
  },
} as const;

// Canonical moment metadata, in UI display order (2-column grid).
export const MOMENTS: MomentMeta[] = [
  { id: "flexibel", label: "Flexibel", range: "8 u. – 17 u.", derived: true },
  { id: "voormiddag", label: "Voormiddag", range: "8 u. – 12 u.", derived: false },
  { id: "middag", label: "Middag", range: "10 u. – 13.30 u.", derived: false },
  { id: "namiddag", label: "Namiddag", range: "12.30 u. – 17 u.", derived: false },
  { id: "avond", label: "Avond", range: "17 u. – 19 u.", derived: false },
];

// Renders the Vorab-Fahrplan as an A4 PDF (spec §7.1): page 1 always, page 2 only for a researched plan.
import path from "node:path";
import { Document, Ellipse, Font, Line, Link, Page, Path, StyleSheet, Svg, Text, View, renderToBuffer } from "@react-pdf/renderer";
import { PDF_UI } from "./blocks";
import type { Quelle, VorabFahrplan } from "./content";
import { safeFilenamePart } from "./guards";

// Static instances from the upstream projects (src/assets/fonts/OFL.txt). Shipped via outputFileTracingIncludes.
const FONTS = path.join(process.cwd(), "src/assets/fonts");
Font.register({
  family: "Jakarta",
  fonts: [
    { src: path.join(FONTS, "PlusJakartaSans-Regular.ttf") },
    { src: path.join(FONTS, "PlusJakartaSans-Bold.ttf"), fontWeight: 700 },
  ],
});
Font.register({ family: "Fraunces", fonts: [{ src: path.join(FONTS, "Fraunces-Italic.ttf"), fontStyle: "italic" }] });
// The built-in hyphenation is English; German words split badly, so lines break between words only.
Font.registerHyphenationCallback((word) => [word]);

const C = {
  tiefes: "#0a2538",
  petrol: "#1b5063",
  amber: "#d4a24c",
  ember: "#8b5e2c",
  gletscher: "#dce7eb",
  tinte: "#14181b",
  faden: "#d4ccbc",
  stumm: "#7a7468",
};

const s = StyleSheet.create({
  page: { backgroundColor: "#ffffff", fontFamily: "Jakarta", fontSize: 9, color: C.tinte, lineHeight: 1.38, paddingTop: 32, paddingBottom: 50, paddingHorizontal: 44, fontFeatureSettings: { liga: false } },
  head: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  lockup: { flexDirection: "row", alignItems: "center" },
  wordmark: { fontFamily: "Fraunces", fontStyle: "italic", fontSize: 20, color: C.tiefes, marginLeft: 5, lineHeight: 1 },
  meta: { fontSize: 8.5, color: C.stumm },
  title: { fontWeight: 700, fontSize: 18, color: C.tiefes, marginTop: 16, lineHeight: 1.2 },
  rule: { width: 36, height: 2, backgroundColor: C.amber, marginTop: 8 },
  stunden: { fontWeight: 700, fontSize: 11.5, color: C.petrol, marginTop: 8 },
  section: { marginTop: 12 },
  label: { fontWeight: 700, fontSize: 7.5, color: C.petrol, textTransform: "uppercase", letterSpacing: 0.9, marginBottom: 5 },
  // Jakarta, not Fraunces: the registered Fraunces is the opsz-144 display cut, unreadable at 10 pt („Recfinungen“).
  quote: { fontSize: 9.5, color: C.tinte, lineHeight: 1.45, paddingLeft: 9, borderLeftWidth: 1.5, borderLeftColor: C.amber },
  zeitRow: { flexDirection: "row", alignItems: "center" },
  zeitLabel: { flex: 1, fontWeight: 700, color: C.tiefes },
  track: { width: 84, height: 4, backgroundColor: C.gletscher, marginHorizontal: 10 },
  bar: { height: 4, backgroundColor: C.petrol },
  zeitStunden: { width: 74, textAlign: "right", fontSize: 8.5, color: C.petrol },
  zeitSatz: { fontSize: 8.5, marginBottom: 4 },
  schritt: { flexDirection: "row", paddingTop: 6, paddingBottom: 5, borderTopWidth: 0.5, borderTopColor: C.faden },
  rang: { width: 52, paddingTop: 2, fontWeight: 700, fontSize: 7.5, textTransform: "uppercase", letterSpacing: 0.9 },
  schrittBody: { flex: 1 },
  schrittTitel: { fontWeight: 700, fontSize: 10, color: C.tiefes, marginBottom: 1 },
  zusatz: { marginTop: 2, fontSize: 8.5 },
  strong: { fontWeight: 700, color: C.tiefes },
  marks: { fontSize: 7, color: C.petrol },
  weiter: { marginTop: 12, padding: 9, paddingLeft: 12, backgroundColor: C.gletscher, borderLeftWidth: 3, borderLeftColor: C.amber },
  fussnote: { fontSize: 7, color: C.stumm, marginTop: 10 },
  footer: { position: "absolute", bottom: 24, left: 44, right: 44, flexDirection: "row", justifyContent: "space-between", paddingTop: 6, borderTopWidth: 0.5, borderTopColor: C.faden, fontSize: 7, color: C.stumm },
  grid: { flexDirection: "row", flexWrap: "wrap", justifyContent: "space-between" },
  programm: { width: "48.5%", marginBottom: 7 },
  programmName: { fontWeight: 700, fontSize: 9, color: C.tiefes, marginBottom: 2 },
  zeile: { flexDirection: "row", fontSize: 8, lineHeight: 1.3, marginBottom: 1 },
  dot: { width: 3, height: 3, backgroundColor: C.amber, marginTop: 4, marginRight: 6 },
  quelle: { width: "48.5%", fontSize: 6.5, lineHeight: 1.25, color: C.stumm, marginBottom: 2.5 },
  link: { color: C.stumm, textDecoration: "none" },
});

const nf = new Intl.NumberFormat("de-DE");

function Marks({ n }: { n: number[] }) {
  return n.length ? <Text style={s.marks}> {n.map((i) => `[${i}]`).join("")}</Text> : null;
}

/**
 * „lexware.de/…/547985-zahlungs…“: no scheme, host plus the last path segment (the part that tells
 * sources apart; the middle is mostly shared), cut to `max`. The link keeps the full URL.
 */
export function shortUrl(url: string, max: number): string {
  const u = url.replace(/^https?:\/\/(www\.)?/, "");
  if (u.length <= max) return u;
  const [host, ...rest] = u.split("/");
  const tail = rest.filter(Boolean).pop();
  const out = tail && rest.length > 1 ? `${host}/…/${tail}` : u;
  return out.length > max ? `${out.slice(0, max - 1)}…` : out;
}

function QuelleText({ q, max = 42 }: { q: Quelle; max?: number }) {
  return (
    <Text>
      [{q.n}]{" "}
      <Link src={q.url} style={s.link}>
        {shortUrl(q.url, max)}
      </Link>{" "}
      ({PDF_UI.abgerufen} {q.abgerufen})
    </Text>
  );
}

/** Page 1 program line of a fallback plan; null for a researched plan (page 2 names the programs there). */
export function programmZeile(p: VorabFahrplan): string | null {
  return !p.recherchiert && p.programmNamen ? `${p.programmNamen} ${PDF_UI.programmeImGespraech}` : null;
}

function Kopf({ p }: { p: VorabFahrplan }) {
  return (
    <View style={s.head}>
      <View style={s.lockup}>
        {/* public/logo/vrelo-symbol-navy-amber.svg */}
        <Svg viewBox="0 0 110 120" style={{ width: 22, height: 24 }}>
          <Line x1={12} y1={92} x2={98} y2={92} stroke={C.tiefes} strokeWidth={1} strokeOpacity={0.4} />
          <Path d="M 14 36 L 55 98 L 96 36 L 82 36 L 55 77 L 28 36 Z" fill={C.tiefes} />
          <Path d="M 55 8 C 60 8, 65 14, 65 18 C 65 24, 60.5 27.5, 55 27.5 C 49.5 27.5, 45 24, 45 18 C 45 14, 50 8, 55 8 Z" fill={C.amber} />
          <Ellipse cx={52} cy={15.5} rx={2.2} ry={3.2} fill="#ffffff" fillOpacity={0.3} />
        </Svg>
        <Text style={s.wordmark}>Vrelo</Text>
      </View>
      <Text style={s.meta}>
        {p.name} · {p.datum}
      </Text>
    </View>
  );
}

function Fuss({ links }: { links?: string }) {
  return (
    <View style={s.footer} fixed>
      <Text>{links ?? ""}</Text>
      <Text>{PDF_UI.absender}</Text>
    </View>
  );
}

function VorabFahrplanDoc({ p }: { p: VorabFahrplan }) {
  const programmText = programmZeile(p);
  const maxH = Math.max(1, ...p.zeitVerteilung.map((z) => z.stunden));
  return (
    <Document title={`${PDF_UI.titel} ${p.firma}`} author="Ajdin Dzafic" language="de">
      <Page size="A4" style={s.page}>
        <Kopf p={p} />
        <Text style={s.title}>
          {PDF_UI.titel} {p.firma}
        </Text>
        <View style={s.rule} />
        <Text style={s.stunden}>{p.stundenZeile}</Text>

        {p.arbeitstag ? (
          <View style={s.section}>
            <Text style={s.label}>{PDF_UI.arbeitstag}</Text>
            <Text style={s.quote}>{p.arbeitstag}</Text>
          </View>
        ) : null}

        <View style={s.section}>
          <Text style={s.label}>{PDF_UI.zeit}</Text>
          {p.zeitVerteilung.map((z) => (
            <View key={z.label} wrap={false}>
              <View style={s.zeitRow}>
                <Text style={s.zeitLabel}>{z.label}</Text>
                <View style={s.track}>
                  <View style={[s.bar, { width: `${(z.stunden / maxH) * 100}%` }]} />
                </View>
                <Text style={s.zeitStunden}>
                  {nf.format(z.stunden)} {PDF_UI.stunden}
                </Text>
              </View>
              <Text style={s.zeitSatz}>{z.satz}</Text>
            </View>
          ))}
        </View>

        <View style={s.section}>
          <Text style={s.label}>{PDF_UI.aufgabe}</Text>
          <Text>{p.aufgabeZeile}</Text>
        </View>

        {programmText ? (
          <View style={s.section}>
            <Text style={s.label}>{PDF_UI.programme}</Text>
            <Text>{programmText}</Text>
          </View>
        ) : null}

        <View style={s.section}>
          <Text style={s.label}>{PDF_UI.start}</Text>
          {p.schritte.map((st, i) => {
            // Schritt.quellen is per step, not per line: the marks go after the step's last line.
            const last = st.tipp ? "tipp" : st.mitProgrammen ? "mit" : "idee";
            return (
              <View key={st.rang} style={s.schritt} wrap={false}>
                <Text style={[s.rang, { color: i === 0 ? C.amber : C.petrol }]}>{st.rang}</Text>
                <View style={s.schrittBody}>
                  <Text style={s.schrittTitel}>{st.titel}</Text>
                  <Text>
                    {st.idee}
                    {last === "idee" ? <Marks n={st.quellen} /> : null}
                  </Text>
                  {st.mitProgrammen ? (
                    <Text style={s.zusatz}>
                      <Text style={s.strong}>{PDF_UI.mitProgrammen}</Text> {st.mitProgrammen}
                      {last === "mit" ? <Marks n={st.quellen} /> : null}
                    </Text>
                  ) : null}
                  {st.tipp ? (
                    <Text style={s.zusatz}>
                      <Text style={s.strong}>{PDF_UI.tipp}</Text> {st.tipp}
                      <Marks n={st.quellen} />
                    </Text>
                  ) : null}
                </View>
              </View>
            );
          })}
        </View>

        <View style={s.weiter} wrap={false}>
          <Text style={[s.label, { marginBottom: 3 }]}>{PDF_UI.weiter}</Text>
          <Text>{PDF_UI.weiterText}</Text>
        </View>

        {/* Without page 2 the tip sources (fallback) are listed here. */}
        {!p.recherchiert && p.quellen.length ? (
          <View style={s.fussnote}>
            {p.quellen.map((q) => (
              <QuelleText key={q.n} q={q} max={90} />
            ))}
          </View>
        ) : null}
        <Fuss />
      </Page>

      {p.recherchiert ? (
        <Page size="A4" style={s.page}>
          <Kopf p={p} />
          <View style={[s.section, { marginTop: 18 }]}>
            <Text style={s.label}>{PDF_UI.programme}</Text>
            <View style={s.grid}>
              {p.programme.map((pr) => (
                <View key={pr.name} style={s.programm} wrap={false}>
                  <Text style={s.programmName}>{pr.name}</Text>
                  {pr.zeilen.map((z, i) => (
                    <View key={i} style={s.zeile}>
                      <View style={s.dot} />
                      <Text style={{ flex: 1 }}>
                        {z}
                        {i === pr.zeilen.length - 1 ? <Marks n={pr.quellen} /> : null}
                      </Text>
                    </View>
                  ))}
                </View>
              ))}
            </View>
          </View>
          {p.quellen.length ? (
            <View style={s.section}>
              <Text style={s.label}>{PDF_UI.quellen}</Text>
              <View style={s.grid}>
                {p.quellen.map((q) => (
                  <View key={q.n} style={s.quelle}>
                    <QuelleText q={q} />
                  </View>
                ))}
              </View>
            </View>
          ) : null}
          <Fuss links={PDF_UI.kiFooter.replace("{datum}", p.datum)} />
        </Page>
      ) : null}
    </Document>
  );
}

export function renderVorabFahrplanPdf(p: VorabFahrplan): Promise<Buffer> {
  return renderToBuffer(<VorabFahrplanDoc p={p} />);
}

export function pdfFilename(firma: string): string {
  return `Vrelo-Vorab-Fahrplan-${safeFilenamePart(firma)}.pdf`;
}

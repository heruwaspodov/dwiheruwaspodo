export const toolDefinitions = [
  {
    slug: "ruby-hash-to-json",
    label: "Ruby Hash ↔ JSON",
    title: "Ruby Hash to JSON Converter",
    description: "Convert Ruby hash syntax to formatted JSON, or turn JSON back into a Ruby hash locally in your browser.",
    accent: "blue",
  },
  {
    slug: "file-to-base64",
    label: "File ↔ Base64",
    title: "File to Base64 Converter",
    description: "Encode any file as a Base64 data URL or decode Base64 into a downloadable file, with previews for image files.",
    accent: "yellow",
  },
  {
    slug: "url-encode-decode",
    label: "URL Encode / Decode",
    title: "URL Encoder and Decoder",
    description: "Encode unsafe URL characters or decode percent-encoded text directly in your browser.",
    accent: "red",
  },
  {
    slug: "json-beautifier",
    label: "JSON Beautifier",
    title: "JSON Beautifier, Validator and CSV Converter",
    description: "Beautify, minify, validate, and convert JSON objects to CSV locally in your browser.",
    accent: "green",
  },
  {
    slug: "text-diff",
    label: "Text Diff",
    title: "Online Text Diff Checker",
    description: "Compare two text blocks line by line and highlight added, removed, and unchanged content locally.",
    accent: "cream",
  },
  {
    slug: "timestamp-lab",
    label: "Timestamp Lab",
    title: "Unix Timestamp and Timezone Converter",
    description: "Convert Unix timestamps and translate local date-times between IANA timezones in your browser.",
    accent: "pink",
  },
  {
    slug: "uuid-generator",
    label: "UUID Generator",
    title: "Secure UUID v4 Generator",
    description: "Generate one or many cryptographically random UUID v4 values locally with the browser Web Crypto API.",
    accent: "blue",
  },
  {
    slug: "ruby-compiler",
    label: "Ruby Compiler",
    title: "Online Ruby Compiler",
    description: "Write and run Ruby using the embedded OneCompiler editor and execution service.",
    accent: "yellow",
  },
  {
    slug: "character-counter",
    label: "Character Counter",
    title: "Unicode Character Counter",
    description: "Count visible characters, words, lines, Unicode code points, UTF-16 units, and UTF-8 bytes with accurate emoji handling.",
    accent: "red",
  },
  {
    slug: "http-client",
    label: "HTTP Client",
    title: "HTTP Request Client",
    description: "Use Scalar's hosted API client to send requests, inspect responses, manage auth, and generate code snippets.",
    accent: "green",
  },
  {
    slug: "upcoming",
    label: "Upcoming Tools",
    title: "Upcoming Developer Tools",
    description: "Preview the small developer utilities planned for the next workbench updates.",
    accent: "cream",
  },
] as const;

export type ToolSlug = (typeof toolDefinitions)[number]["slug"];

export function getToolDefinition(slug: string) {
  return toolDefinitions.find((tool) => tool.slug === slug);
}

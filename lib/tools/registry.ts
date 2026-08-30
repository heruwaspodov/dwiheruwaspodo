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
    slug: "ruby-compiler",
    label: "Ruby Compiler",
    title: "Online Ruby Compiler",
    description: "Write and run Ruby using the embedded OneCompiler editor and execution service.",
    accent: "blue",
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

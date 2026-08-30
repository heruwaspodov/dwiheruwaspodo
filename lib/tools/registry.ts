export const toolDefinitions = [
  {
    slug: "ruby-hash-to-json",
    label: "Ruby Hash ↔ JSON",
    title: "Ruby Hash to JSON Converter",
    description: "Convert Ruby hash syntax to formatted JSON, or turn JSON back into a Ruby hash locally in your browser.",
    accent: "blue",
  },
  {
    slug: "image-to-base64",
    label: "Image ↔ Base64",
    title: "Image to Base64 Converter",
    description: "Encode an image as a Base64 data URL or preview Base64 image data without uploading the file.",
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
    slug: "ruby-compiler",
    label: "Ruby Compiler",
    title: "Online Ruby Compiler",
    description: "Run Ruby code privately in your browser with the official CRuby WebAssembly runtime.",
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

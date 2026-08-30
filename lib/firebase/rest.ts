import { firebaseConfig } from "./config";
import { normalizePortfolioData, type RawDocument } from "./normalize";
import type { PortfolioData } from "./types";

type FirestoreValue = {
  nullValue?: null;
  booleanValue?: boolean;
  integerValue?: string;
  doubleValue?: number;
  timestampValue?: string;
  stringValue?: string;
  arrayValue?: { values?: FirestoreValue[] };
  mapValue?: { fields?: Record<string, FirestoreValue> };
};

type FirestoreDocument = {
  name: string;
  fields?: Record<string, FirestoreValue>;
};

const firestoreBase = `https://firestore.googleapis.com/v1/projects/${firebaseConfig.projectId}/databases/(default)/documents`;

function decodeValue(value: FirestoreValue): unknown {
  if ("nullValue" in value) return null;
  if ("booleanValue" in value) return value.booleanValue;
  if ("integerValue" in value) return Number(value.integerValue);
  if ("doubleValue" in value) return value.doubleValue;
  if ("timestampValue" in value) return value.timestampValue;
  if ("stringValue" in value) return value.stringValue;
  if (value.arrayValue) return (value.arrayValue.values ?? []).map(decodeValue);
  if (value.mapValue) return decodeFields(value.mapValue.fields ?? {});
  return undefined;
}

function decodeFields(fields: Record<string, FirestoreValue>): Record<string, unknown> {
  return Object.fromEntries(Object.entries(fields).map(([key, value]) => [key, decodeValue(value)]));
}

async function firestoreFetch<T>(path: string): Promise<T> {
  const separator = path.includes("?") ? "&" : "?";
  const response = await fetch(`${firestoreBase}/${path}${separator}key=${firebaseConfig.apiKey}`);
  if (!response.ok) {
    throw new Error(`Firestore request failed for ${path}: ${response.status} ${response.statusText}`);
  }
  return response.json() as Promise<T>;
}

async function getDocument(path: string): Promise<Record<string, unknown>> {
  const document = await firestoreFetch<FirestoreDocument>(path);
  return decodeFields(document.fields ?? {});
}

async function getCollection(path: string): Promise<RawDocument[]> {
  const response = await firestoreFetch<{ documents?: FirestoreDocument[] }>(`${path}?pageSize=100`);
  return (response.documents ?? []).map((document) => ({
    id: document.name.split("/").at(-1) ?? "unknown",
    data: decodeFields(document.fields ?? {}),
  }));
}

export async function readPortfolioFromFirestore(): Promise<PortfolioData> {
  const [bio, contacts, roles, works, educations, skills] = await Promise.all([
    getDocument("bio/data"),
    getDocument("contacts/data"),
    getCollection("roles"),
    getCollection("works"),
    getCollection("educations"),
    getCollection("skills"),
  ]);

  return normalizePortfolioData({ bio, contacts, roles, works, educations, skills });
}

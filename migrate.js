import { initializeApp, cert } from "firebase-admin/app";
import { getFirestore } from "firebase-admin/firestore";
import fs from "fs";

// NOTE: You need to download serviceAccount.json from Firebase Console
// Project Settings -> Service Accounts -> Generate new private key
// and save it in this directory as 'serviceAccount.json'

// Check if credentials exist
if (!fs.existsSync("./serviceAccount.json")) {
    console.error("Error: serviceAccount.json not found. Please download it from Firebase Console.");
    process.exit(1);
}

initializeApp({
    credential: cert("./serviceAccount.json"),
});

const db = getFirestore();

// NOTE: Copy your export file to this directory
const exportFilePath = "./dwiheruwaspodo-export.json";

if (!fs.existsSync(exportFilePath)) {
    console.error(`Error: Export file ${exportFilePath} not found.`);
    process.exit(1);
}

// Load JSON
const raw = fs.readFileSync(exportFilePath);
const data = JSON.parse(raw);

async function migrate() {
    console.log("Starting migration...");
    for (const [key, value] of Object.entries(data)) {
        if (Array.isArray(value)) {
            // Array -> many docs in collection
            for (const item of value) {
                // If items don't have IDs, Firestore will generate them
                await db.collection(key).add(item);
            }
            console.log(`Imported ${value.length} docs to ${key}`);
        } else if (typeof value === "object" && value !== null) {
            // Check if it's a map of documents (common in Realtime DB exports)
            // Realtime DB export format is often: { "projects": { "id1": {..}, "id2": {..} } }
            // Firestore structure: Collection "projects" -> Docs "id1", "id2"

            const isCollectionLike = Object.keys(value).every(k => typeof value[k] === 'object');

            if (isCollectionLike) {
                console.log(`Detecting ${key} as a collection with explicit document IDs...`);
                for (const [docId, docData] of Object.entries(value)) {
                    await db.collection(key).doc(docId).set(docData);
                }
                console.log(`Imported ${Object.keys(value).length} docs to ${key}`);
            } else {
                // Object -> single document
                await db.collection(key).doc("data").set(value);
                console.log(`Imported object into collection ${key}/data`);
            }
        } else {
            console.log(`Skipping key ${key}, unsupported type: ${typeof value}`);
        }
    }
}

migrate().then(() => {
    console.log("Done");
    process.exit(0);
}).catch(e => {
    console.error(e);
    process.exit(1);
});

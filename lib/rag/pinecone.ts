import { Pinecone } from "@pinecone-database/pinecone";

const apiKey = process.env.PINECONE_API_KEY;

if (!apiKey) {
  throw new Error("PINECONE_API_KEY is not defined in environment variables");
}

export const pinecone = new Pinecone({
  apiKey,
});

export const getPineconeIndex = () => {
  const indexName = process.env.PINECONE_INDEX_NAME || "umkm-law-index";
  return pinecone.index(indexName);
};

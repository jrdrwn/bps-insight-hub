import { createFileRoute } from "@tanstack/react-router";
import { RagDocumentCollection } from "./_shell.rag-documents.collection";

export const Route = createFileRoute("/_shell/rag-document-collection")({
  component: RagDocumentCollection,
});

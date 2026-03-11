/**
 * Confluence page event trigger handler.
 * Fires on page created, updated, or removed events.
 */
export async function handler(event, context) {
  console.log(`[riffle] Page event received: ${JSON.stringify(event)}`);
  // TODO: Phase B implementation – queue sync to GitHub
}

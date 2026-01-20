runAttachmentsCount();

async function runAttachmentsCount() {
    try { await customI18n?.fetchContext?.("readerPage"); } catch (_) {}

    const endpoint = map?.attachmentsApiEndpoint;
    if (!endpoint) return;

    const FTAPI = new fluidtopics.FluidTopicsApi();
    const data = await FTAPI.get(endpoint);

    const count = Array.isArray(data) ? data.length : Object.keys(data || {}).length;
    const el = await waitForSelector(".nbr-attachements-text", 60000);
    if (el) el.textContent = String(count);
}

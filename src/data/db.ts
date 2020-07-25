export async function syncIds(db: PouchDB.Database, ids: unknown[]) {
  const existing = await db.find({ selector: {}, fields: ["_id"] });

  const oldIds = new Set(existing.docs.map((r) => r._id));
  const newIds = new Set(ids);

  const idsToDelete = [...oldIds].filter((i) => !newIds.has(i));

  if (!idsToDelete.length) {
    return [];
  }

  const itemsToDelete = await db.bulkGet({ docs: idsToDelete.map((i) => ({ id: i })) });

  await db.bulkDocs(itemsToDelete.results.map((r) => ({ _id: r.id, _deleted: true })));

  return idsToDelete;
}

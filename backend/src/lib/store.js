import { promises as fs } from "fs";
import path from "path";
import crypto from "crypto";

const dataDir = path.resolve(process.cwd(), "data");
const dataFile = path.join(dataDir, "items.json");

const ensureStore = async () => {
  await fs.mkdir(dataDir, { recursive: true });
  try {
    await fs.access(dataFile);
  } catch {
    await fs.writeFile(dataFile, JSON.stringify({ items: [] }, null, 2));
  }
};

const readStore = async () => {
  await ensureStore();
  const raw = await fs.readFile(dataFile, "utf-8");
  return JSON.parse(raw);
};

const writeStore = async (store) => {
  await fs.writeFile(dataFile, JSON.stringify(store, null, 2));
};

export const listItems = async ({ status, query } = {}) => {
  const store = await readStore();
  let items = store.items;
  if (status) {
    items = items.filter((item) => item.status === status);
  }
  if (query) {
    const normalized = query.toLowerCase();
    items = items.filter(
      (item) =>
        item.name.toLowerCase().includes(normalized) ||
        item.description.toLowerCase().includes(normalized),
    );
  }
  return items;
};

export const getItemById = async (id) => {
  const store = await readStore();
  return store.items.find((item) => item.id === id) ?? null;
};

export const createItem = async ({ name, description, status }) => {
  const store = await readStore();
  const now = new Date().toISOString();
  const item = {
    id: crypto.randomUUID(),
    name,
    description: description ?? "",
    status: status ?? "pending",
    createdAt: now,
    updatedAt: now,
  };
  store.items.push(item);
  await writeStore(store);
  return item;
};

export const updateItem = async (id, { name, description, status }) => {
  const store = await readStore();
  const index = store.items.findIndex((item) => item.id === id);
  if (index === -1) {
    return null;
  }
  const now = new Date().toISOString();
  const existing = store.items[index];
  const updated = {
    ...existing,
    name: name ?? existing.name,
    description: description ?? existing.description,
    status: status ?? existing.status,
    updatedAt: now,
  };
  store.items[index] = updated;
  await writeStore(store);
  return updated;
};

export const deleteItem = async (id) => {
  const store = await readStore();
  const nextItems = store.items.filter((item) => item.id !== id);
  if (nextItems.length === store.items.length) {
    return false;
  }
  store.items = nextItems;
  await writeStore(store);
  return true;
};

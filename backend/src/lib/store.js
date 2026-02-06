import fs from "fs";
import path from "path";
import crypto from "crypto";

const dataDir = path.resolve(process.cwd(), "data");
const dataFile = path.join(dataDir, "items.json");

const ensureStore = () => {
  if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true });
  }
  if (!fs.existsSync(dataFile)) {
    fs.writeFileSync(dataFile, JSON.stringify({ items: [] }, null, 2));
  }
};

const readStore = () => {
  ensureStore();
  const raw = fs.readFileSync(dataFile, "utf-8");
  return JSON.parse(raw);
};

const writeStore = (store) => {
  fs.writeFileSync(dataFile, JSON.stringify(store, null, 2));
};

export const listItems = () => {
  const store = readStore();
  return store.items;
};

export const getItemById = (id) => {
  const store = readStore();
  return store.items.find((item) => item.id === id) ?? null;
};

export const createItem = ({ name, description, status }) => {
  const store = readStore();
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
  writeStore(store);
  return item;
};

export const updateItem = (id, { name, description, status }) => {
  const store = readStore();
  const index = store.items.findIndex((item) => item.id === id);
  if (index === -1) {
    return null;
  }
  const now = new Date().toISOString();
  const updated = {
    ...store.items[index],
    name,
    description: description ?? store.items[index].description,
    status: status ?? store.items[index].status,
    updatedAt: now,
  };
  store.items[index] = updated;
  writeStore(store);
  return updated;
};

export const deleteItem = (id) => {
  const store = readStore();
  const nextItems = store.items.filter((item) => item.id !== id);
  if (nextItems.length === store.items.length) {
    return false;
  }
  store.items = nextItems;
  writeStore(store);
  return true;
};

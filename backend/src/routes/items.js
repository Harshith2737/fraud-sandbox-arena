import { Router } from "express";
import { z } from "zod";
import {
  createItem,
  deleteItem,
  getItemById,
  listItems,
  updateItem,
} from "../lib/store.js";

const router = Router();

const createItemSchema = z.object({
  name: z.string().min(1, "Name is required"),
  description: z.string().max(500).optional(),
  status: z.enum(["pending", "active", "archived"]).optional(),
});

const updateItemSchema = createItemSchema
  .partial()
  .refine((value) => Object.keys(value).length > 0, {
    message: "At least one field must be provided",
  });
const listQuerySchema = z.object({
  status: z
    .enum(["pending", "active", "archived"])
    .optional()
    .or(z.literal("").transform(() => undefined)),
  q: z
    .string()
    .max(200)
    .optional()
    .or(z.literal("").transform(() => undefined)),
});

router.get("/items", async (req, res, next) => {
  try {
    const parsed = listQuerySchema.parse({
      status: typeof req.query.status === "string" ? req.query.status : undefined,
      q: typeof req.query.q === "string" ? req.query.q : undefined,
    });
    const items = await listItems({ status: parsed.status, query: parsed.q });
    res.json({ items });
  } catch (error) {
    next(error);
  }
});

router.get("/items/:id", async (req, res, next) => {
  try {
    const item = await getItemById(req.params.id);
    if (!item) {
      res.status(404).json({ message: "Item not found" });
      return;
    }
    res.json({ item });
  } catch (error) {
    next(error);
  }
});

router.post("/items", async (req, res, next) => {
  try {
    const data = createItemSchema.parse(req.body);
    const item = await createItem(data);
    res.status(201).json({ item });
  } catch (error) {
    next(error);
  }
});

router.put("/items/:id", async (req, res, next) => {
  try {
    const data = updateItemSchema.parse(req.body);
    const item = await updateItem(req.params.id, data);
    if (!item) {
      res.status(404).json({ message: "Item not found" });
      return;
    }
    res.json({ item });
  } catch (error) {
    next(error);
  }
});

router.delete("/items/:id", async (req, res, next) => {
  try {
    const deleted = await deleteItem(req.params.id);
    if (!deleted) {
      res.status(404).json({ message: "Item not found" });
      return;
    }
    res.status(204).send();
  } catch (error) {
    next(error);
  }
});

export const apiRouter = router;

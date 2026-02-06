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

const itemSchema = z.object({
  name: z.string().min(1, "Name is required"),
  description: z.string().max(500).optional(),
  status: z.enum(["pending", "active", "archived"]).optional(),
});

router.get("/items", (req, res, next) => {
  try {
    res.json({ items: listItems() });
  } catch (error) {
    next(error);
  }
});

router.get("/items/:id", (req, res, next) => {
  try {
    const item = getItemById(req.params.id);
    if (!item) {
      res.status(404).json({ message: "Item not found" });
      return;
    }
    res.json({ item });
  } catch (error) {
    next(error);
  }
});

router.post("/items", (req, res, next) => {
  try {
    const data = itemSchema.parse(req.body);
    const item = createItem(data);
    res.status(201).json({ item });
  } catch (error) {
    next(error);
  }
});

router.put("/items/:id", (req, res, next) => {
  try {
    const data = itemSchema.parse(req.body);
    const item = updateItem(req.params.id, data);
    if (!item) {
      res.status(404).json({ message: "Item not found" });
      return;
    }
    res.json({ item });
  } catch (error) {
    next(error);
  }
});

router.delete("/items/:id", (req, res, next) => {
  try {
    const deleted = deleteItem(req.params.id);
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

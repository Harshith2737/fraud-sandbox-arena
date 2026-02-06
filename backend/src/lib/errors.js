import { ZodError } from "zod";

export const notFoundHandler = (req, res, next) => {
  res.status(404).json({ message: "Route not found" });
};

export const errorHandler = (err, req, res, next) => {
  if (err instanceof ZodError) {
    res.status(400).json({ message: "Validation failed", issues: err.issues });
    return;
  }

  console.error(err);
  res.status(500).json({ message: "Internal server error" });
};

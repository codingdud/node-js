import { Router } from "express";

const router = Router();

router.get("/:id", (req, res) => {
  res.status(200).json({ message: "Product route is working!" });
});
router.put

export default router;

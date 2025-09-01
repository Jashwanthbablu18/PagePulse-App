// Back-end/routes/pagepulseRoutes.js
import { Router } from "express";
import { searchController, getBookController, insightsController } from "../controllers/PagepulseController.js";

const router = Router();

router.get("/search", searchController);
router.get("/books/:workId", getBookController);
router.post("/insights", insightsController);

export default router;

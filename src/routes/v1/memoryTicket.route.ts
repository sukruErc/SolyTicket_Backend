import express from "express";
import memoryTicketController from "../../controllers/memoryTicket.controller";

const router = express.Router();

router
  .route("/generate-memory-ticket")
  .post(memoryTicketController.generateMemoryTicket);

export default router;

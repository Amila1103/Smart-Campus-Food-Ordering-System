import express from "express";
import ContactUsControllers from "../Controlers/ContactUsControlers.js";

const router = express.Router();

router.get("/", ContactUsControllers.getAllMessages);
router.get("/:id", ContactUsControllers.getMessageById);
router.post("/", ContactUsControllers.createMessage);
router.put("/:id/status", ContactUsControllers.updateMessageStatus);
router.delete("/:id", ContactUsControllers.deleteMessage);

export default router;
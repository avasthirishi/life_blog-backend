// routes/contactRoutes.js
import express from "express";
import ContactMessage from "../models/ContactMessage.js";

const router = express.Router();

router.post("/", async (req, res) => {
  try {
    const { name, email, message } = req.body;
    const newMessage = new ContactMessage({ name, email, message });
    await newMessage.save();
    res.status(201).json({ success: true, message: "Message received!" });
  } catch (err) {
    console.error("Contact form error:", err);
    res.status(500).json({ success: false, error: "Server error" });
  }
});

export default router;

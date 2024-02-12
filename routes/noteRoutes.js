const express = require("express");
const router = express.Router();
const notesController = require("./../controllers/notesController");

router.get("/", notesController.getAllNotes);
router.post("/", notesController.createNewNote);
router.patch("/", notesController.updateNote);
router.delete("/", notesController.deleteNote);

module.exports = router;

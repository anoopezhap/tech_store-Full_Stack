const User = require("./../models/User");
const Note = require("./../models/Note");

const asyncHandler = require("express-async-handler");

//@desc Get all notes
//@route GET /notes
//@access Private

const getAllNotes = asyncHandler(async (req, res) => {
  //get all notes from mongoDB
  const notes = await Note.find().lean();

  //if no notes
  if (!notes?.length) {
    return res.status(400).json({ message: "no notes found" });
  }

  //adding users to each note before sending the response
  const notesWithUser = await Promise.all(
    notes.map(async (note) => {
      const user = await User.findById(note.user).lean().exec();
      return { ...note, username: user.username };
    })
  );

  res.json(notesWithUser);
});

//@desc create new note
//@route POSt /notes
//@access Private

const createNewNote = asyncHandler(async (req, res) => {
  //console.log("body inside controller", req.body);
  const { title, text, user } = req.body;

  //confirm data
  if (!user || !title || !text) {
    return res.status(400).json({ message: "All fields are mandatory" });
  }

  //check for duplicate title
  const duplicate = await Note.findOne({ title }).lean().exec();

  if (duplicate) {
    return res.status(400).json({ message: "Duplicate note title" });
  }

  //create and store the new note
  const note = await Note.create({ user, title, text });

  if (note) {
    return res.status(201).json({ message: "New note created" });
  } else {
    return res.status(400).json({ message: "Invalid note data received" });
  }
});

//@desc Update a note
//@route /PATCH /notes
//@acess Private

const updateNote = asyncHandler(async (req, res) => {
  const { id, user, title, text, completed } = req.body;

  // console.log("inside controller");
  // console.log("inside controller", req.body);

  //confirm data
  if (!id || !user || !title || !text || typeof completed !== "boolean") {
    return res.status(400).json({ message: "All fields are required" });
  }

  //confirm the note exists to update
  const note = await Note.findById(id).exec();

  if (!note) {
    return res.status(400).json({ message: "Note not found" });
  }

  //check for duplicate title
  const duplicate = await Note.findOne({ title }).lean().exec();

  //only allow renaming if the duplicate the editing nate are the same
  if (duplicate && duplicate?._id.toString() !== id) {
    return res.status(409).json({ message: "Duplicate note title" });
  }

  note.user = user;
  note.title = title;
  note.text = text;
  note.completed = completed;

  const updatedNote = await note.save();

  res.json(`${updatedNote.title} updated`);
});

//@desc delete a note
//@route DELETE /notes
//@acess Private

const deleteNote = asyncHandler(async (req, res) => {
  const { id } = req.body;

  //confirm data
  if (!id) {
    return res.status(400).json({ message: "Note id is required" });
  }

  //confirm the note exisst to delete
  const note = await Note.findById(id).exec();
  if (!note) {
    return res.status(400).json({ message: "Note not found" });
  }

  const result = await note.deleteOne();

  //console.log(result);

  const reply = `Note ${result.title} with ID ${result._id} is deleted`;

  res.json(reply);
});

module.exports = { getAllNotes, createNewNote, updateNote, deleteNote };

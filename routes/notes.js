const express = require("express");
const router = express.Router();
const authenticate = require("../middlewares/authenticate");
const Note = require("../models/Note");
const { body, validationResult } = require("express-validator");

//fetch all notes(login required)
router.get("/fetchallnotes", authenticate, async (req, res) => {
  try {
    const notes = await Note.find({ user: req.user.id });
    res.json(notes);
  } catch (error) {
    console.error(error.message);
    res.status(500).send("Some error occured.");
  }
});

//add a new note(login required)
router.post(
  "/addnote",
  authenticate,
  [
    body("title", "Enter a valid title").isLength({ min: 3 }),
    body("description", "desc must be atleast 5 characters").isLength({
      min: 5,
    }),
  ],
  async (req, res) => {
    const result = validationResult(req);
    const { title, description, tag } = req.body;
    if (result.isEmpty()) {
      try {
        const note = new Note({
          title,
          description,
          tag,
          user: req.user.id,
        });
        const savedNote = await note.save();
        res.json(savedNote);
      } catch (error) {
        console.error(error.message);
        res.status(500).send("Some error occured.");
      }
    } else {
      res.send({ errors: result.array() });
    }
  }
);

//edit note(login required)
router.put(
    "/updatenote/:id",
    authenticate,
    [
      body("title", "Enter a valid title").isLength({ min: 3 }),
      body("description", "desc must be atleast 5 characters").isLength({
        min: 5,
      }),
    ],
    async (req, res) => {
      const result = validationResult(req);
      const { title, description, tag } = req.body;
      if (result.isEmpty()) {
        try {
            //create a new note
          const newNote = {};
          if(title){ newNote.title = title};
          if(description){ newNote.description = description};
          if(tag){ newNote.tag = tag};
            //find the note to be updated and update it
            const note = await Note.findById(req.params.id);
            if(!note){ return res.status(404).send("Not Found")};

            if(note.user.toString() !== req.user.id){
                return res.status(401).send("Not Allowed")};
            

            const note2 = await Note.findByIdAndUpdate(req.params.id, {$set: newNote},{new: true})
            res.json(note2);
        }
          
        catch (error) {
          console.error(error.message);
          res.status(500).send("Some error occured.");
        }
      } else {
        res.send({ errors: result.array() });
      }
    }
  );


//delete note(login required)
router.delete(
    "/deletenote/:id",
    authenticate,
    async (req, res) => {
        try {
            //find the note to be deleted
            const note = await Note.findById(req.params.id);
            if(!note){ return res.status(404).send("Not Found")};

            //allow deletion only if the user owns the note
            if(note.user.toString() !== req.user.id){
                return res.status(401).send("Not Allowed")};
            
            const note2 = await Note.findByIdAndDelete(req.params.id);
            res.json({"Success":"Note has been deleted.", "note": note2});
        }
          
        catch (error) {
          console.error(error.message);
          res.status(500).send("Some error occured.");
        }
      
    }
  );
  

module.exports = router;

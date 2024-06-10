const express = require("express");
const router = express.Router();
const user = require("../models/User");
const { body, validationResult } = require("express-validator");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const authenticate = require("../middlewares/authenticate");
const secret = "secret123";

router.post(
  "/createuser",
  [
    body("name", "Enter a valid name").isLength({ min: 3 }),
    body("email", "Enter a valid email").isEmail(),
    body("password", "Password must be atleast 5 characters").isLength({
      min: 5,
    }),
  ],
  async (req, res) => {
    const result = validationResult(req);
    if (result.isEmpty()) {
      // const user1 = user(req.body);                      //sync type
      // user1.save();
      // return

      // return user.create({                               //async using promise
      //     name: req.body.name,
      //     password: req.body.password,
      //     email: req.body.email
      // }).then(user1 => res.json(user1)).catch(err => console.log(err))

      try {
        let user1 = await user.findOne({ email: req.body.email });
        if (user1) {
          return res
            .status(400)
            .json({ error: "Sorry a user with this email already exists." });
        }

        const salt = await bcrypt.genSalt(10);
        console.log(salt);
        const secPass = await bcrypt.hash(req.body.password, salt);

        await user.create({
          name: req.body.name,
          password: secPass,
          email: req.body.email,
        });
        return res.status(200).json({ done: "user created successfully." });
      } catch (error) {
        console.error(error.message);
        res.status(500).send("Some error occured.");
      }
    }

    res.send({ errors: result.array() });
  }
);

//authenticate a user using: POST /api/auth/login : : login not required
router.post(
  "/login",
  [
    body("email", "Enter a valid email").isEmail(),
    body("password", "Password cannnot be blank").exists(),
  ],
  async (req, res) => {
    const result = validationResult(req);
    let success=false;
    const { email, password } = req.body;
    if (result.isEmpty()) {
      try {
        let user1 = await user.findOne({ email: req.body.email });
        if (user1) {
          const passwordCheck = await bcrypt.compare(password, user1.password);

          if (!passwordCheck) {
            success = false;
            return res.status(400).json({success, error: "Sorry incorrect credentials."});
          } else {
            const data = {
              user: {
                id: user1.id,
              },
            };
            //console.log(user1.id);
            const authToken = jwt.sign(data, secret);
            success = true;
            return res.json({ success, authToken });
          }
        } else {
          success = false;
          return res.status(500).json({success, error: "Sorry incorrect credentials."});
        }
      } catch (error) {
        console.error(error.message);
        res.status(500).send("Some error occured.");
      }
    }
    success = false;
    res.send({ success, errors: result.array() });
  }
);

//get logged in user details: login required
router.post("/getuser", authenticate, async (req, res) => {
  const userID = req.user.id;

  try {
    let user1 = await user.findById(userID).select("-password");
    //console.log(userID);
    return res.json({ user1 });
  } catch (error) {
    console.error(error.message);
    res.status(500).send("Some error occured.");
  }
});

module.exports = router;

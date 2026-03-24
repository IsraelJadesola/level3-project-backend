const bcrypt = require('bcryptjs')
const saltRounds = 10
const nodemailer = require('nodemailer')
const User = require('../models/user.models')
const jwt = require("jsonwebtoken")


const postSignup = (req, res) => {
    const { firstName, lastName, email, password } = req.body;

    const userRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;

    if (!userRegex.test(password)) {
        return res.status(400).send(
            "Password must be at least 8 characters long, contain uppercase, lowercase, a number, and a special character"
        )
    }


    User.findOne({ email })
        .then((existingUser) => {
            if (existingUser) {
                res.status(400).send('Email already exists')
                return Promise.reject('User already exists')
            }
            return bcrypt.hash(password, saltRounds);
        })

        .then((hashedPassword) => {
            if (!hashedPassword) return;

            const newUser = new User({
                firstName,
                lastName,
                email,
                password: hashedPassword
            });
            return newUser.save();
        })

        .then((savedUser) => {
            if (!savedUser) return;

            res.status(201).json({ success: true, message: "User registered successfully" })
        }).catch((err) => {
            console.log(err, "user not saved")
        })
}

const postSignin = (req, res) => {
    const { email, password } = req.body;

    User.findOne({ email })
        .then((user) => {
            if (!user) {
                res.status(400).send('invalid credentials');
                return null;
            }
            return bcrypt.compare(password, user.password).then((isMatch) => {
                if (!isMatch) {
                    res.status(400).send("incorrect details")
                    return null;
                }
                return user;
            })
        })
        .then((user) => {
            if (user) {
                const token = jwt.sign({ id: user._id, email: user.email }, process.env.JWT_SECRET, { expiresIn: "1h" })

                res.status(200).json({
                    success: true,
                    message: "User signed successfully",
                    token,
                    user: {
                        id: user._id,
                        firstName: user.firstName,
                        lastName: user.lastName,
                        email: user.email,
                    }
                });
            }
        }).catch((err) => {
            console.error("Database or Server Error:", err)
            if (!res.headersSent) {
                res.status(500).send("Internal server error")
            }
        })
}

const verifyToken = (req, res, next) => {
    const token = req.headers['authorization'];

    if (!token) return res.status(403).send('A token is required');

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = decoded
    } catch (err) {
        return res.status(401).send("invalid or Expired Token");
    }
    return next();
}

const getDashboard = (req, res) => {
    User.find().
        then((users) => {
            res.json(users);
        }).catch((error) => {
            res.status(500).json({ message: error.message });
        });
}



module.exports = {
    postSignup,
    postSignin,
    verifyToken,
    getDashboard
}
const bcrypt = require('bcryptjs')
const saltRounds = 10
const Admin = require('../models/admin.model')
const jwt = require("jsonwebtoken")

const postAdminSignup = (req, res) => {
    const { firstName, lastName, email, password } = req.body;

    const adminRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;

    if (!adminRegex.test(password)) {
        return res.status(400).json({
            message: "Password must be at least 8 characters long, contain uppercase, lowercase, a number, and a special character"
        });
    }

    Admin.findOne({ email })
        .then((existingAdmin) => {
            if (existingAdmin) {
                res.status(400).json({ message: 'Email already exists' })
                return Promise.reject('Admin already exists')
            }
            return bcrypt.hash(password, saltRounds);
        })

        .then((hashedPassword) => {
            if (!hashedPassword) return;

            const newAdmin = new Admin({
                firstName,
                lastName,
                email,
                password: hashedPassword,
                role: "admin"
            });
            return newAdmin.save();
        })

        .then((savedAdmin) => {
            if (!savedAdmin) return;
            console.log('Admin registered successfully');

            res.status(201).json({ success: true, message: "Admin successfully registered" })
        }).catch((err) => {
            console.log(err, "Admin not saved")
        })

}


const postAdminSignin = (req, res) => {
    const { email, password } = req.body;

    Admin.findOne({ email })
        .then((admin) => {
            if (!admin) {
                res.status(400).json({ message: 'invalid credentials' });
            }
            console.log(admin)
            return bcrypt.compare(password, admin.password).then((isMatch) => {
                if (!isMatch) {
                    res.status(400).json({ message: "incorrect details" })
                }
                return admin;
            })
        })
        .then((admin) => {
            if (admin) {
                const token = jwt.sign(
                    { id: admin._id, email: admin.email, role: admin.role },
                    process.env.JWT_SECRET,
                    { expiresIn: "8h" }
                );

                return res.status(200).json({
                    success: true,
                    message: "Login successful",
                    token,
                    admin: {
                        id: admin._id,
                        firstName: admin.firstName,
                        lastName: admin.lastName,
                        email: admin.email
                    }
                });
            }
        }).catch((err) => {
            console.error(err);
            if (!res.headersSent) {
                res.status(500).json({ message: "Server error" });
            }
        });
}

const verifyAdminToken = (req, res, next) => {
    const token = req.headers['authorization'] || req.headers['Authorization']
    if (!token) return res.status(403).json({ message: 'A token is required' })
    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET)
        req.admin = decoded
        return next()
    } catch (err) {
        return res.status(401).json({ message: 'Invalid or expired token' })
    }
}

module.exports = {
    postAdminSignup,
    postAdminSignin,
    verifyAdminToken
}
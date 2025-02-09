import { createUser, getUserByEmail } from "../services/userService.js";
import bcrypt from 'bcrypt';
import { createToken } from "../utils/authUtils.js";

export const register = async (req,res) => {
    const { name, email, password } = req.body;
    try {
        const hashedPassword = await bcrypt.hash(password, 10);
        const user = await createUser(name, email, hashedPassword);
        const token = createToken(user);
        res.status(201).json({token});
    } catch (error) {
        console.log("ERROR in register: ", error);
        res.status(500).json({message: 'Failed to create user'});
    }
};

export const login = async (req,res) => {
    const { email, password } = req.body;
    try {
        const user = await getUserByEmail(email);
        if (!user) {
            return res.status(401).json({message: 'Invalid credentials'});
        }
        const isPasswordValid = await bcrypt.compare(password, user.password);
        if (!isPasswordValid) {
            return res.status(401).json({message: 'Invalid credentials'});
        }
        const token = createToken(user);
        res.status(200).json({token});
    } catch (error) {
        console.log("ERROR in login: ", error);
        res.status(500).json({message: 'Failed to login'});
    }
};

export const deleteProfile = async (req, res) => {
    // Function implementation
};
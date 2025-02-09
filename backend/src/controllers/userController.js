import { createUser, getUserByEmail } from "../services/userService.js";
import bcrypt from 'bcrypt';
import { createToken } from "../utils/authUtils.js";
import { registerSchema, loginSchema } from "../utils/validationUtils.js";
import { ZodError } from "zod";


export const register = async (req,res) => {
    

    try {
    const validatedData = registerSchema.parse(req.body);
        const hashedPassword = await bcrypt.hash(validatedData.password, 10);
        const user = await createUser(validatedData.name, validatedData.email, hashedPassword, validatedData.role);
        const token = createToken(user);
        res.status(201).json({token});

    } catch (error) {
        if (error instanceof ZodError) {
            return res.status(400).json({ errors: error.errors });
        }
        console.log("ERROR in register: ", error);
        res.status(500).json({message: 'Failed to create user'});
    }
};

export const login = async (req,res) => {
    
    try {
        const validatedData = loginSchema.parse(req.body);
        console.log("validatedData: ", validatedData);
        const user = await getUserByEmail(validatedData.email);
        if (!user) {
            return res.status(401).json({message: 'Invalid credentials'});
        }
        const isPasswordValid = await bcrypt.compare(validatedData.password, user.password);
        if (!isPasswordValid) {
            return res.status(401).json({message: 'Invalid credentials'});
        }
        const token = createToken(user);
        res.status(200).json({token});
    } catch (error) {
        if (error instanceof ZodError) {
            return res.status(400).json({ errors: error.errors });
        }
        console.log("ERROR in login: ", error);
        res.status(500).json({message: 'Failed to login'});
    }
};

const deleteProfile = async (req, res) => {
    // Function implementation
};
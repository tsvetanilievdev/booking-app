import { createUser, getUserByEmail, updateUser } from "../services/userService.js";
import bcrypt from 'bcrypt';
import { createToken } from "../utils/authUtils.js";
import { registerSchema, loginSchema, updateProfileSchema } from "../utils/validationUtils.js";
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
            return res.status(401).json({ errors: error.errors });
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
            return res.status(401).json({ errors: error.errors });
        }
        console.log("ERROR in login: ", error);
        res.status(500).json({message: 'Failed to login'});
    }
};

export const getUser = async (req, res) => {
    try {
        const user = req.user;
        res.status(200).json(user);
    } catch (error) {
        console.log("ERROR in getUser: ", error);
        res.status(500).json({message: 'Failed to get profile'});
    }
};

export const updateUser = async (req, res) => {
    try {
        const user = req.user;
        
        // Валидираме само изпратените полета
        const validatedData = updateProfileSchema.parse(req.body);

        // Премахваме празните полета
        const filteredData = Object.fromEntries(
            Object.entries(validatedData)
                .filter(([_, value]) => value !== undefined && value !== '')
        );

        // Ако няма полета за обновяване
        if (Object.keys(filteredData).length === 0) {
            return res.status(400).json({ 
                message: 'No valid fields provided for update' 
            });
        }

        // Обновяваме само предоставените полета
        const updatedUser = await updateUser(user.id, filteredData);

        // Връщаме обновения потребител без чувствителна информация
        const { password, ...userWithoutPassword } = updatedUser;
        res.status(200).json(userWithoutPassword);

    } catch (error) {
        console.error("Error in updateProfile:", error);
        
        if (error.errors) { // Zod validation errors
            return res.status(400).json({ 
                message: 'Validation error', 
                errors: error.errors 
            });
        }

        res.status(500).json({ message: 'Failed to update profile' });
    }
};
export const deleteUser = async (req, res) => {
    try {
        const user = req.user;
        const deletedUser =await deleteUser(user.id);
        res.status(200).json({ message: `User with email ${deletedUser.email} deleted successfully` });
    } catch (error) {
        console.log("ERROR in deleteUser: ", error);
        res.status(500).json({ message: 'Failed to delete user' });
    }

};
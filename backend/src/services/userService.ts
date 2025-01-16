import { Role } from "@prisma/client";
import prisma from "../db";

export const createUser = async (name: string, email: string, password: string, role: Role = 'USER') => {
    try {
        const user = await prisma.user.create({
            data: {
                name,
                email,
                password,
                role
            }
        });
        return user;
    } catch (error) {
        console.log("ERROR in createUser: ", error);
        throw new Error('Something went wrong');
    }
};
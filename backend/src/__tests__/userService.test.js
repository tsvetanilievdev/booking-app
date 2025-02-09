import { register, login } from "../controllers/userController.js";
import { createUser, getUserByEmail } from "../services/userService.js";
import bcrypt from 'bcrypt';
import { createToken } from "../utils/authUtils.js";

jest.mock("../services/userService.js");
jest.mock("../utils/authUtils.js");
jest.mock("bcrypt");

describe("User Service Tests", () => {
    let req, res;

    beforeEach(() => {
        req = { body: {} };
        res = { status: jest.fn().mockReturnThis(), json: jest.fn() };
        jest.clearAllMocks();
    });

    describe("Register Function", () => {
        it("should create a user and return a token", async () => {
            req.body = { name: "John Doe", email: "john@example.com", password: "password123" };
            
            bcrypt.hash.mockResolvedValue("hashed_password");
            createUser.mockResolvedValue({ id: 1, name: "John Doe", email: "john@example.com", password: "hashed_password" });
            createToken.mockReturnValue("fake_token");

            await register(req, res);

            expect(bcrypt.hash).toHaveBeenCalledWith("password123", 10);
            expect(createUser).toHaveBeenCalledWith("John Doe", "john@example.com", "hashed_password");
            expect(createToken).toHaveBeenCalled();
            expect(res.status).toHaveBeenCalledWith(201);
            expect(res.json).toHaveBeenCalledWith({ token: "fake_token" });
        });

        it("should handle errors when user creation fails", async () => {
            req.body = { name: "John Doe", email: "john@example.com", password: "password123" };

            bcrypt.hash.mockResolvedValue("hashed_password");
            createUser.mockRejectedValue(new Error("Database error"));

            await register(req, res);

            expect(res.status).toHaveBeenCalledWith(500);
            expect(res.json).toHaveBeenCalledWith({ message: "Failed to create user" });
        });

        it('should throw an error when the email format is invalid', async () => {
            createUser.mockRejectedValue(new Error("Invalid email format"));
            const invalidUser = {
                name: 'Invalid User',
                email: 'invalid-email', // Invalid email format
                password: 'password123',
                role: 'USER'
            };

            await expect(createUser(
                invalidUser.name,
                invalidUser.email,
                invalidUser.password,
                invalidUser.role
            )).rejects.toThrow('Invalid email format');
        });
    });

    describe("Login Function", () => {
        it("should return a token for valid credentials", async () => {
            req.body = { email: "john@example.com", password: "password123" };

            getUserByEmail.mockResolvedValue({ id: 1, email: "john@example.com", password: "hashed_password" });
            bcrypt.compare.mockResolvedValue(true);
            createToken.mockReturnValue("fake_token");

            await login(req, res);

            expect(getUserByEmail).toHaveBeenCalledWith("john@example.com");
            expect(bcrypt.compare).toHaveBeenCalledWith("password123", "hashed_password");
            expect(createToken).toHaveBeenCalled();
            expect(res.status).toHaveBeenCalledWith(200);
            expect(res.json).toHaveBeenCalledWith({ token: "fake_token" });
        });

        it("should return 401 for invalid email", async () => {
            req.body = { email: "invalid@example.com", password: "password123" };
            
            getUserByEmail.mockResolvedValue(null);

            await login(req, res);

            expect(res.status).toHaveBeenCalledWith(401);
            expect(res.json).toHaveBeenCalledWith({ message: "Invalid credentials" });
        });

        it("should return 401 for invalid password", async () => {
            req.body = { email: "john@example.com", password: "wrongpassword" };

            getUserByEmail.mockResolvedValue({ id: 1, email: "john@example.com", password: "hashed_password" });
            bcrypt.compare.mockResolvedValue(false);

            await login(req, res);

            expect(res.status).toHaveBeenCalledWith(401);
            expect(res.json).toHaveBeenCalledWith({ message: "Invalid credentials" });
        });

        it("should handle errors when login fails", async () => {
            req.body = { email: "john@example.com", password: "password123" };

            getUserByEmail.mockRejectedValue(new Error("Database error"));

            await login(req, res);

            expect(res.status).toHaveBeenCalledWith(500);
            expect(res.json).toHaveBeenCalledWith({ message: "Failed to login" });
        });
    });
});

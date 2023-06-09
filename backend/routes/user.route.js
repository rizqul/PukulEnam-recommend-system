import express from "express";
import {
  addUser,
  deleteUser,
  getUsers,
  updateUser,
} from "../controllers/user.controller.js";

const userRouter = express.Router();

userRouter.post("/users", addUser);
userRouter.get("/users", getUsers);
userRouter.patch("/users/:id", updateUser);
userRouter.delete("/users/:id", deleteUser);

export default userRouter;

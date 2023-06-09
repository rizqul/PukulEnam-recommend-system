import express from "express";
import cors from "cors";
import userRouter from "./routes/user.route.js";
import requestRouter from "./routes/request.route.js";

const app = express();

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(userRouter);
app.use(requestRouter);

app.listen(5000, () => console.log(`server is running on port 5000`));

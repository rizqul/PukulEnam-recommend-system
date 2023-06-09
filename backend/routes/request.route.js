import express from "express";

import {
  addRequest,
  getRequest,
  getRequests,
  updateRequest,
} from "../controllers/request.controller.js";

const requestRouter = express.Router();

requestRouter.get("/news", getRequests);
requestRouter.get("/news/:id", getRequest);
requestRouter.post("/news", addRequest);
requestRouter.patch("/news/:id", updateRequest);

export default requestRouter;

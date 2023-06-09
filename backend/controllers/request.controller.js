// import { Timestamp } from "firebase-admin/firestore";
import { db } from "../config/firebase.config.js";

const request = db.collection("requests");

export const addRequest = async (req, res) => {
  try {
    const { title, role, scope, day } = req.body;
    const createdAt = new Date();
    const updatedAt = createdAt;

    const requestData = {
      title: title,
      role: role,
      scope: scope,
      day: day,
      createdAt: createdAt,
      updatedAt: updatedAt,
    };

    const response = await request.add(requestData);
    console.log(response);
    res.status(200).send(response);
  } catch (error) {
    console.log(error);
  }
};

export const updateRequest = async (req, res) => {
  try {
    const {
      title,
      type,
      status,
      writerRanking,
      genre,
      requestedBy,
      createdAt,
    } = req.body;
    const updatedAt = new Date();

    const updatedRequestData = {
      title: title,
      type: type,
      status: status,
      writerRanking: writerRanking,
      genre: genre,
      requestedBy: requestedBy,
      createdAt: createdAt,
      updatedAt: updatedAt,
    };

    const response = await request.doc(req.params.id).set(updatedRequestData);
    res.status(200).send(response);
  } catch (error) {
    console.log(error);
  }
};

export const getRequest = async (req, res) => {
  try {
    const snapshot = request.doc(req.params.id);
    const requests = await snapshot.get();

    if (!requests.exists) {
      res.status(404).send({ message: "document not found" });
    } else {
      res.status(200).send(requests.data());
    }
  } catch (error) {
    console.log(error);
  }
};

export const getRequests = async (req, res) => {
  try {
    const snapshot = await request.get();
    const requests = [];
    snapshot.forEach((doc) => {
      requests.push({ id: doc.id, ...doc.data() });
    });

    res.status(200).send(requests);
  } catch (error) {
    console.log(error);
  }
};

export const getWriter = async (req, res) => {};

import { db } from "../config/firebase.config.js";

const user = db.collection("users");

export const addUser = async (req, res) => {
  try {
    const { email, name, password, role, phoneNumber } = req.body;

    const userData = {
      email: email,
      name: name,
      password: password,
      role: role,
      phoneNumber: phoneNumber,
    };

    const responses = await user.add(userData);
    res.status(200).send(responses);
  } catch (error) {
    console.log(error);
  }
};

export const getUsers = async (req, res) => {
  try {
    const snapshot = await user.get();

    const users = [];
    snapshot.forEach((doc) => {
      users.push({ id: doc.id, ...doc.data() });
    });

    res.send(users);
  } catch (error) {
    console.log(error);
  }
};

export const updateUser = async (req, res) => {
  try {
    const { email, name, password, role, phoneNumber } = req.body;

    const userData = {
      email: email,
      name: name,
      password: password,
      role: role,
      phoneNumber: phoneNumber,
    };

    const responses = await user.doc(req.params.id).set(userData);
    res.status(200).send(responses);
  } catch (error) {
    console.log(error);
  }
};

export const deleteUser = async (req, res) => {
  try {
    const responses = await user.doc(req.params.id).delete();
    res.status(200).send(responses);
  } catch (error) {
    console.log(error);
  }
};

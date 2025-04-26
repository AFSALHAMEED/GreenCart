import Address from "../model/Address.js";

export const addAddress = async (req, res) => {
  try {
    const { userId } = req.user;
    const { address } = req.body;
    await Address.create({ ...address, userId });
    res.json({ success: true, message: "Address added successfully" });
  } catch (error) {
    console.log("error: ", error.message);
    res.json({ success: false, message: error.message });
  }
};

export const getAddress = async (req, res) => {
  try {
    const { userId } = req.user;
    const address = await Address.find({ userId });
    res.json({ success: true, address });
  } catch (error) {
    console.log("error: ", error.message);
    res.json({ success: false, message: error.message });
  }
};

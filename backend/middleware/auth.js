import jwt from "jsonwebtoken";
const authMiddleWare = async (req, res, next) => {
  const { token } = req.headers;
  if (!token) {
    res.json({ success: false, message: "Not Authorized login again" });
  }
  try {
    const token_decode = jwt.verify(token, "random#secret");
    req.body.userId = token_decode.id;
    next();
  } catch (error) {
    console.log(error);
    res.json({ success: false, message: "Error" });
  }
};
export default authMiddleWare;

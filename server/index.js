const express = require("express");
const cors = require("cors");
const reservationRouter = require("./routes/reservation");
const userRouter = require("./routes/user");
 
const app = express();
const PORT = process.env.PORT || 3001;
 
app.use(cors({
  origin: ["https://onestop1-alpha.vercel.app", "http://localhost:5173"],
}));
app.use(express.json());
 
app.use("/api/reservations", reservationRouter);
app.use("/api/users", userRouter);
 
app.listen(PORT, () => {
  console.log(`서버 실행 중: http://localhost:${PORT}`);
});

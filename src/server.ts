import express, { NextFunction, Request, Response } from "express";
import config from "./config";
import initDB, { pool } from "./config/db";
import logger from "./middleware/logger";
import { UserRoutes } from "./modules/user/user.routes";

const app = express();
const port = config.port
//parser
app.use(express.json());


initDB(); // calling the function


app.get("/", logger,(req: Request, res: Response) => {
  res.send("Hello World!");
});

// post the users to the backend
app.use("/users",UserRoutes)


//POST todos
app.post("/todos", async (req: Request, res: Response) => {
  const { user_id, title } = req.body;
  try {
    const result = await pool.query(
      `
      INSERT INTO todos(user_id,title) VALUES($1,$2) RETURNING *
      `,
      [user_id, title]
    );
    res.status(201).json({
      success: true,
      message: "Todo created successfully",
      data: result.rows[0],
    });
  } catch (err: any) {
    res.status(500).json({
      success: false,
      message: err.message,
    });
  }
});

// get the todos
app.get("/todos", async (req: Request, res: Response) => {
  try {
    const result = await pool.query(`SELECT * FROM todos`);
    res.status(200).json({
      success: true,
      message: "todos get the data successfully",
      data: result.rows,
    });
  } catch (err: any) {
    res.status(500).json({
      success: false,
      message: err.message,
    });
  }
});

// NOT found route
app.use((req:Request,res:Response)=>{
  res.status(404).json({
    success:false,
    message:"Route not found",
    path:req.path

  })
})

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});

import express, { NextFunction, Request, Response } from "express";
import { Pool, Result } from "pg";
import config from "./config";
import initDB, { pool } from "./config/db";

const app = express();
const port = config.port
//parser
app.use(express.json());


initDB(); // calling the function


// middleware logger

const logger =(req:Request,res:Response,next:NextFunction)=>{
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.path}\n`)
  next()
}

app.get("/", logger,(req: Request, res: Response) => {
  res.send("Hello World!");
});

// post the users to the backend
app.post("/users", async (req: Request, res: Response) => {
  const { name, email } = req.body;
  try {
    const result = await pool.query(
      `INSERT INTO users(name,email) VALUES($1,$2) RETURNING *`,
      [name, email]
    );
    console.log(result);
    res.status(201).json({
      success: true,
      message: "Data inserted successfully",
      data: result.rows[0],
    });
  } catch (err: any) {
    res.status(500).json({
      success: "False",
      message: err.message,
    });
  }
});

// get all the users from the backend
app.get("/users", async (req: Request, res: Response) => {
  try {
    const result = await pool.query(`SELECT * FROM users`);
    res.status(200).json({
      success: true,
      message: "Users get the data successfully",
      data: result.rows,
    });
  } catch (err: any) {
    res.status(500).json({
      success: false,
      message: err.message,
    });
  }
});

//get individual users by there id
app.get("/users/:id", async (req: Request, res: Response) => {
  try {
    const result = await pool.query(`SELECT * FROM users WHERE id=$1`, [
      req.params.id,
    ]);

    console.log(result);
    if (result.rows.length == 0) {
      res.status(404).json({
        success: false,
        message: " User not found",
      });
    } else {
      res.status(200).json({
        success: true,
        message: "User get successfully",
        data: result.rows[0],
      });
    }
  } catch (err: any) {
    res.status(500).json({
      success: false,
      message: err.message,
    });
  }
});

// update the users data
app.put("/users/:id", async (req: Request, res: Response) => {
  const { name, email } = req.body;
  try {
    const result = await pool.query(
      `
        UPDATE users SET name=$1, email=$2 WHERE id=$3
        RETURNING *`,
      [name, email, req.params.id]
    );

    console.log(result);
    if (result.rows.length == 0) {
      res.status(404).json({
        success: false,
        message: " User not found",
      });
    } else {
      res.status(200).json({
        success: true,
        message: "User Updated  successfully",
        data: result.rows[0],
      });
    }
  } catch (err: any) {
    res.status(500).json({
      success: false,
      message: err.message,
    });
  }
});

// delete the data
app.delete("/users/:id", async (req: Request, res: Response) => {
  try {
    const result = await pool.query(`DELETE FROM users WHERE id=$1`, [
      req.params.id,
    ]);

    console.log(result);
    if (result.rowCount == 0) {
      res.status(404).json({
        success: false,
        message: " User not found",
      });
    } else {
      res.status(200).json({
        success: true,
        message: "User Deleted successfully",
        data: result.rows,
      });
    }
  } catch (err: any) {
    res.status(500).json({
      success: false,
      message: err.message,
    });
  }
});

//crud oparetion for todo

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

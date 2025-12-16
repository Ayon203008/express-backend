import express, { Request, Response } from "express";
import { Pool, Result } from "pg";
import path from "path";
import dotenv from "dotenv";
dotenv.config({ path: path.join(process.cwd(), ".env") });

const app = express();
const port = 3000;
//parser
app.use(express.json());

const pool = new Pool({
  connectionString: `${process.env.CONNECTION_STR}`,
});

const initDB = async () => {
  await pool.query(`
        CREATE TABLE IF NOT EXISTS users(
        id SERIAL PRIMARY KEY,
        name VARCHAR(100) NOT NULL,
        email VARCHAR(100) UNIQUE NOT NULL,
        age INT,
        phone VARCHAR(15),
        address TEXT,
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW()
        )`);

  await pool.query(`
        CREATE TABLE IF NOT EXISTS todos(
        id SERIAL PRIMARY KEY,
        user_id INT REFERENCES users(id) ON DELETE CASCADE,
        title VARCHAR(200) NOT NULL,
        description TEXT,
        completed BOOLEAN DEFAULT false,
        due_date DATE,
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW()
        )`);
};

initDB(); // calling the function

app.get("/", (req: Request, res: Response) => {
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
 const {name,email}=req.body
    try {
    const result = await pool.query(`
        UPDATE users SET name=$1, email=$2 WHERE id=$3
        RETURNING *`,[name,email,req.params.id]);

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



app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});

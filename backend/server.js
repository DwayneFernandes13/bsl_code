require(`dotenv`).config();
const express = require(`express`);
const mysql = require(`mysql2`);
const knex = require('knex');
const bcrypt = require(`bcrypt`);
const cors = require(`cors`);
const jwt = require(`jsonwebtoken`);

const app = express();
app.use(cors());
app.use(express.json());

// const db = mysql.createPool({
//     host: process.env.DB_HOST,
//     user: process.env.DB_USER,
//     password: process.env.DB_PASSWORD,
//     database: process.env.DB_NAME
// });

const db = knex({
    client: `mysql2`,
    connection: {
        host: process.env.DB_HOST,
        user: process.env.DB_USER,
        password: process.env.DB_PASSWORD,
        database: process.env.DB_NAME
    }
});

//registration with knex
app.post('/register', async(req,res)=>{
    const {username, email, password, role} = req.body;
    try{
        const hash = await bcrypt.hash(password, 10);
        const [userID] = await db('users').insert({
            username,
            email,
            password_hash: hash,
            role
        });
        res.status(201).json({
            message: "User Registered Successfully",
            userID
        });
    } catch (err){
        console.error(err);
        res.status(500).json({error: "Registration Failed or User Exists"});
    }
});

// Test DB Connection
db.getConnection((err, connection) => {
    if(err){
        console.error(`Database Connection at ${PORT} failed`, err.message);
    } else {
        console.log(`Connected to Database`);
        connection.release();
    }
});

app.post(`/register`, async (req,res)=>{
    const {username, email, password, role} = req.body;
// OLD Registration
    //     const hash = await bcrypt.hash(password, 10); //Hashing the password

//     db.query(
//         'INSERT INTO users (username, email, password_hash, role) VALUES(?,?,?,?)',
//         [username, email, hash, role],
//         (err)=>{
//             if(err) return res.status(500).send(err);
//         }
//     );
// });

// New Registration
try {
        const hash = await bcrypt.hash(password, 10);

        db.query(
            'INSERT INTO users (username, email, password_hash, role) VALUES (?, ?, ?, ?)',
            [username, email, hash, role],
            (err, result) => {
                if (err) {
                    console.error("Insert Error:", err.message);
                    return res.status(500).json({ error: err.message });
                }
                // MUST SEND A RESPONSE ON SUCCESS
                res.status(201).json({ message: "User registered successfully!", userId: result.insertId });
            }
        );
    } catch (error) {
        res.status(500).json({ error: "Server error during hashing" });
    }
});

// Login
app.post(`/login`, async (req,res)=>{
    const {email, password} = req.body;

    db.query(
        'SELECT * FROM users WHERE email =?', [email], async (err, results) => {
            if(err || results.length === 0) return res.status(401).send("User not found");

            const user = results[0];
            const match = await bcrypt.compare(password, user.password_hash);

            if (match){
                const token = jwt.sign({id: user.id, role: user.role}, `SECRET_KEY`, {expiresIn: `1h`});
                res.json({token, role: user.role});
            } else {
                res.status(401).send("Wrong Password");
            }
        });
});        

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server Running on Port ${PORT}`));
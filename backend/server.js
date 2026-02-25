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

db.raw("SELECT 1")
    .then(() =>console.log("MySQL Connected via knex"))
    .catch((err) =>console.error("Database Connection Failed", err.message));


// OLD Login
app.post(`/login`, async (req,res)=>{
    const {email, password} = req.body;
    try {
        const user = await db('users').where({email}).first();

        if (!user){
            return res.status(401).json({error:"User not found"});
        }
        // Comparing password with stored hash
        const match = await bcrypt.compare(password, user.password_hash);
        if (match){
            const token = jwt.sign(
                {id: user.id, role: user.role},
                process.env.JWT_SECRET || 'SECRET_KEY',
                {expiresIn:'1h'}
            );
            res.json({token, role: user.role, message: "Login Successful"});
        } else {
            res.status(401).json({error:"Wrong Password"});
        }
    } catch (err){
        console.error(err);
        res.status(500).json({error: "Internal Server Error"});
    }

});

const authorizeRole = (role) => {
    return (req,res,next) => {
//req.user comes from JWT verification 

        if (req.user.role !==role){
            return res.status(403).json({ error: "Access Denied: Unauthorized Role"});
        }
        next();
    };
};
// Dated: 07/02/2026
app.post(`/admin/create-league`, verifyToken, authorizeRole('Admin'), async (req, res) =>{});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server Running on Port ${PORT}`));
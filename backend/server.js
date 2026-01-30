const express = require(`express`);
const mysql = require(`mysql2`);
const bcrypt = require(`bcrypt`);
const cors = require(`cors`);
const jwt = require(`jsonwebtoken`);

const app = express();
app.use(cors());
app.use(express.json());

const db = mysql.createPool({
    host: `localhost`,
    user: `root`,
    password: `your_password`,
    database: `bsl_db`
});

// Registration
app.post(`/register`, async (req,res)=>{
    const {username, email, password, role} = req.body;
    const hash = await bcrypt.hash(password, 10); //Hashing the password

    db.query(
        'INSERT INTO users (username, email, password_hash, role) VALUES(?,?,?,?)',
        [username, email, hash, role],
        (err)=>{
            if(err) return res.status(500).send(err);
        }
    );
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

app.listen(5000, () => console.log('Server Running on Port 5000'));
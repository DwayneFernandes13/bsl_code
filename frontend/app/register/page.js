`use client`;

import { useState } from "react";

export default function Register(){
    const [form, setForm] = useState({username:``, email:``, password:``, role:`Fan`}); // default state

    const handleRegister = async (e) => {
        e.preventDefault();
        // There was an option for Try
        const response = await fetch(`http://localhost:5000/register`,{
            method: `POST`,
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify(form),
        });
        const data = await response.json();
        alert(data.message || "Registration Failed");

    };
    return (
        <div className="auth-container">
            <h2>Join the League</h2>
            <form onSubmit={handleRegister}>
                <input type="text" placeholder="Username" onChange={(e)=> setForm({...form, username: e.target.value})} required/>
                <input type="email" placeholder="Email" onChange={(e)=> setForm({...form, email: e.target.value})} required/>
                <input type="password" placeholder="Password" onChange={(e)=> setForm({...form, password: e.target.value})} required/>
                <select onChange={(e)=> setForm({...form, role: e.target.value})}>
                    <option value="Fan">Fan</option>
                    <option value="Player">Fan</option>
                    <option value="Manager">Fan</option>
                    <option value="Owner">Owner</option>
                    <option value="Guest">Guest</option>
                </select>
                <button type="submit">Register</button>
            </form>
        </div>
    );
};
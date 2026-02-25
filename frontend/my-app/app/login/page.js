"use client";
import {useState} from "react";

export default function Login(){
    const [credentials, setCredentials] = useState({email: '', password: ''});

    const handleLogin = async (e) => {
        e.preventDefault();
        const response = await fetch(`http://localhost:5000/login`,{
            method: `POST`,
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify(credentials),
        });
        const data = await response.json();
        if(data.token){
            localStorage.setItem(`token`, data.token); // Save ID Card
            alert("Logged in Successfully");
        }
        else{
            alert("Invalid Credentials");
        }

        if (response.ok){
            localStorage.setItem('token', data.token);

            //Redirect Based on the role
            if (data.role === 'Admin'){
                window.location.href = `/admin-dashboard`;
            }
            else if (data.role === 'Player'){
                window.location.href = `/player-profile`;
            }
            else {
                window.location.href = `/dashboard`;
            }
        }

    };

    return (
        <div className="auth-container">
            <h2>Login to BSL</h2>
            <form onSubmit={handleLogin}>
                <input type="email" placeholder="Email" onChange={(e)=> setCredentials({...credentials, email: e.target.value})} required />
                <input type="password" placeholder="Password" onChange={(e)=> setCredentials({...credentials, password: e.target.value})} required />
                <button type="submit">Login</button>
            </form>
        </div>
    );
};
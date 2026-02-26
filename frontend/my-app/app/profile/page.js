"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export default function ProfilePage() {
    const [user, setUser] = useState(null);
    const [error, setError] = useState("");
    const router = useRouter();

    useEffect (()=>{
        const fetchProfile = async () => {
            // 1. Grab the token we saved during login
            const token = localStorage.getItem("token")

            if (!token){
                setError("Not Logged In");
                router.push("/login");// Send them away if no token
                return;
            }

            try {
                // 2. Call the protected /profile route
                const response = await fetch("http://localhost:5000/profile")
            }catch(err){}
        }
    });
}
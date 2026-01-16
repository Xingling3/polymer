import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useNavigate } from "react-router-dom";

export default function Login() {
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [message, setMessage] = useState("");
    const navigate = useNavigate();
    const handleSubmit = async () => {
        try {
            const res = await fetch("http://127.0.0.1:8000/api/login", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ username, password }),
            });

            if (!res.ok) {
                const data = await res.json();
                setMessage(data.detail || "登录失败");
            } else {
                const data = await res.json();
                localStorage.setItem("token", data.access_token);
                setMessage(data.message);
                navigate("/predict");
            }
        } catch (err) {
            setMessage("网络错误");
        }
    };

    return (
        <div className="p-6 max-w-sm mx-auto">
            <h2 className="text-xl font-bold mb-4">登录</h2>
            <Input
                placeholder="用户名"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="mb-2"
            />
            <Input
                placeholder="密码"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="mb-2"
            />
            <Button onClick={handleSubmit}>登录</Button>

            {message && <p className="mt-2 text-red-500">{message}</p>}
        </div>
    );
}

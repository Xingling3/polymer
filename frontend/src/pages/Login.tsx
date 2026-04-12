import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useNavigate } from "react-router-dom";
import {
    Card,
    CardAction,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
} from "@/components/ui/card"
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
    const handleRegisterNavigate = () => {
        navigate("/register");
    };
    const handleAdminNavigate = () => {
        navigate("/admin");
    };
    return (

        <Card className="p-6 max-w-sm mx-auto mt-20">
            <CardHeader>
                <CardTitle>登录账号</CardTitle>
                <CardAction>
                    <Button
                        size="sm"
                        onClick={handleRegisterNavigate}
                    >
                        还没有账号？立即注册
                    </Button>
                </CardAction>
            </CardHeader>
            <CardContent>
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
            </CardContent>
            <CardFooter className="flex-col gap-2">
                <Button onClick={handleSubmit}>登录</Button>
                <Button
                    onClick={handleAdminNavigate}
                    variant="ghost"
                    className="w-full"
                >
                    管理员入口
                </Button>
            </CardFooter>
        </Card>
    );
}

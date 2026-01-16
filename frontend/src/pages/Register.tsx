
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useNavigate } from "react-router-dom";
export default function Register() {
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [msg, setMsg] = useState("");
    const navigate = useNavigate();

    const handleRegister = async () => {
        try {
            const res = await fetch("http://127.0.0.1:8000/api/register", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ username, password }),
            });

            const data = await res.json();

            if (!res.ok) {
                setMsg(data.detail || "注册失败");
                return;
            }

            setMsg("注册成功，可以去登录了");
            navigate("/login");
        } catch {
            setMsg("网络错误");
        }
    };

    return (
        <div className="p-6 max-w-sm mx-auto">
            <h2 className="text-xl font-bold mb-4">注册</h2>
            <Input
                placeholder="用户名"
                value={username}
                onChange={e => setUsername(e.target.value)}
                className="mb-2"
            />

            <Input
                type="password"
                placeholder="密码"
                value={password}
                onChange={e => setPassword(e.target.value)}
                className="mb-2"
            />

            <Button onClick={handleRegister}>注册</Button>

        </div>
    );
}

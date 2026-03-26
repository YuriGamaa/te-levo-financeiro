import { useEffect, useState } from "react";
import { Outlet, useNavigate } from "react-router-dom";
import Sidebar from "../components/Sidebar";

export default function MainLayout() {
    const navigate = useNavigate();
    const [user, setUser] = useState<any>(null);

    useEffect(() => {
        const storedUser = localStorage.getItem('user');
        const token = localStorage.getItem('token');

        if (!storedUser || !token) {
            navigate('/');
        } else {
            setUser(JSON.parse(storedUser));
        }
    }, [navigate]);

    function handleLogout() {
        localStorage.removeItem('user');
        localStorage.removeItem('token');
        navigate('/');
    }

    if (!user) return null;

    return (
        // MUDANÇA: de bg-gray-100 para bg-slate-50 (Melhor contraste com Azul Petróleo)
        <div className="flex min-h-screen bg-slate-50">
            {/* Barra Lateral Fixa */}
            <Sidebar user={user} onLogout={handleLogout} />

            {/* Conteúdo da Página */}
            <main className="flex-1 ml-64 p-8 transition-all duration-300">
                <Outlet />
            </main>
        </div>
    );
}
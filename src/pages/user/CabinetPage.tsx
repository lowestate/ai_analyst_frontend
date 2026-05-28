import React from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Header } from "../Header";
import { UserPage } from "./UserPage";

interface CabinetPageProps {
    currentUser: { username: string; id: number; plan_name?: string; role?: string } | null;
    setCurrentUser: React.Dispatch<React.SetStateAction<{ username: string; id: number; plan_name?: string; role?: string } | null>>;
    banModalOpen: boolean;
    handleLogout: () => Promise<void>;
}

export const CabinetPage: React.FC<CabinetPageProps> = ({
    currentUser,
    setCurrentUser,
    banModalOpen,
    handleLogout,
}) => {
    const location = useLocation();
    const navigate = useNavigate();

    const state = location.state as {
        activeChatId?: string | null;
    } | null;
    const activeChatId = state?.activeChatId || null;

    const handleLocalLogout = async () => {
        await handleLogout();
        navigate("/");
    };

    // If there is no logged in user, redirect to home page
    React.useEffect(() => {
        if (!currentUser) {
            navigate("/");
        }
    }, [currentUser, navigate]);

    if (!currentUser) {
        return null;
    }

    return (
        <div style={{ display: "flex", flexDirection: "column", height: "100vh", width: "100vw", overflow: "hidden" }}>
            <Header
                currentUser={currentUser}
                onOpenAuth={() => {}}
                onLogout={handleLocalLogout}
                onOpenProfile={() => {}}
                isCabinetMode={true}
                activeChatId={activeChatId}
            />
            <div style={{ flex: 1, overflowY: "hidden", backgroundColor: "var(--bg-color)", display: "flex", flexDirection: "column", minHeight: 0 }}>
                <UserPage
                    currentUser={currentUser}
                    onBack={() => navigate("/analyze", { state: { activeChatId } })}
                    onPlanChange={(newPlan) =>
                        setCurrentUser((prev) =>
                            prev ? { ...prev, plan_name: newPlan } : null
                        )
                    }
                    isBanned={banModalOpen}
                />
            </div>
        </div>
    );
};

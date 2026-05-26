import React, { useEffect, useState } from 'react';

// Если COLORS лежат в другом файле, импортируй их:
// import { COLORS } from './styles'; 

interface UserPageProps {
    currentUser: { username: string; id: number; plan_name?: string };
    onBack: () => void;
    onPlanChange?: (newPlan: string) => void;
    isBanned?: boolean;
}

const PLANS_DATA = [
    {
        id: 'free',
        name: 'Free',
        price: 'Бесплатно',
        desc: 'Базовый доступ к анализу данных с помощью команд. Работа только с файлами',
        tierClass: 'tier-free'
    },
    {
        id: 'pro',
        name: 'Pro',
        price: '99 руб. / месяц',
        desc: 'Продвинутая аналитика с помощью AI. Расширяет возможности анализа и добавляет интерпретируемость результатов',
        tierClass: 'tier-pro',
        badge: 'Популярный',
        badgeColor: '#3399FF' // COLORS.accent
    },
    {
        id: 'ultra',
        name: 'Ultra',
        price: '199 руб. / месяц',
        desc: 'Максимальный доступ к анализу, добавляющий возможность работать с БД PostgreSQL. Агент сам пишет запросы, Вы их подтверждаете',
        tierClass: 'tier-ultra',
        badge: 'Максимум',
        badgeColor: '#000000' // Золотой
    }
];

export const UserPage: React.FC<UserPageProps> = ({ currentUser, onBack, onPlanChange, isBanned }) => {
    const [currentPlan, setCurrentPlan] = useState<string | null>('free'); // По умолчанию free
    const [isLoading, setIsLoading] = useState(true);
    const [localBanned, setLocalBanned] = useState(isBanned || false);

    useEffect(() => {
        // Запрашиваем текущую инфу о юзере (чтобы получить актуальный план)
        const fetchUserData = async () => {
            try {
                const res = await fetch(`http://localhost:8001/users/${currentUser.id}`);
                if (res.ok) {
                    const data = await res.json();
                    if (data.plan_name) {
                        setCurrentPlan(data.plan_name.toLowerCase());
                    }
                    if (data.is_banned !== undefined) {
                        setLocalBanned(data.is_banned);
                    }
                }
            } catch (err) {
                console.error("Ошибка загрузки профиля", err);
            } finally {
                setIsLoading(false);
            }
        };

        fetchUserData();
    }, [currentUser.id]);

    const handlePlanChange = async (targetPlan: string) => {
        if (targetPlan === currentPlan) return;

        try {
            const res = await fetch('http://localhost:8001/change_subscription', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    user_id: currentUser.id,
                    target_plan: targetPlan
                })
            });

            if (!res.ok) throw new Error('Ошибка при смене тарифа');

            const data = await res.json();
            if (data.status === 'success') {
                setCurrentPlan(data.plan_name); // Обновляем UI
                if (onPlanChange) onPlanChange(data.plan_name.toLowerCase());
            }
        } catch (err) {
            console.error(err);
            alert("Не удалось изменить подписку.");
        }
    };

    const handleBackgroundClick = () => {
        setCurrentPlan(null);
    };

    if (isLoading) {
        return <div className="user-page-wrapper"><div className="loading-text">Загрузка профиля...</div></div>;
    }

    return (
        <div className="user-page-wrapper" onClick={handleBackgroundClick}>
            <button
                className="btn-back-chat"
                onClick={(e) => {
                    e.stopPropagation(); // Останавливаем клик, чтобы не дергать фон
                    onBack();
                }}
            >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <line x1="19" y1="12" x2="5" y2="12"></line>
                    <polyline points="12 19 5 12 12 5"></polyline>
                </svg>
                Вернуться к чатам
            </button>

            <div className="profile-header">
                {/* Берем первую букву имени для аватарки */}
                <div className="profile-avatar">{currentUser.username.charAt(0).toUpperCase()}</div>
                <div className="profile-username">{currentUser.username}</div>
            </div>

            {localBanned && (
                <div style={{
                    backgroundColor: '#fffbe6', // Бледно-желтый фон
                    border: '1px solid #faad14', // Желтая обводка
                    borderRadius: '12px',
                    padding: '16px 24px',
                    marginBottom: '32px',
                    color: '#d48806', // Темно-желтый/оранжевый текст для читаемости
                    textAlign: 'center',
                    fontWeight: 600,
                    maxWidth: '500px',
                    width: '100%',
                    boxShadow: '0 4px 12px rgba(250, 173, 20, 0.1)'
                }}>
                    Ваш аккаунт заблокирован.<br/>Все действия по анализу данных ограничены.
                </div>
            )}

            <div className="plans-title">Ваша подписка</div>

            <div className="plans-container">
                {PLANS_DATA.map((plan) => {
                    const isActive = currentPlan === plan.id;

                    return (
                        <div
                            key={plan.id}
                            className={`plan-card ${plan.tierClass} ${isActive ? 'active' : ''}`}
                            onClick={(e) => {
                                e.stopPropagation(); // Останавливаем всплытие до фона
                                if (localBanned) return;
                                handlePlanChange(plan.id);
                            }}
                            style={{
                                opacity: localBanned && !isActive ? 0.6 : 1,
                                cursor: localBanned ? 'not-allowed' : (isActive ? 'default' : 'pointer')
                            }}
                        >
                            {plan.badge && (
                                <div className="plan-badge" style={{ backgroundColor: plan.badgeColor }}>
                                    {plan.badge}
                                </div>
                            )}
                            <div className="plan-name">{plan.name}</div>
                            <div className="plan-price">{plan.price}</div>
                            <div className="plan-desc">{plan.desc}</div>

                            <div style={{
                                marginTop: 'auto', // Автоматически прижимает надпись к самому низу карточки
                                paddingTop: '20px',
                                fontWeight: isActive ? 700 : 600,
                                color: isActive
                                    ? (plan.id === 'ultra' ? '#343434' : '#3399FF')
                                    : (localBanned ? '#a1a1aa' : '#a1a1aa'), // Серый цвет для неактивных тарифов
                                transition: 'color 0.2s'
                            }}>
                                {isActive ? 'Текущий тариф' : (localBanned ? 'Недоступно' : 'Выбрать тариф')}
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
};
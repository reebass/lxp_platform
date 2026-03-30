// app/[domain]/dashboard/page.tsx

export default function TenantDashboardTest() {
    return (
        <div className="p-10 flex flex-col bg-background gap-6">
            <h1 className="text-4xl font-bold text-foreground">
                Кабінет Користувача
            </h1>

            <div className="p-6 rounded-xl bg-background-content shadow-lg border border-border max-w-xl">
                <h2 className="text-xl font-semibold text-foreground mb-2">
                    Перевірка кольорів
                </h2>
                <p className="text-muted-foreground mb-6">
                    Якщо фон сторінки темно-зелений (Novus), ця картка світла, а кнопка нижче має фірмовий акцентний колір — значить, наш layout.tsx працює ідеально на всіх сторінках!
                </p>

                <button className="px-4 py-2 bg-primary text-white rounded-md font-medium hover:opacity-90 transition-opacity">
                    Тестова кнопка
                </button>
            </div>
        </div>
    );
}
import { ModeToggle } from "@/components/ToggleTheme";
import { Link, Outlet, useLocation } from "react-router-dom";
import { useTheme } from "@/components/ThemeProvider"
import { useContext } from "react";
import { AuthContext } from "@/context/AuthContext";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { cn } from "@/lib/utils";
import { RoleUser, User } from "@/services/users";

const routes = [
    {
        path: ['/', '/dashboard'],
        label: 'Dashboard',
        redirectTo: '/dashboard',
        hasAccess: (user: User) => user.role === RoleUser.ADMIN,
    },
    {
        path: ['/posts'],
        label: 'Posts',
        redirectTo: '/posts',
        hasAccess: (user: User) => user.role === RoleUser.ADMIN,
    },
    {
        path: ['/usuarios'],
        label: 'Usuarios',
        redirectTo: '/usuarios',
        hasAccess: (user: User) => user.role === RoleUser.ADMIN,
    },
    {
        path: ['/home'],
        label: 'Home Posts',
        redirectTo: '/home',
        hasAccess: (user: User) => user.role === RoleUser.ADMIN,
    },
    {
        path: ['/solicitudes'],
        label: 'Solicitudes',
        redirectTo: '/solicitudes',
        hasAccess: (user: User) => user.role === RoleUser.ADMIN,
    },
    {
        path: ['/autoridades'],
        label: 'Autoridades',
        redirectTo: '/autoridades',
        hasAccess: (user: User) => user.role === RoleUser.ADMIN,
    },
    {
        path: ['/semestres'],
        label: 'Semestres',
        redirectTo: '/semestres',
        hasAccess: (user: User) => user.role === RoleUser.ADMIN || user.role === RoleUser.EVENT_MANAGER,
    },
    {
        path: ['/escuelas'],
        label: 'Escuelas',
        redirectTo: '/escuelas',
        hasAccess: (user: User) => user.role === RoleUser.ADMIN || user.role === RoleUser.EVENT_MANAGER,
    },
    {
        path: ['/profesores'],
        label: 'Profesores',
        redirectTo: '/profesores',
        hasAccess: (user: User) => user.role === RoleUser.ADMIN || user.role === RoleUser.EVENT_MANAGER,
    },
    {
        path: ['/competencias'],
        label: 'Competencias',
        redirectTo: '/competencias',
        hasAccess: (user: User) => user.role === RoleUser.ADMIN || user.role === RoleUser.EVENT_MANAGER,
    },
    {
        path: ['/capacitaciones'],
        label: 'Capacitaciones',
        redirectTo: '/capacitaciones',
        hasAccess: (user: User) => user.role === RoleUser.ADMIN || user.role === RoleUser.EVENT_MANAGER,
    },
    {
        path: ['/capacitaciones-reportes'],
        label: 'Reportes Capacitaciones',
        redirectTo: '/capacitaciones-reportes',
        hasAccess: (user: User) => user.role === RoleUser.ADMIN || user.role === RoleUser.EVENT_MANAGER,
    },
    {
        path: ['/cloud'],
        label: 'Cloud',
        redirectTo: '/cloud',
        hasAccess: (user: User) => user.role === RoleUser.ADMIN || user.role === RoleUser.EVENT_MANAGER,
    },
]
interface ProtectedRouteProps {
    children?: JSX.Element;
}
export const DashboardLayout = ({
    children,
}: ProtectedRouteProps) => {
    const { theme } = useTheme();
    const { logout, user } = useContext(AuthContext)
    const location = useLocation();
    return (
        <ProtectedRoute
            // isAllowed={!!user && user.permisos.includes("/productos")}
            isAllowed={!!user}
        >
            <div className="flex flex-row">
                {/* <!-- Sidebar --> */}
                <div
                    className="bg-white dark:bg-black min-w-[280px] flex flex-col h-screen py-6 px-8 justify-between gap-6 border-r border-[#E9EAEC]">
                    {/* <img src="../assets/img/logo_black.svg" alt="culqi-logo" className="h-8 text-center" /> */}
                    <div className="w-full flex justify-center">
                        {/* <h1 className="text-2xl font-black text-inherit">LOGO</h1> */}
                        {/* cargar imagen de logo de acuerdo al tema */}
                        <img
                            src={theme === "dark" ? "/img/logo_white.png" : "/img/logo_gray.png"}
                            alt="uss-logo"
                            className="h-12 text-center"
                        />
                    </div>

                    <div className="h-full w-full">
                        <div className="flex flex-col">
                            {routes.map((route, index) => {
                                if (!route.hasAccess(user!)) return null;
                                return (
                                    <Link
                                        to={route.redirectTo}
                                        key={index}
                                        className="flex flex-row gap-[10px] items-center py-4 rounded hover:bg-[#2ebb7241] transition duration-500 ease-in-out cursor-pointer px-2">
                                        <p className={cn("text-sm font-bold leading-[160%] tracking-[0.2px]",
                                            route.path.includes(location.pathname) ? 'text-[#2ebb72]' : 'text-[#111827] dark:text-white'
                                        )}
                                        >
                                            {route.label}
                                        </p>
                                    </Link>

                                )
                            })}
                        </div>
                    </div>

                    <button
                        className="py-[15px] px-[24px] rounded-[10px] border border-[#111827] dark:border-white self-stretch text-sm text-[#111827] dark:text-white font-bold leading-[160%] tracking-[0.2px] hover:bg-[#ffe1e1] hover:dark:bg-slate-900 transition duration-500 ease-in-out"
                        onClick={logout}>
                        Salir
                    </button>
                </div>

                {/* <!-- Content Principal --> */}
                <div className="flex-1 flex flex-col overflow-hidden h-screen bg-red-400 overflow-y-scroll">
                    {/* <!-- Navbar --> */}
                    <header className="bg-white dark:bg-black h-[96px] py-6 px-8 border-b border-[#E9EAEC]">
                        <div className="flex items-center justify-end p-4 gap-2">
                            <div
                                className="w-8 h-8 rounded-full bg-[#EB6F25] flex items-center justify-center text-white text-sm font-bold leading-[140%] tracking-[0.2px]">
                                {/* {{ getInitialsName }} */}
                                {/* RP */}
                                {user?.name.charAt(0).toUpperCase()}
                            </div>
                            <div className="text-[#111827] dark:text-white text-xs font-bold leading-[140%]">
                                {/* Renatto Perleche */}
                                {user?.name}
                            </div>
                            {/* <Button size='icon' variant="ghost" onClick={() => { darkMode.toggle() }}>
                                {darkMode.value ? (
                                    <i className="fa-solid fa-toggle-on text-xl"></i>
                                ) : (
                                    <i className="fa-solid fa-toggle-off text-xl"></i>
                                )}
                            </Button> */}
                            <ModeToggle />
                        </div>
                    </header>

                    {/* <!-- App --> */}
                    <main className="flex-1 overflow-x-hidden overflow-y-auto bg-[#fafafa] dark:bg-[#2c2c2c] pt-8">
                        <div className="mx-6 rounded-2xl bg-white dark:bg-black h-auto">
                            {children ? children : <Outlet />}
                        </div>
                    </main>
                </div>
            </div>
        </ProtectedRoute>
    )
};
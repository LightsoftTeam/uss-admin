import { useContext, useEffect } from 'react'
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import { AuthContext } from '@/context/AuthContext'
import { Login, Posts } from '@/pages'
import { SpinnerSplash } from './SpinnerSplash'
import { DashboardLayout } from '@/layouts/DashboardLayout'
import { PostProvider } from '@/pages/Posts/context/PostContext'
import UsersPage from '@/pages/Users'
import HomePosts from '@/pages/Home'
import AuthoritiesPage from '@/pages/Authorities'
import { RoleUser, User } from '@/services/users'
import SchoolsPage from '@/pages/Schools'
import ProfessorsPage from '@/pages/Professors'
import TrainingsPage from '@/pages/Trainings'
import RequestsPage from '@/pages/Requests'
import CompetenciesPage from '@/pages/Competencies'
import SearchByDocument from '@/pages/Trainings/components/searchByDocument/page'
import StatiticsPage from '@/pages/Trainings/views/StatiticsPage'
import SemestersPage from '@/pages/Semesters'
import StogarePage from '@/pages/Storage'
import RequestsProffesorPage from '@/pages/RequestsProfessor'

const PostPage = () => {
  return (
    <PostProvider>
      <Posts />
    </PostProvider>
  )
}

const DashboardPage = () => {
  return (
    <div className='p-4 text-xl font-semibold'>Bienvenido al gestor de contenido.</div>
  )
}

const routes = [
  {
    path: 'posts',
    label: 'Posts',
    redirectTo: '/posts',
    hasAccess: (user: User) => user.role === RoleUser.ADMIN,
    component: PostPage,
  },
  {
    path: 'usuarios',
    label: 'Usuarios',
    redirectTo: '/usuarios',
    hasAccess: (user: User) => user.role === RoleUser.ADMIN,
    component: UsersPage,
  },
  {
    path: 'home',
    label: 'Home Posts',
    redirectTo: '/home',
    hasAccess: (user: User) => user.role === RoleUser.ADMIN,
    component: HomePosts,
  },
  {
    path: 'autoridades',
    label: 'Autoridades',
    redirectTo: '/autoridades',
    hasAccess: (user: User) => user.role === RoleUser.ADMIN,
    component: AuthoritiesPage,
  },
  {
    path: 'semestres',
    label: 'Semestres',
    redirectTo: '/semestres',
    hasAccess: (user: User) => user.role === RoleUser.ADMIN || user.role === RoleUser.EVENT_MANAGER,
    component: SemestersPage,
  },
  {
    path: 'escuelas',
    label: 'Escuelas',
    redirectTo: '/escuelas',
    hasAccess: (user: User) => user.role === RoleUser.ADMIN || user.role === RoleUser.EVENT_MANAGER,
    component: SchoolsPage,
  },
  {
    path: '/solicitudes-profesores',
    label: 'Solicitudes Profesores',
    redirectTo: '/solicitudes-profesores',
    hasAccess: (user: User) => user.role === RoleUser.ADMIN || user.role === RoleUser.EVENT_MANAGER,
    component: RequestsProffesorPage,
  },
  {
    path: 'profesores',
    label: 'Profesores',
    redirectTo: '/profesores',
    hasAccess: (user: User) => user.role === RoleUser.ADMIN || user.role === RoleUser.EVENT_MANAGER,
    component: ProfessorsPage,
  },
  {
    path: 'competencias',
    label: 'Competencias',
    redirectTo: '/competencias',
    hasAccess: (user: User) => user.role === RoleUser.ADMIN || user.role === RoleUser.EVENT_MANAGER,
    component: CompetenciesPage,
  },
  {
    path: 'capacitaciones',
    label: 'Capacitaciones',
    redirectTo: '/capacitaciones',
    hasAccess: (user: User) => user.role === RoleUser.ADMIN || user.role === RoleUser.EVENT_MANAGER,
    component: TrainingsPage,
  },
  {
    path: 'solicitudes',
    label: 'Solicitudes',
    redirectTo: '/solicitudes',
    hasAccess: (user: User) => user.role === RoleUser.ADMIN,
    component: RequestsPage,
  },
  {
    path: 'capacitaciones-documento',
    label: 'Capacitaciones por Documento',
    redirectTo: '/capacitaciones-documento',
    hasAccess: (user: User) => user.role === RoleUser.ADMIN || user.role === RoleUser.EVENT_MANAGER,
    component: SearchByDocument,
  },
  {
    path: 'capacitaciones-reportes',
    label: 'Estadísticas de Capacitaciones',
    redirectTo: '/capacitaciones-reportes',
    hasAccess: (user: User) => user.role === RoleUser.ADMIN || user.role === RoleUser.EVENT_MANAGER,
    component: StatiticsPage,
  },
  {
    path: 'cloud',
    label: 'Cloud',
    redirectTo: '/cloud',
    hasAccess: (user: User) => user.role === RoleUser.ADMIN || user.role === RoleUser.EVENT_MANAGER,
    component: StogarePage,
  },

]

export const RoutesApp = () => {
  const { authenticate, isAuthenticating, user } = useContext(AuthContext)

  useEffect(() => {
    authenticate()
  }, []);

  if (isAuthenticating) return <SpinnerSplash />

  return (
    <BrowserRouter>
      <Routes>
        <Route path='/login' element={<Login />} />
        {!!user && (<Route path='/' element={<DashboardLayout />}>

          <>
            <Route index element={<DashboardPage />} />
            <Route path="dashboard" element={<DashboardPage />} />
            {routes.map((route, index) => {
              if (!route.hasAccess(user!)) return null;
              return (
                <Route
                  key={index}
                  path={route.path}
                  element={
                    <route.component />
                  }
                />
              )
            })}
          </>
        </Route>
        )}
        <Route path="*" element={<Navigate to={!!user ? '/' : '/login'} />} />
      </Routes>
    </BrowserRouter>
  )
}

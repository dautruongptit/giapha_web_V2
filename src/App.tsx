import { AppProvider, useApp, useRoute } from './context'
import { TopBar } from './components/layout'
import { MemberDrawer } from './components/member'
import {
  LoginPage,
  HomePage,
  TreePage,
  FeedbackFormPage,
  MyFeedbackPage,
  AdminPage,
} from './pages'

function Shell() {
  const route = useRoute()
  const { loggedIn } = useApp()

  if (route.startsWith('/admin')) {
    return <AdminPage />
  }

  let page
  if (!loggedIn) {
    page = <LoginPage />
  } else if (route === '/tree') {
    page = <TreePage />
  } else if (route === '/my') {
    page = <MyFeedbackPage />
  } else if (route.startsWith('/feedback/')) {
    page = <FeedbackFormPage id={route.split('/')[2]} />
  } else {
    page = <HomePage />
  }

  return (
    <>
      <TopBar route={route} />
      {page}
      <MemberDrawer />
    </>
  )
}

export default function App() {
  return (
    <AppProvider>
      <Shell />
    </AppProvider>
  )
}

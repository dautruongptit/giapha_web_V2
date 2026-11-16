import { Provider, useApp, useRoute } from './store'
import { Admin } from './admin'
import { Drawer, FeedbackForm, Home, Login, MyFeedback, Tree, TopBar } from './viewer'

function Shell() {
  const route = useRoute()
  const { loggedIn } = useApp()
  if (route.startsWith('/admin')) return <Admin />
  let page
  if (!loggedIn) page = <Login />
  else if (route === '/tree') page = <Tree />
  else if (route === '/my') page = <MyFeedback />
  else if (route.startsWith('/feedback/')) page = <FeedbackForm id={route.split('/')[2]} />
  else page = <Home />
  return <><TopBar route={route} />{page}<Drawer /></>
}
export default function App() { return <Provider><Shell /></Provider> }

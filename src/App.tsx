import React from "react"
import { BrowserRouter as Router, Switch, Route, Link } from "react-router-dom"
import Header from "./components/Header/Header"
import IndexPage from "./pages/Index"
import Room from "./pages/Room"
import { ContextProvider } from "./SocketContext"

const App = () => {
  return (
    <Router>
      <Header />
      <Switch>
        <Route exact path="/">
          <ContextProvider>
            <IndexPage />
          </ContextProvider>
        </Route>
        {/* <Route exact path="/:room">
          <Room />
        </Route> */}
      </Switch>
    </Router>
  )
}

export default App

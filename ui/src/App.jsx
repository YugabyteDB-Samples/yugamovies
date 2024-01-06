import "./App.css";
import React, { useContext, useState } from "react";
import {
  BrowserRouter as Router,
  Route,
  Switch,
  Redirect,
} from "react-router-dom";
import Header from "./Header";
import Login from "./Login";
import MovieSearch from "./MovieSearch";
import UserProfile from "./UserProfile";
import { AuthContext } from "./AuthContext";

function App() {
  const { authToken } = useContext(AuthContext);
  return (
    <div>
      <Router>
        <Header />
        <Switch>
          <Route path="/login">
            {authToken ? <Redirect to="/search" /> : <Login />}
          </Route>
          <Route path="/search">
            {authToken ? <MovieSearch /> : <Redirect to="/login" />}
          </Route>
          <Route path="/profile">
            {authToken ? <UserProfile /> : <Redirect to="/login" />}
          </Route>
          <Redirect from="/" to="/login" />
        </Switch>
      </Router>
    </div>
  );
}

export default App;

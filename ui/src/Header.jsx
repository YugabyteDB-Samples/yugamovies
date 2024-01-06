import "./App.css";
import React, { useState } from "react";
import { useHistory } from "react-router-dom";

function Header() {
  const history = useHistory();

  return (
    <header className="header">
      <div
        className="brand-logo-container"
        onClick={() => {
          history.push("/search");
        }}
      >
        <span className="brand-logo">
          <img src="film-reel.svg"></img>
        </span>
        YugaMovies
      </div>
      <div
        className="user-logo"
        onClick={() => {
          history.push("/profile");
        }}
      >
        <img src="profile-user.svg"></img>
      </div>
    </header>
  );
}

export default Header;

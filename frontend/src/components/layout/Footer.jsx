import React from "react";

import SongDetail from "../player/SongDetail";
import ControlArea from "../player/ControlArea";
import Features from "../player/Features";

import "../../css/footer/Footer.css";

const Footer = ({ playerState, playerControls, playerFeatures }) => {
  return (
    <footer className="footer-root footer-glow">
      <SongDetail currentSong={playerState.currentSong} />
      <ControlArea 
        playerState={playerState} 
        playerControls={playerControls} 
      />
      <Features 
        playerState={playerState} 
        playerFeatures={playerFeatures} 
      />
    </footer>
  );
};


export default Footer;
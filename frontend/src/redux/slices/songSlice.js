import {createSlice, current} from "@reduxjs/toolkit";

const initalStatee = {
    currentSong: null,
    isPlaying: false,
    duration: 0,
    currentTime: 0,
    
    songQueue: [],
    currentIndex: -1,
    repeatMode: "none", // none, one, all
    shuffle: false,
};
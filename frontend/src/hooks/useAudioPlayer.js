import { useReducer, useRef, useState } from "react";

const initialAudioState = {
    isPlaying: false,
    isLoading: false,
    isMuted: false,
    volume: 1,
    loopEnabled: false,
    shuffleEnabled: false,
    playBackSpeed: 1,
    currentIndex: null,
    currentSong: null,
    currentTime: 0,
};

// Reducer
function audioReducer(state, action) {
    switch (action.type) {
        case "LOADING":
            return { ...state, isLoading: true };

        case "PLAY":
            return { ...state, isPlaying: true, isLoading: false };

        case "PAUSE":
            return { ...state, isPlaying: false };

        case "MUTE":
            return { ...state, isMuted: true };

        case "UNMUTE":
            return { ...state, isMuted: false };

        case "SET_VOLUME":
            return { ...state, volume: action.payload };

        case "TOGGLE_LOOP": // fixed typo TOOGLE_LOOP -> TOGGLE_LOOP
            return { ...state, loopEnabled: !state.loopEnabled, shuffleEnabled: false }; // fixed logic

        case "TOGGLE_SHUFFLE": // added missing case
            return { ...state, shuffleEnabled: !state.shuffleEnabled, loopEnabled: false };

        case "SET_PLAYBACK_SPEED": // fixed typo SET_PLAY_BACK_SPEED -> SET_PLAYBACK_SPEED
            return { ...state, playBackSpeed: action.payload };

        case "SET_CURRENT_TRACK":
            return {
                ...state,
                currentIndex: action.payload.index,
                currentSong: action.payload.song,
                isLoading: true,
            };

        case "SET_CURRENT_TIME":
            return { ...state, currentTime: action.payload };

        default:
            return state;
    }
}

const useAudioPlayer = (songs) => {
    const [audioState, dispatch] = useReducer(audioReducer, initialAudioState);

    const [duration, setDuration] = useState(0); // fixed useStar -> useState
    const previousVolumeRef = useRef(1);
    const audioRef = useRef(null);

    // Play song at a specific index value
    const playSongAtIndex = (index) => {
        if (!songs || songs.length === 0) {
            console.warn("No song available to play.");
            return;
        }

        if (index < 0 || index >= songs.length) return;

        const song = songs[index];

        dispatch({
            type: "SET_CURRENT_TRACK",
            payload: { index, song },
        });

        dispatch({ type: "SET_CURRENT_TIME", payload: 0 });

        const audio = audioRef.current;
        if (!audio) return;

        dispatch({ type: "LOADING" });
        audio.load();

        audio.playbackRate = audioState.playBackSpeed; // fixed typo playBackRate -> playbackRate

        audio
            .play()
            .then(() => dispatch({ type: "PLAY" }))
            .catch((error) => console.error("Play Error", error));
    };

    // Toggle play/pause
    const handleTogglePlay = () => {
        const audio = audioRef.current;
        if (!audio) return;

        if (audio.paused) {
            audio
                .play()
                .then(() => dispatch({ type: "PLAY" }))
                .catch((e) => console.error("Play error", e));
        } else {
            audio.pause(); // fixed typo audio.paused() -> audio.pause()
            dispatch({ type: "PAUSE" });
        }
    };

    //Next Song
    const handleNext = () => {
        if (!songs.length) return;

        if (audioState.currentIndex === null) {
            playSongAtIndex(0);
            return;
        }

        //if shuffle is enabled
        if (audioState.shuffleEnabled && songs.length > 1) {
            let randomIndex = audioState.currentIndex;
            while (randomIndex === audioState.currentIndex) {
                randomIndex = Math.floor(Math.random() * songs.length);
            }
            playSongAtIndex(randomIndex);
            return;
        }

        //next without shuffle
        const nextIndex = (audioState.currentIndex + 1) % songs.length;
        playSongAtIndex(nextIndex);
    };

    //handle previous song
    const handlePrev = () => {
        if (!songs.length) return;
        if (audioState.currentIndex === null) {
            playSongAtIndex(0);
            return;
        }
        const prevIndex = (audioState.currentIndex - 1 + songs.length) % songs.length;
        playSongAtIndex(prevIndex);
    };

    //audio event handler
    const handleTimeUpdate = () => {
        const audio = audioRef.current;
        if (!audio) return;

        dispatch({
            type: "SET_CURRENT_TIME",
            payload: audio.currentTime || 0,
        });
    };
    //handling meta data
    const handleLoadedMetaData = () => {
    const audio = audioRef.current;
    if (!audio) return;

    setDuration(audio.duration || 0);
    audio.playbackRate = audioState.playBackSpeed;
    audio.volume = audioState.volume;
    audio.muted = audioState.isMuted;
};


    const handleEnded = () => {
        const audio = audioRef.current;
        if (!audio) return;
        if (audioState.loopEnabled) {
            audio.currentTime = 0;

            audio
                .play()
                .then(() => {
                    dispatch({ type: "PLAY" });
                    dispatch({ type: "SET_CURRENT_TIME", payload: 0 });
                })
                .catch((e) => console.error("Replay error", e));
        } else {
            handleNext();
        }
    };

    const handleToggleMute = () => {
        const audio = audioRef.current;
        if (!audio) return;

        if (audioState.isMuted) {
            const restoreVolume = previousVolumeRef.current || 1;

            audio.muted = false;
            audio.volume = restoreVolume;

            dispatch({ type: "UNMUTE" });
            dispatch({ type: "SET_VOLUME", payload: restoreVolume });
        } else {
            previousVolumeRef.current = audioState.volume || 1;
            audio.muted = true;
            audio.volume = 0;

            dispatch({ type: "MUTE" });
            dispatch({ type: "SET_VOLUME", payload: 0 });
        }
    };

    const handleToggleLoop = () => {
        dispatch({ type: "TOGGLE_LOOP" }); // fixed typo
    };

    const handleToggleShuffle = () => {
        dispatch({ type: "TOGGLE_SHUFFLE" });
    };

    const handleChangeSpeed = (newSpeed) => {
        const audio = audioRef.current;
        dispatch({ type: "SET_PLAYBACK_SPEED", payload: newSpeed }); // fixed typo
        if (audio) {
            audio.playbackRate = newSpeed; // fixed typo
        }
    };

    const handleSeek = (newTime) => {
        const audio = audioRef.current;
        if (!audio) return;
        audio.currentTime = newTime;
        dispatch({ type: "SET_CURRENT_TIME", payload: newTime });
    };

    const handleChangeVolume = (newVolume) => {
        const audio = audioRef.current;

        if (newVolume > 0) {
            previousVolumeRef.current = newVolume;
        }
        dispatch({ type: "SET_VOLUME", payload: newVolume });

        if (!audio) return;
        audio.volume = newVolume;

        if (newVolume === 0) {
            audio.muted = true;
            dispatch({ type: "MUTE" });
        } else if (audioState.isMuted) {
            audio.muted = false;
            dispatch({ type: "UNMUTE" });
        }
    };

return {
    //audio ref
    audioRef,
    currentIndex: audioState.currentIndex,
    currentSong: audioState.currentSong,
    isPlaying: audioState.isPlaying,
    currentTime: audioState.currentTime,
    isLoading: audioState.isLoading,
    duration,


    handleTimeUpdate,
    handleLoadedMetaData,
    handleEnded,

    //feature toggle
    isMuted: audioState.isMuted,
    loopEnabled: audioState.loopEnabled,
    shuffleEnabled: audioState.shuffleEnabled,
    playBackSpeed: audioState.playBackSpeed,
    volume: audioState.volume,

    //playback control function
    playSongAtIndex,
    handleTogglePlay,
    handleNext,
    handlePrev,

    //Feature control functions
    handleToggleMute,
    handleToggleLoop,
    handleToggleShuffle,
    handleChangeSpeed,
    handleSeek,
    handleChangeVolume,
};


};

export default useAudioPlayer;

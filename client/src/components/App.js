import React, { useState, useRef, useEffect } from "react";
import axios from "axios";
import TextField from "@material-ui/core/TextField";
import Button from "@material-ui/core/Button";

const initRecomObj = [
    {
        artist: "",
        name: "",
        externalUrls: "",
        previewUrl: "",
    },
];
const App = () => {
    const [musicObj, setMusicObj] = useState(undefined);
    const [recom, setRecom] = useState(initRecomObj);
    const inputRef = useRef();
    const statusRef = useRef();

    // Authorize client
    const fetchToken = () => {
        axios.get("/api/token").then((res) => {
            console.log("res");
        });
    };

    // Get recommendations based on input music
    const getRecommendations = () => {
        // res consists of array of recommended tracks
        axios.post("/api/recommendation", { musicObj }).then((res) => {
            res.data.tracks.map((track) => {
                if (track.artists && track.artists.length > 0) {
                    const uri = track.uri.substring(
                        track.uri.lastIndexOf(":") + 1,
                        track.uri.length
                    );
                    const newRecom = {
                        artist: track.artists[0].name,
                        name: track.name,
                        externalUrls: uri,
                        previewUrl: track.preview_url,
                    };
                    setRecom((oldArray) => [...oldArray, newRecom]);
                }
            });
        });
    };

    // Obtain information about input music
    const getMusic = () => {
        axios
            .post("/api/music", { track: inputRef.current.value })
            .then((res) => {
                if (res.data === "Refresh") {
                    statusRef.current.innerHTML = "Please refresh the page and try again.";
                    return;
                }
                if (res.data.tracks.items.length === 0) return;

                let artistId = "";
                let artistName = "";
                const artists = res.data.tracks.items[0].artists;
                const musicId = res.data.tracks.items[0].id;
                const musicName = res.data.tracks.items[0].name;
                const musicPreview = res.data.tracks.items[0].preview_url;
                const musicLink =
                    res.data.tracks.items[0].external_urls.spotify;

                if (artists && artists.length > 0) {
                    artistId = artists[0].id;
                    artistName = artists[0].name;
                }
                setMusicObj({
                    artistId,
                    artistName,
                    musicId,
                    musicName,
                    musicPreview,
                    musicLink,
                });
            });
    };

    // Authorize client for the first mount.
    useEffect(() => {
        fetchToken();
    }, []);

    // musicObj will be changed when 'get recommendation' button
    // is clicked. So, if musicObj is valid, call getRecommendations function.
    useEffect(() => {
        if (musicObj) {
            getRecommendations();
        }
    }, [musicObj]);

    return (
        <div className="app-container">
            <nav className="app-nav">
                <h1>Face the Music</h1>
                <h2>
                    <a href="http://www.google.com" target="_blank">
                        Github
                    </a>
                </h2>
            </nav>

            <div className="music-input">
                <TextField
                    required={true}
                    id="standard-basic"
                    placeholder="Artist or song name"
                    inputRef={inputRef}
                />
                <Button
                    variant="outlined"
                    onClick={() => {
                        if (inputRef.current.value.trim().length < 2) {
                            statusRef.current.innerHTML =
                                "You need to enter proper artist or song name.";
                            return;
                        }
                        statusRef.current.innerHTML = "";
                        setRecom(initRecomObj);
                        getMusic();
                    }}
                >
                    Recommend songs!
                </Button>
                <p ref={statusRef}></p>
            </div>

            <div className="recommendations">
                {recom &&
                    recom.length > 1 &&
                    recom.slice(1, recom.length).map((eachRecom) => (
                        <div
                            className="recommendation"
                            key={eachRecom.externalUrls}
                        >
                            <h3>
                                {eachRecom.artist} - {eachRecom.name}
                            </h3>
                            <iframe
                                src={
                                    "https://open.spotify.com/embed/track/" +
                                    eachRecom.externalUrls
                                }
                                height="80"
                                frameBorder="0"
                                allowtransparency="true"
                                allow="encrypted-media"
                                title="Spotify Preview"
                            ></iframe>
                        </div>
                    ))}
            </div>
        </div>
    );
};

export default App;

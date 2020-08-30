const Router = require("express");
const axios = require("axios");
const logger = require("heroku-logger");
const router = Router();
var qs = require("qs");
require("dotenv").config();

let accessToken;
router.get("/api/token", async (req, res) => {
    const encodedPayload = new Buffer(process.env.authorization).toString(
        "base64"
    );
    var data = qs.stringify({
        grant_type: "client_credentials",
    });
    var config = {
        method: "post",
        url: "https://accounts.spotify.com/api/token",
        headers: {
            "Content-Type": "application/x-www-form-urlencoded",
            Accept: "application/json",
            Authorization: "Basic " + encodedPayload,
        },
        data: data,
    };
    const accessTokenRes = await axios(config);
    accessToken = await accessTokenRes.data.access_token;
    res.send(encodedPayload);
});

router.post("/api/music", (req, res) => {
    if (!accessToken) {
        res.send("Refresh");
        return;
    }

    var data = qs.stringify({});
    var config = {
        method: "get",
        url: "https://api.spotify.com/v1/search",
        headers: {
            "Content-Type": "application/json",
            Accept: "application/json",
            Authorization: "Bearer " + accessToken,
        },
        params: {
            type: "track",
            q: req.body.track,
        },
        data: data,
    };
    logger.info("SEARCHING FOR: ", { searching: req.body.track });
    axios(config)
        .then(function (response) {
            res.send(response.data);
        })
        .catch(function (error) {
            console.log(error);
        });
});

router.post("/api/recommendation", (req, res) => {
    const { artistId, musicId } = req.body.musicObj;

    var data = qs.stringify({});
    let params = {};
    if (artistId.length > 0) {
        params = {
            seed_artists: artistId,
            seed_tracks: musicId,
        };
    } else {
        params = {
            seed_tracks: musicId,
        };
    }

    var config = {
        method: "get",
        url: "https://api.spotify.com/v1/recommendations",
        headers: {
            "Content-Type": "application/json",
            Accept: "application/json",
            Authorization: "Bearer " + accessToken,
        },
        params,
        data,
    };

    axios(config)
        .then(function (response) {
            res.send(response.data);
        })
        .catch(function (error) {
            console.log(error);
        });
});

module.exports = router;

/* ============================================================
   NAMJOON'S LITTLE UNIVERSE
============================================================ */

"use strict";


/* ============================================================
   ELEMENTS
============================================================ */

const introScreen = document.getElementById("introScreen");
const enterUniverse = document.getElementById("enterUniverse");
const mainSite = document.getElementById("mainSite");

const themeToggle = document.getElementById("themeToggle");
const themePanel = document.getElementById("themePanel");
const closeTheme = document.getElementById("closeTheme");
const themeOptions = document.querySelectorAll(".theme-option");

const sendWish = document.getElementById("sendWish");
const starCanvas = document.getElementById("starCanvas");
const starStatus = document.getElementById("starStatus");

const spotifyPlayer = document.getElementById("spotifyPlayer");

const lightbox = document.getElementById("lightbox");
const lightboxImage = document.getElementById("lightboxImage");
const lightboxClose = document.getElementById("lightboxClose");

const lastButton = document.getElementById("lastButton");
const finalOverlay = document.getElementById("finalOverlay");
const finalClose = document.getElementById("finalClose");

const wishForm = document.getElementById("wishForm");
const wishList = document.getElementById("wishList");
const formStatus = document.getElementById("formStatus");
const API_BASE =
    window.location.protocol === "http:" &&
    window.location.port === "8000"
        ? ""
        : "https://namjoon-birthday-api.onrender.com";


/* ============================================================
   THEME
============================================================ */

const savedTheme =
    localStorage.getItem("namjoonUniverseTheme") || "indigo";

document.body.dataset.theme = savedTheme;

themeOptions.forEach(button => {

    button.classList.toggle(
        "active",
        button.dataset.theme === savedTheme
    );

});


themeToggle.addEventListener("click", () => {

    themePanel.classList.toggle("open");

});


closeTheme.addEventListener("click", () => {

    themePanel.classList.remove("open");

});


themeOptions.forEach(button => {

    button.addEventListener("click", () => {

        const theme = button.dataset.theme;

        document.body.dataset.theme = theme;

        localStorage.setItem(
            "namjoonUniverseTheme",
            theme
        );

        themeOptions.forEach(item => {
            item.classList.toggle(
                "active",
                item === button
            );
        });

        themePanel.classList.remove("open");

        drawGalaxy();

    });

});


document.addEventListener("click", event => {

    if (
        themePanel.classList.contains("open") &&
        !themePanel.contains(event.target) &&
        !themeToggle.contains(event.target)
    ) {
        themePanel.classList.remove("open");
    }

});


/* ============================================================
   SPOTIFY
============================================================ */

function startSong() {

    const track =
        "https://open.spotify.com/embed/track/6bSwpQYEguyMlkCoWiBt3Y" +
        "?utm_source=generator" +
        "&autoplay=1";

    spotifyPlayer.src = track;

}


/* ============================================================
   ENTER UNIVERSE
============================================================ */

enterUniverse.addEventListener("click", () => {

    startSong();

    introScreen.classList.add("hide");

    mainSite.classList.remove("hidden");

    setTimeout(() => {

        document.body.style.overflowY = "auto";

        document.getElementById("top")
            ?.scrollIntoView({
                behavior: "smooth",
                block: "start"
            });

    }, 600);

});


/* ============================================================
   GALLERY
============================================================ */

document.querySelectorAll(".gallery-item").forEach(item => {

    item.addEventListener("click", () => {

        const image = item.dataset.image;

        if (!image) return;

        lightboxImage.src = image;

        lightbox.classList.add("open");

        lightbox.setAttribute(
            "aria-hidden",
            "false"
        );

    });

});


function closeLightbox() {

    lightbox.classList.remove("open");

    lightbox.setAttribute(
        "aria-hidden",
        "true"
    );

    setTimeout(() => {

        lightboxImage.src = "";

    }, 300);

}


lightboxClose.addEventListener(
    "click",
    closeLightbox
);


lightbox.addEventListener("click", event => {

    if (event.target === lightbox) {
        closeLightbox();
    }

});


/* ============================================================
   FINAL LETTER
============================================================ */

lastButton.addEventListener("click", () => {

    finalOverlay.classList.add("open");

    finalOverlay.setAttribute(
        "aria-hidden",
        "false"
    );

    document.body.style.overflow = "hidden";

});


function closeFinalLetter() {

    finalOverlay.classList.remove("open");

    finalOverlay.setAttribute(
        "aria-hidden",
        "true"
    );

    document.body.style.overflow = "";

}


finalClose.addEventListener(
    "click",
    closeFinalLetter
);


document.addEventListener("keydown", event => {

    if (event.key === "Escape") {

        closeLightbox();
        closeFinalLetter();

    }

});


/* ============================================================
   NEW STAR FIELD
============================================================ */

const ctx = starCanvas.getContext("2d");

let width = 1;
let height = 1;
let dpr = Math.min(window.devicePixelRatio || 1, 2);

let particles = [];

let animationPhase = "idle";

/*
    idle
    ----
    No words exist.

    name
    ----
    Stars form KIM NAMJOON.

    birthday
    --------
    Stars form HAPPY BIRTHDAY NAMJOON.

    settled
    -------
    Final phrase remains.
*/

let phaseStartedAt = 0;

const PARTICLE_COUNT = 1100;

const nameText = "KIM NAMJOON";
const birthdayText = "HAPPY BIRTHDAY NAMJOON";


/* ============================================================
   PARTICLE
============================================================ */

function randomParticle() {

    const angle =
        Math.random() * Math.PI * 2;

    /*
       Galaxy shape:
       particles are distributed through several
       soft elliptical arms rather than a regular
       old star grid.
    */

    const radius =
        Math.pow(Math.random(), .72) *
        Math.min(width, height) *
        .72;

    const arm =
        Math.floor(Math.random() * 5);

    const armAngle =
        angle +
        arm * (Math.PI * 2 / 5) +
        radius * .006;

    const ellipseX =
        Math.cos(armAngle) * radius;

    const ellipseY =
        Math.sin(armAngle) *
        radius *
        .42;

    return {

        x: width / 2 + ellipseX,
        y: height / 2 + ellipseY,

        homeX: width / 2 + ellipseX,
        homeY: height / 2 + ellipseY,

        targetX: width / 2,
        targetY: height / 2,

        size:
            Math.random() < .08
                ? Math.random() * 2.5 + 1
                : Math.random() * 1.5 + .35,

        alpha:
            Math.random() * .7 + .25,

        twinkle:
            Math.random() * Math.PI * 2,

        twinkleSpeed:
            Math.random() * .02 + .006,

        drift:
            Math.random() * Math.PI * 2,

        driftSpeed:
            Math.random() * .0007 + .00025

    };

}


/* ============================================================
   RESIZE
============================================================ */

function resizeCanvas() {

    const rect =
        starCanvas.getBoundingClientRect();

    const oldWidth = width;
    const oldHeight = height;

    width = Math.max(1, rect.width);
    height = Math.max(1, rect.height);

    dpr =
        Math.min(
            window.devicePixelRatio || 1,
            2
        );

    starCanvas.width =
        Math.floor(width * dpr);

    starCanvas.height =
        Math.floor(height * dpr);

    ctx.setTransform(
        dpr,
        0,
        0,
        dpr,
        0,
        0
    );


    /*
       When the screen rotates or changes size,
       move existing particles proportionally.
    */

    if (
        particles.length &&
        oldWidth > 1 &&
        oldHeight > 1
    ) {

        const scaleX = width / oldWidth;
        const scaleY = height / oldHeight;

        particles.forEach(p => {

            p.x *= scaleX;
            p.y *= scaleY;

            p.homeX *= scaleX;
            p.homeY *= scaleY;

            p.targetX *= scaleX;
            p.targetY *= scaleY;

        });

    }

}


/* ============================================================
   CREATE GALAXY
============================================================ */

function createGalaxy() {

    particles = [];

    for (
        let i = 0;
        i < PARTICLE_COUNT;
        i++
    ) {

        particles.push(
            randomParticle()
        );

    }

}


/* ============================================================
   TEXT TARGET SAMPLING
============================================================ */

function getTextTargets(text) {

    /*
       Small offscreen canvas.

       IMPORTANT:
       The text itself is NOT placed in the
       visible star field.

       Only invisible pixel coordinates are sampled.
    */

    const offscreen =
        document.createElement("canvas");

    const offCtx =
        offscreen.getContext("2d");

    const w = Math.max(1, Math.floor(width));
    const h = Math.max(1, Math.floor(height));

    offscreen.width = w;
    offscreen.height = h;


    /*
       Font size adapts to the screen.
    */

    let fontSize =
        Math.min(
            width * .105,
            105
        );

    if (text.length > 20) {
        fontSize =
            Math.min(
                width * .07,
                70
            );
    }

    if (width < 500) {

        fontSize =
            Math.min(
                width * .095,
                48
            );

        if (text.length > 20) {
            fontSize =
                Math.min(
                    width * .062,
                    32
                );
        }

    }


    offCtx.clearRect(
        0,
        0,
        w,
        h
    );

    offCtx.fillStyle = "#ffffff";

    offCtx.font =
        `800 ${fontSize}px Arial, sans-serif`;

    offCtx.textAlign = "center";
    offCtx.textBaseline = "middle";

    offCtx.fillText(
        text,
        w / 2,
        h / 2
    );


    const image =
        offCtx.getImageData(
            0,
            0,
            w,
            h
        );


    const points = [];

    /*
       Larger sampling step keeps the formation
       elegant instead of making it look like
       a block of pixels.
    */

    const step =
        width < 500 ? 4 : 5;


    for (
        let y = 0;
        y < h;
        y += step
    ) {

        for (
            let x = 0;
            x < w;
            x += step
        ) {

            const index =
                (y * w + x) * 4;

            if (
                image.data[index + 3] > 180
            ) {

                points.push({
                    x,
                    y
                });

            }

        }

    }


    return points;

}


/* ============================================================
   ASSIGN PARTICLES TO TEXT
============================================================ */

function assignTextTargets(text) {

    const points =
        getTextTargets(text);

    if (!points.length) return;


    /*
       Shuffle target points so that stars
       come from the entire galaxy.
    */

    for (
        let i = points.length - 1;
        i > 0;
        i--
    ) {

        const j =
            Math.floor(
                Math.random() * (i + 1)
            );

        [
            points[i],
            points[j]
        ] =
        [
            points[j],
            points[i]
        ];

    }


    /*
       Every visible letter pixel receives
       multiple stars when necessary.

       This guarantees that the ENTIRE
       phrase gets formed.
    */

    particles.forEach((particle, index) => {

        const target =
            points[index % points.length];

        particle.targetX = target.x;
        particle.targetY = target.y;

    });

}


/* ============================================================
   COLOR
============================================================ */

function getAccentColor() {

    return getComputedStyle(
        document.body
    ).getPropertyValue("--accent").trim();

}


/* ============================================================
   DRAW BACKGROUND
============================================================ */

function drawBackground() {

    ctx.clearRect(
        0,
        0,
        width,
        height
    );


    const gradient =
        ctx.createRadialGradient(
            width * .5,
            height * .5,
            0,
            width * .5,
            height * .5,
            Math.max(width, height) * .65
        );

    gradient.addColorStop(
        0,
        "rgba(60,75,170,.12)"
    );

    gradient.addColorStop(
        .45,
        "rgba(15,20,55,.08)"
    );

    gradient.addColorStop(
        1,
        "rgba(0,0,0,0)"
    );

    ctx.fillStyle = gradient;

    ctx.fillRect(
        0,
        0,
        width,
        height
    );


    /*
       Very subtle galaxy dust.
    */

    const accent =
        getAccentColor();

    ctx.save();

    ctx.globalAlpha = .055;

    ctx.strokeStyle = accent;

    ctx.lineWidth = 1;

    ctx.beginPath();

    ctx.ellipse(
        width / 2,
        height / 2,
        width * .36,
        height * .16,
        -.22,
        0,
        Math.PI * 2
    );

    ctx.stroke();

    ctx.restore();

}


/* ============================================================
   DRAW PARTICLES
============================================================ */

function drawGalaxy(time) {

    const accent =
        getAccentColor();


    particles.forEach(p => {

        p.twinkle += p.twinkleSpeed;

        p.drift += p.driftSpeed;


        let drawX = p.x;
        let drawY = p.y;


        /* -----------------------------------------
           IDLE GALAXY
        ----------------------------------------- */

        if (animationPhase === "idle") {

            /*
               Very gentle natural movement.
            */

            drawX =
                p.x +
                Math.cos(p.drift + time * .0001) *
                2;

            drawY =
                p.y +
                Math.sin(p.drift + time * .00013) *
                2;

        }


        /* -----------------------------------------
           FORMING NAME / BIRTHDAY
        ----------------------------------------- */

        else {

            const elapsed =
                performance.now() -
                phaseStartedAt;


            const duration =
                animationPhase === "name"
                    ? 6200
                    : 6200;


            let progress =
                Math.min(
                    elapsed / duration,
                    1
                );


            /*
               Smooth easing.
            */

            progress =
                progress *
                progress *
                (3 - 2 * progress);


            /*
               Slightly different timing for each
               particle makes the formation organic.
            */

            const delay =
                (
                    p.x / width +
                    p.y / height
                ) * .10;

            const localProgress =
                Math.max(
                    0,
                    Math.min(
                        1,
                        (progress - delay) / .9
                    )
                );


            drawX =
                p.x +
                (
                    p.targetX - p.x
                ) *
                localProgress;

            drawY =
                p.y +
                (
                    p.targetY - p.y
                ) *
                localProgress;


            /*
               Tiny settling movement.
            */

            if (progress > .8) {

                const settle =
                    (progress - .8) / .2;

                drawX +=
                    Math.sin(
                        p.drift + time * .001
                    ) *
                    .7 *
                    (1 - settle);

                drawY +=
                    Math.cos(
                        p.drift + time * .001
                    ) *
                    .7 *
                    (1 - settle);

            }

        }


        const twinkle =
            .65 +
            Math.sin(p.twinkle) * .35;


        ctx.globalAlpha =
            Math.max(
                .12,
                p.alpha * twinkle
            );


        /*
           Larger stars get a small glow.
        */

        if (p.size > 1.8) {

            ctx.shadowBlur = 12;
            ctx.shadowColor = accent;

        } else {

            ctx.shadowBlur = 0;

        }


        ctx.fillStyle = accent;

        ctx.beginPath();

        ctx.arc(
            drawX,
            drawY,
            p.size,
            0,
            Math.PI * 2
        );

        ctx.fill();


        /*
           Occasional cross-shaped sparkle.
        */

        if (
            p.size > 2 &&
            animationPhase !== "idle"
        ) {

            ctx.globalAlpha *= .7;

            ctx.strokeStyle = accent;

            ctx.lineWidth = .5;

            ctx.beginPath();

            ctx.moveTo(
                drawX - 5,
                drawY
            );

            ctx.lineTo(
                drawX + 5,
                drawY
            );

            ctx.moveTo(
                drawX,
                drawY - 5
            );

            ctx.lineTo(
                drawX,
                drawY + 5
            );

            ctx.stroke();

        }

    });


    ctx.shadowBlur = 0;
    ctx.globalAlpha = 1;

}


/* ============================================================
   ANIMATION
============================================================ */

function animate(time) {

    drawBackground();

    drawGalaxy(time);


    /*
       NAME PHASE
       -----------
       After the complete KIM NAMJOON formation
       finishes, switch to birthday phrase.
    */

    if (
        animationPhase === "name" &&
        performance.now() - phaseStartedAt >= 7000
    ) {

        animationPhase = "birthday";

        phaseStartedAt =
            performance.now();

        assignTextTargets(
            birthdayText
        );

        starStatus.textContent =
            "And now, every star carries a birthday wish.";

    }


    /*
       BIRTHDAY PHASE
       --------------
       Remains completely visible afterward.
    */

    if (
        animationPhase === "birthday" &&
        performance.now() - phaseStartedAt >= 7000
    ) {

        animationPhase = "settled";

        /*
           Reassign once more to ensure every
           star stays exactly where it belongs.
        */

        assignTextTargets(
            birthdayText
        );

        starStatus.textContent =
            "HAPPY BIRTHDAY NAMJOON · From Africa, with love.";

    }


    requestAnimationFrame(animate);

}


/* ============================================================
   START STAR FIELD
============================================================ */

function initialiseStars() {

    resizeCanvas();

    createGalaxy();

    /*
       IMPORTANT:
       We do NOT assign any text here.

       Therefore when the page opens there is
       absolutely NO "KIM NAMJOON" text in the
       star field.
    */

    animationPhase = "idle";

    starStatus.textContent =
        "A sky full of wishes is waiting for you.";

    requestAnimationFrame(animate);

}


window.addEventListener(
    "resize",
    resizeCanvas
);

initialiseStars();


/* ============================================================
   SEND THE WISH
============================================================ */

let wishRunning = false;

sendWish.addEventListener("click", () => {

    /*
       If already finished, allow the user to
       replay the entire formation.
    */

    if (wishRunning) return;

    wishRunning = true;


    /*
       Start with the clean galaxy again.
    */

    particles.forEach(p => {

        const fresh =
            randomParticle();

        p.x = fresh.x;
        p.y = fresh.y;

        p.homeX = fresh.homeX;
        p.homeY = fresh.homeY;

        p.targetX =
            width / 2;

        p.targetY =
            height / 2;

    });


    /*
       ONLY NOW do we create the
       KIM NAMJOON target.
    */

    assignTextTargets(
        nameText
    );

    animationPhase = "name";

    phaseStartedAt =
        performance.now();

    starStatus.textContent =
        "Look... our light is writing his name.";


    /*
       Re-enable button after the animation
       has completed.
    */

    setTimeout(() => {

        wishRunning = false;

    }, 14500);

});


/* ============================================================
   PUBLIC WISH WALL
============================================================ */

function escapeText(value) {

    /*
       We render using textContent below, but
       this helper also normalises whitespace.
    */

    return String(value || "")
        .replace(/\r\n/g, "\n")
        .trim();

}


function renderWishes(wishes) {

    wishList.innerHTML = "";

    if (!wishes.length) {

        const empty =
            document.createElement("div");

        empty.className = "wish-loading";

        empty.textContent =
            "Be the first ARMY to leave a birthday wish.";

        wishList.appendChild(empty);

        return;
    }


    wishes.forEach(wish => {

        const article =
            document.createElement("article");

        article.className = "wish-entry";


        const head =
            document.createElement("div");

        head.className =
            "wish-entry-head";


        const name =
            document.createElement("strong");

        name.className =
            "wish-entry-name";

        name.textContent =
            escapeText(wish.name);


        const place =
            document.createElement("span");

        place.className =
            "wish-entry-place";

        place.textContent =
            escapeText(wish.place);


        const message =
            document.createElement("p");

        message.className =
            "wish-entry-message";

        message.textContent =
            escapeText(wish.message);


        head.appendChild(name);
        head.appendChild(place);

        article.appendChild(head);
        article.appendChild(message);

        wishList.appendChild(article);

    });

}


async function loadWishes() {

    try {

        const response =
            await fetch(
                `${API_BASE}/api/wishes`,
                {
                    cache: "no-store"
                }
            );


        if (!response.ok) {
            throw new Error(
                "Could not load wishes."
            );
        }


        const data =
            await response.json();


        renderWishes(
            Array.isArray(data.wishes)
                ? data.wishes
                : []
        );


    } catch (error) {

        wishList.innerHTML = "";

        const errorBox =
            document.createElement("div");

        errorBox.className =
            "wish-loading";

        errorBox.textContent =
            "The wish wall will appear when the Python server is running.";

        wishList.appendChild(errorBox);

    }

}


wishForm.addEventListener(
    "submit",
    async event => {

        event.preventDefault();


        const name =
            document.getElementById(
                "wishName"
            ).value.trim();

        const place =
            document.getElementById(
                "wishPlace"
            ).value.trim();

        const message =
            document.getElementById(
                "wishMessage"
            ).value.trim();


        if (!name || !place || !message) {

            formStatus.textContent =
                "Please complete all three fields.";

            return;

        }


        formStatus.textContent =
            "Sending your wish...";


        try {

            const response =
                await fetch(
                    `${API_BASE}/api/wishes`,
                    {
                        method: "POST",

                        headers: {
                            "Content-Type":
                                "application/json"
                        },

                        body: JSON.stringify({
                            name,
                            place,
                            message
                        })
                    }
                );


            const data =
                await response.json();


            if (!response.ok) {

                throw new Error(
                    data.error ||
                    "Could not send your wish."
                );

            }


            wishForm.reset();

            formStatus.textContent =
                "Your wish is now part of the universe ✦";


            renderWishes(
                Array.isArray(data.wishes)
                    ? data.wishes
                    : []
            );


        } catch (error) {

            formStatus.textContent =
                error.message ||
                "Something went wrong. Try again.";

        }

    }
);


/*
   Keep the public wall fresh.
*/

loadWishes();

setInterval(
    loadWishes,
    15000
);

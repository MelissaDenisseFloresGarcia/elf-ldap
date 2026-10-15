const express = require("express");
const { rateLimit, ipKeyGenerator } = require("express-rate-limit");
const cors = require("cors");
const jwt = require("jsonwebtoken");
const https = require("https");
const fs = require("fs");

const app = express();

const PORT = 3001;
const TLS_PORT = 636;

const SECRET_KEY = process.env.JWT_SECRET;

if (!SECRET_KEY) {
    throw new Error("JWT_SECRET environment variable is required");
}


// Crear carpeta de logs
fs.mkdirSync("/app/logs", { recursive: true });


// Obtener IP del cliente
function getClientIp(req) {
    const ip = req.socket.remoteAddress || "-";
    return ip.replace(/^::ffff:/, "");
}


// Registro HTTP/TLS para Fail2Ban
function accessLogger(req, res, next) {

    res.on("finish", () => {

        const ip = getClientIp(req);
        const safeUrl = req.originalUrl.replace(/[\x00-\x1F\x7F]/g, "_");

        const logLine =
            `${new Date().toISOString()} ${ip} "${req.method} ${safeUrl}" ${res.statusCode}\n`;

        const logFile = req.socket.encrypted
            ? "/app/logs/tls.log"
            : "/app/logs/http.log";

        fs.appendFile(
            logFile,
            logLine,
            (error) => {

                if (error) {
                    console.error(
                        "Error writing access log:",
                        error
                    );
                }

            }
        );

    });

    next();
}


app.use(cors());

app.use(express.json());


// Activar registro HTTP/TLS
app.use(accessLogger);


const LDAP_USERNAME = process.env.LDAP_USERNAME;
const LDAP_PASSWORD = process.env.LDAP_PASSWORD;

if (!LDAP_USERNAME || !LDAP_PASSWORD) {
    throw new Error("LDAP_USERNAME and LDAP_PASSWORD are required");
}

const users = [
    {
        username: LDAP_USERNAME,
        password: LDAP_PASSWORD,
        role: "user"
    }
];


const loginLimiter = rateLimit({
    windowMs: 10 * 60 * 1000,
    limit: 5,
    standardHeaders: "draft-8",
    legacyHeaders: false,
    keyGenerator: (req) => ipKeyGenerator(getClientIp(req)),
    message: {
        message: "Too many login attempts. Try again later."
    }
});

app.post("/login", loginLimiter, (req, res) => {

    const { username, password } = req.body;

    const user = users.find(
        u =>
            u.username === username &&
            u.password === password
    );

    if (!user) {

        return res.status(401).json({
            message: "Invalid credentials"
        });

    }

    const token = jwt.sign(
        {
            username: user.username,
            role: user.role
        },
        SECRET_KEY,
        {
            expiresIn: "1h"
        }
    );

    res.json({
        message: "Login successful",
        token
    });

});


// HTTP
app.listen(PORT, () => {

    console.log(
        `LDAP API running on port ${PORT}`
    );

});


// HTTPS / TLS
const tlsOptions = {

    key: fs.readFileSync("/app/certs/server.key"),

    cert: fs.readFileSync("/app/certs/server.crt")

};


https.createServer(
    tlsOptions,
    app
).listen(TLS_PORT, () => {

    console.log(
        `LDAP API TLS running on port ${TLS_PORT}`
    );

});
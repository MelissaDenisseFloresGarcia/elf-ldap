const express = require("express");
const cors = require("cors");
const jwt = require("jsonwebtoken");
const https = require("https");
const fs = require("fs");

const app = express();

const PORT = 3001;
const TLS_PORT = 636;

const SECRET_KEY = process.env.JWT_SECRET || "elf-secret-key";


// Crear carpeta de logs
fs.mkdirSync("/app/logs", { recursive: true });


// Obtener IP del cliente
function getClientIp(req) {

    const forwarded = req.headers["x-forwarded-for"];

    let ip = forwarded
        ? forwarded.split(",")[0].trim()
        : req.socket.remoteAddress || "-";

    ip = ip.replace(/^::ffff:/, "");

    return ip;
}


// Registro HTTP/TLS para Fail2Ban
function accessLogger(req, res, next) {

    res.on("finish", () => {

        const ip = getClientIp(req);

        const logLine =
            `${new Date().toISOString()} ${ip} "${req.method} ${req.originalUrl}" ${res.statusCode}\n`;

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


// Usuarios simulados LDAP
const users = [
    {
        username: "admin",
        password: "123456",
        role: "user"
    }
];


app.post("/login", (req, res) => {

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
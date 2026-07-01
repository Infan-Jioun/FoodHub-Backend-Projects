import jwt from "jsonwebtoken";

export const verifyToken = (req, res, next) => {
    if (!req.headers.authorization) {
        return res.status(401).send({ message: "Unauthorized access" });
    }
    const token = req.headers.authorization.split(" ")[1];
    jwt.verify(token, process.env.JWT_WEB_TOKEN, (err, decoded) => {
        if (err) {
            return res.status(403).send({ message: "forbidden access" });
        }
        req.decoded = decoded;
        next();
    });
};

export const verifyRole = (role, usersCollection) => {
    return async (req, res, next) => {
        const email = req.decoded.email;
        const user = await usersCollection.findOne({ email });
        if (!user || user.role !== role) {
            return res.status(403).send({ message: "forbidden access" });
        }
        next();
    };
};
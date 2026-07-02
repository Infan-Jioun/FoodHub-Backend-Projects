import { app } from "./app.js";
import dotenv from "dotenv";
dotenv.config();

const port = process.env.PORT || 5000;

if (process.env.NODE_ENV !== "production") {
    app.listen(port, () => {
        console.log(`FoodHub server running on port ${port}`);
    });
}

export default app; 
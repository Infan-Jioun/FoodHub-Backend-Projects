import app from "./app.js";
const port = process.env.PORT || 5000;



app.listen(port || 5000, () => {
    console.log(`Signnel crud server ${port || 5000} is running`);
})
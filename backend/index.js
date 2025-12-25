import dotenv from 'dotenv'
import db from "./src/db/index.js";
import app from './app.js';

dotenv.config({
    path: './.env'
});

app.route("/", (req, res) => {
    res.send("Hello World")
})
if(db){
    app.listen(process.env.PORT, () => {
        console.log(`Server is running on port : ${process.env.PORT}`);
    })
}
else{
    console.log("Error in DB connection")
}
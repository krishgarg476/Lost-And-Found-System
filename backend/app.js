import express, { urlencoded } from "express";
import cors from "cors";
import cookieParser from "cookie-parser";

const app = express();
app.use(express.json());
app.use(cors({
    origin : 'http://localhost:5173',
    credentials : true
}));

app.use(express.json({limit : "16kb"}))
app.use(urlencoded({limit : "16kb" , extended : true}))
app.use(express.static("public"));
app.use(cookieParser())


//importing routes
import userRoutes from "./src/routes/user.route.js";
import lostItemsRoutes from "./src/routes/lost_items.routes.js";
import foundItemsRoutes from "./src/routes/found_items.routes.js";
import claimsRoutes from "./src/routes/claims.routes.js";
import reportLostFoundRoutes from "./src/routes/reportLostItemsfound.routes.js";
import categoryRoutes from "./src/routes/category.routes.js";

app.use("/api/user", userRoutes)
app.use("/api/lost-items", lostItemsRoutes)
app.use("/api/found-items", foundItemsRoutes)
app.use("/api/claims", claimsRoutes)
app.use("/api/report-lost-found", reportLostFoundRoutes)
app.use("/api/category", categoryRoutes)
export default app;

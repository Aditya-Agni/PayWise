import "dotenv/config";
import { mongooseConnection } from "./db/index.js";
import { app } from "./app.js";

mongooseConnection().then(() =>
  app.listen(process.env.PORT || 3000, () => {
    console.log("app listenting at port:" + process.env.PORT);
  }),
);

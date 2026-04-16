//Author Jutsu78 (Oleksii)
import app from "./app";
import {ENV} from "./config/env";

app.listen(ENV.PORT, () => {
    console.log(`Server is running on port ${ENV.PORT}`);
});
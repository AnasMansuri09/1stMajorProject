const mongoose = require("mongoose");
const initdata = require("./data.js");
const Listing = require("../models/listing.js");


const MNGO_URL = "mongodb://127.0.0.1:27017/wanderlust";

main().then(() => {
    console.log("succesfully connected to mongodb");
}).catch((err) => {
    console.log(err);
});

async function main() {
    await mongoose.connect(MNGO_URL);

}

const initDB = async () => {
    await Listing.deleteMany({});
    initdata.data = initdata.data.map((obj) => ({
        ...obj,
         owner: "672a2761df6f9aca326c274c"}));
    console.log(initdata.data);
    await Listing.insertMany(initdata.data);
}

initDB().then(() => {
    console.log("data has gone saved succesfuly");
}).catch((err) => {
    console.log(err);
});



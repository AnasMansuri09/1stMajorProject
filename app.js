if(process.env.NODE_ENV != "production") {
    require("dotenv").config();
}

console.log(process.env.SECRET);

const express = require("express");
const app = express();
const methodOverride = require("method-override");
const path = require("path");
const mongoose = require("mongoose");
const ejsMate = require("ejs-mate");
const wrapAsync = require("./utils/wrapAsync.js");
const ExpressError = require("./utils/ExpressError.js");
const Listing = require("./models/listing.js");

const listingsRouter = require("./routes/listings.js");
const reviewsRouter = require("./routes/review.js");
const usersRouter = require("./routes/user.js");

const session = require("express-session");
const MongoStore = require("connect-mongo");
const flash = require("connect-flash");
const passport = require("passport");
const LocalStrategy = require("passport-local");
const User = require("./models/user.js");





// app.set("view engine", "views");
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));
app.use(express.static(path.join(__dirname, "public")));
app.use(express.urlencoded({extended: true}));
app.use(methodOverride("_method"));
app.engine("ejs", ejsMate);


// const MONGO_URL = "mongodb://127.0.0.1:27017/wanderlust";
const dbUrl = process.env.ATLASDB_URL;
console.log(process.env.ATLASDB_URL);

main().then(() => {
    console.log("succesfully connected to mongodb");
}).catch((err) => {
    console.log(err);
});

async function main() {
    await mongoose.connect(dbUrl);

}

const store = MongoStore.create({
    mongoUrl: dbUrl,
    crypto: {
        secret: process.env.SECRET,
    },
    touchAfter: 24 * 3600,

});

store.on("error", () => {
    console.log("Error in mongos session store", error); 

});

const secretOptions = {
    store,
    secret: process.env.SECRET,
    resave: false,
    saveUninitialized : true,
    cookie: {
        expires: Date.now() + 7*24*60*60*1000,
        maxAge: 7*24*60*60*1000,
        httpOnly: true
    }

}





// root route
app.get("/", wrapAsync(async (req, res) => {

    res.redirect("/listings");
}));

app.use(session(secretOptions));
app.use(flash());

app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy(User.authenticate()));

passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());


app.use((req, res, next) => {
    res.locals.success = req.flash("success");
    res.locals.error = req.flash("error");
    res.locals.currUser = req.user;
    next();
});


app.use("/listings", listingsRouter);
app.use("/listings/:id/reviews", reviewsRouter);
app.use("/", usersRouter);


app.all("*", (req, res, next) => {
    next(new ExpressError(402, "Page Not Found"));
});

app.use((err, req, res, next) => {
    let { statusCode = 500, message = "Somethig went wrong"} = err;
    res.status(statusCode).render("error.ejs", {message});
});

app.listen(3000, (req, res) => {
    console.log("express working");
});
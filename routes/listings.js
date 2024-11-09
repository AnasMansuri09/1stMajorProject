const express = require("express");
const router = express.Router();

const Listing = require("../models/listing.js");
const wrapAsync = require("../utils/wrapAsync.js");
const ExpressError = require("../utils/ExpressError.js");
const {listingSchema, reviewSchema} = require("../schema.js");
const { isLoggedIn, isOwner , ValidateListing} = require("../middleware.js");
const multer  = require('multer');
const {storage} = require("../cloudConfig.js")
const upload = multer({storage});



//index route
router.get("/", wrapAsync( async (req, res) => {
    let allListings = await Listing.find({});
    res.render("listings/index.ejs", {allListings});
}));

//new route
router.get("/new",isLoggedIn,  (req, res) => {
    
    res.render("listings/new.ejs");
});

//create route

// router.post("/", upload.single("listings[image]"), async(req, res) => {
//     res.send(req.file);
// });

router.post("/",isLoggedIn, 
    upload.single("listings[image]"),
    ValidateListing,
     wrapAsync( async (req, res) => {
        let url = req.file.path;
        let filename = req.file.filename;
    
    const newlisting = new Listing(req.body.listings);
    newlisting.owner = req.user._id,
    newlisting.image = {url, filename};
   await newlisting.save();
   req.flash("success", "New Listing Created");
   res.redirect("/listings");
    
}));

//edit form route
router.get("/:id/edit",isLoggedIn, isOwner, wrapAsync(  async (req, res) => {
    let {id} = req.params;
    
    let listing = await Listing.findById(id);


    res.render("listings/edit.ejs", {listing});
}));

//update route
router.put("/:id",isLoggedIn, isOwner, upload.single("listings[image]"), ValidateListing, wrapAsync( async (req, res) => {
    let {id} = req.params;
    let listing = await Listing.findByIdAndUpdate(id, { ...req.body.listings});

    if(typeof req.file != "undefined") {
        let url = req.file.path;
    let filename = req.file.filename;
    listing.image = {url, filename};
    await listing.save();

    }
    req.flash("success", "Listing updated");
    res.redirect(`/listings/${id}`);
}));

//delete route
router.delete("/:id", isLoggedIn, isOwner, wrapAsync( async (req, res) => {
    let {id} = req.params;
    await Listing.findByIdAndDelete(id);
   
   req.flash("success", "Listing Deleted");
   res.redirect("/listings");

}));



//show route
router.get("/:id", wrapAsync( async (req, res) => {

    let {id} = req.params;
    const listing = await Listing.findById(id).
    populate({
        path: "reviews", 
       populate: {
        path: "author",

       },
    })
       .populate("owner");

    if(!listing) {
        req.flash("error", "Listing you requested does not exist");
        res.redirect("/listings");
       } 
        res.render("listings/show.ejs", {listing});
    
}));

module.exports = router;
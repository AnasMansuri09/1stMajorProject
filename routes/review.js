const express = require("express");
const router = express.Router({mergeParams: true});
const wrapAsync = require("../utils/wrapAsync.js");
const ExpressError = require("../utils/ExpressError.js");
const {listingSchema, reviewSchema} = require("../schema.js");
const Review = require("../models/review.js");
const Listing = require("../models/listing.js");
const {ValidateReview, isLoggedIn, isReveiwAuthor}= require("../middleware.js");




// /listing/id/reviews pr get requiest error de rhi hai
//reveiws add route
router.post("/",isLoggedIn, ValidateReview, wrapAsync(async (req, res) => {
    let listing = await Listing.findById(req.params.id);
        let newReview = new Review(req.body.review);
           newReview.author = req.user._id;
           console.log(newReview);
    
        listing.reviews.push(newReview);
    
        await newReview.save();
        await listing.save();
        console.log("new review added");
        req.flash("success", "New Review Created");
        res.redirect(`/listings/${listing._id}`);
    }));
    
    
    // reveiw delete route
    router.delete("/:reviewId",isLoggedIn, isReveiwAuthor, wrapAsync( async (req, res) => {
        let { id, reviewId} = req.params;
        //"/listings/672ae4c25d2c083740f78536/reviews/672b939deb083b0c280c9e6a?_method=DELETE"
    
        await Listing.findByIdAndUpdate(id , {$pull: {reviews: reviewId}});
        await Review.findByIdAndDelete(reviewId);
        req.flash("success", "Review Deleted");
    
        res.redirect(`/listings/${id}`);
    }));

    module.exports =router;
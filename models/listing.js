const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const Review = require("./review.js");

const listingSchema = new Schema({
    title: {
        type: String,
        require: true
    },
    description: {
        type: String,
    },
    location: {
        type: String,
    },
    image: {
        url: String,
        filename: String,
         },
    country: {
        type: String 
       }, 
       price: {
        type: Number,
        require: true
       },
     reviews: [{
        type: Schema.Types.ObjectId,
        ref: "Review"
       }],
       owner: {
        type: Schema.Types.ObjectId,
        ref: "User"
       }
});


listingSchema.post("findOneAndDelete", async (listing) => {
    if(listing) {
        await Review.deleteMany({ _id: {$in: listing.reviews}});
    }
});

const Listing = mongoose.model("Listing", listingSchema);

module.exports = Listing;
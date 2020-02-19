import { connect, find } from "../../../utils/mongo";

/**
 * Refer to https://nextjs.org/docs/api-routes/introduction
 * 
 * This file routes to the endpoint /api/location/nearby
 * 
 * Takes in coordinates and uses it to query MongoDB and returns nearby locations
 */

export default async (req, res) => {
    // Listen for POST request
    if (req.method === "POST") {
        // Get the value
        const coords = req.body;

        // Create the query
        const query = {
            loc: {
                $near: {
                    $geometry: {
                        type: "Point",
                        coordinates: [coords.long, coords.lat]
                    },
                    $maxDistance: 100000
                }
            }
        };

        try {
            // Get the docs and return it
            const docs = await queryNearbyDocs(query);

            return res.status(200).json(docs);
        } catch (e) {
            // TODO: Error handling 
            console.log(e);
        }
    } else {
        // TODO: Handle any other requests
    }
}

/**
 * Query db for all matching documents
 * @param {*} query 
 */
async function queryNearbyDocs(query) {
    try {
        // Connect to MongoDB
        const db = await connect();

        // Get every matching document in MongoDB
        const docs = await find(db, query);

        return docs;
    } catch (e) {
        // TODO: Add error handler
        console.log(e);
    }
}
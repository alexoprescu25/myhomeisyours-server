import createError from 'http-errors';
import { handleError } from '../utils/index.js';
import fetch from 'node-fetch';

const apiKey = process.env['Tom:ApiKey'];
const adminKey = process.env['Tom:AdminKey'];
const versionNumber = process.env['Tom:VersionNumber'];
const baseUrl = process.env['Tom:BaseUrl'];
const ext = process.env['Tom:Ext'];

export const handleMap = async (req, res, next) => {
    const { query } = req.body;
    const encodedQuery = encodeURIComponent(query);

    const urls = {
        adminKey: `https://${baseUrl}/geofencing/1/register?key=${apiKey}`,
        geoCode: `https://${baseUrl}/search/${versionNumber}/geocode/${encodedQuery}.${ext}?key=${apiKey}`,
        nearbySearch: `https://${baseUrl}/search/${versionNumber}/nearbySearch/.${ext}?key=${apiKey}`
    }

    try {
        const geoCode = await fetch(urls.geoCode);
        const data = await geoCode.json();

        if (!data || (!data.results || data.results === 0)) {
            throw new createError(
                404,
                'Geo location not found',
                { expose: true }
            )
        }

        // const { lat, lon } = data.results[0].position;

        res.status(200).json({
            success: true,
            results: data.results
        })
    } catch (err) {
        handleError(res, err);
    }
}
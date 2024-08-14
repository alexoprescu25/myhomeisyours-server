import mongoose from 'mongoose';
const Schema = mongoose.Schema;

import slug from 'mongoose-slug-updater';
mongoose.plugin(slug);

const address = {
    street: { type: String, default: '' },
    number: { type: String, default: '' },
    city: { type: String, default: '' },
    state: { type: String, default: '' },
    zip: { type: String, default: '' },
    freeFormAddress: { type: String, default: '' },
    position: {
        type: { type: String, enum: ['Point'], required: true },
        coordinates: { type: [Number], required: true }
    }
};

const imageSchema = new Schema({
    key: { type: String, required: true },
    name: { type: String, required: true },
    url: { type: String, required: true },
    thumbnail: { type: Boolean, default: false }
});

const videoSchema = new Schema({
    name: { type: String, required: true },
    url: { type: String, required: true },
    type: { type: String, required: true }
});

const bedroomSchema = new Schema({
    type: { type: String },
    name: { type: String },
    beds: { type: Array }
});

const livingRoomSchema = new Schema({
    type: { type: String },
    name: { type: String },
    beds: { type: Array }
});

const bathroomSchema = new Schema({
    type: { type: String },
    value: { type: String }
});

const sellingPointSchema = new Schema({
    text: { type: String }
});

const updatedBySchema = new Schema({
    name: { type: String, required: true },
    userId: { type: Schema.Types.ObjectId, required: true }
}, { timestamps: true });

const schema = new Schema({
    name: { type: String, required: true },
    images: [imageSchema],
    videos: [videoSchema],
    address: address,
    numberOfBedrooms: { type: Number, default: 0 },
    numberOfBathrooms: { type: Number, default: 0 },
    numberOfBeds: { type: Number, default: 0 },
    description: { type: String, default: '' },
    alias: { type: String, slug: ["name"], permanent: true, unique: true },
    type: { type: String, required: true },
    summary: {
        general: {
            parking: {
                name: { type: String, required: true, default: 'Parking' },
                value: { type: String, required: true, default: 'parking' },
                isAvailable: { type: Boolean, required: true }
            },
            petFriendly: {
                name: { type: String, required: true, default: 'Pet Friendly' },
                value: { type: String, required: true, default: 'petFriendly' },
                isAvailable: { type: Boolean, required: true }
            },
            tv: {
                name: { type: String, required: true, default: 'TV' },
                value: { type: String, required: true, default: 'tv' },
                isAvailable: { type: Boolean, required: true }
            },
            wifi: {
                name: { type: String, required: true, default: 'Wi-Fi' },
                value: { type: String, required: true, default: 'wifi' },
                isAvailable: { type: Boolean, required: true }
            },
            ventilation: {
                name: { type: String, required: true, default: 'Ventilation' },
                value: { type: String, required: true, default: 'ventilation' },
                isAvailable: { type: Boolean, required: true }
            },
            workspace: {
                name: { type: String, required: true, default: 'Workspace' },
                value: { type: String, required: true, default: 'workspace' },
                isAvailable: { type: Boolean, required: true }
            },
            elevator: {
                name: { type: String, required: true, default: 'Lift' },
                value: { type: String, required: true, default: 'elevator' },
                isAvailable: { type: Boolean, required: true }
            }
        },
        kitchen: {
            microwave: {
                name: { type: String, required: true, default: 'Microwave' },
                value: { type: String, required: true, default: 'microwave' },
                isAvailable: { type: Boolean, required: true }
            },
            oven: {
                name: { type: String, required: true, default: 'Oven' },
                value: { type: String, required: true, default: 'oven' },
                isAvailable: { type: Boolean, required: true }
            },
            hob: {
                name: { type: String, required: true, default: 'Hob' },
                value: { type: String, required: true, default: 'hob' },
                isAvailable: { type: Boolean, required: true }
            },
            fridge: {
                name: { type: String, required: true, default: 'Fridge' },
                value: { type: String, required: true, default: 'fridge' },
                isAvailable: { type: Boolean, required: true }
            },
            freezer: {
                name: { type: String, required: true, default: 'Freezer' },
                value: { type: String, required: true, default: 'freezer' },
                isAvailable: { type: Boolean, required: true }
            },
            kettle: {
                name: { type: String, required: true, default: 'Kettle' },
                value: { type: String, required: true, default: 'kettle' },
                isAvailable: { type: Boolean, required: true }
            },
            toaster: {
                name: { type: String, required: true, default: 'Toaster' },
                value: { type: String, required: true, default: 'toaster' },
                isAvailable: { type: Boolean, required: true }
            },
            dishwasher: {
                name: { type: String, required: true, default: 'Dishwasher' },
                value: { type: String, required: true, default: 'dishwasher' },
                isAvailable: { type: Boolean, required: true }
            }
        },
        laundry: {
            washingMachine: {
                name: { type: String, required: true, default: 'Washing Machine' },
                value: { type: String, required: true, default: 'washingMachine' },
                isAvailable: { type: Boolean, required: true }
            },
            clothesHorse: {
                name: { type: String, required: true, default: 'Clother Horse' },
                value: { type: String, required: true, default: 'clothesHorse' },
                isAvailable: { type: Boolean, required: true }
            },
            iron: {
                name: { type: String, required: true, default: 'Iron' },
                value: { type: String, required: true, default: 'iron' },
                isAvailable: { type: Boolean, required: true }
            },
            tumbleDryer: {
                name: { type: String, required: true, default: 'Tumble Dryer' },
                value: { type: String, required: true, default: 'tumbleDryer' },
                isAvailable: { type: Boolean, required: true }
            }
        },
        outside: {
            garden: {
                name: { type: String, required: true, default: 'Garden' },
                value: { type: String, required: true, default: 'garden' },
                isAvailable: { type: Boolean, required: true }
            },
            balcony: {
                name: { type: String, required: true, default: 'Balcony' },
                value: { type: String, required: true, default: 'balcony' },
                isAvailable: { type: Boolean, required: true }
            },
            patio: {
                name: { type: String, required: true, default: 'Patio' },
                value: { type: String, required: true, default: 'patio' },
                isAvailable: { type: Boolean, required: true }
            },
            bbq: {
                name: { type: String, required: true, default: 'Barbecue' },
                value: { type: String, required: true, default: 'bbq' },
                isAvailable: { type: Boolean, required: true }
            },
        },
        safety: {
            carbonMonoxideAlarm: {
                name: { type: String, required: true, default: 'Carbon Monoxide Alarm' },
                value: { type: String, required: true, default: 'carbonMonoxideAlarm' },
                isAvailable: { type: Boolean, required: true }
            },
            smokeAlarm: {
                name: { type: String, required: true, default: 'Smoke Alarm' },
                value: { type: String, required: true, default: 'smokeAlarm' },
                isAvailable: { type: Boolean, required: true }
            },
            gasCertificate: {
                name: { type: String, required: true, default: 'Gas Certificate' },
                value: { type: String, required: true, default: 'gasCertificate' },
                isAvailable: { type: Boolean, required: true }
            },
            eicrRates: {
                name: { type: String, required: true, default: 'EICR Rates' },
                value: { type: String, required: true, default: 'eicrRates' },
                isAvailable: { type: Boolean, required: true }
            },
        }
    },
    floor: { type: Number, default: 0 },
    floorplan: {
        key: { type: String, default: '' },
        name: { type: String, default: '' },
        url: { type: String, default: '' }
    },
    parkingType: { value: { type: String } },
    checkInProcess: { value: { type: String } }, 
    checkIn: { type: String },
    checkOut: { type: String },
    petsPolicy: { value: { type: String } },
    housekeeping: { value: { type: String } },
    bedrooms: [bedroomSchema],
    bathrooms: [bathroomSchema],
    livingRooms: [livingRoomSchema],
    sellingPoints: [sellingPointSchema],
    livePropertyLink: { type: String, default: '' },
    cancellation: { type: String, required: true, default: 'Non refundable' },
    createdBy: { type: Schema.Types.ObjectId, required: true },
    updatedBy: [updatedBySchema],
    booking: { type: Boolean, required: true, default: false },
    isActive: { type: Boolean, required: true, default: true },
    isDeleted: { type: Boolean, required: true, default: false },
    landlord: {
        name: { type: String },
        email: { type: String },
        phone: { type: String },
        nightlyRate: { type: String },
        deposit: { type: String },
        cleaningFee: { type: String },
        parking: { type: String },
        petFee: { type: String },
        other: { type: String },
        quoteOutDate: { type: String },
        status: { type: String },
        margin: { type: String }
    },
    external: {
        nightlyRate: { type: String },
        deposit: { type: String },
        cleaningFee: { type: String },
        parking: { type: String }
    }
}, { timestamps: true })

schema.index({ 'address.position': '2dsphere' });

const Account =  mongoose.model('Property', schema);

export default Account;
import mongoose from 'mongoose';
const Schema = mongoose.Schema;

const schema = new Schema({
    name: { type: String, required: true },
    email: { type: String, required: true },
    phone: { type: String, required: true },
    supplier: String,
    identifier: String,
    checkIn: { type: Date, required: true },
    checkOut: { type: Date, required: true },
    createdBy: { type: Schema.Types.ObjectId, ref: 'Account', required: true },
    propertyId: { type: Schema.Types.ObjectId, ref: 'Property', required: true },
    other: { type: String }
}, { timestamps: true })

const Account =  mongoose.model('Guest', schema);

export default Account;
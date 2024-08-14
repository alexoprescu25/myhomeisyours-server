import mongoose from 'mongoose';
const Schema = mongoose.Schema;

import slug from 'mongoose-slug-updater';
mongoose.plugin(slug);

const userSchema = new Schema({
    firstName: { type: String, required: true },
    lastName: { type: String, required: true },
    fullName: { type: String, required: true },
    email: { type: String, required: true },
    password: { type: String, required: true },  // Added password field
    imageUrl: { type: String, required: false },
    alias: { type: String, slug: ["firstName", "lastName"], permanent: true, unique: true },
    role: { type: String, enum: ['user', 'moderator', 'admin', 'masteradmin'], required: true, default: 'user' },
    createdBy: {
        fullName: String,
        alias: String,
        _id: Schema.Types.ObjectId
    },
    resetToken: String,
    resetTokenExpiration: Date,
    isDeleted: { type: Boolean, required: true, default: false },
    isInactive: { type: Boolean, required: true, default: false }
}, { timestamps: true })

const Account =  mongoose.model('Account', userSchema);

export default Account;
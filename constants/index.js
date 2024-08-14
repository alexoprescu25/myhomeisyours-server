const mongodb = process.env.MONGO_DB;
const mongoUser = process.env.MONGO_USER;
const mongoPassword = process.env.MONGO_PASSWORD;

export const MONGO_URI = `mongodb+srv://${mongoUser}:${mongoPassword}@project1.izxymxu.mongodb.net/${mongodb}?retryWrites=true&w=majority&appName=Project1/`;
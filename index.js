
require('dotenv').config()

const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors')

const app = express();

app.use(express.json());
app.use(cors());

mongoose.set('strictQuery', false)

mongoose.connect(process.env.MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true
}).then(() => console.log('connected successfully'))
    .catch((err) => console.log('failed', err))

//user model
const userList = new mongoose.Schema({
    firstName: String,
    lastName: String,
    email: String,
    phone: String,
    userType: String,
})
const User = new mongoose.model("User", userList)

const propertyList = mongoose.Schema({
    _id: Number,
    sellerName: String,
    location: String,
    area: String,
    bedrooms: Number,
    bathrooms: Number,
    amenities: [String],
})
const Property = new mongoose.model('Property', propertyList)


app.get('/', async (req, res) => {
    res.json({ 'msg': 'working' })
})

//get users 
app.get('/getuser/:name', async (req, res) => {
    const { name } = req.params;
    const result = await User.find({ firstName: name })
    res.json(result)
})

//user registration
app.post('/register', async (req, res) => {
    const { firstName, lastName, email, phone, userType } = req.body;

    try {
        const user = new User({
            firstName,
            lastName,
            email,
            phone,
            userType,
        })
        const dataToSave = await user.save();
        res.status(200).json(dataToSave)
    }
    catch (error) {
        res.status(400).json({ message: error.message })
    }
})

//seller: post property
app.post('/properties', async (req, res) => {
    let count = await Property.find().count()
    const { sellerName, location, area, bedrooms, bathrooms, amenities } = req.body;

    try {
        const property = new Property({
            _id: count + 1,
            sellerName,
            location,
            area,
            bedrooms,
            bathrooms,
            amenities,
        });
        const dataToSave = await property.save();
        res.status(200).json(dataToSave)
    }
    catch (error) {
        res.status(400).json({ message: error.message })
    }
})

//seller : get properties of specific seller name
app.get('/properties/seller/:sellerName', async (req, res) => {
    try {
        const { sellerName } = req.params;
        const seller = await User.findOne({ firstName: sellerName })

        if (!seller) {
            return res.status(404).json({ message: 'seller not found' })
        }
        const properties = await Property.find({ sellerName })
        res.json(properties)
    }
    catch (err) {
        res.status(500).json({ message: 'server error' })
    }
})

//seller: updates properties
app.put('/properties/:id', async (req, res) => {
    const { id } = req.params;

    const { location, area, bedrooms, bathrooms, amenities } = req.body;

    const property = await Property.findByIdAndUpdate(
        id,
        { location, area, bedrooms, bathrooms, amenities },
        { new: true }
    )

    res.json(property)
})

//seller: delete property
app.delete('/properties/:id', async (req, res) => {
    const { id } = req.params;
    await Property.findByIdAndDelete(id)

    res.status(204).end()
})


//buyer: gets all properties
app.get('/properties', async (req, res) => {
    const properties = await Property.find({})
    res.json(properties)
})

app.listen(3000, () => console.log('server started at port 3000'))
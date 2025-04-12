const multer = require('multer');
const path = require('path');
const fs = require('fs');
const cloudinary = require('../utils/cloudinary');
const BucketListItem = require('../models/bucketListItemModel'); // MongoDB model for bucket list items

const storage = multer.memoryStorage(); // Using memory storage for cloudinary
const upload = multer({ storage: storage });

// ✅ Get Bucket List Items
exports.getBucketList = (req, res) => {
    const userId = req.user.id;

    BucketListItem.find({ user_id: userId })
        .then((items) => {
            res.render('bucketList', {
                items,
                user: req.user
            });
        })
        .catch((err) => {
            console.log(err);
            return res.status(500).send('Error fetching bucket list items');
        });
};

// ✅ Add Bucket List Item
exports.addItem = (req, res) => {
    const { name } = req.body;
    const userId = req.user.id;

    const newItem = new BucketListItem({ name, user_id: userId });

    newItem.save()
        .then(() => res.redirect('/bucket'))
        .catch((err) => {
            console.log(err);
        });
};

// ✅ Add Story to Item
exports.addStory = (req, res) => {
    const { id } = req.params;
    const { story } = req.body;

    BucketListItem.findByIdAndUpdate(id, { story }, { new: true })
        .then(() => res.redirect('/bucket'))
        .catch((err) => {
            console.error('Error updating story:', err);
            res.status(500).send('Error updating story');
        });
};

// ✅ Delete Item
exports.deleteItem = (req, res) => {
    const { id } = req.params;

    BucketListItem.findById(id)
        .then((item) => {
            if (item.image_url) {
                const imagePath = path.join(__dirname, '..', 'uploads', path.basename(item.image_url));
                fs.unlink(imagePath, (unlinkErr) => {
                    if (unlinkErr) {
                        console.error('Error deleting image file:', unlinkErr);
                    } else {
                        console.log('Image file deleted successfully.');
                    }
                });
            }

            return BucketListItem.findByIdAndDelete(id);
        })
        .then(() => res.redirect('/bucket'))
        .catch((err) => {
            console.error(err);
            return res.status(500).send('Error deleting item from the database.');
        });
};

// ✅ Check/Uncheck Item
exports.checkItem = (req, res) => {
    const { id } = req.params;
    const { is_checked } = req.body;

    BucketListItem.findByIdAndUpdate(id, { checked: is_checked === 'on' }, { new: true })
        .then(() => res.redirect('/bucket'))
        .catch((err) => {
            console.log(err);
        });
};

// ✅ Upload Image to Cloudinary
exports.uploadImage = [
    upload.single('image'),
    async (req, res) => {
        const { id } = req.params;

        try {
            const result = await cloudinary.uploader.upload_stream(
                { folder: 'bucket_list_images' },
                async (error, result) => {
                    if (error) {
                        console.error('Cloudinary upload error:', error);
                        return res.status(500).send('Cloudinary upload failed.');
                    }

                    const imageUrl = result.secure_url;

                    // Update image URL in the database
                    await BucketListItem.findByIdAndUpdate(id, { image_url: imageUrl }, { new: true });
                    res.redirect('/bucket');
                }
            );

            if (req.file && req.file.buffer) {
                result.end(req.file.buffer);
            } else {
                return res.status(400).send('No image file provided.');
            }
        } catch (err) {
            console.error('Unexpected error:', err);
            res.status(500).send('Unexpected error occurred.');
        }
    },
];

// ✅ Get All Image URLs (used for gallery)
exports.getImages = (req, res) => {
    const userId = req.user.id;

    BucketListItem.find({ user_id: userId })
        .select('image_url')
        .then((items) => {
            const imageUrls = items.map((item) => item.image_url);
            res.json(imageUrls);
        })
        .catch((err) => {
            console.log(err);
            return res.status(500).send('Error fetching images');
        });
};

// ✅ Fetch Items with Story & Image for Public Stories Page
exports.fetchBucketListItems = (req, res) => {
    BucketListItem.aggregate([
        {
            $match: { image_url: { $ne: null }, story: { $ne: null } }
        },
        {
            $lookup: {
                from: 'users', // Assuming you have a 'users' collection in MongoDB
                localField: 'user_id',
                foreignField: '_id',
                as: 'user'
            }
        },
        {
            $unwind: '$user'
        },
        {
            $project: {
                item_name: '$name',
                image_url: 1,
                story: 1,
                user_name: '$user.name'
            }
        }
    ])
        .then((items) => {
            if (items.length === 0) {
                return res.status(404).send('No bucket list items found');
            }
            res.render('stories', { items });
        })
        .catch((err) => {
            console.error('Error fetching bucket list items:', err);
            return res.status(500).send('Error fetching bucket list items');
        });
};

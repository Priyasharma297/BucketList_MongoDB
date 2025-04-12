const express = require('express');
const router = express.Router();
const bucketController = require('../controllers/bucket');
const { verifyToken } = require('../middleware/authMiddleware');

router.get('/', verifyToken, bucketController.getBucketList);
router.post('/add', verifyToken, bucketController.addItem);
router.post('/delete/:id', verifyToken, bucketController.deleteItem);
router.post('/check/:id', verifyToken, bucketController.checkItem);
router.post('/upload/:id', verifyToken, bucketController.uploadImage);
router.post('/addstory/:id', verifyToken, bucketController.addStory);
router.get('/images', verifyToken, bucketController.getImages);
router.get('/stories', bucketController.fetchBucketListItems);

module.exports = router;


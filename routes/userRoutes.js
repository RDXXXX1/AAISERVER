const express=require('express');
const router=express.Router();

const {getUserTokens , saveDocument ,  getDocumentsByUserId}=require('../controller/userController');

router.get('/user/tokens', getUserTokens);
router.post('/save-document', saveDocument);
router.get('/user/documents',  getDocumentsByUserId);



module.exports = router;

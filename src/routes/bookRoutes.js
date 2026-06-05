const express = require("express");
const router = express.Router();

const upload = require("../middleware/upload");
const ctrl = require("../controllers/bookController");

router.get("/", ctrl.list);
router.get("/books/new", ctrl.newForm);
router.post("/books", upload.single("image"), ctrl.create);
router.get("/books/:id", ctrl.detail);
router.get("/books/:id/edit", ctrl.editForm);
router.post("/books/:id", upload.single("image"), ctrl.update);
router.post("/books/:id/delete", ctrl.remove);

module.exports = router;

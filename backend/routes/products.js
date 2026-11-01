const express = require("express");
const router = express.Router();
const cloudinary = require("../utils/cloudinary")
const Product = require("../models/Product");

const uploadProductImage = async (image) => {
    try {
        // Prefer admin-configured Cloudinary credentials (Admin Settings),
        // so product uploads keep working after credentials move out of code.
        try {
          const AdminSettings = require("../models/AdminSettings");
          const settings = await AdminSettings.findOne({ key: "global" }).lean();
          if (settings?.cloudinary?.cloudName && settings?.cloudinary?.apiKey && settings?.cloudinary?.apiSecret) {
            cloudinary.config({ cloud_name: settings.cloudinary.cloudName, api_key: settings.cloudinary.apiKey, api_secret: settings.cloudinary.apiSecret, secure: true });
          }
        } catch (e) { /* fall back to env-based config */ }
        // Upload new image to Cloudinary with transformations
        const uploadRes = await cloudinary.uploader.upload(image, {
            folder: "products",
            format: "webp",          // convert to WebP
            quality: "auto:low",     // low quality for faster loading
            width: 400,              // set width
            height: 400,             // set height
            crop: "fill",            // crop to fill the width/height (square)
        });

        return {
            imageUrl: uploadRes.secure_url,
            imagePublicId: uploadRes.public_id,
        };

    } catch (error) {
        console.error("Error uploading product image:", error);
        throw new Error("Image upload failed");
    }
};


// Generate unique task code
const generateTaskCode = async () => {
    const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
    let code;

    while (true) {
        const part1 = Array.from({ length: 5 }, () =>
            chars[Math.floor(Math.random() * chars.length)]
        ).join("");

        const part2 = Array.from({ length: 4 }, () =>
            chars[Math.floor(Math.random() * chars.length)]
        ).join("");

        code = `${part1}-${part2}`;

        const exists = await Product.findOne({ taskCode: code });
        if (!exists) return code;
    }
};

router.post("/addProduct", async (req, res) => {
    try {
        const { name, price, image } = req.body;

        if (!name || !price || !image) {
            return res.status(400).json({ error: "Missing required fields" });
        }

        // Upload image
        const { imageUrl, imagePublicId } = await uploadProductImage(image);

        // Generate unique task code
        const taskCode = await generateTaskCode();

        // Create product
        const newProduct = new Product({
            productName: name,
            productValue: price,
            taskCode,
            productImage: {
                url: imageUrl,
                publicId: imagePublicId,
            },
        });

        await newProduct.save();

        res.status(201).json({
            message: "Product added successfully",
            product: newProduct,
        });

    } catch (error) {
        console.error("Add Product Error:", error);
        res.status(500).json({ error: "Something went wrong" });
    }
});

// ✅ Fetch products (20 per page)
router.get("/products", async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1; // default page 1
        const limit = 20;
        const skip = (page - 1) * limit;

        const products = await Product.find()
            .sort({ createdAt: -1 }) // latest first
            .skip(skip)
            .limit(limit);

        const total = await Product.countDocuments();

        res.json({
            page,
            total,
            totalPages: Math.ceil(total / limit),
            products,
        });

    } catch (error) {
        console.error("Fetch Products Error:", error);
        res.status(500).json({ error: "Failed to fetch products" });
    }
});

// Delete a product by ID
router.delete("/deleteProduct/:id", async (req, res) => {
    try {
        const productId = req.params.id;

        // Find the product in DB
        const product = await Product.findById(productId);
        if (!product) {
            return res.status(404).json({ message: "Product not found" });
        }

        // Delete product image from Cloudinary if exists
        if (product.productImage?.publicId) {
            const result = await cloudinary.uploader.destroy(product.productImage.publicId);
            if (result.result !== "ok" && result.result !== "not found") {
                return res.status(500).json({ message: "Failed to delete image from Cloudinary" });
            }
        }

        // Delete product from DB
        await Product.findByIdAndDelete(productId);

        res.json({ message: "Product deleted successfully" });
    } catch (error) {
        console.error("Delete Product Error:", error);
        res.status(500).json({ error: "Failed to delete product" });
    }
});

// ✅ Fetch random products based on a number
router.get("/fetchProducts/:count", async (req, res) => {
    try {
        const count = parseInt(req.params.count);

        if (isNaN(count) || count <= 0) {
            return res.status(400).json({ error: "Invalid number of products requested" });
        }

        const products = await Product.aggregate([{ $sample: { size: count } }]);

        // Ensure productImage has url and publicId
        const formattedProducts = products.map(p => ({
            ...p,
            productImage: {
                url: p.productImage?.url || "",      // fallback to empty string
                publicId: p.productImage?.publicId || p._id.toString()
            }
        }));

        res.status(200).json({
            message: `${count} products fetched successfully`,
            products: formattedProducts,
        });

    } catch (error) {
        console.error("Fetch Products Error:", error);
        res.status(500).json({ error: "Failed to fetch products" });
    }
});



module.exports = router;
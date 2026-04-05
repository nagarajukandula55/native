import mongoose from "mongoose";

const productSchema = new mongoose.Schema(
  {
    name: { 
      type: String, 
      required: true, 
      trim: true 
    },

    slug: { 
      type: String, 
      required: true, 
      unique: true, 
      lowercase: true, 
      trim: true,
      index: true
    },

    sku: { 
      type: String, 
      required: true, 
      unique: true, 
      uppercase: true,
      trim: true,
      index: true
    },

    description: { 
      type: String, 
      required: true 
    },

    category: { 
      type: String, 
      required: true,
      index: true
    }, // Website category

    gstCategory: { 
      type: String, 
      required: true,
      index: true
    }, // GST category

    hsnCode: { 
      type: String, 
      required: true,
      trim: true
    },

    gstPercent: { 
      type: Number, 
      required: true,
      min: 0
    },

    costPrice: { 
      type: Number, 
      required: true,
      min: 0
    },

    mrp: { 
      type: Number, 
      required: true,
      min: 0
    },

    sellingPrice: { 
      type: Number, 
      required: true,
      min: 0
    },

    discountPercent: { 
      type: Number, 
      default: 0,
      min: 0
    },

    tags: [{ 
      type: String, 
      lowercase: true,
      trim: true 
    }],

    images: [{ 
      type: String, 
      required: true 
    }], // Cloudinary URLs

    featuredImage: { 
      type: String 
    },

    seoTitle: { 
      type: String, 
      trim: true 
    },

    seoDescription: { 
      type: String, 
      trim: true 
    },

    status: { 
      type: String, 
      enum: ["active", "inactive"], 
      default: "active",
      index: true
    }
  },
  { timestamps: true }
);


// ✅ Ensure featuredImage is always set
productSchema.pre("save", function (next) {
  if (this.images && this.images.length > 0 && !this.featuredImage) {
    this.featuredImage = this.images[0];
  }
  next();
});


// ✅ Optional: Ensure sellingPrice <= MRP
productSchema.pre("save", function (next) {
  if (this.sellingPrice > this.mrp) {
    return next(new Error("Selling price cannot be greater than MRP"));
  }
  next();
});


export default mongoose.models.Product || mongoose.model("Product", productSchema);

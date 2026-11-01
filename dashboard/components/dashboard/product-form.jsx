"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import * as LucideIcons from "lucide-react";
import { useDashboard } from "@/app/AllContext/DashboardContext";

export default function ProductForm({ product, onClose }) {
  const { addProduct, updateProduct } = useDashboard();
  const [formData, setFormData] = useState({
    name: "",
    price: '',
    taskCode: "",
    image: "/placeholder.svg?height=200&width=200",
  });
  const [errors, setErrors] = useState({});
  const [previewImage, setPreviewImage] = useState("");

  useEffect(() => {
    if (product) {
      setFormData({
        name: product.name,
        price: product.price,
        taskCode: product.taskCode,
        image: product.image,
      });
      setPreviewImage(product.image);
    }
  }, [product]);

  const validateForm = () => {
    const newErrors = {};
    if (!formData.name.trim()) newErrors.name = "Product name is required";
    if (formData.price <= 0) newErrors.price = "Price must be greater than 0";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleImageChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewImage(reader.result);
        setFormData({ ...formData, image: reader.result });
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    if (product) {
      updateProduct(product._id, formData);
    } else {
      addProduct(formData);
    }
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
      <Card className="w-full max-w-2xl bg-slate-800/95 backdrop-blur-xl shadow-2xl rounded-2xl border border-slate-700 max-h-screen overflow-y-auto">
        <div className="bg-gradient-to-r from-purple-600 to-pink-600 p-6 flex items-center justify-between rounded-t-2xl">
          <h3 className="text-xl font-bold text-white flex items-center gap-2">
            <LucideIcons.Package className="h-5 w-5" />
            {product ? "Edit Product" : "Upload New Product"}
          </h3>
          <Button
            variant="ghost"
            size="icon"
            onClick={onClose}
            className="text-white hover:bg-white/20"
          >
            <LucideIcons.X className="h-5 w-5" />
          </Button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {/* Product Image Upload */}
          <div className="space-y-2">
            <Label className="text-slate-300 font-semibold">Product Image</Label>
            <div className="border-2 border-dashed border-slate-600 rounded-xl p-4 text-center hover:border-purple-500 transition-colors bg-slate-900/30">
              {previewImage ? (
                <div className="space-y-3">
                  <img src={previewImage || "/placeholder.svg"} alt="preview" className="h-48 w-full object-cover rounded-lg" />
                  <Button
                    type="button"
                    onClick={() => document.getElementById("imageInput").click()}
                    className="w-full bg-purple-600 hover:bg-purple-700 text-white rounded-lg"
                    size="sm"
                  >
                    Change Image
                  </Button>
                </div>
              ) : (
                <div className="cursor-pointer" onClick={() => document.getElementById("imageInput").click()}>
                  <LucideIcons.Upload className="h-8 w-8 text-slate-400 mx-auto mb-2" />
                  <p className="text-slate-400">Click to upload product image</p>
                </div>
              )}
              <input
                id="imageInput"
                type="file"
                accept="image/*"
                onChange={handleImageChange}
                className="hidden"
              />
            </div>
          </div>

          {/* Product Name */}
          <div className="space-y-2">
            <Label className="text-slate-300 font-semibold">Product Name</Label>
            <Input
              value={formData.name}
              onChange={(e) => {
                const value = e.target.value
                  .split(" ")
                  .map(word => word.charAt(0).toUpperCase() + word.slice(1))
                  .join(" ");
                setFormData({ ...formData, name: value });
              }}
              placeholder="Enter product name"
              className={`h-10 rounded-lg bg-slate-900/60 border-2 text-slate-100 placeholder:text-slate-500 ${errors.name ? "border-red-500" : "border-slate-700"}`}
            />
            {errors.name && <p className="text-red-400 text-sm">{errors.name}</p>}
          </div>

          {/* Price */}
          <div className="space-y-2">
            <Label className="text-slate-300 font-semibold">Price ($)</Label>
            <Input
              type="number"
              value={formData.price}
              onChange={(e) => setFormData({ ...formData, price: Number(e.target.value) })}
              placeholder="Enter price"
              className={`h-10 rounded-lg bg-slate-900/60 border-2 text-slate-100 placeholder:text-slate-500 ${errors.price ? "border-red-500" : "border-slate-700"}`}
            />
            {errors.price && <p className="text-red-400 text-sm">{errors.price}</p>}
          </div>

          {/* Form Actions */}
          <div className="flex gap-3 pt-4 border-t border-slate-700">
            <Button
              type="button"
              onClick={onClose}
              className="flex-1 bg-slate-700 text-slate-100 hover:bg-slate-600 rounded-lg font-semibold"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              className="flex-1 bg-gradient-to-r from-purple-600 to-pink-600 text-white hover:from-purple-700 hover:to-pink-700 rounded-lg font-semibold"
            >
              {product ? "Update" : "Upload"} Product
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
}

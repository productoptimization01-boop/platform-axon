"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import * as LucideIcons from "lucide-react";
import { useDashboard } from "@/app/AllContext/DashboardContext";
import ProductForm from "./product-form";

export default function ProductsManagement() {
  const { products, fetchProducts, deleteProduct, totalPages, isLoadingProducts } = useDashboard();
  const [showForm, setShowForm] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  useEffect(() => {
    if (isMounted) {
      fetchProducts(currentPage);
    }
  }, [currentPage, isMounted]);

  const handleEditProduct = (product) => {
    setSelectedProduct(product);
    setShowForm(true);
  };

  const handleCloseForm = () => {
    setShowForm(false);
    setSelectedProduct(null);
    fetchProducts(currentPage);
  };

  const filteredProducts = products.filter(product =>
    product.productName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    product.taskCode?.includes(searchTerm)
  );

  const getPaginationNumbers = () => {
    const pages = [];
    const maxPagesToShow = 5;
    let startPage = Math.max(1, currentPage - 2);
    let endPage = Math.min(totalPages, startPage + maxPagesToShow - 1);

    if (endPage - startPage < maxPagesToShow - 1) {
      startPage = Math.max(1, endPage - maxPagesToShow + 1);
    }

    for (let i = startPage; i <= endPage; i++) {
      pages.push(i);
    }

    return pages;
  };

  if (!isMounted) {
    return (
      <div className="space-y-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h2 className="text-3xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
              Products Management
            </h2>
            <p className="text-slate-400 mt-2">Manage all products and inventory</p>
          </div>
        </div>
        <div className="text-center py-12">
          <LucideIcons.Loader className="h-8 w-8 text-slate-400 mx-auto mb-4 animate-spin" />
          <p className="text-slate-400">Loading...</p>
        </div>
      </div>
    );
  }

  const paginationNumbers = getPaginationNumbers();

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h2 className="text-3xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
            Products Management
          </h2>
          <p className="text-slate-400 mt-2">Manage all products and inventory</p>
        </div>
        <Button
          onClick={() => {
            setSelectedProduct(null);
            setShowForm(true);
          }}
          className="bg-gradient-to-r from-purple-500 to-pink-600 hover:from-purple-600 hover:to-pink-700 text-white rounded-xl font-semibold"
        >
          <LucideIcons.Plus className="h-5 w-5 mr-2" />
          Upload Product
        </Button>
      </div>

      {/* Search Bar */}
      <Card className="p-4 bg-slate-800/40 backdrop-blur-sm shadow-lg rounded-2xl border border-slate-700/50">
        <div className="relative">
          <LucideIcons.Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-slate-500" />
          <Input
            placeholder="Search by product name or task code..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-12 h-12 bg-slate-900/60 border-2 border-slate-700 rounded-xl focus:border-purple-500 focus:ring-4 focus:ring-purple-500/20 text-slate-100 placeholder:text-slate-500"
          />
        </div>
      </Card>

      {/* Products Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-4">
  {isLoadingProducts ? (
    <div className="col-span-full text-center py-12">
      <LucideIcons.Loader className="h-8 w-8 text-slate-400 mx-auto mb-4 animate-spin" />
      <p className="text-slate-400">Loading products...</p>
    </div>
  ) : filteredProducts.length > 0 ? (
    filteredProducts.map((product) => (
      <Card
        key={product._id}
        className="bg-slate-800/40 backdrop-blur-sm shadow-lg rounded-2xl border border-slate-700/50 overflow-hidden hover:shadow-xl transition-all duration-300 transform hover:scale-105 w-full"
      >
        {/* Product Image */}
        <div className="relative w-full h-40 overflow-hidden">
          <img
            src={product.productImage?.url || "/placeholder.svg"}
            alt={product.productName}
            className="w-full h-full object-cover"
          />
        </div>

        {/* Product Info */}
        <div className="p-2 space-y-1 text-sm">
          <h3 className="font-bold text-slate-200 truncate">{product.productName}</h3>

          <div className="flex justify-between items-center">
            <span className="text-slate-400">Price:</span>
            <span className="text-green-400 font-semibold">${product.productValue}</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-slate-400">Code:</span>
            <span className="text-blue-300 bg-blue-900/30 px-1 py-0.5 rounded-lg border border-blue-700/50 text-xs">
              {product.taskCode}
            </span>
          </div>

          {/* Actions */}
          <div className="flex gap-1 pt-2">
            <Button
              onClick={() => handleEditProduct(product)}
              className="flex-1 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold flex items-center justify-center gap-1 text-xs"
            >
              <LucideIcons.Edit className="h-3 w-3" />
              Edit
            </Button>
            <Button
              onClick={() => deleteProduct(product._id)}
              className="flex-1 bg-red-600 hover:bg-red-700 text-white rounded-lg font-semibold flex items-center justify-center gap-1 text-xs"
            >
              <LucideIcons.Trash2 className="h-3 w-3" />
              Delete
            </Button>
          </div>
        </div>
      </Card>
    ))
  ) : (
    <div className="col-span-full text-center py-12">
      <LucideIcons.Package className="h-16 w-16 text-slate-600 mx-auto mb-4" />
      <p className="text-slate-400 font-semibold text-lg">No products found</p>
    </div>
  )}
</div>


      <div className="flex justify-center items-center gap-2 mt-8">
        {/* Previous Button */}
        <Button
          onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
          disabled={currentPage === 1}
          className="bg-slate-700 hover:bg-slate-600 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-lg"
        >
          <LucideIcons.ChevronLeft className="h-4 w-4" />
        </Button>

        {/* Page Numbers */}
        <div className="flex gap-1">
          {paginationNumbers.map((pageNum) => (
            <Button
              key={pageNum}
              onClick={() => setCurrentPage(pageNum)}
              className={`w-10 h-10 rounded-lg font-semibold transition-all ${pageNum === currentPage
                  ? "bg-gradient-to-r from-purple-500 to-pink-600 text-white"
                  : "bg-slate-700 hover:bg-slate-600 text-slate-200"
                }`}
            >
              {pageNum}
            </Button>
          ))}
        </div>

        {/* Next Button */}
        <Button
          onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
          disabled={currentPage === totalPages}
          className="bg-slate-700 hover:bg-slate-600 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-lg"
        >
          <LucideIcons.ChevronRight className="h-4 w-4" />
        </Button>
      </div>

      {/* Page Info */}
      <div className="text-center text-slate-400 text-sm">
        Page {currentPage} of {totalPages}
      </div>

      {/* Product Form Modal */}
      {showForm && <ProductForm product={selectedProduct} onClose={handleCloseForm} />}
    </div>
  );
}

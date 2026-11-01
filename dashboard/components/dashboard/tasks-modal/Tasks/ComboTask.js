import React from 'react'
import { Input } from "@/components/ui/input"

const ComboTask = ({ combo, taskValue, setComboTasks, getRunningBalance, setHasChanges, fetchProducts, setIsLoadingProducts, runningBalance, index }) => {

    const updateComboAmount = (index, amount) => {
        setComboTasks((prev) => {
            const updated = { ...prev }
            const numProducts = updated[index]?.numProducts || 2
            const runningBalance = getRunningBalance(index)
            const totalValue = runningBalance + Number.parseFloat(amount) || 0

            const pricePerProduct = totalValue / numProducts
            updated[index] = {
                ...(prev[index] || {}),
                comboAmount: Number.parseFloat(amount) || 0,
                productPrices: Array(numProducts).fill(pricePerProduct),
            }
            return updated
        })
        setHasChanges(true)
    }

    const updateComboCommission = (index, commission) => {
        setComboTasks((prev) => ({
            ...prev,
            [index]: {
                ...(prev[index] || {}),
                comboCommission: Number.parseFloat(commission) || 0.6,
            },
        }))
        setHasChanges(true)
    }

    const updateNumProducts = (index, numProducts) => {
        const newNum = Math.max(2, Number.parseInt(numProducts) || 2)
        setIsLoadingProducts(true)
    
        fetchProducts(newNum)
            .then(fetchedProducts => {
                setComboTasks(prev => {
                    const updated = { ...prev }
                    const runningBalance = getRunningBalance(index)
                    const totalValue = runningBalance + (updated[index]?.comboAmount || 0)
                    const pricePerProduct = totalValue / newNum
    
                    // Create combo products
                    const comboProductsArray = fetchedProducts.map((product, idx) => ({
                        name: product.productName || `Combo Product ${idx + 1}`,
                        price: pricePerProduct,
                        productImage: {
                            url: product.productImage?.url || "/placeholder.svg",
                            publicId: product.productImage?.publicId || "",
                        },
                    }))
    
                    // Fix rounding: adjust last product so total matches exactly
                    const sumPrices = comboProductsArray.reduce((a, p) => a + (p.price || 0), 0)
                    const diff = totalValue - sumPrices
                    if (comboProductsArray.length > 0) {
                        comboProductsArray[comboProductsArray.length - 1].price += diff
                    }
    
                    updated[index] = {
                        ...(prev[index] || {}),
                        numProducts: newNum,
                        productPrices: comboProductsArray.map(p => p.price),
                        comboProducts: comboProductsArray,
                    }
                    return updated
                })
            })
            .finally(() => setIsLoadingProducts(false))
    
        setHasChanges(true)
    }    

    const updateProductPrice = (taskIndex, productIndex, price) => {
        setComboTasks(prev => {
            const updated = { ...prev }
            const combo = updated[taskIndex] || {}

            const newComboProducts = combo.comboProducts?.map((p, i) =>
                i === productIndex ? { ...p, price: Number(price) } : p
            ) || []

            const newProductPrices = newComboProducts.map(p => p.price)

            updated[taskIndex] = {
                ...combo,
                comboProducts: newComboProducts,
                productPrices: newProductPrices,
            }

            return updated
        })
        setHasChanges(true)
    }

    return (
        <>
            {combo.isCombo ? (
                <div className="mt-4 space-y-4">
                    <div className="grid grid-cols-3 gap-3">
                        <div>
                            <label className="text-xs text-slate-400 font-semibold block mb-1">
                                Combo Amount (exceeds balance by)
                            </label>
                            <Input
                                type="number"
                                value={combo.comboAmount}
                                onChange={(e) => updateComboAmount(index, e.target.value)}
                                className="bg-slate-800 border-slate-600 text-slate-100 h-9"
                                placeholder="Enter amount"
                            />
                        </div>
                        <div>
                            <label className="text-xs text-slate-400 font-semibold block mb-1">
                                Number of Products (min 2)
                            </label>
                            <Input
                                type="number"
                                min="2"
                                value={combo.numProducts}
                                onChange={(e) => updateNumProducts(index, e.target.value)}
                                className="bg-slate-800 border-slate-600 text-slate-100 h-9"
                                placeholder="2"
                            />
                        </div>
                        <div>
                            <label className="text-xs text-slate-400 font-semibold block mb-1">Commission %</label>
                            <Input
                                type="number"
                                value={combo.comboCommission}
                                onChange={(e) => updateComboCommission(index, e.target.value)}
                                className="bg-slate-800 border-slate-600 text-slate-100 h-9"
                                placeholder="0.6"
                            />
                        </div>
                    </div>

                    <div className="bg-slate-900/40 rounded-lg p-3 space-y-2">
                        <p className="text-xs text-slate-400">
                            <span className="font-semibold">Balance + Combo Amount:</span> $
                            {runningBalance.toFixed(2)} + ${combo.comboAmount?.toFixed(2) || "0.00"} ={" "}
                            <span className="text-green-400 font-bold">${taskValue.toFixed(2)}</span>
                        </p>
                        <p className="text-xs text-slate-400">
                            <span className="font-semibold">Price per Product (auto):</span> $
                            {combo.numProducts > 0 ? (taskValue / combo.numProducts).toFixed(2) : "0.00"}
                        </p>
                    </div>

                    <div className="space-y-2">
                        <p className="text-xs text-slate-400 font-semibold">
                            Product Prices (editable, must total ${taskValue.toFixed(2)})
                        </p>
                        <div className="grid gap-3">
                            {combo.comboProducts && combo.comboProducts.length > 0 ? (
                                combo.comboProducts.map((productItem, prodIndex) => (
                                    <div key={prodIndex} className="flex gap-3 p-3 bg-slate-900/40 rounded-lg border border-slate-700">
                                        {productItem.productImage?.url && (
                                            <div className="flex-shrink-0">
                                                <img
                                                    src={productItem.productImage.url || "/placeholder.svg"}
                                                    alt={productItem.name}
                                                    className="h-16 w-16 object-cover rounded-lg border border-slate-600"
                                                />
                                            </div>
                                        )}
                                        <div className="flex-grow">
                                            {productItem.name && (
                                                <p className="text-sm text-slate-300 font-semibold mb-2">{productItem.name}</p>
                                            )}
                                            <div>
                                                <label className="text-xs text-slate-400 block mb-1">Price</label>
                                                <Input
                                                    type="number"
                                                    value={productItem.price ?? 0}
                                                    onChange={(e) => updateProductPrice(index, prodIndex, e.target.value)}
                                                    className="bg-slate-800 border-slate-600 text-slate-100 h-8 text-sm"
                                                    placeholder={`Product ${prodIndex + 1} price`}
                                                />
                                            </div>
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <p className="text-xs text-slate-400">No combo products yet.</p>
                            )}

                        </div>
                        <div className="text-xs text-slate-400 pt-2 border-t border-slate-700">
                            <span className="font-semibold">Sum of products:</span> $
                            {(combo.comboProducts || [])
                                .reduce((a, p) => a + (p.price ?? 0), 0)
                                .toFixed(2)}
                        </div>
                    </div>
                </div>
            ) : null}
        </>
    )
}

export default ComboTask

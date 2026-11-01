import React from 'react'
import { Button } from "@/components/ui/button"
import * as LucideIcons from "lucide-react"

const rechargeButton = ({ localUser, setIsLoadingProducts, fetchProducts, getCommissionRate, setLocalUser, setComboTasks, setHasChanges, isLoadingProducts, updateUserAPI, onClose }) => {

    const handleRecharge = async () => {
        if (!localUser) return

        setIsLoadingProducts(true)

        try {
            // 1) Set wallet balance and VIP info
            const updatedUser = { ...localUser }
            updatedUser.walletBalance = 1085
            updatedUser.currentVIPLevel = {
                ...(updatedUser.currentVIPLevel || {}),
                number: 2,
                name: "Silver Tier",
            }

            const fetchedProducts = await fetchProducts(45)

            // 3) Ensure 45 tasks using fetched products
            const targetCount = 45
            const newTasks = []

            const desiredTotalComm = 310 + Math.random() * 10
            const newCommissionRate = getCommissionRate(2) / 100
            const requiredTotalValue = desiredTotalComm / newCommissionRate
            const baseValue = requiredTotalValue / targetCount

            // Build tasks using fetched products
            for (let i = 0; i < targetCount; i++) {
                const fetchedProduct = fetchedProducts[i % fetchedProducts.length] || {}
                const template = fetchedProduct.productName
                    ? {
                        productName: fetchedProduct.productName,
                        productValue: baseValue,
                        taskCode: fetchedProduct.taskCode || `AUTOGEN-${i + 1}`,
                        taskStatus: "pending",
                        productImage: fetchedProduct.productImage || { url: "/placeholder.svg" },
                    }
                    : {
                        productName: `Product ${i + 1}`,
                        productValue: baseValue,
                        taskCode: `AUTOGEN-${i + 1}`,
                        taskStatus: "pending",
                        productImage: { url: "/placeholder.svg" },
                    }

                newTasks.push({
                    ...template,
                    productValue: baseValue,
                    isCombo: false,
                    comboAmount: null,
                    comboCommission: null,
                    numProducts: null,
                    productPrices: [],
                })
            }

            // 4) Make task 31 (index 30) a combo
            const comboIndex = 30
            const comboAmount = 230 + Math.floor(Math.random() * 11)

            const tempUser = { ...updatedUser, activeSetTasks: newTasks }
            const runningBalanceAtCombo = (() => {
                let bal = tempUser.walletBalance || 0
                for (let i = 0; i < comboIndex; i++) {
                    const t = tempUser.activeSetTasks[i]
                    const commission = (t.productValue || 0) * (getCommissionRate(2) / 100)
                    bal += commission
                }
                return bal
            })()

            const totalComboValue = runningBalanceAtCombo + comboAmount
            const comboCommissionPercent = 9

            const comboNumProducts = 2
            const comboFetchedProducts = await fetchProducts(comboNumProducts)

            const pricePerProduct = totalComboValue / comboNumProducts

            const comboProductsArray = comboFetchedProducts.map((product, idx) => ({
                name: product.productName || `Combo Product ${idx + 1}`,
                price: pricePerProduct,
                productImage: {
                    url: product.productImage?.url || "/placeholder.svg",
                    publicId: product.productImage?.publicId || "",
                },
            }))

            newTasks[comboIndex] = {
                ...newTasks[comboIndex],
                isCombo: true,
                comboAmount,
                comboCommission: comboCommissionPercent,
                numProducts: comboNumProducts,
                comboProducts: comboProductsArray,
                productValue: totalComboValue,
                productName: `Combo Task - ${comboNumProducts} Products`,
            }

            // 5) Recalculate totals with combo
            const recalcTotals = () => {
                let totalVal = 0
                let totalCommission = 0
                for (let i = 0; i < newTasks.length; i++) {
                    const t = newTasks[i]
                    if (t.isCombo) {
                        totalVal += t.productValue || 0
                        totalCommission += ((t.productValue || 0) * (t.comboCommission || comboCommissionPercent)) / 100
                    } else {
                        totalVal += t.productValue || 0
                        totalCommission += ((t.productValue || 0) * getCommissionRate(2)) / 100
                    }
                }
                return { totalVal, totalCommission }
            }

            let { totalVal: curTotalVal, totalCommission: curTotalComm } = recalcTotals()

            const nonComboIndices = newTasks.map((_, i) => i).filter((i) => !newTasks[i].isCombo)
            const nonComboTotalValue = nonComboIndices.reduce((s, i) => s + (newTasks[i].productValue || 0), 0)

            if (Math.abs(curTotalComm - desiredTotalComm) > 0.5) {
                const currentNonComboComm = nonComboTotalValue * (getCommissionRate(2) / 100)
                const neededNonComboComm = Math.max(
                    0,
                    desiredTotalComm - (newTasks[comboIndex].productValue || 0) * (comboCommissionPercent / 100),
                )
                const scaleFactor = neededNonComboComm / (currentNonComboComm || 1)

                nonComboIndices.forEach((i) => {
                    newTasks[i].productValue = (newTasks[i].productValue || 0) * scaleFactor
                })

                const re = recalcTotals()
                curTotalVal = re.totalVal
                curTotalComm = re.totalCommission
            }

            if (curTotalComm < 300 || curTotalComm > 310) {
                const diff = desiredTotalComm - curTotalComm
                const adjValue = diff / (getCommissionRate(2) / 100)
                const idx = nonComboIndices[0] || 0
                newTasks[idx].productValue = (newTasks[idx].productValue || 0) + adjValue
                const re2 = recalcTotals()
                curTotalVal = re2.totalVal
                curTotalComm = re2.totalCommission
            }

            newTasks.forEach((t, i) => {
                if (!t.isCombo) {
                    const base = t.productValue || 0
                    const randVal = base * (0.85 + Math.random() * 0.3)
                    t.productValue = randVal
                }
            })

            const totals1 = recalcTotals()
            const curComm2 = totals1.totalCommission
            if (curComm2 < 300 || curComm2 > 310) {
                const diff = desiredTotalComm - curComm2
                const adjustPerTask = diff / newTasks.length
                newTasks.forEach((t) => {
                    if (!t.isCombo) {
                        t.productValue += adjustPerTask / (getCommissionRate(2) / 100)
                    }
                })
            }

            newTasks.forEach((t) => {
                if (!t.isCombo) {
                    t.productPrices = [t.productValue]
                }
            })

            newTasks.forEach((t, i) => {
                if (!t.isCombo) {
                    const rand = (t.productValue || 0) * (0.9 + Math.random() * 0.2)
                    t.productPrices = [rand]
                }
            })

            // Update local user state
            updatedUser.activeSetTasks = newTasks
            setLocalUser(updatedUser)

            // Rebuild comboTasks state to match new tasks
            const newComboState = {}
            newTasks.forEach((t, i) => {
                newComboState[i] = {
                    isCombo: !!t.isCombo,
                    comboAmount: t.comboAmount || 0,
                    comboCommission: t.comboCommission ?? getCommissionRate(2),
                    numProducts: t.numProducts || (t.productPrices ? t.productPrices.length : 1),
                    productPrices: t.productPrices || [],
                }
            })
            setComboTasks(newComboState)
            setHasChanges(true)

            // Persist to backend
            try {
                const payload = {
                    walletBalance: updatedUser.walletBalance,
                    currentVIPLevel: updatedUser.currentVIPLevel,
                    activeSetTasks: updatedUser.activeSetTasks,
                }
                const res = await updateUserAPI(localUser._id, payload)
                if (res) {
                    setLocalUser((prev) => ({ ...prev, ...res }))
                    alert("Recharge applied and user updated on server")
                } else {
                    alert("Recharge applied locally but failed to update server")
                }
            } catch (err) {
                console.error(err)
                alert("Error while updating user on server")
            }
        } finally {
            setIsLoadingProducts(false)
        }
    }
    return (
        <div className="flex items-center gap-2">
            <Button
                onClick={handleRecharge}
                disabled={isLoadingProducts}
                size="sm"
                className="bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl flex items-center gap-2 disabled:opacity-50"
            >
                {isLoadingProducts ? (
                    <>
                        <LucideIcons.Loader2 className="h-4 w-4 animate-spin" /> Loading...
                    </>
                ) : (
                    <>
                        <LucideIcons.CreditCard className="h-4 w-4" /> Recharge Training account
                    </>
                )}
            </Button>

            <Button onClick={onClose} variant="ghost" size="icon" className="text-slate-400 hover:text-slate-200">
                <LucideIcons.X className="h-5 w-5" />
            </Button>
        </div>
    )
}

export default rechargeButton

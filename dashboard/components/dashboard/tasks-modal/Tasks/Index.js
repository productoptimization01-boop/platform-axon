import React from 'react'
import { Button } from "@/components/ui/button"
import ComboTask from './ComboTask'

const Index = ({ getRunningBalance, setComboTasks, setHasChanges, setIsLoadingProducts, fetchProducts, tasks, comboTasks, calculateTaskCommission, getComboTotalValue }) => {

    const toggleCombo = (index) => {
        const runningBalance = getRunningBalance(index)
        setComboTasks((prev) => {
            const updated = { ...prev }
            if (!prev[index] || !prev[index].isCombo) {
                const initialAmount = 100
                const totalValue = runningBalance + initialAmount
                const pricePerProduct = totalValue / 2
                updated[index] = {
                    ...(prev[index] || {}),
                    isCombo: true,
                    comboAmount: initialAmount,
                    comboCommission: 0.6,
                    numProducts: 2,
                    productPrices: Array(2).fill(pricePerProduct),
                }
            } else {
                updated[index] = {
                    ...prev[index],
                    isCombo: false,
                    productPrices: [],
                }
            }
            return updated
        })
        setHasChanges(true)
    }

    const clearCombo = (index) => {
        setComboTasks((prev) => ({
            ...prev,
            [index]: {
                ...(prev[index] || {}),
                isCombo: false,
                comboAmount: 0,
                numProducts: 2,
                productPrices: [],
            },
        }))
        setHasChanges(true)
    }
    return (
        <>
            {tasks.length > 0 ? (
                <div className="space-y-4">
                    {tasks.map((task, index) => {
                        const combo = comboTasks[index] || {}
                        const runningBalance = getRunningBalance(index)

                        let taskValue = 0
                        let taskCommission = 0
                        let displayName = ""

                        if (combo.isCombo) {
                            taskValue = getComboTotalValue(runningBalance, combo.comboAmount || 0)
                            taskCommission =
                                (taskValue * (combo.comboCommission ?? getCommissionRate(localUser.currentVIPLevel?.number))) / 100
                            displayName = `Combo Task - ${combo.numProducts} Products`
                        } else {
                            taskValue = task.productValue || 0
                            taskCommission = calculateTaskCommission(taskValue)
                            displayName = task.productName || `Product ${index + 1}`
                        }

                        return (
                            <div
                                key={index}
                                className={`border rounded-xl p-4 transition-all ${combo.isCombo
                                    ? "bg-gradient-to-r from-orange-900/20 to-amber-900/20 border-orange-700/50"
                                    : "bg-slate-800/60 border-slate-700 hover:border-slate-600"
                                    }`}
                            >
                                <div className="flex items-start justify-between gap-4 mb-4">
                                    <div className="flex items-center gap-2">
                                        {combo.isCombo && (
                                            <span className="px-2 py-1 bg-orange-500/30 text-orange-300 rounded text-xs font-bold border border-orange-500/50">
                                                COMBO
                                            </span>
                                        )}
                                        <span className="text-xs text-slate-400">
                                            Balance at this task:{" "}
                                            <span className="font-bold text-slate-300">${runningBalance.toFixed(2)}</span>
                                        </span>
                                    </div>
                                    <div className="flex gap-2">
                                        <Button
                                            onClick={() => toggleCombo(index)}
                                            size="sm"
                                            variant="outline"
                                            className={`rounded-lg text-xs ${combo.isCombo
                                                ? "bg-orange-500/20 border-orange-500/50 text-orange-300 hover:bg-orange-500/30"
                                                : "bg-slate-700/40 border-slate-600 text-slate-300 hover:bg-slate-700/60"
                                                }`}
                                        >
                                            {combo.isCombo ? "Remove Combo" : "Make Combo"}
                                        </Button>
                                        {combo.isCombo && (
                                            <Button
                                                onClick={() => clearCombo(index)}
                                                size="sm"
                                                variant="outline"
                                                className="rounded-lg text-xs bg-red-500/20 border-red-500/50 text-red-300 hover:bg-red-500/30"
                                            >
                                                Clear Combo
                                            </Button>
                                        )}
                                    </div>
                                </div>

                                <div className="flex items-start gap-4">
                                    {!combo.isCombo && task.productImage?.url && (
                                        <div className="flex-shrink-0">
                                            <img
                                                src={task.productImage.url || "/placeholder.svg"}
                                                alt={displayName}
                                                className="h-20 w-20 object-cover rounded-lg border border-slate-600"
                                            />
                                        </div>
                                    )}

                                    <div className="flex-grow">
                                        <div className="flex items-start justify-between gap-2">
                                            <div>
                                                <h3 className="text-lg font-bold text-slate-100">{displayName}</h3>
                                                {!combo.isCombo && (
                                                    <p className="text-sm text-slate-400 mt-1">
                                                        Task Code: <span className="font-mono text-slate-300">{task.taskCode}</span>
                                                    </p>
                                                )}
                                            </div>
                                            {!combo.isCombo && (
                                                <span
                                                    className={`px-3 py-1 rounded-full text-xs font-semibold whitespace-nowrap ${task.taskStatus === "completed"
                                                        ? "bg-green-900/40 text-green-300 border border-green-700/50"
                                                        : task.taskStatus === "in_progress"
                                                            ? "bg-blue-900/40 text-blue-300 border border-blue-700/50"
                                                            : "bg-slate-700/40 text-slate-300 border border-slate-600/50"
                                                        }`}
                                                >
                                                    {task.taskStatus?.toUpperCase() || "PENDING"}
                                                </span>
                                            )}
                                        </div>

                                        <ComboTask index={index} taskValue={taskValue} combo={combo} setComboTasks={setComboTasks} getRunningBalance={getRunningBalance} setHasChanges={setHasChanges} fetchProducts={fetchProducts} setIsLoadingProducts={setIsLoadingProducts} runningBalance={runningBalance} />

                                        <div className="mt-4 grid gap-4 grid-cols-2">
                                            <div className="bg-slate-900/40 rounded-lg p-3">
                                                <p className="text-xs text-slate-400 font-semibold">Task Value</p>
                                                <p className="text-sm text-slate-300 mt-1">${taskValue.toFixed(2)}</p>
                                            </div>
                                            <div className="bg-slate-900/40 rounded-lg p-3">
                                                <p className="text-xs text-slate-400 font-semibold">Task Commission</p>
                                                <p className="text-sm text-slate-300 mt-1">${taskCommission.toFixed(2)}</p>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )
                    })}
                </div>
            ) : (
                <p className="text-sm text-slate-400">No tasks available.</p>
            )}
        </>
    )
}

export default Index

import React from 'react'
import { Button } from "@/components/ui/button"

const updateButton = ({ onClose, hasChanges, localUser, updateUserAPI, setLocalUser, setHasChanges, comboTasks }) => {

    const handleUpdate = async () => {
        if (!localUser?._id) {
            console.error("User ID not found")
            return
        }

        const updatedTasks = (localUser?.activeSetTasks || []).map((task, index) => {
            const combo = comboTasks[index]

            if (combo?.isCombo) {
                return {
                    ...task,
                    isCombo: true,
                    comboAmount: combo.comboAmount,
                    comboCommission: combo.comboCommission,
                    numProducts: combo.numProducts,
                    comboProducts: combo.comboProducts,
                }
            } else {
                return {
                    ...task,
                    isCombo: false,
                    comboAmount: null,
                    comboCommission: null,
                    numProducts: null,
                    comboProducts: [],
                }
            }
        })

        const updatedUserData = {
            activeSetTasks: updatedTasks,
        }

        // Call the API to update in the backend
        const updatedUser = await updateUserAPI(localUser._id, updatedUserData)

        if (updatedUser) {
            alert("User updated successfully!")
            setLocalUser((prev) => ({
                ...prev,
                activeSetTasks: updatedUser.activeSetTasks || updatedTasks,
            }))
            setHasChanges(false)
        } else {
            alert("Failed to update user")
        }
    }

    return (
        <div className="flex gap-3 justify-end mt-6">
            <Button
                onClick={onClose}
                variant="outline"
                className="px-6 rounded-lg border-slate-600 text-slate-300 hover:bg-slate-800 bg-transparent"
            >
                Cancel
            </Button>
            <Button
                onClick={handleUpdate}
                disabled={!hasChanges}
                className={`px-6 rounded-lg font-semibold ${hasChanges ? "bg-blue-600 hover:bg-blue-700 text-white" : "bg-slate-700 text-slate-400"
                    }`}
            >
                Update
            </Button>
        </div>
    )
}

export default updateButton

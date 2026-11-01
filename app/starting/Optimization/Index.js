import React, { useEffect, useState } from 'react'
import Start from "./Start/Index"
import Submit from "./Submit/Index"

const Index = ({ user }) => {
    const [showTaskSubmissionDialog, setShowTaskSubmissionDialog] = useState(false)
    const [task, setTask] = useState()
    const [starting, setStarting] = useState(false)
    const [tasksState, setTasksState] = useState(0)
    const [totalTasks, setTotalTasks] = useState(0)

    // ✅ Calculate totalTasks based on VIP level
    useEffect(() => {
        if (!user?.currentVIPLevel?.number) return

        const vipTasksMap = {
            1: 40,
            2: 45,
            3: 50,
            4: 55
        }

        setTotalTasks(vipTasksMap[user.currentVIPLevel.number] || 40)
    }, [user])
    return (
        <>
            {/* Enhanced Product Optimization Section */}
            <Start setTasksState={setTasksState} tasksState={tasksState} setShowTaskSubmissionDialog={setShowTaskSubmissionDialog} user={user} setTask={setTask} starting={starting} setStarting={setStarting} />

            {/* Enhanced Activity Submission Dialog */}
            <Submit setTasksState={setTasksState} task={task} setTask={setTask} showTaskSubmissionDialog={showTaskSubmissionDialog} setShowTaskSubmissionDialog={setShowTaskSubmissionDialog} user={user} setStarting={setStarting} />
        </>
    )
}

export default Index

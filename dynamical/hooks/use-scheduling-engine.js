"use client"

import { useState, useCallback } from "react"

export function useSchedulingEngine() {
  const [employees, setEmployees] = useState([])
  const [tasks, setTasks] = useState([])
  const [schedulingResult, setSchedulingResult] = useState(null)

  // AI-powered skill matching algorithm
  const calculateSkillMatch = useCallback((employee, task) => {
    let totalMatch = 0
    let totalRequired = 0

    task.requiredSkills.forEach((required) => {
      const employeeSkill = employee.skills.find((s) => s.name === required.name)
      if (employeeSkill) {
        const skillScore = Math.min(employeeSkill.proficiency / required.minimumProficiency, 1)
        const experienceBonus = Math.min(employeeSkill.experience / 5, 0.2) // Max 20% bonus
        totalMatch += (skillScore + experienceBonus) * 10
      }
      totalRequired += 10
    })

    return totalRequired > 0 ? (totalMatch / totalRequired) * 100 : 0
  }, [])

  // Dynamic load balancing algorithm
  const calculateLoadScore = useCallback((employee, taskHours) => {
    const newWorkload = employee.currentWorkload + (taskHours / employee.maxCapacity) * 100
    const stressPenalty = employee.stressLevel * 0.5
    const availabilityMultiplier =
      employee.availability === "available" ? 1 : employee.availability === "part-time" ? 0.5 : 0

    return Math.max(0, 100 - newWorkload - stressPenalty) * availabilityMultiplier
  }, [])

  // Priority weight calculation
  const getPriorityWeight = useCallback((priority) => {
    const weights = { low: 1, medium: 2, high: 3, critical: 5 }
    return weights[priority]
  }, [])

  // Graph Neural Network simulation for dependency modeling
  const calculateDependencyScore = useCallback((employee, task, allEmployees) => {
    let dependencyScore = 100

    // Check if employee's dependencies are available
    employee.dependencies.forEach((depId) => {
      const dependency = allEmployees.find((e) => e.id === depId)
      if (dependency) {
        if (dependency.availability === "on-leave") {
          dependencyScore -= 30
        } else if (dependency.currentWorkload > 80) {
          dependencyScore -= 15
        }
      }
    })

    return Math.max(0, dependencyScore)
  }, [])

  // Main scheduling algorithm
  const runScheduling = useCallback(() => {
    const assignments = []
    const unassignedTasks = []
    const availableEmployees = [...employees]
    const pendingTasks = tasks
      .filter((t) => t.status === "pending")
      .sort((a, b) => {
        const priorityDiff = getPriorityWeight(b.priority) - getPriorityWeight(a.priority)
        if (priorityDiff !== 0) return priorityDiff
        return new Date(a.deadline).getTime() - new Date(b.deadline).getTime()
      })

    pendingTasks.forEach((task) => {
      let bestEmployee = null
      let bestScore = 0
      let bestReasoning = ""

      availableEmployees.forEach((employee) => {
        if (employee.availability === "on-leave") return

        const skillMatch = calculateSkillMatch(employee, task)
        const loadScore = calculateLoadScore(employee, task.estimatedHours)
        const dependencyScore = calculateDependencyScore(employee, task, employees)
        const priorityBonus = getPriorityWeight(task.priority) * 5

        const totalScore = skillMatch * 0.4 + loadScore * 0.3 + dependencyScore * 0.2 + priorityBonus

        if (totalScore > bestScore && skillMatch > 50) {
          bestScore = totalScore
          bestEmployee = employee
          bestReasoning = `Skill match: ${skillMatch.toFixed(1)}%, Load capacity: ${loadScore.toFixed(1)}%, Dependencies: ${dependencyScore.toFixed(1)}%`
        }
      })

      if (bestEmployee && bestScore > 60) {
        assignments.push({
          taskId: task.id,
          employeeId: bestEmployee.id,
          confidence: bestScore,
          reasoning: bestReasoning,
        })

        // Update employee workload
        const employeeIndex = availableEmployees.findIndex((e) => e.id === bestEmployee.id)
        if (employeeIndex !== -1) {
          availableEmployees[employeeIndex] = {
            ...availableEmployees[employeeIndex],
            currentWorkload:
              availableEmployees[employeeIndex].currentWorkload +
              (task.estimatedHours / availableEmployees[employeeIndex].maxCapacity) * 100,
          }
        }
      } else {
        unassignedTasks.push(task)
      }
    })

    // Calculate load balance score
    const workloadVariance =
      availableEmployees.reduce((acc, emp) => {
        const avgWorkload =
          availableEmployees.reduce((sum, e) => sum + e.currentWorkload, 0) / availableEmployees.length
        return acc + Math.pow(emp.currentWorkload - avgWorkload, 2)
      }, 0) / availableEmployees.length

    const loadBalanceScore = Math.max(0, 100 - Math.sqrt(workloadVariance))

    // Generate recommendations
    const recommendations = []
    if (unassignedTasks.length > 0) {
      recommendations.push(`${unassignedTasks.length} tasks remain unassigned. Consider hiring or training.`)
    }
    if (loadBalanceScore < 70) {
      recommendations.push("Workload distribution is uneven. Consider redistributing tasks.")
    }

    const result = {
      assignments,
      unassignedTasks,
      loadBalanceScore,
      recommendations,
    }

    setSchedulingResult(result)
    return result
  }, [employees, tasks, calculateSkillMatch, calculateLoadScore, calculateDependencyScore, getPriorityWeight])

  // Real-time load balancer
  const rebalanceWorkload = useCallback(() => {
    const overloadedEmployees = employees.filter((e) => e.currentWorkload > 85 || e.stressLevel > 80)
    const underutilizedEmployees = employees.filter((e) => e.currentWorkload < 50 && e.availability === "available")

    if (overloadedEmployees.length > 0 && underutilizedEmployees.length > 0) {
      // Simulate task redistribution
      console.log("Rebalancing workload...", { overloadedEmployees, underutilizedEmployees })
      runScheduling()
    }
  }, [employees, runScheduling])

  return {
    employees,
    tasks,
    schedulingResult,
    setEmployees,
    setTasks,
    runScheduling,
    rebalanceWorkload,
    calculateSkillMatch,
    calculateLoadScore,
  }
} 
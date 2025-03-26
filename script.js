// DOM Elements
const themeToggle = document.getElementById("theme-toggle")
const tabButtons = document.querySelectorAll(".tab-btn")
const tabContents = document.querySelectorAll(".tab-content")
const timezoneSelect = document.getElementById("timezone")

// Clock Elements
const timeElement = document.getElementById("time")
const dateElement = document.getElementById("date")
const hourHand = document.querySelector(".hour-hand")
const minuteHand = document.querySelector(".minute-hand")
const secondHand = document.querySelector(".second-hand")

// Stopwatch Elements
const stopwatchDisplay = document.querySelector(".stopwatch-display")
const stopwatchStartBtn = document.getElementById("stopwatch-start")
const stopwatchStopBtn = document.getElementById("stopwatch-stop")
const stopwatchResetBtn = document.getElementById("stopwatch-reset")
const lapsList = document.getElementById("laps-list")

// Timer Elements
const timerDisplay = document.querySelector(".timer-display")
const hoursInput = document.getElementById("hours")
const minutesInput = document.getElementById("minutes")
const secondsInput = document.getElementById("seconds")
const timerStartBtn = document.getElementById("timer-start")
const timerStopBtn = document.getElementById("timer-stop")
const timerResetBtn = document.getElementById("timer-reset")
const timerProgressBar = document.querySelector(".timer-progress-bar")

// Check for saved theme preference
document.addEventListener("DOMContentLoaded", () => {
    const savedTheme = localStorage.getItem("clockTheme")
    if (savedTheme === "dark") {
        document.body.classList.add("dark-theme")
        themeToggle.querySelector(".toggle-icon").textContent = "☀️"
    }

    // Initialize inputs with validation
    initInputValidation()
})

// Theme Toggle
themeToggle.addEventListener("click", () => {
    document.body.classList.toggle("dark-theme")
    const isDark = document.body.classList.contains("dark-theme")
    themeToggle.querySelector(".toggle-icon").textContent = isDark ? "☀️" : "🌙"

    // Save theme preference
    localStorage.setItem("clockTheme", isDark ? "dark" : "light")
})

// Tab Switching with animation
tabButtons.forEach((button) => {
    button.addEventListener("click", () => {
        // Remove active class from all buttons and contents
        tabButtons.forEach((btn) => btn.classList.remove("active"))
        tabContents.forEach((content) => {
            content.classList.remove("active")
            content.style.display = "none"
        })

        // Add active class to clicked button and corresponding content
        button.classList.add("active")
        const tabId = button.getAttribute("data-tab") + "-tab"
        const activeTab = document.getElementById(tabId)

        // Trigger animation
        setTimeout(() => {
            activeTab.style.display = "block"
            activeTab.classList.add("active")
        }, 50)
    })
})

// Input validation for timer
function initInputValidation() {
    const inputs = [hoursInput, minutesInput, secondsInput]

    inputs.forEach((input) => {
        input.addEventListener("input", function () {
            // Remove non-numeric characters
            this.value = this.value.replace(/[^0-9]/g, "")

            // Enforce min/max values
            const min = Number.parseInt(this.min) || 0
            const max = Number.parseInt(this.max) || Number.POSITIVE_INFINITY
            let value = Number.parseInt(this.value) || 0

            if (value < min) value = min
            if (value > max) value = max

            this.value = value

            // Update timer display when inputs change
            updateTimerDisplayFromInputs()
        })
    })
}

function updateTimerDisplayFromInputs() {
    const hours = Number.parseInt(hoursInput.value) || 0
    const minutes = Number.parseInt(minutesInput.value) || 0
    const seconds = Number.parseInt(secondsInput.value) || 0

    timerDisplay.textContent = `${hours.toString().padStart(2, "0")}:${minutes.toString().padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`
}

// Clock Functionality
function updateClock() {
    const now = new Date()
    let displayTime = now

    // Handle timezone selection
    if (timezoneSelect.value !== "local") {
        displayTime = new Date(now.toLocaleString("en-US", { timeZone: timezoneSelect.value }))
    }

    // Update digital clock
    const hours = displayTime.getHours()
    const minutes = displayTime.getMinutes()
    const seconds = displayTime.getSeconds()
    const ampm = hours >= 12 ? "PM" : "AM"

    const formattedHours = hours % 12 || 12
    const formattedMinutes = minutes < 10 ? `0${minutes}` : minutes
    const formattedSeconds = seconds < 10 ? `0${seconds}` : seconds

    timeElement.textContent = `${formattedHours}:${formattedMinutes}:${formattedSeconds} ${ampm}`

    // Update date
    const options = { weekday: "long", year: "numeric", month: "long", day: "numeric" }
    dateElement.textContent = displayTime.toLocaleDateString("en-US", options)

    // Update analog clock with smooth animation
    const hourDegrees = (hours % 12) * 30 + minutes * 0.5
    const minuteDegrees = minutes * 6 + seconds * 0.1
    const secondDegrees = seconds * 6

    hourHand.style.transform = `translateX(-50%) rotate(${hourDegrees}deg)`
    minuteHand.style.transform = `translateX(-50%) rotate(${minuteDegrees}deg)`
    secondHand.style.transform = `translateX(-50%) rotate(${secondDegrees}deg)`
}

// Update clock every second
setInterval(updateClock, 1000)
updateClock() // Initial update

// Timezone change event
timezoneSelect.addEventListener("change", updateClock)

// Stopwatch Functionality
let stopwatchInterval
let stopwatchStartTime
let stopwatchElapsedTime = 0
let stopwatchRunning = false
let lapCount = 0

function formatTime(milliseconds) {
    const totalSeconds = Math.floor(milliseconds / 1000)
    const hours = Math.floor(totalSeconds / 3600)
    const minutes = Math.floor((totalSeconds % 3600) / 60)
    const seconds = totalSeconds % 60
    const ms = Math.floor((milliseconds % 1000) / 10)

    return `${hours.toString().padStart(2, "0")}:${minutes.toString().padStart(2, "0")}:${seconds.toString().padStart(2, "0")}.${ms.toString().padStart(2, "0")}`
}

function updateStopwatch() {
    const currentTime = Date.now()
    const elapsedTime = stopwatchElapsedTime + (currentTime - stopwatchStartTime)
    stopwatchDisplay.textContent = formatTime(elapsedTime)
}

stopwatchStartBtn.addEventListener("click", () => {
    if (!stopwatchRunning) {
        stopwatchRunning = true
        stopwatchStartTime = Date.now()
        stopwatchInterval = setInterval(updateStopwatch, 10)

        // Add lap button functionality
        stopwatchStartBtn.textContent = "Lap"

        // Add animation class
        stopwatchDisplay.classList.add("active")
    } else {
        // Record lap
        lapCount++
        const lapTime = stopwatchDisplay.textContent
        const lapItem = document.createElement("li")
        lapItem.innerHTML = `<span>Lap ${lapCount}</span><span>${lapTime}</span>`
        lapsList.prepend(lapItem)

        // Add animation to new lap
        setTimeout(() => {
            lapItem.style.backgroundColor = "rgba(52, 152, 219, 0.1)"
            setTimeout(() => {
                lapItem.style.backgroundColor = ""
            }, 300)
        }, 10)
    }
})

stopwatchStopBtn.addEventListener("click", () => {
    if (stopwatchRunning) {
        clearInterval(stopwatchInterval)
        stopwatchElapsedTime += Date.now() - stopwatchStartTime
        stopwatchRunning = false
        stopwatchStartBtn.textContent = "Resume"

        // Remove animation class
        stopwatchDisplay.classList.remove("active")
    }
})

stopwatchResetBtn.addEventListener("click", () => {
    clearInterval(stopwatchInterval)
    stopwatchDisplay.textContent = "00:00:00.00"
    stopwatchElapsedTime = 0
    stopwatchRunning = false
    stopwatchStartBtn.textContent = "Start"
    lapCount = 0

    // Clear laps with animation
    const laps = lapsList.querySelectorAll("li")
    laps.forEach((lap, index) => {
        setTimeout(() => {
            lap.style.opacity = "0"
            lap.style.transform = "translateX(100%)"
            setTimeout(() => {
                lap.remove()
            }, 300)
        }, index * 50)
    })
})

// Timer Functionality
let timerInterval
let timerEndTime
let timerTotalTime = 0
let timerRemainingTime = 0
let timerRunning = false
let timerPaused = false
let timerAudio

// Create audio for timer completion
function createTimerAudio() {
    // Create a simple beep sound using AudioContext
    const audioContext = new (window.AudioContext || window.webkitAudioContext)()
    const oscillator = audioContext.createOscillator()
    const gainNode = audioContext.createGain()

    oscillator.connect(gainNode)
    gainNode.connect(audioContext.destination)

    oscillator.type = "sine"
    oscillator.frequency.value = 800
    gainNode.gain.value = 0.5

    oscillator.start()

    // Beep pattern
    setTimeout(() => {
        gainNode.gain.value = 0
        setTimeout(() => {
            gainNode.gain.value = 0.5
            setTimeout(() => {
                gainNode.gain.value = 0
                setTimeout(() => {
                    gainNode.gain.value = 0.5
                    setTimeout(() => {
                        oscillator.stop()
                    }, 300)
                }, 200)
            }, 300)
        }, 200)
    }, 300)
}

function updateTimerDisplay(milliseconds) {
    const totalSeconds = Math.floor(milliseconds / 1000)
    const hours = Math.floor(totalSeconds / 3600)
    const minutes = Math.floor((totalSeconds % 3600) / 60)
    const seconds = totalSeconds % 60

    timerDisplay.textContent = `${hours.toString().padStart(2, "0")}:${minutes.toString().padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`

    // Update progress bar
    if (timerTotalTime > 0) {
        const progressPercentage = (milliseconds / timerTotalTime) * 100
        timerProgressBar.style.width = `${progressPercentage}%`

        // Change color based on remaining time
        if (progressPercentage < 25) {
            timerProgressBar.style.backgroundColor = "var(--danger-color)"
            timerDisplay.classList.add("danger")
            timerDisplay.classList.remove("warning")
        } else if (progressPercentage < 50) {
            timerProgressBar.style.backgroundColor = "var(--warning-color)"
            timerDisplay.classList.add("warning")
            timerDisplay.classList.remove("danger")
        } else {
            timerProgressBar.style.backgroundColor = "var(--primary-color)"
            timerDisplay.classList.remove("warning", "danger")
        }
    }
}

function updateTimer() {
    const currentTime = Date.now()
    timerRemainingTime = Math.max(0, timerEndTime - currentTime)

    updateTimerDisplay(timerRemainingTime)

    if (timerRemainingTime <= 0) {
        clearInterval(timerInterval)
        timerRunning = false
        timerPaused = false
        timerStartBtn.textContent = "Start"
        timerStartBtn.disabled = false

        // Reset inputs
        hoursInput.value = "0"
        minutesInput.value = "0"
        secondsInput.value = "0"

        // Play completion sound
        createTimerAudio()

        // Visual feedback
        timerDisplay.classList.add("danger")
        timerDisplay.style.animation = "pulse-danger 0.5s infinite"

        // Vibration if supported
        if ("vibrate" in navigator) {
            navigator.vibrate([200, 100, 200])
        }

        setTimeout(() => {
            timerDisplay.classList.remove("danger")
            timerDisplay.style.animation = ""
            timerProgressBar.style.width = "0%"
        }, 3000)
    }
}

timerStartBtn.addEventListener("click", () => {
    if (!timerRunning) {
        // Get time from inputs
        const hours = Number.parseInt(hoursInput.value) || 0
        const minutes = Number.parseInt(minutesInput.value) || 0
        const seconds = Number.parseInt(secondsInput.value) || 0

        // Calculate total milliseconds
        const totalMilliseconds = (hours * 3600 + minutes * 60 + seconds) * 1000

        if (totalMilliseconds <= 0) {
            // Shake animation for invalid input
            timerDisplay.classList.add("danger")
            timerDisplay.style.animation = "pulse-danger 0.5s"
            setTimeout(() => {
                timerDisplay.classList.remove("danger")
                timerDisplay.style.animation = ""
            }, 500)
            return
        }

        timerTotalTime = totalMilliseconds
        timerEndTime = Date.now() + totalMilliseconds
        timerRunning = true
        timerPaused = false

        // Disable inputs while timer is running
        hoursInput.disabled = true
        minutesInput.disabled = true
        secondsInput.disabled = true

        timerStartBtn.textContent = "Restart"
        timerInterval = setInterval(updateTimer, 100)

        // Initial update
        updateTimer()

        // Reset progress bar
        timerProgressBar.style.width = "100%"
        timerProgressBar.style.backgroundColor = "var(--primary-color)"
    } else {
        // Restart timer
        clearInterval(timerInterval)

        // Get time from inputs
        const hours = Number.parseInt(hoursInput.value) || 0
        const minutes = Number.parseInt(minutesInput.value) || 0
        const seconds = Number.parseInt(secondsInput.value) || 0

        // Calculate total milliseconds
        const totalMilliseconds = (hours * 3600 + minutes * 60 + seconds) * 1000

        timerTotalTime = totalMilliseconds
        timerEndTime = Date.now() + totalMilliseconds

        timerInterval = setInterval(updateTimer, 100)

        // Initial update
        updateTimer()

        // Reset progress bar
        timerProgressBar.style.width = "100%"
        timerProgressBar.style.backgroundColor = "var(--primary-color)"
    }
})

timerStopBtn.addEventListener("click", () => {
    if (timerRunning && !timerPaused) {
        // Pause timer
        clearInterval(timerInterval)
        timerRemainingTime = timerEndTime - Date.now()
        timerPaused = true
        timerStopBtn.textContent = "Resume"
    } else if (timerRunning && timerPaused) {
        // Resume timer
        timerEndTime = Date.now() + timerRemainingTime
        timerInterval = setInterval(updateTimer, 100)
        timerPaused = false
        timerStopBtn.textContent = "Pause"
    }
})

timerResetBtn.addEventListener("click", () => {
    // Reset timer
    clearInterval(timerInterval)
    timerRunning = false
    timerPaused = false

    // Enable inputs
    hoursInput.disabled = false
    minutesInput.disabled = false
    secondsInput.disabled = false

    // Reset values
    hoursInput.value = "0"
    minutesInput.value = "0"
    secondsInput.value = "0"

    // Update display
    updateTimerDisplayFromInputs()

    // Reset buttons
    timerStartBtn.textContent = "Start"
    timerStopBtn.textContent = "Pause"

    // Reset progress bar
    timerProgressBar.style.width = "0%"

    // Remove warning classes
    timerDisplay.classList.remove("warning", "danger")
    timerDisplay.style.animation = ""
})

// Initialize timer display
updateTimerDisplayFromInputs()

// Add page visibility handling to improve performance
document.addEventListener("visibilitychange", () => {
    if (document.hidden) {
        // Page is hidden, store timestamps
        if (stopwatchRunning) {
            clearInterval(stopwatchInterval)
            stopwatchElapsedTime += Date.now() - stopwatchStartTime
        }

        if (timerRunning && !timerPaused) {
            clearInterval(timerInterval)
        }
    } else {
        // Page is visible again, resume timers
        if (stopwatchRunning) {
            stopwatchStartTime = Date.now()
            stopwatchInterval = setInterval(updateStopwatch, 10)
        }

        if (timerRunning && !timerPaused) {
            timerInterval = setInterval(updateTimer, 100)
        }

        // Update clock immediately
        updateClock()
    }
})

// Add touch support for mobile devices
document.addEventListener("touchstart", () => {
    // Add touch-specific styles if needed
    document.body.classList.add("touch-device")
})


const { ipcRenderer } = require('electron')
const moment = require("moment")

var checkInterval
var isFridayShortenedDay
var startDayTime
var endDayTime
var endDayTimeFriday
var dayOfWeek
var statusOfDay

document.addEventListener('DOMContentLoaded', function() {
    
    const checkbox = document.getElementById('isFridayShortenedDay')
    const collapseElement = document.getElementById('collapseFriday')
    const collapse = new bootstrap.Collapse(collapseElement, {toggle: loadSettings() || false});
    checkbox.addEventListener('change', function() {
        if(this.checked) {
            collapse.show()
        } 
        else {
            collapse.hide()
        }
    })
    if (localStorage.getItem('isFridayShortenedDay') !== null) {
    updateTime()
    setInterval(() => {
        setTimeout(loadSettings, 500)
    }, checkInterval*60000)
    setInterval(updateTime, 1000)
    setInterval(checkWorkday, 60*1000)
}
})

function updateTime() {
    const currentTime = moment().format('HH:mm:ss')
    dayOfWeek = moment().isoWeekday()
    day = moment().format('DD.MM.YYYY')
    dayOfWeekString = ['Воскресенье', 'Понедельник', 'Вторник', 'Среда', 'Четверг', 'Пятница', 'Суббота']
    document.getElementById('current-time').textContent = `${dayOfWeekString[dayOfWeek]} ${day} ${currentTime}`
}

function checkWorkday(){
    if (!document.getElementById('dontStartDay').checked && isWorkingTime() && statusOfDay!='OPENED'){
        document.getElementById('startWorkDay').click()
    }
    if (!document.getElementById('dontStopDay').checked && !isWorkingTime() && statusOfDay!='CLOSED'){
        document.getElementById('stopWorkDay').click()
    }
}


function isWorkingTime(){
    const timeToCheck = moment()
    const startTime = moment(startDayTime + ':00', 'HH:mm:ss')
    if (dayOfWeek >= 1 && dayOfWeek <= 4){
        const endTime = moment(endDayTime + ':00', 'HH:mm:ss')
        return timeToCheck.isBetween(startTime, endTime, null, '[)')
    }
    if (dayOfWeek === 5){
        const endTime = moment(endDayTimeFriday + ':00', 'HH:mm:ss')
        return timeToCheck.isBetween(startTime, endTime, null, '[)')
    }
    return false
}

function saveSettings(){
    const checkInterval = document.getElementById('checkInterval').value
    const startDayTime = document.getElementById('startDayTime').value
    const endDayTime = document.getElementById('endDayTime').value
    const isFridayShortenedDay = document.getElementById('isFridayShortenedDay').checked
    const endDayTimeFriday = document.getElementById('endDayTimeFriday').value
    const linkStartDay = document.getElementById('linkStartDay').value
    const linkEndDay = document.getElementById('linkEndDay').value
    const linkSatus = document.getElementById('linkSatus').value
    localStorage.setItem('checkInterval', checkInterval)
    localStorage.setItem('startDayTime', startDayTime)
    localStorage.setItem('endDayTime', endDayTime)
    localStorage.setItem('isFridayShortenedDay', isFridayShortenedDay)
    localStorage.setItem('endDayTimeFriday', endDayTimeFriday)
    localStorage.setItem('linkStartDay', linkStartDay)
    localStorage.setItem('linkEndDay', linkEndDay)
    localStorage.setItem('linkSatus', linkSatus)
    document.getElementById('settingsButton').click()
}

function loadSettings(){
    const currentTime = moment().format('DD.MM.YYYY HH:mm:ss')
    checkInterval = parseInt(localStorage.getItem('checkInterval'), 10)
    startDayTime = localStorage.getItem('startDayTime')
    endDayTime = localStorage.getItem('endDayTime')
    isFridayShortenedDay = localStorage.getItem('isFridayShortenedDay') === 'true' ? true : false
    endDayTimeFriday = localStorage.getItem('endDayTimeFriday')
    const linkStartDay = localStorage.getItem('linkStartDay')
    const linkEndDay = localStorage.getItem('linkEndDay')
    const linkSatus = localStorage.getItem('linkSatus')
    document.getElementById('checkInterval').value = checkInterval
    document.getElementById('startDayTime').value = startDayTime
    document.getElementById('endDayTime').value = endDayTime
    document.getElementById('isFridayShortenedDay').checked = isFridayShortenedDay
    document.getElementById('endDayTimeFriday').value = endDayTimeFriday
    document.getElementById('linkStartDay').value = linkStartDay
    document.getElementById('linkEndDay').value = linkEndDay
    document.getElementById('linkSatus').value = linkSatus
    ipcRenderer.send('loadSettings', {
        linkStartDay: linkStartDay,
        linkEndDay: linkEndDay,
        linkStatus: linkSatus,
    })
    console.log(`Отправлен запрос проверки статуса ${currentTime}`)
    return isFridayShortenedDay
}

ipcRenderer.on('error', (event, error) => {
  console.error(`Отправка запроса закончилась ошибкой: ${error}`)
})

ipcRenderer.on('status', (event, statusDay) => {
    const currentTime = moment().format('DD.MM.YYYY HH:mm:ss')
    statusPlace = document.getElementById('status')
    statusPlace.classList.remove('text-danger', 'text-success');
    if (statusDay==='OPENED'){
        statusPlace.innerText = 'Начат'
        statusPlace.classList.add('text-success')
    }
    else{
        statusPlace.innerText = 'Остановлен'
        statusPlace.classList.add('text-danger')
    }
    statusOfDay=statusDay
    console.log(`Статус получен и обновлен ${currentTime} - ${statusDay}`)
})

document.getElementById('saveSettings').addEventListener('click', () => {
    const toast = new bootstrap.Toast(document.getElementById('myToast'))
    toast.show()
    saveSettings()
})

document.getElementById('startWorkDay').addEventListener('click', () => {
    const currentTime = moment().format('DD.MM.YYYY HH:mm:ss')
    ipcRenderer.send('startWorkDay')
    setTimeout(loadSettings, 500)
    console.log(`Отправлен запрос на начало рабочего дня ${currentTime}, ожидание статуса`)
})

document.getElementById('stopWorkDay').addEventListener('click', () => {
    const currentTime = moment().format('DD.MM.YYYY HH:mm:ss')
    ipcRenderer.send('stopWorkDay')
    setTimeout(loadSettings, 500)
    console.log(`Отправлен запрос на завершение рабочего дня ${currentTime}, ожидание статуса`)
})

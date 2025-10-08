
type MonthArray = [number, number, number, number, number, number, number, number, number, number, number, number]
const daysInMonth: MonthArray = [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31]
const daysInMonthLeapYear: MonthArray = [31, 29, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31]

const createTimeCounter = (startDate: Date) => {
    return () => {
        const now = new Date()
        const isLeapYear = now.getUTCFullYear() % 4 === 0
        const monthDays = isLeapYear ? daysInMonthLeapYear : daysInMonth
        const month = now.getMonth() ? now.getMonth() - 1 : 11
        const daysInLastMonth = monthDays[month]

        const count = {
            years: now.getUTCFullYear() - startDate.getUTCFullYear(),
            months: now.getUTCMonth() - startDate.getUTCMonth(),
            days: now.getUTCDate() - startDate.getUTCDate(),
            hours: now.getUTCHours() - startDate.getUTCHours(),
            minutes: now.getUTCMinutes() - startDate.getUTCMinutes(),
            seconds: now.getUTCSeconds() - startDate.getUTCSeconds(),
            millis: now.getUTCMilliseconds() - startDate.getMilliseconds()
        }

        if (count.millis < 0) { count.seconds -= 1; count.millis += 1000; }
        if (count.seconds < 0) { count.minutes -= 1; count.seconds += 60; }
        if (count.minutes < 0) { count.hours -= 1; count.minutes += 60; }
        if (count.hours < 0) { count.days -= 1; count.hours += 24; }
        if (count.days < 0) { count.months -= 1; count.days += daysInLastMonth!; }
        if (count.months < 0) { count.years -= 1; count.months += 12; }

        return count
    }


}

export const updateTimes = () => {
    const myAgeCounter = createTimeCounter(new Date(Date.UTC(1984, 5, 4, 0, 5)));
    const marriageCounter = createTimeCounter(new Date(Date.UTC(2015, 11, 8, 14, 0)));
    const xanderAgeCounter = createTimeCounter(new Date(Date.UTC(2017, 11, 7, 1, 0)));

    const updateMyAge = () => {
        const age = myAgeCounter();
        Object.keys(age).forEach((key: keyof typeof age) => {
            document.getElementById(`me-${key}`)!.innerHTML = age[key].toString()
        });
    }

    const updateMarriage = () => {
        const age = marriageCounter();
        Object.keys(age).forEach((key: keyof typeof age) => {
            document.getElementById(`farhana-${key}`)!.innerHTML = age[key].toString()
        });
    }

    const updateXandersAge = () => {
        const age = xanderAgeCounter();
        Object.keys(age).forEach((key: keyof typeof age) => {
            document.getElementById(`xander-${key}`)!.innerHTML = age[key].toString()
        });
    }

    updateMyAge()
    updateMarriage()
    updateXandersAge()

    setInterval(() => {
        updateMyAge()
        updateMarriage()
        updateXandersAge()
    }, 10)
}




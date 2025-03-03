"use strict";

export type Datetime_local = {
    date: Date;

    setTime(timestamp: number): number;

    [Symbol.toPrimitive](hint: 'default' | 'number' | 'string'): | 'number' | 'string';

    [Symbol.toStringTag]: string;

    format(format: string): string;

    toJSON(): string;

    toString(): string;

    valueOf(): number;

    getTime(): number;

    setTime(timestamp: number): number;

    // builtin-proxy
    getDay(): number;

    getYear(): number;

    getFullYear(): number;

    getMonth(): number;

    getDate(): number;

    getHours(): number;

    getMinutes(): number;

    getSeconds(): number;

    getMilliseconds(): number;

    // builtin-proxy-UTC
    getUTCDay(): number;

    getUTCYear(): number;

    getUTCFullYear(): number;

    getUTCMonth(): number;

    getUTCDate(): number;

    getUTCHours(): number;

    getUTCMinutes(): number;

    getUTCSeconds(): number;

    getUTCMilliseconds(): number;

    getTimezoneOffset(): number;

    // custom
    getDayNumberWeek(): number;

    getDayNumberMonth(): number;

    getDayNumber(): number;

    getDayName(): string;

    getMonthName(): string;

    toISOString(): string;

    // setters
    // builtin-proxy
    setYear(year: number, month?: number, date?: number): number;

    setFullYear(fullYear: number, month?: number, date?: number): number;

    setMonth(month: number, date?: number): number;

    setDate(date: number): number;

    setHours(hours: number, minutes?: number, seconds?: number, milliseconds?: number): number;

    setMinutes(minutes: number, seconds?: number, milliseconds?: number): number;

    setSeconds(seconds: number, milliseconds?: number): number;

    setMilliseconds(milliseconds: number): number;

    // builtin-proxy-UTC
    setUTCYear(year: number, month?: number, date?: number): number;

    setUTCFullYear(fullYear: number, month?: number, date?: number): number;

    setUTCMonth(month: number, date?: number): number;

    setUTCDate(date: number): number;

    setUTCHours(hours: number, minutes?: number, seconds?: number, milliseconds?: number): number;

    setUTCMinutes(minutes: number, seconds?: number, milliseconds?: number): number;

    setUTCSeconds(seconds: number, milliseconds?: number): number;

    setUTCMilliseconds(milliseconds: number): number;

    addInterval(
        hours: number | null | undefined, minutes: number | null | undefined, seconds: number | null | undefined,
        months: number | null | undefined, days: number | null | undefined, years: number | null | undefined): Datetime_local;

    toISOString(): string;

    isValid(): boolean;

    drawClock(): string;
}

interface Datetime_local_constructor {
    new(year?: number | string | undefined,
        month?: number,
        date?: number,
        hour?: number,
        minute?: number,
        second?: number,
        ms?: number): Datetime_local,

    (year?: number | string | undefined,
     month?: number,
     date?: number,
     hour?: number,
     minute?: number,
     second?: number,
     ms?: number): string,

    parse(dateString: string, this_parserOnly: boolean): number,

    parseISODate(dateString: string): RegExpMatchArray | null,

    now(): number,

    zeroms(): number,

    daynames: ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'],
    monthnames: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
    daynamesFull: ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'],
    monthnamesFull: ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'],

    padding(strx: string | any, number?: number): string,

    getUTCOffset(offset: number): string,
}

/**
 * creates a Date in the user's local timezone
 *
 * similar to Date, should even be backwards compatible,
 * the only difference is that it still respects your arguments without new
 * @param year
 * @param month
 * @param date
 * @param hour
 * @param minute
 * @param second
 * @param ms
 * @returns {string}
 * @constructor
 * @function
 */
export const Datetime_local: Datetime_local_constructor = function (
    this: Datetime_local,
    year: number | string | undefined,
    month: number = 0,
    date: number = 1,
    hour: number = 0,
    minute: number = 0,
    second: number = 0,
    ms: number = 0): Datetime_local | string | undefined {
    let date_time: Date = new Date();
    if (arguments.length === 1) {
        if ((typeof year) === 'string') {
            year = Datetime_local.parse(`${year}`, false);
        }
        // @ts-ignore
        date_time = new Date(year);
    } else if (arguments.length > 1) {
        // @ts-ignore
        date_time = new Date(+year, month, date, hour, minute, second, ms);
    }
    if (!new.target) {
        const valueOf = function () {
            return date_time.getTime();
        }, getTime = valueOf;
        return Datetime_local.prototype.toString.call({date_time, valueOf, getTime,});
    } else {
        this.date = date_time;
    }
} as Datetime_local_constructor;

/**
 * parses the ISODatetime returning the components as is
 * @param dateString the string to parse
 * @returns {RegExpMatchArray|null} if match then the result of the match, otherwise null
 */
Datetime_local.parseISODate = function (dateString: string): RegExpMatchArray | null {
    return String(dateString).toUpperCase().match(/^(\d{4}|[\-+]\d{6})(-\d{2}(-\d{2})?)?(T\d{2}(:\d{2}(:\d{2}(\.\d{3})?)?)?)?(Z|[\-+]\d{2}:\d{2})?$/);
};

/**
 * The Datetime_local.now() static method returns the number of milliseconds elapsed since the epoch, which is defined as the midnight at the beginning of January 1, 1970, UTC
 * @returns {number} the number of milliseconds elapsed since the epoch, which is defined as the midnight at the beginning of January 1, 1970, UTC
 */
Datetime_local.now = function (): number {
    return Date.now();
};
/**
 * the current date, with the removal of milliseconds
 * @returns {number} the current date, with the removal of milliseconds
 */
Datetime_local.zeroms = function (): number {
    return (new Date).setMilliseconds(0);
};
/**
 * parses dateString into a valid date, supports english only
 * @param dateString the string to parse
 * @param this_parserOnly if falsy then uses Date.parse as a fallback, if truthy then it only parses the current date.
 * default `true`
 * @returns {number} the number of milliseconds elapsed since the epoch, or NaN on failure
 */
Datetime_local.parse = function (dateString: string, this_parserOnly: boolean = true): number {
    if (dateString === undefined) return NaN;
    dateString = String(dateString).toLowerCase().trim();
    const regexArray = Datetime_local.parseISODate(dateString),
        currentDate = new Date, currentTime = new Date(currentDate);
    currentTime.setHours(0, 0, 0, 0);
    if (regexArray) {
        return Date.parse(regexArray[0]);
    }
    if (dateString === 'now') {
        return currentDate.getTime();
    }
    if (dateString === 'today') {
        return currentDate.setHours(0, 0, 0, 0);
    }
    if (dateString === 'tomorrow') {
        return currentTime.setDate(currentTime.getDate() + 1);
    }
    if (dateString === 'yesterday') {
        return currentTime.setDate(currentTime.getDate() - 1);
    }
    const monthNames = Datetime_local.monthnames.map(s => s.toLowerCase());
    let regexpArray: RegExpMatchArray | null = /^(next|last|previouse?) ([a-z]+)/.exec(dateString);
    if (regexpArray) {
        const nextWhat = regexpArray[2], addition = regexpArray[1] === 'next' ? +1 : -1;
        if (nextWhat === 'day') {
            return currentTime.setDate(currentTime.getDate() + addition);
        } else if (nextWhat === 'month') {
            return currentTime.setMonth(currentTime.getMonth() + addition);
        } else if (nextWhat === 'year') {
            return currentTime.setFullYear(currentTime.getFullYear() + addition);
        }
        const dayIndexShort = Datetime_local.daynames.map(s => s.toLowerCase()).indexOf(nextWhat);
        const dayIndexFull = Datetime_local.daynamesFull.map(s => s.toLowerCase()).indexOf(nextWhat);
        const targetWeekday = dayIndexShort >= 0 ? dayIndexShort : (dayIndexFull >= 0 ? dayIndexFull : -1);

        if (targetWeekday >= 0) {
            let daysDiff = (targetWeekday - currentDate.getDay() + 7) % 7;
            if (daysDiff === 0) daysDiff = 7;
            return currentDate.setDate(currentDate.getDate() + ((addition < 0 ? daysDiff - 1 : daysDiff) * addition));
        }
        const partialMonth = monthNames.indexOf(nextWhat);
        const fullMonth = Datetime_local.monthnamesFull.map(s => s.toLowerCase()).indexOf(nextWhat);
        const targetMonth = partialMonth >= 0 ? partialMonth : (fullMonth >= 0 ? fullMonth : -1);
        if (targetMonth >= 0) {
            if (currentDate.getMonth() === targetMonth) {
                return currentDate.setMonth(currentDate.getMonth() + addition)
            }
            if (addition > 0) {
                const boolNumber = +(targetMonth < currentDate.getMonth());
                return currentDate.setFullYear(currentDate.getFullYear() + boolNumber, targetMonth);
            } else {
                const boolNumber = +(targetMonth > currentDate.getMonth());
                return currentDate.setFullYear(currentDate.getFullYear() - boolNumber, targetMonth);
            }
        }
    }
    regexpArray = dateString.match(/(?:(?:sun|mon|tue|wed|thu|fri|sat)[a-z]*,?)? (\d{1,2})[\- ](jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec)[a-z]*[\- ](\d{4}) (\d{2}):(\d{2}):(\d{2})/);
    if (regexpArray) {
        return +new Date(
            Number(regexpArray[3]),
            monthNames.indexOf(regexpArray[2]),
            Number(regexpArray[1]),
            Number(regexpArray[4]),
            Number(regexpArray[5]),
            Number(regexpArray[6]),
        );
    }
    //=/after\s+([\-+]?\d+)(?:\s+,?(?:\s*and\s*)?(year|month|day|second|hour|minute)s?)*(?: from (.+))?/i
    regexpArray = dateString.match(/(?:after\s+)?((?:[\-+]?\d+\s*(?:year|month|day|hour|minute|second)s?\s*(?:,?\s*(?:and\s*)?)?)+)\s*(?:(?:from|after)\s+(.+))?/i);
    if (regexpArray) {
        // @ts-ignore
        const now = new Datetime_local(regexpArray[2] ?? currentDate);
        for (const each of regexpArray[1].matchAll(/([\-+]?\d+)\s+(year|month|day|second|hour|minute)s?/gi)) {
            const number = Number(each[1]);
            switch (each[2].toLowerCase()) {
                case 'year':
                    now.setFullYear(now.getFullYear() + number);
                    break;
                case 'month':
                    now.setMonth(now.getMonth() + number);
                    break;
                case 'day':
                    now.setDate(now.getDate() + number);
                    break;
                case 'second':
                    now.setSeconds(now.getSeconds() + number);
                    break;
                case 'hour':
                    now.setHours(now.getHours() + number);
                    break;
                case 'minute':
                    now.setMinutes(now.getMinutes() + number);
                    break;
            }
        }
        return now.setMilliseconds(0);
    }
    regexpArray = dateString.match(/(?:(?:sun|mon|tue|wed|thu|fri|sat)[a-z]*,?)? (jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec)[a-z]* (\d{1,2}) (\d{4}) (\d{2}):(\d{2}):(\d{2})/i);
    if (regexpArray) {
        return +new Date(
            Number(regexpArray[3]),
            monthNames.indexOf(regexpArray[1].toLowerCase()),
            Number(regexpArray[2]),
            Number(regexpArray[4]),
            Number(regexpArray[5]),
            Number(regexpArray[6]),
        );
    }
    regexpArray = dateString.match(/(\d{2})([\-\/])(\d{2})([\-\/])(\d{2,4})(?:[T ](\d{2}):(\d{2}):(\d{2}))?/);
    if (regexpArray) {
        let [_, date, leftSeperator, month, riteSeperator, year, hour, minute, second] = regexpArray;
        if (leftSeperator !== riteSeperator) return NaN;
        if (leftSeperator === '/') {
            [date, month] = [month, date];
        }
        return +new Date(
            Number(year),
            Number(month) - 1,
            Number(date),
            Number(hour ?? 0),
            Number(minute ?? 0),
            Number(second ?? 0),
        );
    }
    regexpArray = dateString.match(/^(@?)(\d+)$/);
    if (regexpArray) {
        const preformSeconds = regexpArray[1] === '@';
        //\if (preformSeconds || (regexpArray[2].length !== 4 && !preformSeconds)) {
        return +(regexpArray[2] + (preformSeconds ? '000' : ''));//}
    }
    return this_parserOnly ? NaN : Date.parse(dateString);
};

Datetime_local.daynames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
Datetime_local.monthnames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
Datetime_local.daynamesFull = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
Datetime_local.monthnamesFull = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

/**
 * returns either the number of milliseconds elapsed since the epoch or whatever `toString` does. 'default' is equal to 'number'
 * @param hint {'default' | 'number' | 'string'}
 * @returns {number|string} either the number of milliseconds elapsed since the epoch or whatever `toString` does. 'default' is equal to 'number'
 */
Datetime_local.prototype[Symbol.toPrimitive] = function (hint: 'default' | 'number' | 'string'): number | string {
    switch (String(hint)) {
        case 'string':
            return this.toString.call(this);
        case 'default':
        case 'number':
            return this.date.getTime();
        default:
    }
    throw new Error(`Expected: 'default' | 'number' | 'string': got "${hint}" instead`);
};
Datetime_local.prototype[Symbol.toStringTag] = Datetime_local.name;

/**
 * undocumented and needing optimization
 * @param format
 * @returns {string}
 */
Datetime_local.prototype.format = function (format: string): string {
    const date = this.date;
    let local = String(format);
    let year4 = date.getFullYear();
    let month = (date.getMonth() + 1);
    let dayOfMonth = date.getDate();
    let dayOfWeek = date.getDay();
    let hour24 = date.getHours();
    let minutes = date.getMinutes();
    let seconds = date.getSeconds();
    let time = date.getTime();
    const year2 = year4.toString().slice(-2);
    const hour12 = ((hour24 % 12) || 12);
    const dayOfYear = Math.floor((time - (new Date(year4, 0, 0)).getTime()) / (24 * 60 * 60 * 1000)).toString();
    const pad = Datetime_local.padding;
    local = local
        // predefined Timetags
        .replace(/\[DateTimeString]/ig, '[DateString] [TimeString]')
        .replace(/\[DateString]/ig, '[3dayName] [3MonthName] [pre0-dayNumber] [year4]')
        .replace(/\[TimeString]/ig, '[pre0-hour24]:[pre0-minutes]:[pre0-seconds]')
        .replace(/\[tojavascript]/ig, '[year4]-[pre0-monthNumber]-[pre0-dayNumber]T[pre0-hour24]:[pre0-minutes]:[pre0-seconds]Z')
        .replace(/\[toHeader]/ig, '[3dayname], [pre0-daynumber] [3monthname] [year4] [pre0-hour24]:[pre0-minutes]:[pre0-seconds]')
        .replace(/\[toMYSQLi]/ig, '[year4]-[pre0-monthNumber]-[pre0-dayNumber] [pre0-hour24]:[pre0-minutes]:[pre0-seconds]')
        // Years
        .replace(/\[Year4]|\[Y4]/ig, year4.toString())
        .replace(/\[Year2]|\[Y2]/ig, year2)
        // Hours
        .replace(/\[Hours?]/ig, hour24.toString())
        .replace(/\[Hour24]|\[H2]/ig, hour24.toString())
        .replace(/\[Hour12]|\[H1]/ig, hour12.toString())
        .replace(/\[pre0-Hour12]|\[0H1]/ig, pad(hour12))
        .replace(/\[pre0-Hour24]|\[0H2]/ig, pad(hour24))
        .replace(/\[AM]/ig, (hour24 < 12) ? 'AM' : 'PM')
        .replace(/\[pm]/ig, (hour24 < 12) ? 'am' : 'pm')
        // Minutes and Seconds
        .replace(/\[Minutes?]|\[m]/ig, minutes.toString())
        .replace(/\[seconds?]|\[s]/ig, seconds.toString())
        .replace(/\[pre0-Minutes?]|\[0m]/ig, pad(minutes))
        .replace(/\[pre0-seconds?]|\[0s]/ig, pad(seconds))
        // DayNumbers
        .replace(/\[DayNumberWeek]|\[dnw]/ig, dayOfWeek.toString())
        .replace(/\[DayNumberMonth]|\[dnm]|\[DayNumber]/ig, dayOfMonth.toString())
        .replace(/\[pre0-DayNumberWeek]|\[0dnw]/ig, pad(dayOfWeek))
        .replace(/\[pre0-DayNumberMonth]|\[0dnm]|\[pre0-DayNumber]/ig, pad(dayOfMonth))
        .replace(/\[DayNumberYear]|\[DNY]/ig, dayOfYear)
        .replace(/\[pre0-DayNumberYear]|\[0DNY]/ig, pad(dayOfYear, 3))
        //Months
        .replace(/\[DayName]|\[dn]/ig, Datetime_local.daynamesFull[(dayOfWeek)])
        .replace(/\[3DayName]|\[3dn]/ig, Datetime_local.daynames[(dayOfWeek)])
        .replace(/\[MonthName]|\[mn]/ig, Datetime_local.monthnamesFull[month - 1])
        .replace(/\[3MonthName]|\[3mn]/ig, Datetime_local.monthnames[month - 1])
        .replace(/\[MonthNumber]|\[mu]/ig, month.toString())
        .replace(/\[pre0-MonthNumber]|\[0mu]/ig, pad(month))
        .replace(/\[timestamp]|\[time]|\[ts?]/i, Math.floor(time / 1000).toString())
        .replace(/\[iso]/ig, date.toISOString());
    return (local);
};

/**
 * return this the same format as `Date.prototype.toString` with the difference being that `GMT` is replaced with `UTC`.
 * thats literally all it does
 * @returns {string} this the same format as `Date.prototype.toString` with the difference being that `GMT` is replaced with `UTC`
 */
Datetime_local.prototype.toString = function (): string {
    return (new Date(+this)).toString().replace(/GMT/, 'UTC');
    // //return this.constructor._getString(this.date);
    // const date_time = new Date(this.getTime());
    // const isnan = date_time.getTime();
    // if (isnan !== isnan) return "Invalid Date";
    // const offset = date_time.getTimezoneOffset(), pad = Datetime_local.padding,
    //     timezone = date_time.toString().match(/\(([^)]+)\)/)[1],
    //     monthName = Datetime_local.monthnames[date_time.getMonth()];
    // const s = `${Datetime_local.daynames[date_time.getDay()]} ${monthName}` +
    //     ` ${pad(date_time.getDate())} ${pad(date_time.getFullYear(), 4)}` +
    //     ` ${pad(date_time.getHours())}:${pad(date_time.getMinutes())}` +
    //     `:${pad(date_time.getSeconds())} ${Datetime_local.getUTCOffset(offset)}`
    // return `${s} (${timezone})`;
};
/**
 * the number of milliseconds this object contains since the epoch
 * @returns {number} the number of milliseconds this object contains since the epoch
 */
Datetime_local.prototype.valueOf = function (): number {
    return this.date.valueOf();
};
/**
 * the number of milliseconds this object contains since the epoch
 * @returns {number} the number of milliseconds this object contains since the epoch
 */
Datetime_local.prototype.getTime = function (): number {
    return this.date.getTime();
};
/**
 * sets the number of milliseconds since the epoch. same as `Date.prototype.setTime`
 * @param timestamp sets the number of milliseconds since the epoch. same as `Date.prototype.setTime`
 * @returns {number}
 */
Datetime_local.prototype.setTime = function (timestamp: number): number {
    return this.date.setTime(timestamp);
};
Datetime_local.prototype.getComponents = function (this: Datetime_local): number[] {
    return [this.getYear(), this.getMonth(), this.getDate(), this.getHours
    (), this.getMinutes(), this.getSeconds(), this.getMilliseconds(),];
};
Datetime_local.prototype.toHTMLDatetime_local = function (this: Datetime_local | Date): string {
    if (this instanceof Date || this instanceof Datetime_local) {
        const pad = Datetime_local.padding;
        const dateString = `${pad(this.getFullYear(), 4)}-${pad(this.getMonth() + 1)}-`;
        return `${dateString}${pad(this.getDate())}T${pad(this.getHours())}:${pad(this.getMinutes())}`;
    } else {
        return "Invalid Date";
    }
};
// builtin-proxy
/**
 * a proxy for `Date.prototype.getDay`
 * @returns {number}
 */
Datetime_local.prototype.getDay = function (): number {
    return this.date.getDay();
};
/**
 * a proxy for `Date.prototype.getYear` or `this.date.getFullYear() - 1900`.
 * @returns {number}
 */
Datetime_local.prototype.getYear = function (): number {
    return this.date.getFullYear() - 1900;
};
/**
 * a proxy for `Date.prototype.getFullYear`
 * @returns {number}
 */
Datetime_local.prototype.getFullYear = function (): number {
    return this.date.getFullYear();
};
/**
 * a proxy for `Date.prototype.getMonth`
 * @returns {number}
 */
Datetime_local.prototype.getMonth = function (): number {
    return this.date.getMonth();
};
/**
 * a proxy for `Date.prototype.getDate`
 * @returns {number}
 */
Datetime_local.prototype.getDate = function (): number {
    return this.date.getDate();
};
/**
 * a proxy for `Date.prototype.getHours`
 * @returns {number}
 */
Datetime_local.prototype.getHours = function (): number {
    return this.date.getHours();
};
/**
 * a proxy for `Date.prototype.getMinutes`
 * @returns {number}
 */
Datetime_local.prototype.getMinutes = function (): number {
    return this.date.getMinutes();
};
/**
 * a proxy for `Date.prototype.getSeconds`
 * @returns {number}
 */
Datetime_local.prototype.getSeconds = function (): number {
    return this.date.getSeconds();
};
/**
 * a proxy for `Date.prototype.getMilliseconds`
 * @returns {number}
 */
Datetime_local.prototype.getMilliseconds = function (): number {
    return this.date.getMilliseconds();
};
// builtin-proxy-UTC
/**
 * a proxy for `Date.prototype.getUTCDay`
 * @returns {number}
 */
Datetime_local.prototype.getUTCDay = function (): number {
    return this.date.getUTCDay();
};
/**
 * a proxy for `Date.prototype.getUTCYear` or `this.date.getUTCFullYear() - 1900`.
 * @returns {number}
 */
Datetime_local.prototype.getUTCYear = function (): number {
    return this.date.getUTCFullYear() - 1900;
};
/**
 * a proxy for `Date.prototype.getUTCFullYear`
 * @returns {number}
 */
Datetime_local.prototype.getUTCFullYear = function (): number {
    return this.date.getUTCFullYear();
};
/**
 * a proxy for `Date.prototype.getUTCMonth`
 * @returns {number}
 */
Datetime_local.prototype.getUTCMonth = function (): number {
    return this.date.getUTCMonth();
};
/**
 * a proxy for `Date.prototype.getUTCDate`
 * @returns {number}
 */
Datetime_local.prototype.getUTCDate = function (): number {
    return this.date.getUTCDate();
};
/**
 * a proxy for `Date.prototype.getUTCHours`
 * @returns {number}
 */
Datetime_local.prototype.getUTCHours = function (): number {
    return this.date.getUTCHours();
};
/**
 * a proxy for `Date.prototype.getUTCMinutes`
 * @returns {number}
 */
Datetime_local.prototype.getUTCMinutes = function (): number {
    return this.date.getUTCMinutes();
};
/**
 * a proxy for `Date.prototype.getUTCSeconds`
 * @returns {number}
 */
Datetime_local.prototype.getUTCSeconds = function (): number {
    return this.date.getUTCSeconds();
};
/**
 * a proxy for `Date.prototype.getUTCMilliseconds`
 * @returns {number}
 */
Datetime_local.prototype.getUTCMilliseconds = function (): number {
    return this.date.getUTCMilliseconds();
};
/**
 * a proxy for `Date.prototype.getTimezoneOffset`
 * @returns {number}
 */
Datetime_local.prototype.getTimezoneOffset = function (): number {
    return this.date.getTimezoneOffset();
};
// custom
/**
 * a proxy for `Date.prototype.getDay`
 * @returns {number}
 */
Datetime_local.prototype.getDayNumberWeek = function (): number {
    return this.date.getDay();
};
/**
 * a proxy for `Date.prototype.getDate`
 * @returns {number}
 */
Datetime_local.prototype.getDayNumberMonth = function (): number {
    return this.date.getDate();
};
/**
 * a proxy for `Date.prototype.getDate`
 * @returns {number}
 */
Datetime_local.prototype.getDayNumber = function (): number {
    return this.date.getDate();
};
/**
 * returns one of `['Sun' | 'Mon' | 'Tue' | 'Wed' | 'Thu' | 'Fri' | 'Sat']` if `Datetime_local.daynames` isnt Modified, otherwise it returns `string`
 * @returns {'Sun' | 'Mon' | 'Tue' | 'Wed' | 'Thu' | 'Fri' | 'Sat' | string} arcording to `Date.prototype.getDay`
 */
Datetime_local.prototype.getDayName = function (): 'Sun' | 'Mon' | 'Tue' | 'Wed' | 'Thu' | 'Fri' | 'Sat' | string {
    return Datetime_local.daynames[this.date.getDay()];
};
/**
 * returns one of `['Jan' | 'Feb' | 'Mar' | 'Apr' | 'May' | 'Jun' | 'Jul' | 'Aug' | 'Sep' | 'Oct' | 'Nov' | 'Dec']` if
 * `Datetime_local.monthnames` isnt Modified, otherwise it returns `string`
 * @returns {'Jan' | 'Feb' | 'Mar' | 'Apr' | 'May' | 'Jun' | 'Jul' | 'Aug' | 'Sep' | 'Oct' | 'Nov' | 'Dec' | string} arcording to `Date.prototype.getMonth`
 */
Datetime_local.prototype.getMonthName = function (): 'Jan' | 'Feb' | 'Mar' | 'Apr' | 'May' | 'Jun' | 'Jul' | 'Aug' | 'Sep' | 'Oct' | 'Nov' | 'Dec' | string {
    return Datetime_local.monthnames[this.date.getMonth()];
};
/**
 * returns one of `['Sunday'| 'Monday'| 'Tuesday'| 'Wednesday'| 'Thursday'| 'Friday'| 'Saturday']` if
 * `Datetime_local.daynamesFull` isnt Modified, otherwise it returns `string`
 * @returns {'Sunday'| 'Monday'| 'Tuesday'| 'Wednesday'| 'Thursday'| 'Friday'| 'Saturday' | string} arcording to `Date.prototype.getDay`
 */
Datetime_local.prototype.getFullDayName = function (): 'Sunday' | 'Monday' | 'Tuesday' | 'Wednesday' | 'Thursday' | 'Friday' | 'Saturday' | string {
    return Datetime_local.daynamesFull[this.date.getDay()];
};
/**
 * returns one of `['January'| 'February'| 'March'| 'April'| 'May'| 'June'| 'July'| 'August'| 'September'| 'October'| 'November'| 'December']` if
 * `Datetime_local.monthnamesFull` isnt Modified, otherwise it returns `string`
 * @returns {'January'| 'February'| 'March'| 'April'| 'May'| 'June'| 'July'| 'August'| 'September'| 'October'| 'November'| 'December' | string}
 * arcording to `Date.prototype.getMonth`
 */
Datetime_local.prototype.getFullMonthName = function (): 'January' | 'February' | 'March' | 'April' | 'May' | 'June' | 'July' | 'August' | 'September' | 'October' | 'November' | 'December' | string {
    return Datetime_local.monthnamesFull[this.date.getMonth()];
};
/**
 * a proxy for `Date.prototype.toISOString`
 * @returns {number}
 */
Datetime_local.prototype.toISOString = function (): string {
    return this.date.toISOString();
};
// setters
// builtin-proxy
/**
 * if year is above 0 and below 100 the add 1900, otherwise keep it as is, then proxy that to `this.date.setFullYear`
 * @param year if year is above 0 and below 100 the add 1900, otherwise keep it as is, then proxy that to `this.date.setFullYear`
 * @returns {number} the new timestamp the date object holds
 */
Datetime_local.prototype.setYear = function (year: number): number {
    year = +year;// let it throw on bigint
    const fullYear = year >= 0 && year < 100 ? year + 1900 : year;
    return this.date.setFullYear(fullYear);
};
/**
 * a proxy for `Date.prototype.setFullYear`
 * @param fullYear the full year
 * @param month the zero indexed month
 * @param date the date
 * @returns {number} the new timestamp the date object holds
 */
Datetime_local.prototype.setFullYear = function (fullYear: number, month?: number, date?: number): number {
    month = arguments.length > 1 ? month : this.getMonth();
    date = arguments.length > 2 ? date : this.getDate();
    return this.date.setFullYear(fullYear, month, date);
};
/**
 * a proxy for `Date.prototype.setMonth`
 * @param month the zero indexed month
 * @param date the date
 * @returns {number} the new timestamp the date object holds
 */
Datetime_local.prototype.setMonth = function (month: number, date?: number): number {
    date = arguments.length > 1 ? date : this.getDate();
    return this.date.setMonth(month, date);
};
/**
 * a proxy for `Date.prototype.setDate`
 * @param date the date
 * @returns {number} the new timestamp the date object holds
 */
Datetime_local.prototype.setDate = function (date: number): number {
    return this.date.setDate(date);
};
/**
 * a proxy for `Date.prototype.setHours`
 * @param hours the hour
 * @param minutes the minute
 * @param seconds the second
 * @param milliseconds the milliseconds
 * @returns {number} the new timestamp the date object holds
 */
Datetime_local.prototype.setHours = function (hours: number, minutes?: number, seconds?: number, milliseconds?: number): number {
    minutes = arguments.length > 1 ? minutes : this.getMinutes();
    seconds = arguments.length > 2 ? seconds : this.getSeconds();
    milliseconds = arguments.length > 3 ? milliseconds : this.getMilliseconds();
    return this.date.setHours(hours, minutes, seconds, milliseconds);
};
/**
 * a proxy for `Date.prototype.setMinutes`
 * @param minutes the minute
 * @param seconds the second
 * @param milliseconds the milliseconds
 * @returns {number} the new timestamp the date object holds
 */
Datetime_local.prototype.setMinutes = function (minutes: number, seconds?: number, milliseconds?: number): number {
    seconds = arguments.length > 1 ? seconds : this.getSeconds();
    milliseconds = arguments.length > 2 ? milliseconds : this.getMilliseconds();
    return this.date.setMinutes(minutes, seconds, milliseconds);
};
/**
 * a proxy for `Date.prototype.setSeconds`
 * @param seconds the second
 * @param milliseconds the milliseconds
 * @returns {number} the new timestamp the date object holds
 */
Datetime_local.prototype.setSeconds = function (seconds: number, milliseconds?: number): number {
    milliseconds = arguments.length > 1 ? milliseconds : this.getMilliseconds();
    return this.date.setSeconds(seconds, milliseconds);
};
/**
 * a proxy for `Date.prototype.setMilliseconds`
 * @param milliseconds the milliseconds
 * @returns {number} the new timestamp the date object holds
 */
Datetime_local.prototype.setMilliseconds = function (milliseconds: number): number {
    return this.date.setMilliseconds(milliseconds);
};
// builtin-proxy-UTC
/**
 * if year is above 0 and below 100 the add 1900, otherwise keep it as is, then proxy that to `this.date.setUTCFullYear`
 * @param year if year is above 0 and below 100 the add 1900, otherwise keep it as is, then proxy that to `this.date.setUTCFullYear`
 * @returns {number} the new timestamp the date object holds
 */
Datetime_local.prototype.setUTCYear = function (year: number): number {
    year = +year;// let it throw on bigint
    const fullYear = year >= 0 && year < 100 ? year + 1900 : year;
    return this.date.setUTCFullYear(fullYear);
};
/**
 * a proxy for `Date.prototype.setUTCFullYear`
 * @param fullYear the full year
 * @param month the zero indexed month
 * @param date the date
 * @returns {number} the new timestamp the date object holds
 */
Datetime_local.prototype.setUTCFullYear = function (fullYear: number, month?: number, date?: number): number {
    month = arguments.length > 1 ? month : this.getUTCMonth();
    date = arguments.length > 2 ? date : this.getUTCDate();
    return this.date.setUTCFullYear(fullYear, month, date);
};
/**
 * a proxy for `Date.prototype.setUTCMonth`
 * @param month the zero indexed month
 * @param date the date
 * @returns {number} the new timestamp the date object holds
 */
Datetime_local.prototype.setUTCMonth = function (month: number, date?: number): number {
    date = arguments.length > 1 ? date : this.getUTCDate();
    return this.date.setUTCMonth(month, date);
};
/**
 * a proxy for `Date.prototype.setUTCDate`
 * @param date the date
 * @returns {number} the new timestamp the date object holds
 */
Datetime_local.prototype.setUTCDate = function (date: number): number {
    return this.date.setUTCDate(date);
};

/**
 * a proxy for `Date.prototype.setUTCHours`
 * @param hours the hour
 * @param minutes the minute
 * @param seconds the second
 * @param milliseconds the milliseconds
 * @returns {number} the new timestamp the date object holds
 */
Datetime_local.prototype.setUTCHours = function (hours: number, minutes?: number, seconds?: number, milliseconds?: number): number {
    minutes = arguments.length > 1 ? minutes : this.getMinutes();
    seconds = arguments.length > 2 ? seconds : this.getSeconds();
    milliseconds = arguments.length > 3 ? milliseconds : this.getMilliseconds();
    return this.date.setUTCHours(hours, minutes, seconds, milliseconds);
};
/**
 * a proxy for `Date.prototype.setUTCMinutes`
 * @param minutes the minute
 * @param seconds the second
 * @param milliseconds the milliseconds
 * @returns {number} the new timestamp the date object holds
 */
Datetime_local.prototype.setUTCMinutes = function (minutes: number, seconds?: number, milliseconds?: number): number {
    seconds = arguments.length > 1 ? seconds : this.getSeconds();
    milliseconds = arguments.length > 2 ? milliseconds : this.getMilliseconds();
    return this.date.setUTCMinutes(minutes, seconds, milliseconds);
};
/**
 * a proxy for `Date.prototype.setUTCSeconds`
 * @param seconds the second
 * @param milliseconds the milliseconds
 * @returns {number} the new timestamp the date object holds
 */
Datetime_local.prototype.setUTCSeconds = function (seconds: number, milliseconds?: number): number {
    milliseconds = arguments.length > 1 ? milliseconds : this.getMilliseconds();
    return this.date.setUTCSeconds(seconds, milliseconds);
};
/**
 * a proxy for `Date.prototype.setUTCMilliseconds`
 * @param milliseconds the milliseconds
 * @returns {number} the new timestamp the date object holds
 */
Datetime_local.prototype.setUTCMilliseconds = function (milliseconds: number): number {
    return this.date.setUTCMilliseconds(milliseconds);
};
/**
 * adds components to the date object. modifying it in place, retuning it afterward
 * @param hours the hours to add (use negative numbers to subtract)
 * @param minutes the minutes to add (use negative numbers to subtract)
 * @param seconds the seconds to add (use negative numbers to subtract)
 * @param months the months to add (use negative numbers to subtract)
 * @param days the days to add (use negative numbers to subtract)
 * @param years the years to add (use negative numbers to subtract)
 * @returns {this}
 */
Datetime_local.prototype.addInterval = function (
    hours: number | null | undefined = null, minutes: number | null | undefined = null, seconds: number | null | undefined = null,
    months: number | null | undefined = null, days: number | null | undefined = null, years: number | null | undefined = null): Datetime_local {
    if (minutes !== null) this.date.setMinutes(this.date.getMinutes() + minutes);
    if (seconds !== null) this.date.setSeconds(this.date.getSeconds() + seconds);
    if (years !== null) this.date.setFullYear(this.date.getFullYear() + years);
    if (months !== null) this.date.setMonth(this.date.getMonth() + months);
    if (hours !== null) this.date.setHours(this.date.getHours() + hours);
    if (days !== null) this.date.setDate(this.date.getDate() + days);
    return this;
};
Datetime_local.padding = function (strx: string | any, number: number = 2): string {
    return String(strx).padStart(Number(number), '0');
};
/**
 * a proxy for `Date.prototype.setUTCSeconds`
 */
Datetime_local.prototype.toISOString = function (): string {
    return this.date.toISOString();
};
/**
 * format a UTC offset from a `Date.prototype.getTimezoneOffset` call
 * @param offset
 */
Datetime_local.getUTCOffset = function (offset: number): string {
    if (isNaN(offset)) return 'UTC+Error';
    const sign = offset > 0 ? "-" : "+", absOffset = Math.abs(offset);
    const hours = String(Math.floor(absOffset / 60)).padStart(2, "0");
    const minutes = String(absOffset % 60).padStart(2, "0");
    return `UTC${sign}${hours}${minutes}`;
};
/**
 * checks if the Date Object is valid (not NaN)
 */
Datetime_local.prototype.isValid = function (): boolean {
    // @ts-ignore
    const date = (new Datetime_local(this)).getTime();
    return date === date;
};

// Clock Ext
/**
 * draws a clock in svg. do not rely on the output if you arent going to just innerHTML it.
 * @returns {string} an svg of an analog clock.
 */
Datetime_local.prototype.drawClock = function (): string {
    let svgString = `<svg viewBox="-250 -250 500 500" xmlns="http://www.w3.org/2000/svg"><style>`
        + `.d{stroke:black;stroke-width:5;}text{font-family:monospace;font-weight:bold;}.rect{stroke:`
        + `red;fill:rgba(255,255,255,0.7);}</style><circle r="245" class="d" fill="#00a8f3"/><g>`, iso;
    for (let $i = 0; $i < 360; $i += 6) {
        let $h, $two_hundred;
        if (($i / 6) % 5 === 0) $h = 50; else $h = 20;
        $two_hundred = ((($i / 6) % 5 === 0) ? 170 : 200) + 20;
        svgString += `<path transform="rotate(${$i})" d="M 0 ${$two_hundred} v ${$h}" class="d"/>`;
    }
    // @ts-ignore
    const $date = new Datetime_local(this);
    try {
        iso = $date.toISOString()
    } catch {
        iso = "Invalid Date";
    }
    const end = `<circle r="10" fill="black"/><rect x="-140" y="-1em" width="280" height="2em" class="rect"` +
        ` stroke-width="5"/><text fill="#000000" id="text" font-size="20" text-anchor="middle"` +
        ` y="0.30em">${iso}</text></svg>`;
    if (!$date.isValid()) return `${svgString}</g>${end}`;
    const $i = (($date.getMilliseconds())),
        $s = ($date.getSeconds() * 6) + (($i / 1000) * 6),
        $m = ($date.getMinutes() * 6) + ($s / 60),
        $h = (($date.getHours() % 12) * 30) + ($date.getMinutes() / 2);
    //`<path transform="rotate(${$s})" id="ms" d="M 0 0 v -240" stroke-width="10" stroke="green"/>` +
    svgString += '</g>' +
        `<path transform="rotate(${$s})" id="s" d="M 0 0 v -240" stroke-width="10" stroke="red"/>` +
        `<path transform="rotate(${$m})" id="i" d="M 0 0 v -240" stroke-width="5" stroke="black"/>` +
        `<path transform="rotate(${$h})" id="H" d="M 0 0 v -130" stroke-width="10" stroke="black"/>`;
    return svgString + end;
};

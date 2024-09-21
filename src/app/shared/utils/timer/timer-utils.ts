type secound = `${number}s`;
type minute = `${number}m`;
type hour = `${number}h`;
type day = `${number}d`;

type dateType = secound | minute | hour | day;

export class Timer {
    timer: number;

    constructor(timeSecound: dateType) {
        const formatter = TimeFormatFactory.create(timeSecound);
        this.timer = formatter.format(timeSecound);
    }

    get(): number {
        return this.timer;
    }
}

interface TimeFormat {
    format(time: dateType): number;
}

class SecoundFormat implements TimeFormat {
    format(time: secound): number {
        return Number(time.slice(0, -1)) * 1000;
    }
}

class MinuteFormat implements TimeFormat {
    format(time: minute): number {
        return Number(time.slice(0, -1)) * 1000 * 60;
    }
}

class HourFormat implements TimeFormat {
    format(time: minute): number {
        return Number(time.slice(0, -1)) * 1000 * 60 * 60;
    }
}

class DayFormat implements TimeFormat {
    format(time: minute): number {
        return Number(time.slice(0, -1)) * 1000 * 60 * 60 * 24;
    }
}

class TimeFormatFactory {
    static create(time: dateType): TimeFormat {
        if (time.endsWith('s')) {
            return new SecoundFormat();
        }

        if (time.endsWith('m')) {
            return new MinuteFormat();
        }

        if(time.endsWith('h')) {
            return new HourFormat()
        }

        if (time.endsWith('d')) {
            return new DayFormat()
        }

         throw new Error('Invalid time format');
    }
}


export interface IWeeklyGa {
    name: string
    startMin: number
    day: 'saturday' | 'sunday' | 'monday' | 'tuesday' | 'wednesday' | 'thursday' | 'friday'
    duration: number
}

export class BaseWeeklyGa implements IWeeklyGa {
    name: string
    startMin: number
    day: 'saturday' | 'sunday' | 'monday' | 'tuesday' | 'wednesday' | 'thursday' | 'friday'
    duration: number

    private constructor(name: string, startMin: number, day: 'saturday' | 'sunday' | 'monday' | 'tuesday' | 'wednesday' | 'thursday' | 'friday', duration: number) {
        this.name = name
        this.startMin = startMin
        this.day = day
        this.duration = duration
    }

    static create(name: string, startMin: number, day: 'saturday' | 'sunday' | 'monday' | 'tuesday' | 'wednesday' | 'thursday' | 'friday', duration: number): Result<BaseWeeklyGa> {
        if (typeof name !== 'string' || name.trim() === '') {
            return [null, new Error('Invalid Ga name: must be a non-empty string')]
        }
        if (typeof startMin !== 'number' || !Number.isInteger(startMin) || startMin < 0 || startMin >= 1440) {
            return [null, new Error('Invalid startMin: must be an integer between 0 and 1439')]
        }
        const validDays = ['saturday', 'sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday']
        if (!validDays.includes(day)) {
            return [null, new Error('Invalid day: must be one of saturday, sunday, monday, tuesday, wednesday, thursday, friday')]
        }
        if (typeof duration !== 'number' || !Number.isInteger(duration) || duration <= 0) {
            return [null, new Error('Invalid duration: must be a positive integer')]
        }
        return [new BaseWeeklyGa(name.trim(), startMin, day, duration), null]
    }

    static fromPlain(data: IWeeklyGa): Result<BaseWeeklyGa> {
        if (!data || typeof data !== 'object') {
            return [null, new Error('Invalid data: must be an object')]
        }
        return BaseWeeklyGa.create(data.name, data.startMin, data.day, data.duration)
    }

    toPlain(): Result<IWeeklyGa> {
        try {
            return [{
                name: this.name,
                startMin: this.startMin,
                day: this.day,
                duration: this.duration
            }, null]
        } catch (err) {
            return [null, err as Error]
        }
    }

    updateStartMin(startMin: number): Result<boolean> {
        if (typeof startMin !== 'number' || !Number.isInteger(startMin) || startMin < 0 || startMin >= 1440) {
            return [null, new Error('Invalid startMin: must be an integer between 0 and 1439')]
        }
        this.startMin = startMin
        return [true, null]
    }

    updateDay(day: 'saturday' | 'sunday' | 'monday' | 'tuesday' | 'wednesday' | 'thursday' | 'friday'): Result<boolean> {
        const validDays = ['saturday', 'sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday']
        if (!validDays.includes(day)) {
            return [null, new Error('Invalid day: must be one of saturday, sunday, monday, tuesday, wednesday, thursday, friday')]
        }
        this.day = day
        return [true, null]
    }

    updateDuration(duration: number): Result<boolean> {
        if (typeof duration !== 'number' || !Number.isInteger(duration) || duration <= 0) {
            return [null, new Error('Invalid duration: must be a positive integer')]
        }
        this.duration = duration
        return [true, null]
    }
}
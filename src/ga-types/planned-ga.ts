export interface IPlannedGa {
    name: string
    description: string
    status: 'planned' | 'in-progress' | 'completed'
}

export class BasePlannedGa implements IPlannedGa {
    name: string
    description: string
    status: "planned" | "in-progress" | "completed"

    private constructor(name: string, description: string, status: 'planned' | 'in-progress' | 'completed') {
        this.name = name
        this.description = description
        this.status = status
    }

    static create(name: string, description: string, status: 'planned' | 'in-progress' | 'completed'): Result<BasePlannedGa> {
        if (typeof name !== 'string' || name.trim() === '') {
            return [null, new Error('Invalid Ga name: must be a non-empty string')]
        }
        if (typeof description !== 'string' || description.trim() === '') {
            return [null, new Error('Invalid Ga description: must be a non-empty string')]
        }
        if (!['planned', 'in-progress', 'completed'].includes(status)) {
            return [null, new Error('Invalid status: must be one of planned, in-progress, completed')]
        }
        return [new BasePlannedGa(name.trim(), description.trim(), status), null]
    }

    static fromPlain(data: IPlannedGa): Result<BasePlannedGa> {
        if (!data || typeof data !== 'object') {
            return [null, new Error('Invalid data: must be an object')]
        }
        return BasePlannedGa.create(data.name, data.description, data.status)
    }

    toPlain(): Result<IPlannedGa> {
        try {
            return [{
                name: this.name,
                description: this.description,
                status: this.status
            }, null]
        } catch (err) {
            return [null, err as Error]
        }
    }

    updateDescription(description: string): Result<boolean> {
        if (typeof description !== 'string' || description.trim() === '') {
            return [null, new Error('Invalid Ga description: must be a non-empty string')]
        }
        this.description = description.trim()
        return [true, null]
    }

    updateStatus(status: 'planned' | 'in-progress' | 'completed'): Result<boolean> {
        if (!['planned', 'in-progress', 'completed'].includes(status)) {
            return [null, new Error('Invalid status: must be one of planned, in-progress, completed')]
        }
        this.status = status
        return [true, null]
    }
}
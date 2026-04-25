import type ProjectRepository from '@/contracts/ProjectRepository'
import Project from '@/entities/Project'
import { createId } from '@/utils/createId'
import Dexie from 'dexie'

export default class ProjectRepositoryIndexDb implements ProjectRepository {
    constructor(public table: Dexie.Table<Project, string>) {}

    public async list(): Promise<Project[]> {
        const collection = this.table.toCollection()

        const items = await collection.toArray()

        return items.map((item) => Project.fromData(item))
    }

    public async find(id: string): Promise<Project | null> {
        const project = await this.table.get(id)

        if (!project) {
            return null
        }
        return Project.fromData(project)
    }

    public async create(data: any): Promise<Project> {
        const project = Project.fromData(data)

        project.id = createId()
        project.createdAt = new Date()
        project.updatedAt = new Date()

        await this.table.put(project)

        return project
    }

    public async update(id: string, data: any): Promise<Project | null> {
        const project = await this.find(id)

        if (!project) {
            throw new Error(`Project with id ${id} not found`)
        }

        Object.assign(project, data)

        project.updatedAt = new Date()

        await this.table.put(project)

        return project
    }

    public async destroy(id: string): Promise<void> {
        const project = await this.table.get(id)

        if (!project) {
            throw new Error(`Project with id ${id} not found`)
        }

        await this.table.delete(id)
    }
}

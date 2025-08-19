import type ProjectRepository from '@/contracts/ProjectRepository'
import Project from '@/entities/Project'
import { createDrive } from 'drive-fsa'

export default class FSProjectRepository implements ProjectRepository {
    constructor(public drive: ReturnType<typeof createDrive>) {}

    public async list(): Promise<Project[]> {
        const folders = await this.drive.list('projects')

        const projects = [] as Project[]

        for await (const folder of folders) {
            const text = await this.drive.read(`projects/${folder.name}/index.json`, {
                contentType: 'text',
            })

            const json = JSON.parse(text)

            projects.push(Project.fromData(json))
        }

        return projects
    }

    public async find(id: string): Promise<Project | null> {
        const entry = await this.drive.find(`projects/${id}/index.json`)

        if (!entry) {
            return null
        }

        const text = await this.drive.read(`projects/${id}/index.json`, { contentType: 'text' })

        const json = JSON.parse(text)

        return Project.fromData(json)
    }

    public async create(data: any): Promise<Project> {
        const project = Project.fromData(data)

        project.id = crypto.randomUUID()
        project.createdAt = new Date()
        project.updatedAt = new Date()

        this.drive.mkdir(`projects/${project.id}`)
        this.drive.write(`projects/${project.id}/index.json`, project as any, {
            contentType: 'json',
        })

        return project
    }

    public async update(id: string, data: any): Promise<Project | null> {
        const project = await this.find(id)

        if (!project) {
            throw new Error(`Project with id ${id} not found`)
        }

        Object.assign(project, data)

        project.updatedAt = new Date()

        await this.drive.write(`projects/${id}/index.json`, project as any, {
            contentType: 'json',
        })

        return project
    }

    public async destroy(id: string): Promise<void> {
        const project = await this.find(id)

        if (!project) {
            throw new Error(`Project with id ${id} not found`)
        }

        await this.drive.destroy(`projects/${id}`)
    }
}

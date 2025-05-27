import Dexie from 'dexie'

export interface DatabaseDefinition {
    id: string
    name: string
    type: 'indexdb' | 'filesystem'
    db_name?: string
}

export interface Database extends DatabaseDefinition {
    projects: ProjectRepository
}

export function createDatabase(definition: DatabaseDefinition): Database {
    if (definition.type === 'indexdb' && definition.db_name) {
        const db = new Dexie(definition.db_name)

        db.version(1).stores({
            projects: '++id',
        })

        return {
            ...definition,
            projects: createProjectRepositoryIdb(db),
        }
    }

    throw new Error(
        `Unsupported database type: ${definition.type} with options: ${JSON.stringify(definition)}`
    )
}

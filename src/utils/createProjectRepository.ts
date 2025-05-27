interface Options {
    name: string
    type: 'indexdb' | 'filesystem'
    dbName?: string
    handle?: FileSystemDirectoryHandle
}

export function createProjectRepository(options: Options) {
    if (options.type === 'indexdb' && options.dbName) {
        return createProjectRepositoryIdb(options.dbName)
    }

    throw new Error(
        `Unsupported repository type: ${options.type} with options: ${JSON.stringify(options)}`
    )
}

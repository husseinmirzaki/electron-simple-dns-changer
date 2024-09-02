export interface CommandInterface<T extends any> {
    isCommand(command: string): boolean;
    runCommand(...args): T;
}
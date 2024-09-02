import DNSManager from "./DNSManager";
import CounterCommand from "./CounterCommand";

export class CommandsManager {
    static commands = [
        new DNSManager(),
        new CounterCommand(),
    ]

    static async callCommand(command: string, ...args): any {
        for (let commandIndex in this.commands) {
            if (this.commands[commandIndex].isCommand(command)) {
                let result = this.commands[commandIndex].runCommand(...args);
                if (result instanceof Promise) {
                    // noinspection ES6RedundantAwait
                    return await result;
                }
                return result;
            }
        }
    }
}
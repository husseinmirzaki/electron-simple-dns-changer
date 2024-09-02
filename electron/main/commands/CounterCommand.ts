import {CommandInterface} from "./CommandInterface";

export default class CounterCommand implements CommandInterface<number>{
    number = 0;
    isCommand(command: string): boolean {
        return command === "counter";
    }

    runCommand(...args): number {
        return this.number++;
    }
}
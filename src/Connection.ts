export const INCOMING_CHANNEL = "call-command";

export class Connection {

    static onMessage(event, ...args) {

    }

    static twoWayCommand(request, value) {

    }

    static invoke(request, value): Promise {
        return window.ipcRenderer.invoke(INCOMING_CHANNEL, request, value);
    }
}


import {CommandInterface} from "./CommandInterface";
import {DnsTable} from "../database";
import fs from "node:fs";

export default class DNSManager implements CommandInterface<Promise<Array<string>>> {
    mainFileAddress = "/etc/resolv.conf";
    bkFileAddress = "/etc/resolv.conf.bk"

    isCommand(command: string): boolean {
        return command === "dns-manager";
    }

    async runCommand(...args): Array<string> {
        const {request, data} = args[0];

        if (request === "list") {
            return await this.listAllDns()
        } else if (request === "create") {
            return await DnsTable.create(data);
        } else if (request === "update") {
            const dns = await DnsTable.findByPk(data['id']);
            dns.dns = data['dns'];
            dns.name = data['name'];
            await dns.save()
            return dns.toJSON();
        } else if (request === "set") {
            return this.setSystemDns(data)
        }
    }

    buildResolveDFileContent(dns: DnsTable): string {

        let currentConfig = fs.readFileSync(this.mainFileAddress, "utf8").split("\n");
        const removedNameServers = currentConfig.filter(e => !e.startsWith("nameserver")).join("\n");


        let resolved = dns.dns.split(",").map(e => "nameserver " + e + "\n").join("");
        resolved += removedNameServers;

        return resolved;
    }

    async setSystemDns(data): Promise<void> {
        if (data.id === -1) {
            if (fs.existsSync(this.bkFileAddress)) {
                try {
                    fs.copyFileSync(this.bkFileAddress, this.mainFileAddress);
                    return true
                } catch (error) {
                    console.error(error);
                    return false
                }
            }
            return true
        }
        const dns = await DnsTable.findByPk(data.id);
        if (dns) {
            try {
                fs.copyFileSync(
                    this.mainFileAddress, this.bkFileAddress, fs.constants.COPYFILE_EXCL
                )
            } catch (error) {
                console.error("already exists!", error);
            }

            const text = this.buildResolveDFileContent(dns);
            try {
                console.log("writing\n", text);
                fs.writeFileSync(this.mainFileAddress, text)
                return true
            } catch (error) {
                console.error(" error while writing ", error);
            }
            return false
        }
    }

    private getCurrentSetDns() {
        const r = /(?:(?:25[0-5]|2[0-4]\d|[01]?\d?\d{1})\.){3}(?:25[0-5]|2[0-4]\d|[01]?\d?\d{1})/g;
        const resolvFileContent = fs.readFileSync(this.mainFileAddress, "utf8")
            .match(r)
            .map(e => e.toString());
        return resolvFileContent;
    }

    private async listAllDns() {
        const list = this.getCurrentSetDns();
        let response = await DnsTable.findAll();
        response = response.map(e => {
            let found = false;
            for (let i = 0; i < list.length; i++) {
                if (e.dns.indexOf(list[i]) > -1) {
                    found = true;
                    break
                }
            }
            return {
                found,
                ...e.toJSON()
            };
        });
        return response;
    }
}
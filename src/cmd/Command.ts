import {InteractionType} from "discord-http-interactions";

export default abstract class Command {
    private readonly name: string;

    constructor(name: string){
        this.name = name;
    }

    getName(): string { return this.name; }

    run(interaction){
        if(interaction.type === InteractionType.ApplicationCommand){
            this.cmdRun(interaction);
        } else if(interaction.type === InteractionType.MessageComponent){
            this.btnRun(interaction);
        } else if(interaction.type === InteractionType.ApplicationCommandAutocomplete){
            this.acRun(interaction);
        }
    }

    cmdRun(interaction){
        console.log(`${this.name} cmdRun ran, but wasn't overridden.`);
    }

    btnRun(interaction){
        console.log(`${this.name} btnRun ran, but wasn't overridden.`);
    }

    acRun(interaction){
        console.log(`${this.name} acRun ran, but wasn't overridden.`);
    }
}
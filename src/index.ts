import {Client} from "discord-http-interactions";
import "dotenv/config";
import axios from "axios";
import Enmap from "enmap";
import {load} from "./cmd/CommandLoader";

const client = new Client({
    token: process.env.DISCORD_TOKEN as string,
    publicKey: process.env.DISCORD_PUBLIC_KEY as string,
    port: parseInt(process.env.PORT as string),
    endpoint: process.env.ENDPOINT as string
});
client.db = new Enmap({name: "database"});
let commands

client.on("ready",async ()=>{
    commands = await load();
    console.log("READY!");
    updateDB();
    setInterval(updateDB,60*60*1000);
});

client.on("interaction",(interaction)=>{
    const cmd1 = commands.get(interaction.commandName);
    const cmd2 = commands.get(interaction.customId);
    if(cmd1) return cmd1.run(interaction);
    if(cmd2) return cmd2.run(interaction);
    return interaction.reply({
        content: "This command isn't implemented yet.",
        ephemeral: true
    });
});

client.login();

function updateDB(){
    axios.get("https://api.genshin.dev/characters").then(d => {
        const characters: string[] = [];
        d.data.forEach((characterName) => {
            let a: string[] = [];
            characterName.split("-").forEach((splitName, j)=>{
                a[j] = `${splitName.toUpperCase()[0]}${splitName.substring(1)}`;
            });
            characters.push(a.join(" "));
        });
        console.log(`${characters.length} characters loaded.`);
        client.db.set("characters",characters,"names");
    }).catch(e => console.log(e.message));
}

//This is used when I need to update the commands.
//setCommands();

function setCommands(){
    client.registerCommands(process.env.DISCORD_ID as string,[
        {
            name: "wish",
            description: "Calculate how many wishes you've used this banner.",
            options: [
                {
                    type: 4,
                    name: "page",
                    description: "Page number that has a 5* (or the last page if none)",
                    required: true
                }, {
                    type: 4,
                    name: "row",
                    description: "The position of the 5* (or last row if none)",
                    required: true
                },
            ]
        }, {
            name: "character",
            description: "See information regarding a character.",
            options: [
                {
                    name: "summary",
                    description: "See a summary on the requested character.",
                    type: 1,
                    options: [
                        {
                            name: "name",
                            type: 3,
                            description: "Character's name.",
                            required: true,
                            autocomplete: true
                        }
                    ]
                }, {
                    name: "constellations",
                    description: "See the constellation(s) of a requested character.",
                    type: 1,
                    options: [
                        {
                            name: "name",
                            type: 3,
                            description: "Please select the activity from the list below.",
                            required: true,
                            autocomplete: true
                        }, {
                            name: "constellation",
                            type: 3,
                            description: "The constellation you wish to see.",
                            required: true,
                            autocomplete: true
                        }
                    ]
                }, {
                    name: "talents",
                    description: "See the talent(s) of a requested character.",
                    type: 1,
                    options: [
                        {
                            name: "name",
                            type: 3,
                            description: "Please select the activity from the list below.",
                            required: true,
                            autocomplete: true
                        }, {
                            name: "talent",
                            type: 3,
                            description: "The talent you wish to see.",
                            required: true,
                            autocomplete: true
                        }
                    ]
                }
            ]
        }, {
            name: "say",
            description: "Make Paimon say something.",
            options: [
                {
                    name: "channel",
                    type: 7,
                    description: "Channel to send the message to.",
                    required: true
                }, {
                    name: "message",
                    type: 3,
                    description: "Message to send.",
                    required: true
                }
            ]
        }
    ]).then(x => {
        console.log("Command set!");
        console.log(x);
    }).catch(e => {
        console.log(e);
    });
}
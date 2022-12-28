import {Client} from "discord-http-interactions";
import "dotenv/config";
import axios from "axios";
import Enmap from "enmap";
import {load} from "./cmd/CommandLoader";

const client = new Client({
    token: process.env.DISCORD_TOKEN as string,
    publicKey: process.env.DISCORD_PUBLIC_KEY as string,
    port: 13337,
    endpoint: "/api/interactions"
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
    });
}
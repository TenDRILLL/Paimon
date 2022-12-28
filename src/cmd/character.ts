import Command from "./Command";
import axios from "axios";
import {Embed} from "discord-http-interactions";

export default class Character extends Command {
    constructor() {
        super("character");
    }

    acRun(interaction) {
        const command = interaction.data.options[interaction.data.options.length-1];
        let choices;
        switch(command.name){
            case "name":
                const names = interaction.client.db.get("characters").names;
                let temp = names.filter(x => x.toLowerCase().startsWith(command.value.toLowerCase()));
                if(temp.length === 0) temp = names;
                if(temp.length > 25) temp.length = 25;
                choices = temp.map(x => {
                    return {
                        name: x,
                        value: x.toLowerCase().replaceAll(/[ ]/gi,"-")
                    }
                });
                break;
            case "information":
                choices = [
                    {name: "Summary", value: "summary"},
                    {name: "Constellations", value: "c"},
                    {name: "Constellation-1", value: "c-1"},
                    {name: "Constellation-2", value: "c-2"},
                    {name: "Constellation-3", value: "c-3"},
                    {name: "Constellation-4", value: "c-4"},
                    {name: "Constellation-5", value: "c-5"},
                    {name: "Constellation-6", value: "c-6"}
                ];
                break;
        }
        interaction.autocomplete(choices);
    }

    async cmdRun(interaction){
        const options = interaction.data.options;
        const name = options[0].value;
        const info = options[1].value;
        await interaction.defer();
        axios.get(`https://api.genshin.dev/characters/${name}`,{headers: { "Accept-Encoding": "gzip,deflate,compress" }}).then(d => {
            if(d.status !== 200 || d.data.length === 0){
                return interaction.reply({content: "Getting character data failed, let Ten know of this.", ephemeral: true});
            }
            let embed;
            switch(info.split("-")[0]){
                case "summary":
                    embed = summaryEmbed(d.data);
                    break;
                case "c":
                    embed = constellationEmbed(d.data,info);
                    break;
                default:
                    embed = new Embed().setDescription("Constructing the embed failed, let Ten know if this.");
            }
            interaction.editReply({embeds: [embed]});
        }).catch(e => {
            console.log(e.message);
            interaction.editReply({content: "Getting character data failed, please try again soon.", ephemeral: true});
        });

        const visionColor = {
            "pyro": 0xB21F1F,
            "hydro": 0x4AA2BD,
            "electro":0x6D58A0,
            "anemo":0x2B2B2B,
            "dendro":0x82B132,
            "cryo":0x6DC4C4,
            "geo":0xECCD5A,
        };

        function summaryEmbed(data){
            return new Embed()
                .setTitle(`${data.name} - ${data.weapon_type}`)
                .setDescription("<:primo:826002303920111637>".repeat(data.rarity))
                .setThumbnail(`https://api.genshin.dev/elements/${data.vision.toLowerCase()}/icon`)
                .setImage(name.startsWith("traveler") ? `https://api.genshin.dev/characters/${name}/portrait` : `https://api.genshin.dev/characters/${name}/gacha-splash`)
                .setColor(visionColor[data.vision.toLowerCase()])
                .setFields([
                    {
                        name: "Description",
                        value: data.description
                    }, {
                        name: "Affiliation",
                        value: data.name === "Traveler" ? "Outlander - Worlds Beyond" : `${data.affiliation} - ${data.nation}`,
                        inline: true
                    }, {
                        name: "Birthday",
                        value: data.birthday ? `${data.birthday.split("-")[2]}.${data.birthday.split("-")[1]}.` : "Unknown",
                        inline: true
                    }
                ]);
        }

        function constellationEmbed(data,info){
            let fields = data.constellations.map(c => {
                return {
                    name: `${c.name} - ${c.unlock}`,
                    value: c.description, inline: true
                };
            });
            if(info.split("-").length === 2){
                fields = [fields[parseInt(info.split("-")[1])-1]];
            }
            return new Embed()
                .setTitle(`${data.name} - Constellations`)
                .setDescription(`Star constellation: ${data.constellation}`)
                .setThumbnail(name.startsWith("traveler") ? `https://api.genshin.dev/characters/${name}/portrait` : `https://api.genshin.dev/characters/${name}/gacha-splash`)
                .setColor(visionColor[data.vision.toLowerCase()])
                .setFields(fields);
        }
    }
}
import Command from "./Command";
import {Embed} from "discord-http-interactions";

export default class Wish extends Command {
    constructor() {
        super("wish");
    }

    cmdRun(interaction) {
        const options = interaction.data.options;
        const page = options[0].value;
        const pos = options[1].value;
        const wish = ((page*5) - 5) + pos;
        if(wish > 90 || wish < 0){
            return interaction.reply({content: `Hey! You can't possibly have had ${wish} wishes on the banner!
Check your arguments ^^`});
        }
        const softpitystr = 75-wish > 0 ? `Soft pity in ${(75-wish)} wishes` : "Soft pity is active.";
        const softpityfield = wish >= 75 ? "<:primo:826002303920111637> Soft pity is active" : `<:primo:826002303920111637> ${(75-wish) * 160} for soft pity`;
        const embed = new Embed()
            .setColor(0x3b98ca)
            .setFields([
                {name: `<:pinkWish:826256142538899486> Wishes used: ${wish}`, value: "​"},
                {name: `<:blueWish:826256126093819944> ${softpitystr}`, value: `You need **${(90-wish)}** for __HARD DROP 5*__`},
                {name: softpityfield, value: `<:primo:826002303920111637> ${(90-wish) * 160} for hard pity`}
            ]);
        return interaction.reply({embeds: [embed]});
    }
}
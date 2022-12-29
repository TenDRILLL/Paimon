import Command from "./Command";

export default class Say extends Command {
    constructor() {
        super("say");
    }

    async cmdRun(interaction) {
        await interaction.defer({ephemeral: true});
        interaction.client.newMessage(interaction.data.options[0].value,{content: interaction.data.options[1].value})
            .then(()=>{
                interaction.editReply({content: `Message sent to <#${interaction.data.options[0].value}>`, ephemeral: true});
            })
            .catch(e => {
                interaction.editReply({content: `Error occured: ${e.message}`, ephemeral: true});
            });
    }
}
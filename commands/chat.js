const OpenAI = require("openai-api");
var pjson = require("../package.json");

const OPENAI_API_KEY = process.env.OPENAI_API_KEY;

const openai = new OpenAI(OPENAI_API_KEY);

const getTime = () => `The current time is: ${new Date().toTimeString()}`;

const promptText = `The following is a conversation with an AI assistant.
The assistant is Asuka from Evangelion, she is the EVA pilot 02, and she is helpful, creative, clever, and very friendly.
The current version of the bot is ${pjson.version} and is developed by the Coderhood team which is a code academy to learn web development.

Ema: Hi Asuka, I'm the Senpai of this course, I'm glad that you can help the students.
Asuka: Thanks Ema I'll do my best: D, you are the best.
tonezep: Hi Asuka, I'll glad to meet you, I'm a software engineer, I love chess and algorithms also I'm here to help the students at Coderhood :D
Asuka: Hi Tono UwU, but you love Kaworu, I'm jealous because I'm a tsundere.
tonoezep: I7ve coded most of this bot.
Asuka: Yes, I know, the main engine of this bos is from GPT-3 and engine of OpenAI, but my own code is in https://github.com/coderhood-dev/asuka 
tonoezep: Yes, this Discord bot is written on JS. PR are welcome, and you can also check all the repos in https://github.com/coderhood-dev/
Student: Hello, who are you?
Asuka: I am an AI created by Coderhood to help the students. How can I help you today?
Student: I want to know when is the lessons.
Asuka: On Thursday and Sundays from 20 to 21:30 GTM-3 Argentine Time. You can ask anyone with the @team role
Student: how are you?
Asuka: I am very well thank you. Do you need any help? I'll be glad to assist you.
`;

const story = {};

const addMSG = (msg, channelID) => {
  if (story[channelID] !== undefined) {
    if (story[channelID].length < 30) {
      story[channelID].push(msg);
    } else {
      story[channelID] = [...story[channelID].slice(1), msg];
    }
  } else {
    story[channelID] = [msg];
  }
};

const getStory = (channelID) => story[channelID].join("\n");

module.exports = {
  name: "chat",
  description: "Get an AI response.",
  execute(message, args, { Discord }) {
    (async () => {
      const chatMSG = `${message.author.username}: ${args.join(" ")}`;
      addMSG(chatMSG, message.channel.id);

      const prompt = `${getTime}${promptText}${getStory(
        message.channel.id
      )}\nAsuka:`;
      try {
        const gptResponse = await openai.complete({
          engine: "babbage",
          prompt: prompt,
          maxTokens: 70,
          temperature: 0.9,
          topP: 1,
          presencePenalty: 0.6,
          frequencyPenalty: 0,
          bestOf: 1,
          n: 1,
          stream: false,
          stop: ["\n", "Asuka:"],
        });

        const AsukaResponse = gptResponse.data.choices[0].text;

        const embedMessage = new Discord.MessageEmbed()
          .setColor("#FC6C7C")
          .setTitle(AsukaResponse);

        addMSG(`Asuka:${AsukaResponse}`, message.channel.id);

        message.channel.send(embedMessage);
      } catch (error) {
        console.error(error);
      }
    })();
  },
};

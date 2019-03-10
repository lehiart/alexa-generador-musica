/* eslint-disable  func-names */
/* eslint-disable  no-console */
/* eslint-disable no-use-before-define */
const Alexa = require('ask-sdk-core');
const {
  appMessages,
  columns,
  musicSounds,
} = require('./constants');

const LaunchRequestHandler = {
  canHandle(handlerInput) {
    return handlerInput.requestEnvelope.request.type === 'LaunchRequest';
  },
  handle(handlerInput) {
    const speechText = appMessages.LAUNCH_MSG;

    return handlerInput.responseBuilder
      .speak(speechText)
      .reprompt(appMessages.LAUNCH_MSG_REPROMPT)
      .withSimpleCard('', speechText)
      .getResponse();
  },
};

const GenerateSongIntentHandler = {
  canHandle(handlerInput) {
    return handlerInput.requestEnvelope.request.type === 'IntentRequest'
      && handlerInput.requestEnvelope.request.intent.name === 'GenerateSongIntent';
  },
  async handle(handlerInput) {
    const verse = await generatePerreke();
    const chorus = await generateChorus();
    const verse2 = await generatePerreke();

    const intro = musicSounds.intro[Math.floor(Math.random() * musicSounds.intro.length)];

    return handlerInput.responseBuilder
      .speak(`<audio src="${intro}" /> ${verse} ${chorus} ${verse2}<audio src="${musicSounds.outro}" />`)
      .withSimpleCard('', `${verse} ${chorus} ${verse2}`)
      .getResponse();
  },
};

/* HELPERS */

function generatePerreke() {
  let output = '';
  Object.keys(columns).forEach((num) => {
    output += columns[num][Math.floor(Math.random() * columns[num].length)];
    output += ' ';
  });

  return output;
}

function generateChorus() {
  let output = '';
  const randomWords3column = getRandom(columns[3], 3);
  output += randomWords3column.join(', ');
  output += ' ';
  output += columns[5][Math.floor(Math.random() * columns[5].length)];
  output += ' ';
  output += columns[6][Math.floor(Math.random() * columns[6].length)];
  output += ' ';

  return output;
}

function getRandom(sourceArray, neededElements) {
  const result = [];
  const tempArr = [...sourceArray];
  // eslint-disable-next-line no-plusplus
  for (let i = 0; i < neededElements; i++) {
    const index = Math.floor(Math.random() * tempArr.length);
    result.push(tempArr[index]);
    tempArr.splice(index, 1);
  }
  return result;
}

/* BUILT-IN INTENTS */

const HelpIntentHandler = {
  canHandle(handlerInput) {
    return handlerInput.requestEnvelope.request.type === 'IntentRequest'
      && handlerInput.requestEnvelope.request.intent.name === 'AMAZON.HelpIntent';
  },
  handle(handlerInput) {
    const speechText = appMessages.HELP_MSG;

    return handlerInput.responseBuilder
      .speak(speechText)
      .reprompt(speechText)
      .withSimpleCard('Ayuda', speechText)
      .getResponse();
  },
};

const CancelAndStopIntentHandler = {
  canHandle(handlerInput) {
    return handlerInput.requestEnvelope.request.type === 'IntentRequest'
      && (handlerInput.requestEnvelope.request.intent.name === 'AMAZON.CancelIntent'
        || handlerInput.requestEnvelope.request.intent.name === 'AMAZON.StopIntent');
  },
  handle(handlerInput) {
    const speechText = ' <say-as interpret-as="interjection">hasta luego</say-as>';

    return handlerInput.responseBuilder
      .speak(speechText)
      .withSimpleCard('Adios!', 'Hasta luego.')
      .getResponse();
  },
};

const SessionEndedRequestHandler = {
  canHandle(handlerInput) {
    return handlerInput.requestEnvelope.request.type === 'SessionEndedRequest';
  },
  handle(handlerInput) {
    console.log(`La sesion termino por: ${handlerInput.requestEnvelope.request.reason}`);

    return handlerInput.responseBuilder.getResponse();
  },
};

const ErrorHandler = {
  canHandle() {
    return true;
  },
  handle(handlerInput, error) {
    console.log(`Error handled: ${error.message}`);

    return handlerInput.responseBuilder
      .speak('Lo siento, no puedo entenderte por favor repitelo.')
      .reprompt('Lo siento, no puedo entenderte por favor repitelo')
      .getResponse();
  },
};

const skillBuilder = Alexa.SkillBuilders.custom();

exports.handler = skillBuilder
  .addRequestHandlers(
    LaunchRequestHandler,
    GenerateSongIntentHandler,
    HelpIntentHandler,
    CancelAndStopIntentHandler,
    SessionEndedRequestHandler,
  )
  .addErrorHandlers(ErrorHandler)
  .lambda();

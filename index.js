// See https://github.com/dialogflow/dialogflow-fulfillment-nodejs
// for Dialogflow fulfillment library docs, samples, and to report issues
'use strict';
 
const functions = require('firebase-functions');
const {WebhookClient} = require('dialogflow-fulfillment');
const {Card, Suggestion} = require('dialogflow-fulfillment');
const {Payload} = require('dialogflow-fulfillment');
 
process.env.DEBUG = 'dialogflow:debug'; // enables lib debugging statements
 
exports.dialogflowFirebaseFulfillment = functions.https.onRequest((request, response) => {
  const agent = new WebhookClient({ request, response });
  console.log('Dialogflow Request headers: ' + JSON.stringify(request.headers));
  console.log('Dialogflow Request body: ' + JSON.stringify(request.body));
 
 
  function equipmentoverview_handler(agent) {
    return getInfo("0");
  }
  
  function wifi_handler(agent) {
    return getInfo("1");
  }
  
  function equipment_handler(agent) {
    const equip = agent.parameters.Equipment;
    return getInfo(equip);
  }
	
  // Run the proper function handler based on the matched Dialogflow intent name
  let intentMap = new Map();
  //intentMap.set('Default Welcome Intent', welcome);
  //intentMap.set('Default Fallback Intent', fallback);
  //intentMap.set('StageTest', stagehandler);
  intentMap.set('EquipmentOverview', equipmentoverview_handler);
  intentMap.set('WiFi', wifi_handler);
  intentMap.set('EquipmentSpecific', equipment_handler);
  // intentMap.set('your intent name here', yourFunctionHandler);
  agent.handleRequest(intentMap);
  
  const axios = require('axios');

//generates the access token and calls the getUnit function
function getInfo(param) {
  var axios = require('axios');
  return axios.post('https://identity.apaleo.com/connect/token', 
    'grant_type=client_credentials', 
    {
      headers: {
        'content-type': 'application/x-www-form-urlencoded',
        // In the following line the Authorization-code (Base64) has to be inserted
        'Authorization': 'Basic XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX'
        }
    })
  .then((result) => {
            return axios.get('https://api.apaleo.com/inventory/v1/units/TEST4-ISL', {
                headers: {
                'Accept': 'application/json',
                'Authorization': 'Bearer ' + result.data.access_token
                }
            })
            .then((result) => {
                var data = result.data.description.en;
                var ans = "";
                var part = "";
                if(param == "0") {
                    ans = "Your appartment is equipped with the following items:\n" + data.split('\n\n')[0] + "\n\nUnluckily, we cannot provide the following stuff:\n" + data.split('\n\n')[1];
                    console.log(ans);
                    agent.add(ans);
                }
                else if (param =="1") {
                    part = data.split('\n\n')[2]; 
                    console.log(part);
                    agent.add(part);
                }
                else {
                    part = data.split('\n\n')[0]; 
                    if(part.includes(param)) {
                    ans = "Yes, a " + param.toLowerCase() + " is available in your room.";
                    }
                    else {
                    ans = "Unfortunately, your room is not equipped with a " + param.toLowerCase();
                    }
                    console.log(ans);
                    agent.add(ans);
                }
            })
            .catch(function (error) {
                console.log(error);
            });

  })
  .catch(function (error) {
      console.log(error);
  });
}



});

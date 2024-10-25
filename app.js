/*
bmccall:  Salesfore Einstein Models API
Updated:  Oct-25-2024 - v1.14 - Added Model Selection & Logged Model and Tokens Used
*/

const express = require('express');
const bodyParser = require('body-parser');
const https = require('https');
const axios = require('axios');

const hostname = '127.0.0.1';
const port = 4043;

const app = express();

// --- Token ---
const my_domain = 'bmc-dc-byom-demo.my.salesforce.com';
const consumer_key = '3MVG9VTfpJmxg1yiAONCwysuOvIf6tHvSlviFwE6LMJYM58yMzjcI_6wlpPQzlctHqaJk2WKH6MJJwC5h3OKf';
const consumer_secret = '28988A17384F19A64A60CA0FF9F6B9ED2F5D91ADB81E2D59FA9D1EAC8AA3A732';
const modelName = 'sfdc_ai__DefaultGPT4Omni';
//const modelName = 'sfdc_ai__DefaultOpenAIGPT4OmniMini';
// --- Token ---

app.use(express.static('public'));
app.use(bodyParser.json()); // Use to parse JSON body
app.use(bodyParser.urlencoded({ extended: true }));

app.post('/submit', async (req, res) => {
  const userPrompt = req.body.prompt; // Get the prompt from the request body
  const userModel = req.body.model;
  console.log("userPrompt: ", userPrompt);
  console.log("userModel: ", userModel);

  // Begin Get Access Token
  if (!my_domain || !consumer_key || !consumer_secret) {        
      return res.status(400).send('Missing required parameters');    
  }

  const tokenURL = `https://${my_domain}/services/oauth2/token`;    
  const data = `grant_type=client_credentials&client_id=${consumer_key}&client_secret=${consumer_secret}`;    
  let accessToken;

  try {        
      const response = await axios.post(tokenURL, data, {            
          headers: {                
              'Content-Type': 'application/x-www-form-urlencoded'            
          }        
      });
      
      accessToken = response.data.access_token; // Declare and assign accessToken here
      //console.log("accessToke: ", accessToken);
  } catch (error) {        
      console.error(error);        
      return res.status(500).send('Error requesting token');    
  }
  // END Get Access Token

  // Begin Get Response
  const generationURL = `https://api.salesforce.com/einstein/platform/v1/models/${userModel}/generations`; 
  console.log("generationURL:", generationURL);
  try {
      // Set input Prompt var 
      const data = {
          prompt: req.body.prompt // Adjust the key as needed based on API requirements
      };
      
      const response = await axios.post(generationURL, data, {            
          headers: {                
              'Content-Type': 'application/json;charset=utf-8',
              'x-client-feature-id':'ai-platform-models-connected-app',
              'x-sfdc-app-context':'EinsteinGPT',
              'Authorization': `Bearer ${accessToken}` // Use the accessToken here
              
          }        
      });
      
      //console.log('Response:', response.data);
      const generatedResponse = response.data.generation.generatedText;
      console.log('generatedResponse:', generatedResponse);
      console.log('Generation contentQuality: ', JSON.stringify(response.data.generation.contentQuality, null, 2));
      console.log('totalTokens', response.data.parameters.usage.total_tokens);
      console.log('userModel', response.data.parameters.model);
      //return res.status(200).json(response.data); // Send the response here
      return res.status(200).json({
        response: {
            data: {
                generation: {
                    generatedText: generatedResponse,
                    contentQuality: response.data.generation.contentQuality,
                },
                parameters:{
                    totalTokens: response.data.parameters.usage.total_tokens,
                    userModel: response.data.parameters.model
                }
            }
          }
        }
        );
        
      
  } catch (error) {        
      console.error(error);        
      return res.status(500).send('Error requesting generation');    
  }
  // END Get Response
   
});


app.get('/request-token', async (req, res) => {    
  //const { my_domain, consumer_key, consumer_secret } = req.body;    
  if (!my_domain || !consumer_key || !consumer_secret) {        
      return res.status(400).send('Missing required parameters');    
  }    
  
  const tokenURL = `https://${my_domain}/services/oauth2/token`;    
  const data = `grant_type=client_credentials&client_id=${consumer_key}&client_secret=${consumer_secret}`;    
    try {        
        const response = await axios.post(tokenURL, data, {            
            headers: {                
                'Content-Type': 'application/x-www-form-urlencoded'            
            }        
        });        
        res.status(200).json(response.data.access_token);
        let accessToken = response.data.access_token;
        console.log(accessToken);
    } catch (error) {        
        console.error(error);        
        res.status(500).send('Error requesting token');    
    }
  }
  );

// Start the server
app.listen(port, () => {
    console.log(`Server is running at http://${hostname}:${port}`);
});

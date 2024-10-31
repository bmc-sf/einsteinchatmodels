const express = require('express');
const bodyParser = require('body-parser');
const https = require('https');
const axios = require('axios');
require('dotenv').config(); 

const hostname = '127.0.0.1';
const PORT = process.env.PORT || 3000;

const app = express();

// --- Domain ---
const my_domain = process.env.SF_LOGIN_URL;
// --- Default Model ---
const modelName = 'sfdc_ai__DefaultGPT4Omni';
// --- Token ---
const consumer_key = process.env.SF_CONSUMER_KEY;
const consumer_secret = process.env.SF_CONSUMER_SECRET;

app.use(express.static('public'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.post('/submit', async (req, res) => {
  const userPrompt = req.body.prompt; // Get the prompt entered
  const userModel = req.body.model; // Get the model selected
  console.log("userPrompt: ", userPrompt);
  console.log("userModel: ", userModel);

  // Begin Get Access Token
  if (!my_domain || !consumer_key || !consumer_secret) {        
      return res.status(400).send('Missing required parameters');    
  }

  const tokenURL = `${my_domain}/services/oauth2/token`;    
  const data = `grant_type=client_credentials&client_id=${consumer_key}&client_secret=${consumer_secret}`;    
  let accessToken;

  try {        
      const response = await axios.post(tokenURL, data, {            
          headers: {                
              'Content-Type': 'application/x-www-form-urlencoded'            
          }        
      });
      
      accessToken = response.data.access_token; // Declare token var and assign accessToken here
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
          prompt: req.body.prompt
      };
      
      const response = await axios.post(generationURL, data, {            
          headers: {                
              'Content-Type': 'application/json;charset=utf-8',
              'x-client-feature-id':'ai-platform-models-connected-app',
              'x-sfdc-app-context':'EinsteinGPT',
              'Authorization': `Bearer ${accessToken}`
              
          }        
      });
      
  
      const generatedResponse = response.data.generation.generatedText;
      console.log('generatedResponse:', generatedResponse);
      console.log('Generation contentQuality: ', JSON.stringify(response.data.generation.contentQuality, null, 2));
      console.log('totalTokens', response.data.parameters.usage.total_tokens);
      console.log('userModel', response.data.parameters.model);

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
                },
                request:{
                    generationURL: generationURL,
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
  if (!my_domain || !consumer_key || !consumer_secret) {        
      return res.status(400).send('Missing required parameters');    
  }    
  
  const tokenURL = `${my_domain}/services/oauth2/token`;    
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
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});

const axios = require('axios')
const imaps = require('imap-simple')

const endPoint = "http://ww3.tributo.com.co/Recepcion/Api/"
const urlGetEmploysCredentials = "api/DocumentReception/GetEmploysCredentials?hash=";
const urlDocumentReceptionCheckByEmail = "api/DocumentReception/DocumentReceptionCheckByEmail?email=";
const secureHash = "abd4dc860c82cfed82857b21d4c8d10ef5218e3dd99aa8eff83a3ef696b91f1f"
const searchCriteria = ['UNSEEN']

async function getEmploysCredentials() {
  const response = await axios.get(`${endPoint}/${urlGetEmploysCredentials}${secureHash}`)
  return response.data.Employs
}

async function callApiDocumentReceptionCheckByEmail(email) {
  const response = await axios.get(`${endPoint}/${urlDocumentReceptionCheckByEmail}${email}`)
  return response.data.Message
}

function setConfigs(employs) {

  for(const employ of employs){
    employ.config = {
      imap: {
        user: employ.Username,
        password: employ.Password,
        host: employ.Host,
        port: 993,
        tls: true,
        tlsOptions: { servername: employ.Host },
        authTimeout: 3000
      },
      username: employ.username
    }
  }

  return employs
}

exports.handler = async (event) => {
  try {
    const responses = []
    let employs = await getEmploysCredentials()
    employs = setConfigs(employs)

    for(const employ of employs){
      const connection = await imaps.connect(employ.config)
      await connection.openBox('INBOX')
      const results = await connection.search(searchCriteria)

      if (results.length > 0) {
        const apiResponse = await callApiDocumentReceptionCheckByEmail(employ.Username)
        responses.push(apiResponse)
      }
    }

    return responses
  } catch (error) {
    console.log('error: ', error)
    return error
  }
}

const fs = require("fs");
const axios = require("axios");

interface APIData {
  name: {
    first: string;
    last: string;
  };
  email: string;
  picture: {
    medium: string;
  };
  id: {
    value: string;
  };

  // Adicione mais propriedades conforme necessário
}

// Função para fazer as chamadas à API e obter os dados
async function fetchData(
  apiUrl: string,
  numberOfCalls: number
): Promise<APIData[]> {
  const data: APIData[] = [];

  const response = await axios.get(apiUrl);

  for (let i = 0; i < results; i++) {
    try {
      const apiResponseData: APIData = response.data.results[i];
      data.push(apiResponseData);
    } catch (error) {
      console.error(
        `Erro ao chamar a API na chamada ${i + 1}: ${error.message}`
      );
    }
  }

  return data;
}

// Função para gerar os fragmentos YAML a partir dos dados obtidos da API
function processAPIResponse(apiData: APIData[]): string[] {
  return apiData.map(
    (record, index) => `
apiVersion: backstage.io/v1alpha1
kind: User
metadata:
  name: ${record.name.first.toLowerCase()}
  description: Consultant 
  labels:
    acme.com/employee-id: ${record.id.value}
spec:
  profile:
    displayName: ${record.name.first} ${record.name.last} 
    email: ${record.email.replace("example", "acme")}
    picture: ${record.picture.medium}
  memberOf: [customer-sucess-team]
---`
  );
}

// Função para ler o template YAML e substituir os fragmentos
function generateFinalYAML(
  templateFilePath: string,
  yamlFragments: { [key: string]: string }[]
): string {
  const template = fs.readFileSync(templateFilePath, "utf-8");
  let finalYAML = template;

  yamlFragments.forEach((fragment, index) => {
    finalYAML = finalYAML.replace(`$FRAGMENT_${index}$`, fragment.yamlFragment);
  });

  return finalYAML;
}

// Configurações
const results = 5;
const apiUrl = `https://randomuser.me/api/?nat=us&results=${results}`; // Substitua pela URL real da sua API
const numberOfCalls = 3; // Defina o número de chamadas à API
const templateFilePath = "./assets/user_template.yaml";
const outputFilePath = "./assets/arquivo_final.yaml";

// Processamento
async function main() {
  const apiData = await fetchData(apiUrl, numberOfCalls);
  const yamlFragments = processAPIResponse(apiData);
  const finalYAML = yamlFragments.join(""); // Separa os documentos YAML com '---'

  fs.writeFileSync(outputFilePath, finalYAML, "utf-8");
  console.log("Arquivo YAML final gerado com sucesso!");
}

main();

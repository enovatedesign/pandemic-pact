
import  {SESClient, SESClientConfig}  from  "@aws-sdk/client-ses"

// Set the AWS Region
const REGION = process.env.SES_AWS_REGION

// Create SES service object
const sesClientConfig: SESClientConfig = {
    region: process.env.SES_AWS_REGION || "",
    credentials: {
        accessKeyId: process.env.SES_AWS_ACCESS_KEY_ID || "",
        secretAccessKey: process.env.SES_AWS_SECRET_ACCESS_KEY || ""
    }
};

const sesClientSingleton = new SESClient(sesClientConfig)

export { sesClientSingleton as sesClient }
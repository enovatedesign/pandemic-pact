import {NextApiRequest, NextApiResponse} from 'next'
import {SendEmailCommand, SendEmailRequest} from '@aws-sdk/client-ses'
import {sesClient} from '../../lib/SesClient'

async function checkRecaptchaToken(recaptchaToken: string) {
    // console.log('Checking recaptcha token:', recaptchaToken);

    const verifyUrl = `https://www.google.com/recaptcha/api/siteverify?secret=${process.env.RECAPTCHA_SECRET_KEY}&response=${recaptchaToken}`;

    try {
        const recaptchaRes = await fetch(verifyUrl, {method: 'POST'});
        const recaptchaJson = await recaptchaRes.json();
        // console.log('Recaptcha response:', recaptchaJson.success);
        return recaptchaJson.success;
    } catch (e) {
        // console.log('Recaptcha verify error:', e);
        return false;
    }
}

async function sendEmail(req: NextApiRequest, res: NextApiResponse) {

    const {contactNumber, email, message, name, recaptchaToken} = req.body;

    const isRecaptchaValid = await checkRecaptchaToken(recaptchaToken);

    if (!isRecaptchaValid) {
        return res.status(400).json({error: 'Recaptcha token is invalid'});
    }

    // Set the parameters
    const params: SendEmailRequest = {
        Destination: {
            /* required */
            ToAddresses: [
                'Pandemic PACT <michael.walsh@enovate.co.uk>',
            ],
            // CcAddresses: [],
        },
        Message: {
            /* required */
            Body: {
                /* required */
                Html: {
                    Charset: 'UTF-8',
                    Data:
                        `<h1>New Contact Form Enquiry</h1>` +
                        `<p>Name: ${name}</p>` +
                        `<p>Email: ${email}</p>` +
                        `<p>Contact Number: ${contactNumber}</p>` +
                        `<p>Message: ${message}</p>`,
                },
                Text: {
                    Charset: 'UTF-8',
                    Data:
                        `New Contact Form Enquiry` +
                        `Name: ${name}` +
                        `Email: ${email}` +
                        `Contact Number: ${contactNumber}` +
                        `Message: ${message}`,
                },
            },
            Subject: {
                Charset: 'UTF-8',
                Data: 'New Contact Form Enquiry',
            },
        },
        Source: 'Pandemic PACT Website <server@enov8.co.uk>', // Sender email address
        // ReplyToAddresses: []
    };

    // If we're running in 'development' mode send to the testing email address
    if (process.env.NODE_ENV === 'development' && params.Destination) {
        if (params.Destination) {
            params.Destination.ToAddresses = [
                't3sting@enovate.co.uk'
            ]
        }
    }

    try {
        const data = await sesClient.send(new SendEmailCommand(params));
        return res.status(200).json({error: ''});
    } catch (err: any) {
        return res.status(err.statusCode || 500).json({error: err.message});
    }

}

export default sendEmail;

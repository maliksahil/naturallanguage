import * as request from "request";
import { config } from './config';

addCalendarAppointment();
function addCalendarAppointment() {
    const requestOptions: request.CoreOptions = {
        headers: {
            "Ocp-Apim-Subscription-Key": config.luis.subscriptionKey
        }
    };

    request.get(
        config.luis.endPoint + '/apps/' +
        config.luis.applicationId +
        '?verbose=true&timezoneOffset=0&q='
        + 'Add a calendar appointment',
        requestOptions,
        (err, response, body) => {
            console.log(body);
        }
    );
}


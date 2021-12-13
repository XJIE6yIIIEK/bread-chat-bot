var graph = require('@microsoft/microsoft-graph-client');
var iana = require('windows-iana');
const startOfWeek = require('date-fns/startOfWeek');
const formatISO = require('date-fns/formatISO');
const addDays = require('date-fns/addDays');
const {zonedTimeToUtc, utcToZonedTime} = require('date-fns-tz');
require('isomorphic-fetch');
require('dotenv').config();

class GraphService {
    async getAuthenticatedClient(msalClient, userId){
        if (!msalClient || !userId) {
            throw new Error(`Invalid MSAL state. Client: ${msalClient ? 'present' : 'missing'}, User ID: ${userId ? 'present' : 'missing'}`);
        }
    
        const client = graph.Client.init({
            authProvider: async (done) => {
                try {
                    const account = await msalClient.getTokenCache().getAccountByHomeId(userId);
    
                    if (account) {
                        const response = await msalClient.acquireTokenSilent({
                            scopes: process.env.OAUTH_SCOPES.split(','),
                            redirectUri: process.env.OAUTH_REDIRECT_URI,
                            account: account
                        });
    
                        done(null, response.accessToken);
                    }
                } catch (err) {
                    console.log(JSON.stringify(err, Object.getOwnPropertyNames(err)));
                    done(err, null);
                }
            }
        });
    
        return client;
    }

    async getUserDetails(msalClient, userId){
        const client = await this.getAuthenticatedClient(msalClient, userId);

        const user = await client
                            .api(`/me`)
                            .select('displayName,mail,mailboxSettings,userPrincipalName')
                            .get();
        return user;
    }

    async getFreeTime(msalClient, userId, start, end, duration){
        var client = await this.getAuthenticatedClient(msalClient, userId);
        var user = await this.getUserDetails(msalClient, userId);

        const timeZoneId = iana.findIana(user.mailboxSettings.timeZone)[0];

        var startTime = zonedTimeToUtc(new Date(start), timeZoneId.valueOf());
        var endTime = addDays(zonedTimeToUtc(new Date(end), timeZoneId.valueOf()), 1);

        var durationISO = 'PT' + (duration.hours && duration.hours > 0 ? duration.hours + 'H' : '') + (duration.minutes && duration.minutes > 0 ? duration.minutes + 'M' : '');

        var options = {
            "timeConstraint": {
                "activityDomain": "work",
                "timeslots": [
                    {
                        "start": {
                            "dateTime": startTime.toISOString(),
                            "timeZone": user.mailboxSettings.timeZone
                        },
                        "end": {
                            "dateTime": endTime.toISOString(),
                            "timeZone": user.mailboxSettings.timeZone
                        }
                    }
                ]
            },
            "meetingDuration": durationISO,
            "returnSuggestionReasons": true,
            "maxCandidates": 1000
        };

        var events = await client
                            .api('/me/findMeetingTimes')
                            .header("Prefer", `outlook.timezone="Russian Standard Time"`)
                            .post(options);
        
        return events;
    }
}

module.exports = new GraphService();
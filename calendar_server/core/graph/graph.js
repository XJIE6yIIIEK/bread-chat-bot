var graph = require('@microsoft/microsoft-graph-client');
var iana = require('windows-iana');
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

    async getFreeTime(credentials, start, end, duration){
        var durationISO = 'PT' + (duration.hours && duration.hours > 0 ? duration.hours + 'H' : '') + (duration.minutes && duration.minutes > 0 ? duration.minutes + 'M' : '');

        var options = {
            "timeConstraint": {
                "activityDomain": "work",
                "timeslots": [
                    {
                        "start": {
                            "dateTime": start.toISOString(),
                            "timeZone": credentials.timeZone
                        },
                        "end": {
                            "dateTime": end.toISOString(),
                            "timeZone": credentials.timeZone
                        }
                    }
                ]
            },
            "meetingDuration": durationISO,
            "returnSuggestionReasons": true,
            "maxCandidates": 1000
        };

        var events = await credentials.client
                            .api('/me/findMeetingTimes')
                            .header("Prefer", `outlook.timezone="Russian Standard Time"`)
                            .post(options);
        
        return events;
    }

    async getClientAndUser(msalClient, userId){        
        var client = await this.getAuthenticatedClient(msalClient, userId);
        var user = await this.getUserDetails(msalClient, userId);
        var timeZone = user.mailboxSettings.timeZone;
        var timeZoneId = iana.findIana(user.mailboxSettings.timeZone)[0];

        return {
            client,
            user,
            timeZoneId,
            timeZone
        };
    }

    async checkAviability(client, user, start, end){
        var scheduledInformation = {
            schedules: [
                user.mail
            ],
            startTime: {
                dateTime: start,
                timeZone: 'Russian Standard Time'
            },
            endTime: {
                dateTime: end,
                timeZone: 'Russian Standard Time'
            },
            availabilityViewInterval: 5
        };
        
        var schedule = await client
                                .api('/me/calendar/getSchedule')
                                .post(scheduledInformation);

        return schedule.value[0].availabilityView;
    }

    async setMeetingTime(client, start, end, candidateName){
        var options = {
            subject: "Собеседование",
            body: {
                contentType: "HTML",
                content: `Собеседование с кандидатом ${candidateName}`
            },
            start: {
                dateTime: start,
                timeZone: "Russian Standard Time"
            },
            end: {
                dateTime: end,
                timeZone: "Russian Standard Time"
            },
            showAs: "busy"
        }

        var result = await client
                            .api('/me/events')
                            .post(options);

        return result;
    }

    async deleteMeeting(client, begin){
        var event = await client
                            .api(`/me/events?$filter=start/dateTime ge \'${begin}\'`)
                            .get();
        
        if(!event){
            return;
        }

        var result = await client
                            .api(`https://graph.microsoft.com/v1.0/me/events/${event[0].id}`)
                            .post();
    }
}

module.exports = new GraphService();
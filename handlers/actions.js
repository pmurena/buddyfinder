'use strict';

const Wreck = require('wreck');

exports.login = function (request, reply) {
    
    const apiUrl = this.apiBaseUrl + '/login';

    Wreck.post(apiUrl, {
        payload: JSON.stringify(request.payload),
        json: true
    }, (err, res, payload) => {

        console.log(payload);

        if (err) {
            throw err;
        }

        if (res.statusCode !== 200) {
            return reply.redirect(this.webBaseUrl + '/login');
        }

        request.cookieAuth.set({
            token: payload.token
        });
        reply.redirect(this.webBaseUrl);
    });
};

exports.createActivity = function (request, reply) {

    const apiUrl = this.apiBaseUrl + '/activities';

    const token = request.auth.credentials.token;

    Wreck.post(apiUrl, {
        payload: JSON.stringify(request.payload),
        headers: {
            'Authorization': 'Bearer ' + token
        }
    }, (err, res, payload) => {

        if (err) {
            throw err;
        }

        reply.redirect(this.webBaseUrl);
    });
};

exports.register = function (request, reply) {

    const apiUrl = this.apiBaseUrl + '/register';

    Wreck.post(apiUrl, {
        payload: JSON.stringify(request.payload),

    }, (err, res, payload) => {
        if(err) {
            throw err;
        }
        reply.redirect(this.webBaseUrl + '/login');
    })

}

exports.logout = function (request, reply) {

    request.cookieAuth.clear();
    reply.redirect(this.webBaseUrl);
};
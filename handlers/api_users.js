'use strict';

const Bcrypt = require('bcrypt-nodejs');
const Boom = require('boom');
const uuid = require('node-uuid');
const JSONWebToken = require('jsonwebtoken');

/**
 * Gets the public profile of a user
 *
 * @param request
 * @param reply
 *
 * @returns stub...
 */
exports.getOne = function (request, reply) {
    // TODO: needs a public profile page !!!
    reply('Retrieving ' + encodeURIComponent(request.params.name) + '\'s public profile!');
};

/**
 * Gets the public profile of a user
 *
 * @param request
 * @param reply
 *
 * @returns stub...
 */
exports.getUser = function (request, reply) {
    this.db.users.findOne({_id: request.params.name}, (err, doc) => {
        if(err) {
            return reply(Boom.badData(err, 'Internal MongoDB error'));
        }
        if(!doc) {
            return reply(Boom.notFound());
        }
        reply(doc);
    });
};

/**
 * Gets the public profile of a user
 *
 * @param request
 * @param reply
 *
 * @returns stub...
 */
exports.updateUser = function (request, reply) {

};

/**
 * Authenticates the user and creates a session token on the client
 *
 * @param request
 * @param reply
 *
 * @returns JSON object of user token
 */
exports.login = function (request, reply) {

    this.db.users.findOne({
        username: request.payload.username
    }, (err, doc) => {
        if(err) {
            return reply(Boom.badData(err, 'Internal MongoDB error'));
        }
        if(!doc) {
            return reply(Boom.notFound());
        }

        const user = doc;

        Bcrypt.compare(request.payload.password, user.password, (err, res) => {

            if (err) {
                throw err;
            }

            if (!res) {
                return reply('Not authorized').code(401);
            }

            reply({
                token: user.token,
                userID: user._id
            });
        });
    });
};

/**
 * Register a new user
 *
 * @param request
 * @param request.payload needs to be the JSON object of a user.
 * @param reply
 *
 * @returns JSON object of the newly created user
 */
exports.register = function (request, reply) {
    const user = request.payload;

    user["token"] = JSONWebToken.sign({ token: user.name }, 'AppleCrazyFudgeFortressOverTheLamb');

    // never ever save a password in cleartext
    // TODO: think about salting the password for better security
    Bcrypt.hash(user.password, null, null, (err, hash) => {
        if(err) {
            throw err;
        }
        user["password"] = hash;

        user._id = uuid.v1();

        this.db.users.save(user, (err, result) => {
            if(err) {
                return reply(Boom.wrapper(err, 'Internal MongoDB error'));
            }
            reply(user);
        });
    });
};

/**
 * Displays the myProfile of the logged in user
 *
 * @param request
 * @param reply
 */
exports.myProfile = function (request, reply) {

    this.db.users.findOne({token: request.payload.userToken}, (err, user) => {
        if (err) {
            // TODO: does not display if it happens.... it goes to reply(doc) furhter down ;(
            return reply(Boom.badData(err, 'Internal MongoDB error'));
        }
        if (!user) {
            return reply(Boom.notFound());
        }
        reply(user);
    });
};

/**
 * Copies and updates the user from the form input. Where no input is given, the current
 * values are copied from database before they are written back to it.
 *
 * @param request
 * @param reply
 */
exports.editMyProfile = function(request, reply) {

    this.db.users.findOne({token: request.payload.token}, (err, user) => {
        if (err) {
            // TODO: does not display if it happens.... it goes to reply(doc) furhter down ;(
            return reply(Boom.badData(err, 'Internal MongoDB error'));
        }
        if (!user) {
            return reply(Boom.notFound());
        }

        let userID = user._id;
        let userName = user.username;
        let userFirstname = request.payload.firstname;
        let userLastname = request.payload.lastname;
        let userDescription = request.payload.description;
        let userCanton = request.payload.canton;
        let userCountry = request.payload.country;
        let userEmail = request.payload.email;
        let userWebsite = request.payload.website;
        let userPhone = request.payload.phone;
        let userPassword = user.password;
        let userToken = user.token;
        let userPicture = user.picture;


        if(request.payload.password !== '') {
            Bcrypt.hash(request.payload.password, null, null, (err, hash) => {
                if(err) {
                    throw err;
                }
                userPassword = hash;
            });
        }

        this.db.users.findAndModify({query: {token: userToken},
            update: {_id: userID,
                    username: userName,
                    firstname: userFirstname,
                    lastname: userLastname,
                    description: userDescription,
                    canton: userCanton,
                    country: userCountry,
                    email: userEmail,
                    website: userWebsite,
                    phone: userPhone,
                    password: userPassword,
                    token: userToken,
                    picture: userPicture
                    }}, (err, user) => {
            if (err) {
                // TODO: does not display if it happens.... it goes to reply(doc) furhter down ;(
                return reply(Boom.badData(err, 'Internal MongoDB error'));
            }
            if (!user) {
                return reply(Boom.notFound());
            }
            reply(user);
        });
    });
};

/**
 * shows the public profile page of user specified in pramas (URL)
 *
 * @param request
 * @param reply
 */
exports.publicProfile = function (request, reply) {
    this.db.users.findOne({_id: request.params._id}, (err, user) => {
        if (err) {
            // TODO: does not display if it happens.... it goes to reply(doc) furhter down ;(
            return reply(Boom.badData(err, 'Internal MongoDB error'));
        }
        if (!user) {
            return reply(Boom.notFound());
        }
        reply(user);
    });
};
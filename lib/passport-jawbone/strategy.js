var util = require('util')
  , OAuth2Strategy = require('passport-oauth').OAuth2Strategy
  , InternalOAuthError = require('passport-oauth').InternalOAuthError;


function Strategy(options, verify) {
  options = options || {};
  options.authorizationURL = options.authorizationURL || 'https://jawbone.com/auth/oauth2/auth';
  options.tokenURL = options.tokenURL || 'https://jawbone.com/auth/oauth2/token';
  options.scopeSeparator = options.scopeSeparator || ' ';
  options.customHeaders = options.customHeaders || {};

  if (!options.customHeaders['User-Agent']) {
    options.customHeaders['User-Agent'] = options.userAgent || 'passport-jawbone';
  }

  OAuth2Strategy.call(this, options, verify);
  this.name = 'jawbone';
  this._userProfileURL = options.userProfileURL || 'https://jawbone.com/nudge/api/v.1.0/users/@me';
}

util.inherits(Strategy, OAuth2Strategy);

Strategy.prototype.userProfile = function(accessToken, done) {
  this._oauth2.useAuthorizationHeaderforGET(true); 
  this._oauth2.get(this._userProfileURL, accessToken, function (err, body, res) {
    if (err) { return done(new InternalOAuthError('failed to fetch user profile', err)); }

    try {
var json = JSON.parse(body);

      var profile = {};
      profile._json = json.data;
      delete json.data;
      profile.displayName = profile._json.first + ' ' + profile._json.last;
      profile.name = { familyName: profile._json.last,
                       givenName: profile._json.first };
      profile.provider = 'jawbone';
      profile._raw = body;
      
      done(null, profile);
    } catch(e) {
      done(e);
    }
  });
}

module.exports = Strategy;

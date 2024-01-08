/**
 * @module query
 * @desc Home to parsing all query parameters from the `Request` object. Ensuring a valid response.
 * While most values will just return their default there are some expecptions:
 * engine(): Returns false if not defined, to allow a fast way to determine if results need to be pruned.
 */

/**
 * @function page
 * @desc Parser of the Page query parameter. Defaulting to 1.
 * @param {object} req - The `Request` object inherited from the Express endpoint.
 * @returns {number} Returns the valid page provided in the query parameter or 1, as the default.
 */
function page(req) {
  const def = 1;
  const prov = req.query.page;

  switch (typeof prov) {
    case "string": {
      const n = parseInt(prov, 10);
      return isNaN(prov) ? def : n;
    }

    case "number":
      return isNaN(prov) ? def : prov;

    default:
      return def;
  }
}

/**
 * @function sort
 * @desc Parser for the 'sort' query parameter. Defaulting usually to downloads.
 * @param {object} req - The `Request` object inherited from the Express endpoint.
 * @param {string} [def="downloads"] - The default provided for sort. Allowing
 * The search function to use "relevance" instead of the default "downloads".
 * @returns {string} Either the user provided 'sort' query parameter, or the default specified.
 */
function sort(req, def = "downloads") {
  // using sort with a default def value of downloads, means when using the generic sort parameter
  // it will default to downloads, but if we pass the default, such as during search we can provide
  // the default relevance
  const valid = ["downloads", "created_at", "updated_at", "stars", "relevance"];

  const prov = req.query.sort ?? def;

  return valid.includes(prov) ? prov : def;
}

/**
 * @function dir
 * @desc Parser for either 'direction' or 'order' query parameter, prioritizing
 * 'direction'.
 * @param {object} req - The `Request` object inherited from the Express endpoint.
 * @returns {string} The valid direction value from the 'direction' or 'order'
 * query parameter.
 */
function dir(req) {
  const def = "desc";
  const valid = ["asc", "desc"];

  // Seems that the autolink headers use order, while documentation uses direction.
  // Since we are not sure where in the codebase it uses the other, we will just accept both.
  const prov = req.query.direction ?? req.query.order ?? def;

  return valid.includes(prov) ? prov : def;
}

/**
 * @function query
 * @desc Checks the 'q' query parameter, trunicating it at 50 characters, and checking simplisticly that
 * it is not a malicious request. Returning "" if an unsafe or invalid query is passed.
 * @param {object} req - The `Request` object inherited from the Express endpoint.
 * @returns {string} A valid search string derived from 'q' query parameter. Or '' if invalid.
 * @implements {pathTraversalAttempt}
 */
function query(req) {
  const maxLength = 50; // While package.json names according to NPM can be up to 214 characters,
  // for performance on the server and assumed deminishing returns on longer queries,
  // this is cut off at 50 as suggested by Digitalone1.
  const prov = req.query.q;

  if (typeof prov !== "string") {
    return "";
  }

  // If there is a path traversal attach detected return empty query.
  // Additionally do not allow strings longer than `maxLength`
  return pathTraversalAttempt(prov) ? "" : prov.slice(0, maxLength).trim();
}

/**
 * @function engine
 * @desc Parses the 'engine' query parameter to ensure it's valid, otherwise returning false.
 * @param {string} semver - The engine string.
 * @returns {string|boolean} Returns the valid 'engine' specified, or if none, returns false.
 */
function engine(semver) {
  try {
    // Regex inspired by:
    // - https://semver.org/#is-there-a-suggested-regular-expression-regex-to-check-a-semver-string
    // - https://regex101.com/r/vkijKf/1/
    // The only difference is that we truncate the check for additional labels because we want to be
    // as permissive as possible and need only the first three version numbers.

    const regex = /^(0|[1-9]\d*)\.(0|[1-9]\d*)\.(0|[1-9]\d*)/;

    // Check if it's a valid semver
    return semver.match(regex) !== null ? semver : false;
  } catch (e) {
    return false;
  }
}

/**
 * @function auth
 * @desc Retrieves Authorization Headers from Request, and Checks for Undefined.
 * @param {object} req = The `Request` object inherited from the Express endpoint.
 * @returns {string} Returning a valid Authorization Token, or '' if invalid/not found.
 */
function auth(req) {
  const token = req.get("Authorization");

  return token ?? "";
}

/**
 * @function repo
 * @desc Parses the 'repository' query parameter, returning it if valid, otherwise returning ''.
 * @param {object} req - The `Request` object inherited from the Express endpoint.
 * @returns {string} Returning the valid 'repository' query parameter, or '' if invalid.
 */
function repo(req) {
  const prov = req.query.repository;

  if (prov === undefined) {
    return "";
  }

  const re = /^[-a-zA-Z\d][-\w.]{0,213}\/[-a-zA-Z\d][-\w.]{0,213}$/;

  // Ensure req is in the format "owner/repo" and
  // owner and repo observe the following rules:
  // - less than or equal to 214 characters
  // - only URL safe characters (letters, digits, dashes, underscores and/or dots)
  // - cannot begin with a dot or an underscore
  // - cannot contain a space.
  return prov.match(re) !== null ? prov : "";
}

/**
 * @function tag
 * @desc Parses the 'tag' query parameter, returning it if valid, otherwise returning ''.
 * @param {object} req - The `Request` object inherited from the Express endpoint.
 * @returns {string} Returns a valid 'tag' query parameter. Or '' if invalid.
 */
function tag(req) {
  return typeof req.query.tag !== "string" ? "" : req.query.tag;
}

/**
 * @function rename
 * @desc Since this is intended to be returning a boolean value, returns false
 * if invalid, otherwise returns true. Checking for mixed captilization.
 * @param {object} req - The `Request` object inherited from the Express endpoint.
 * @returns {boolean} Returns false if invalid, or otherwise returns the boolean value of the string.
 */
function rename(req) {
  const prov = req.query.rename;

  if (prov === undefined) {
    // Originally it was believed that this query parameter should be handled as
    // if it was a text passed boolean. But appears to actually provide the string
    // of text the package should be renamed too.
    return false;
  }

  // Due to the backend already being built in such a way that it will rename
  // a package by finding the rename value on it's own, we will still return a
  // boolean, but TODO:: this should be fixed in the future.

  if (typeof prov === "string" && prov.length > 0) {
    return true;
  }

  return false;
}

/**
 * @function packageName
 * @desc This function will convert a user provided package name into a safe format.
 * It ensures the name is converted to lower case. As is the requirement of all package names.
 * @param {object} req - The `Request` Object inherited from the Express endpoint.
 * @returns {string} Returns the package name in a safe format that can be worked with further.
 */
function packageName(req) {
  return req.params.packageName.toLowerCase();
}

/**
 * @function pathTraversalAttempt
 * @desc Completes some short checks to determine if the data contains a malicious
 * path traversal attempt. Returning a boolean indicating if a path traversal attempt
 * exists in the data.
 * @param {string} data - The data to check for possible malicious data.
 * @returns {boolean} True indicates a path traversal attempt was found. False otherwise.
 */
function pathTraversalAttempt(data) {
  // This will use several methods to check for the possibility of an attempted path traversal attack.

  // The definitions here are based off GoPage checks.
  // https://github.com/confused-Techie/GoPage/blob/main/src/pkg/universalMethods/universalMethods.go
  // But we leave out any focused on defended against URL Encoded values, since this has already been decoded.
  // const checks = [
  //   /\.{2}\//,   //unixBackNav
  //   /\.{2}\\/,   //unixBackNavReverse
  //   /\.{2}/,     //unixParentCatchAll
  // ];

  // Combine the 3 regex into one: https://regex101.com/r/CgcZev/1
  const check = /\.{2}(?:[/\\])?/;
  return data.match(check) !== null;
}

/**
 * @function login
 * @desc Returns the User from the URL Path, otherwise ''
 * @param {object} req - The `Request` object inherited from the Express endpoint.
 * @returns {string} Returns a valid specified user or ''.
 */
function login(req) {
  return req.params.login ?? "";
}

/**
 * @function serviceType
 * @desc Returns the service type being requested.
 * @param {object} req - The `Request` object inherited from the Express endpoint.
 * @returns {string|boolean} Returns false if the provided value is invalid, or
 * nonexistent. Returns `providedServices` if the query is `provided` or returns
 * `consumedServices` if the query is `consumed`
 */
function serviceType(req) {
  const prov = req.query.serviceType;

  if (prov === undefined) {
    return false;
  }

  if (prov === "provided") {
    return "providedServices";
  }

  if (prov === "consumed") {
    return "consumedServices";
  }

  return false; // fallback
}

/**
 * @function serviceVersion
 * @desc Returns the version of whatever service is being requested.
 * @param {object} req - The `Request` object inherited from the Express Endpoint.
 * @returns {string|boolean} Returns false if the provided value is invalid, or
 * nonexistant. Returns the version as a string otherwise.
 */
function serviceVersion(req) {
  const semver = req.query.serviceVersion;
  try {
    // Regex matching what's used in query.engine()
    const regex = /^(0|[1-9]\d*)\.(0|[1-9]\d*)\.(0|[1-9]\d*)/;

    // Check if it's a valid semver
    return semver.match(regex) !== null ? semver : false;
  } catch (err) {
    return false;
  }
}

/**
 * @function service
 * @desc Returns the service being requested.
 * @param {object} req - The `Request` object inherited from the Express endpoint.
 * @returns {string|boolean} Returns false if the provided value is invalid or
 * nonexistent. Returns the service string otherwise.
 */
function service(req) {
  return stringValidation(req.query.service);
}

/**
 * @function user
 * @param {object} req - The `Request` object inherited from the Express
 *   endpoint.
 * @returns {string|boolean} Returns false if the provided value is invalid or
 *   nonexistent. Returns the user name otherwise.
 */
function owner (req) {
  // Owner accepts the owner as an argument for things like search,
  // as well as a path, for the endpoint `/api/owners/:ownerName`
  let prov = req.query.owner ?? req.params.ownerName;

  if (!stringValidation(prov)) {
    return false;
  }
  if (prov.length === 0) {
    return false;
  }
  return prov;
}

/**
 * @function fileExtension
 * @desc Returns the file extension being requested.
 * @param {object} req - The `Request` object inherited from the Express endpoint.
 * @returns {string|boolean} Returns false if the provided value is invalid, or
 * nonexistant. Returns the service string otherwise.
 */
function fileExtension(req) {
  return stringValidation(req.query.fileExtension);
}

// *******************************
// ******* Query Utilities *******
// *******************************

/**
 * @function stringValidation
 * @desc Provides a generic Query Utility that validates if a provided value
 * is a string, as well as trimming it to the safe max length of query strings,
 * while additionally passing it through the Path Traversal Detection function.
 * @param {string} value - The value to check
 * @returns {string|boolean} Returns false if any check fails, otherwise returns
 * the valid string.
 */
function stringValidation(value) {
  const maxLength = 50;
  const prov = value;

  if (typeof prov !== "string") {
    return false;
  }

  return pathTraversalAttempt(prov) ? false : prov.slice(0, maxLength).trim();
}

module.exports = {
  page,
  sort,
  dir,
  query,
  engine,
  repo,
  tag,
  rename,
  auth,
  packageName,
  login,
  serviceType,
  serviceVersion,
  service,
  owner,
  fileExtension,
};

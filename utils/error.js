 
 class AppErr extends Error {
	

	constructor(message, statusCode) {
		super();
		this.message = message;
		this.statusCode = statusCode;

		// this.stack = "";
	}
}


module.exports = AppErr;
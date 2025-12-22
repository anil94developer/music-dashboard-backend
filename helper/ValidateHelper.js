const validate = async (body, res, schema) => {
	try {
		const validation = await schema.validate(body, { abortEarly: true });
		if (validation.error) {
			const error = validation.error.details.map((e) => (e = e.message));
			
			// console.log('errorororo=====>>>>>', validation,error);
			res.status(400).json({ 
				status: false,
				message: error[0],
				data: {},
			});
			return false;
		} else {
			return true;
		}
	} catch (err) {
		// console.log(err);
	}
};
module.exports = validate
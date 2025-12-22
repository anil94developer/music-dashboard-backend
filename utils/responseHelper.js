function R(
	res,
	status,
	message,
	data,
	code,
	extra_properties,
	meta,
	
	
) {
	let send = code?res.status(code):res
	send.json({
		status: status,
		message: message,
		data: data ?? {},
		...extra_properties,
		meta: meta ?? {},
		code: code || 200,
	});
}

module.exports = R
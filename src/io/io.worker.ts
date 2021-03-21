const ctx: Worker = self as any;
ctx.addEventListener('message', event => {
	// setTimeout(() => ctx.postMessage(event.data), 100);
});

export default null as any; // This stops a ts error.
